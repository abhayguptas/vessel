package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"vessel/core-infra/execution-agent/internal/agent"
	"vessel/core-infra/execution-agent/internal/db"
	"vessel/core-infra/execution-agent/internal/runtime"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

type JobAssignment struct {
	JobID   string   `json:"job_id"`
	Image   string   `json:"image"`
	Payload []string `json:"payload"`
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	nodeID := os.Getenv("WORKER_NODE_ID")
	if nodeID == "" {
		nodeID = "worker-local-1"
	}

	redisAddr := os.Getenv("REDIS_URL")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	natsUrl := os.Getenv("NATS_URL")
	if natsUrl == "" {
		natsUrl = "nats://localhost:4222"
	}

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgres://vessel_admin:secret_password@localhost:5432/vessel_db"
	}

	// 1. Initialize DB client for status updates
	dbClient, err := db.NewPostgresClient(ctx, dbUrl)
	if err != nil {
		log.Fatalf("Failed to init DB: %v", err)
	}
	defer dbClient.Close()

	// 2. Initialize Heartbeat
	hbManager := agent.NewHeartbeatManager(redisAddr, nodeID)
	go hbManager.Start(ctx)

	// 3. Connect to NATS JetStream
	nc, err := nats.Connect(natsUrl)
	if err != nil {
		log.Fatalf("Failed to connect to NATS: %v", err)
	}
	defer nc.Close()

	js, err := jetstream.New(nc)
	if err != nil {
		log.Fatalf("Failed to init JetStream: %v", err)
	}

	// 4. Initialize Docker Runtime with NATS connection
	dockerRt, err := runtime.NewDockerRuntime(nc)
	if err != nil {
		log.Fatalf("Failed to initialize Docker runtime: %v", err)
	}

	// 5. Create Streams & Consumer
	streamName := "WORKLOADS"
	_, err = js.CreateOrUpdateStream(ctx, jetstream.StreamConfig{
		Name:     streamName,
		Subjects: []string{"jobs.assigned.>"},
	})
	if err != nil {
		log.Printf("Warning: failed to ensure stream %s: %v", streamName, err)
	}

	_, err = js.CreateOrUpdateStream(ctx, jetstream.StreamConfig{
		Name:     "LOGS",
		Subjects: []string{"logs.job.>"},
		MaxAge:   7 * 24 * time.Hour, // Keep logs for 7 days
	})
	if err != nil {
		log.Printf("Warning: failed to ensure LOGS stream: %v", err)
	}

	consumer, err := js.CreateOrUpdateConsumer(ctx, streamName, jetstream.ConsumerConfig{
		Durable:       "worker-" + nodeID,
		AckPolicy:     jetstream.AckExplicitPolicy,
		FilterSubject: "jobs.assigned." + nodeID,
	})
	if err != nil {
		log.Fatalf("Failed to create consumer: %v", err)
	}

	// 6. Polling Loop
	log.Printf("Worker %s started, listening for jobs...", nodeID)
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			default:
				msgs, err := consumer.FetchNoWait(1)
				if err != nil {
					time.Sleep(500 * time.Millisecond)
					continue
				}
				msg := <-msgs.Messages()
				if msg == nil {
					time.Sleep(500 * time.Millisecond)
					continue
				}

				var assignment JobAssignment
				if err := json.Unmarshal(msg.Data(), &assignment); err != nil {
					log.Printf("Invalid job payload, terminating message: %v", err)
					msg.Term()
					continue
				}

				log.Printf("Received assignment for job %s (image=%s)", assignment.JobID, assignment.Image)

				// Update job status to 'running' in PostgreSQL
				if err := dbClient.UpdateJobStatus(ctx, assignment.JobID, "running"); err != nil {
					log.Printf("Failed to update job %s to running: %v", assignment.JobID, err)
					// NAK so it can be retried
					msg.Nak()
					continue
				}

				// Execute the job in Docker
				if err := dockerRt.ExecuteJob(ctx, assignment.JobID, assignment.Image, assignment.Payload); err != nil {
					log.Printf("Job %s execution failed: %v", assignment.JobID, err)

					// Update status to 'failed' in PostgreSQL
					if dbErr := dbClient.UpdateJobStatus(ctx, assignment.JobID, "failed"); dbErr != nil {
						log.Printf("Failed to update job %s to failed: %v", assignment.JobID, dbErr)
					}

					msg.Term()
				} else {
					log.Printf("Job %s execution completed successfully", assignment.JobID)

					// Update status to 'completed' in PostgreSQL
					if dbErr := dbClient.UpdateJobStatus(ctx, assignment.JobID, "completed"); dbErr != nil {
						log.Printf("Failed to update job %s to completed: %v", assignment.JobID, dbErr)
					}

					msg.Ack()
				}
			}
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down worker agent...")
}
