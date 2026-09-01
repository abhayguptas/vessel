package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"vessel/core-infra/scheduler/internal/db"
	"vessel/core-infra/scheduler/internal/messaging"
	"vessel/core-infra/scheduler/internal/queue"
	"vessel/core-infra/scheduler/internal/scheduler"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	redisAddr := os.Getenv("REDIS_URL")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgres://vessel_admin:secret_password@localhost:5432/vessel_db"
	}

	natsUrl := os.Getenv("NATS_URL")
	if natsUrl == "" {
		natsUrl = "nats://localhost:4222"
	}

	workerID := os.Getenv("WORKER_NODE_ID")
	if workerID == "" {
		workerID = "worker-local-1"
	}

	// Init DB
	dbClient, err := db.NewPostgresClient(ctx, dbUrl)
	if err != nil {
		log.Fatalf("Failed to init DB: %v", err)
	}
	defer dbClient.Close()

	// Init Queue
	redisQueue := queue.NewRedisQueue(redisAddr)

	// Init NATS
	natsClient, err := messaging.NewNATSClient(natsUrl)
	if err != nil {
		log.Fatalf("Failed to init NATS: %v", err)
	}
	defer natsClient.Close()

	// Init Scheduler Engine
	engine := scheduler.NewEngine(redisQueue, dbClient, natsClient, workerID)

	// Run Engine in background
	go engine.Start(ctx)

	// Wait for interrupt signal for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down Scheduler...")
}
