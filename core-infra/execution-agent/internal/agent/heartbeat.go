package agent

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

type HeartbeatManager struct {
	client *redis.Client
	nodeID string
}

func NewHeartbeatManager(redisUrl string, nodeID string) (*HeartbeatManager, error) {
	opt, err := redis.ParseURL(redisUrl)
	if err != nil {
		return nil, err
	}
	client := redis.NewClient(opt)
	return &HeartbeatManager{
		client: client,
		nodeID: nodeID,
	}, nil
}

// Start pulses a heartbeat to Redis every 5 seconds
func (h *HeartbeatManager) Start(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()



	for {
		select {
		case <-ctx.Done():
			h.client.ZRem(context.Background(), "vessel:workers:active", h.nodeID)
			log.Println("Heartbeat stopped.")
			return
		case <-ticker.C:
			// Score is current timestamp in ms
			score := float64(time.Now().UnixMilli())
			err := h.client.ZAdd(ctx, "vessel:workers:active", redis.Z{
				Score:  score,
				Member: h.nodeID,
			}).Err()
			
			// Optional cleanup of old workers (older than 15s)
			cutoff := float64(time.Now().UnixMilli() - 15000)
			h.client.ZRemRangeByScore(ctx, "vessel:workers:active", "-inf", fmt.Sprintf("%f", cutoff))
			
			if err != nil {
				log.Printf("Failed to pulse heartbeat: %v", err)
			}
		}
	}
}
