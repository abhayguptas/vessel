package messaging

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/nats-io/nats.go"
)

// JobAssignment is the payload published to NATS for the execution agent.
// Must match the agent's JobAssignment struct exactly.
type JobAssignment struct {
	JobID   string   `json:"job_id"`
	Image   string   `json:"image"`
	Payload []string `json:"payload"`
}

type NATSClient struct {
	conn *nats.Conn
}

func NewNATSClient(url string) (*NATSClient, error) {
	nc, err := nats.Connect(url,
		nats.RetryOnFailedConnect(true),
		nats.MaxReconnects(10),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS at %s: %w", url, err)
	}
	log.Printf("Connected to NATS at %s", url)
	return &NATSClient{conn: nc}, nil
}

// PublishAssignment publishes a job assignment to the worker's NATS subject.
func (n *NATSClient) PublishAssignment(workerID string, assignment JobAssignment) error {
	subject := fmt.Sprintf("jobs.assigned.%s", workerID)
	data, err := json.Marshal(assignment)
	if err != nil {
		return fmt.Errorf("failed to marshal assignment: %w", err)
	}

	if err := n.conn.Publish(subject, data); err != nil {
		return fmt.Errorf("failed to publish to %s: %w", subject, err)
	}

	log.Printf("Published assignment for job %s to %s", assignment.JobID, subject)
	return nil
}

func (n *NATSClient) Close() {
	if n.conn != nil {
		n.conn.Close()
	}
}
