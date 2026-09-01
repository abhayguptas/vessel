package db

import (
	"context"
	"fmt"
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
	return &PostgresClient{pool: pool}, nil
}

func (db *PostgresClient) UpdateJobStatus(ctx context.Context, jobID string, status string) error {
	_, err := db.pool.Exec(ctx, "UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2", status, jobID)
	return err
}

func (db *PostgresClient) Close() {
	db.pool.Close()
}
