package queue

import (
	"context"
	"encoding/json"
	"github.com/redis/go-redis/v9"
)

type JobPayload struct {
	ID             string `json:"id"`
	OrganizationID string `json:"organization_id"`
	Type           string `json:"type"`
	Priority       string          `json:"priority"`
	Payload        json.RawMessage `json:"payload"`
}

type RedisQueue struct {
	client *redis.Client
}

func NewRedisQueue(addr string) *RedisQueue {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})
	return &RedisQueue{client: client}
}

// Push adds a job to the priority queue
func (q *RedisQueue) Push(ctx context.Context, job JobPayload) error {
	data, err := json.Marshal(job)
	if err != nil {
		return err
	}

	score := getPriorityScore(job.Priority)
	err = q.client.ZAdd(ctx, "vessel:queue:jobs", redis.Z{
		Score:  score,
		Member: data,
	}).Err()
	return err
}

// Pop fetches the highest priority job from the queue
func (q *RedisQueue) Pop(ctx context.Context) (*JobPayload, error) {
	// Pop highest score element
	res, err := q.client.ZPopMax(ctx, "vessel:queue:jobs", 1).Result()
	if err != nil {
		return nil, err
	}
	if len(res) == 0 {
		return nil, nil // Empty queue
	}

	member := res[0].Member.(string)
	var job JobPayload
	if err := json.Unmarshal([]byte(member), &job); err != nil {
		return nil, err
	}

	return &job, nil
}

func getPriorityScore(priority string) float64 {
	switch priority {
	case "high":
		return 100
	case "normal":
		return 50
	case "low":
		return 10
	default:
		return 50
	}
}
