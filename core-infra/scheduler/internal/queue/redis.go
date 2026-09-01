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

func NewRedisQueue(redisUrl string) (*RedisQueue, error) {
	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opt)
	return &RedisQueue{client: client}, nil
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

// GetActiveWorker returns the ID of a randomly selected active worker
func (q *RedisQueue) GetActiveWorker(ctx context.Context) (string, error) {
	// Pick a random active worker from the sorted set
	// In production, you'd likely want load balancing or just ZRandMember
	res, err := q.client.ZRandMember(ctx, "vessel:workers:active", 1).Result()
	if err != nil {
		if err == redis.Nil {
			return "", nil
		}
		return "", err
	}
	if len(res) == 0 {
		return "", nil
	}
	return res[0], nil
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
