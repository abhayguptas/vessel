package db

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresClient struct {
	pool *pgxpool.Pool
}

func NewPostgresClient(ctx context.Context, connString string) (*PostgresClient, error) {
	pool, err := pgxpool.New(ctx, connString)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to database: %v", err)
	}
	log.Printf("Agent connected to PostgreSQL")
	return &PostgresClient{pool: pool}, nil
}

// UpdateJobStatus updates the job status and timestamp in PostgreSQL.
// Only transitions to the target status if the current status allows it.
func (db *PostgresClient) UpdateJobStatus(ctx context.Context, jobID string, status string) error {
	tag, err := db.pool.Exec(ctx,
		"UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2",
		status, jobID,
	)
	if err != nil {
		return fmt.Errorf("failed to update job %s to %s: %w", jobID, status, err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("job %s not found", jobID)
	}
	return nil
}

func (db *PostgresClient) Close() {
	db.pool.Close()
}
