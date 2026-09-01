package scheduler

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"vessel/core-infra/scheduler/internal/db"
	"vessel/core-infra/scheduler/internal/messaging"
	"vessel/core-infra/scheduler/internal/queue"
)

type Engine struct {
	queue    *queue.RedisQueue
	db       *db.PostgresClient
	nats     *messaging.NATSClient
	workerID string
}

func NewEngine(q *queue.RedisQueue, dbClient *db.PostgresClient, natsClient *messaging.NATSClient, workerID string) *Engine {
	return &Engine{
		queue:    q,
		db:       dbClient,
		nats:     natsClient,
		workerID: workerID,
	}
}

func (e *Engine) Start(ctx context.Context) {
	log.Println("Starting Scheduler Engine...")
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Scheduler shutting down")
			return
		case <-ticker.C:
			e.processNextJob(ctx)
		}
	}
}

func (e *Engine) processNextJob(ctx context.Context) {
	job, err := e.queue.Pop(ctx)
	if err != nil {
		log.Printf("Error popping job: %v", err)
		return
	}
	if job == nil {
		// No jobs in queue
		return
	}

	log.Printf("Processing job: %s (type=%s, priority=%s, org=%s)", job.ID, job.Type, job.Priority, job.OrganizationID)

	// Update status to 'scheduled' — the scheduler has claimed this job
	err = e.db.UpdateJobStatus(ctx, job.ID, "scheduled")
	if err != nil {
		log.Printf("Failed to update job %s status to scheduled: %v", job.ID, err)
		// Cannot proceed without DB confirmation — attempt to re-enqueue
		if reqErr := e.queue.Push(ctx, *job); reqErr != nil {
			log.Printf("CRITICAL: job %s lost — failed DB update and re-enqueue: %v", job.ID, reqErr)
		}
		return
	}

	// Construct assignment for the execution agent
	type ExecutionPayload struct {
		Image string   `json:"image"`
		Cmd   []string `json:"cmd"`
	}
	var execPayload ExecutionPayload
	if len(job.Payload) == 0 {
		log.Printf("Job %s has missing payload", job.ID)
		e.db.UpdateJobStatus(ctx, job.ID, "failed")
		return
	}
	
	if err := json.Unmarshal(job.Payload, &execPayload); err != nil {
		log.Printf("Failed to unmarshal job payload for job %s: %v", job.ID, err)
		e.db.UpdateJobStatus(ctx, job.ID, "failed")
		return
	}
	
	if execPayload.Image == "" {
		log.Printf("Job %s payload missing required 'image'", job.ID)
		e.db.UpdateJobStatus(ctx, job.ID, "failed")
		return
	}

	assignment := messaging.JobAssignment{
		JobID:   job.ID,
		Image:   execPayload.Image,
		Payload: execPayload.Cmd,
	}

	// Get active worker from Redis
	targetWorkerID, err := e.queue.GetActiveWorker(ctx)
	if err != nil || targetWorkerID == "" {
		log.Printf("No active workers available for job %s: %v", job.ID, err)
		// Revert status back so it can be retried
		e.db.UpdateJobStatus(ctx, job.ID, "queued")
		// Put back in queue
		e.queue.Push(ctx, *job)
		return
	}

	// Publish assignment to NATS
	err = e.nats.PublishAssignment(targetWorkerID, assignment)
	if err != nil {
		log.Printf("Failed to publish NATS assignment for job %s: %v", job.ID, err)
		// Revert status back so it can be retried
		if revertErr := e.db.UpdateJobStatus(ctx, job.ID, "queued"); revertErr != nil {
			log.Printf("CRITICAL: job %s stuck in scheduled — failed NATS publish and status revert: %v", job.ID, revertErr)
		}
		return
	}

	log.Printf("Job %s assigned to worker %s via NATS", job.ID, targetWorkerID)
}
