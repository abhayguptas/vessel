package runtime

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/nats-io/nats.go"
)

type DockerRuntime struct {
	cli *client.Client
	nc  *nats.Conn
}

func NewDockerRuntime(nc *nats.Conn) (*DockerRuntime, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &DockerRuntime{cli: cli, nc: nc}, nil
}

func (d *DockerRuntime) getEnvInt(key string, def int) int {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	var res int
	fmt.Sscanf(val, "%d", &res)
	if res == 0 {
		return def
	}
	return res
}

func (d *DockerRuntime) getEnvFloat(key string, def float64) float64 {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	var res float64
	fmt.Sscanf(val, "%f", &res)
	if res == 0 {
		return def
	}
	return res
}

type LogPayload struct {
	JobID     string `json:"job_id"`
	Timestamp string `json:"timestamp"`
	Message   string `json:"message"`
}

// ExecuteJob runs a given image as a container
func (d *DockerRuntime) ExecuteJob(ctx context.Context, jobID string, img string, payload []string) error {
	log.Printf("Executing job %s with image %s", jobID, img)

	timeoutSec := d.getEnvInt("WORKER_EXECUTION_TIMEOUT_SEC", 300)
	ctx, cancel := context.WithTimeout(ctx, time.Duration(timeoutSec)*time.Second)
	defer cancel()

	start := time.Now()

	reader, err := d.cli.ImagePull(ctx, img, image.PullOptions{})
	if err == nil {
		io.Copy(os.Stdout, reader)
		reader.Close()
	} else {
		log.Printf("Image pull error (continuing if local exists): %v", err)
	}

	resp, err := d.cli.ContainerCreate(ctx, &container.Config{
		Image: img,
		Cmd:   payload,
		Tty:   false,
	}, &container.HostConfig{
		AutoRemove: true,
		Resources: container.Resources{
			Memory:   int64(d.getEnvInt("WORKER_MEM_LIMIT_MB", 256)) * 1024 * 1024,
			NanoCPUs: int64(d.getEnvFloat("WORKER_CPU_LIMIT", 0.5) * 1e9),
		},
	}, nil, nil, fmt.Sprintf("vessel-job-%s", jobID))

	if err != nil {
		return fmt.Errorf("failed to create container: %v", err)
	}

	if err := d.cli.ContainerStart(ctx, resp.ID, container.StartOptions{}); err != nil {
		return fmt.Errorf("failed to start container: %v", err)
	}

	// Stream logs to NATS
	logsReader, err := d.cli.ContainerLogs(ctx, resp.ID, container.LogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
	})
	if err == nil {
		go d.streamLogs(jobID, logsReader)
	}

	statusCh, errCh := d.cli.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	var exitCode int64
	select {
	case err := <-errCh:
		if err != nil {
			log.Printf("Error waiting for container %s (job %s): %v. Terminating container.", resp.ID, jobID, err)
			// Use context.Background() because the original ctx might be cancelled/timed out
			killCtx, killCancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer killCancel()
			if killErr := d.cli.ContainerKill(killCtx, resp.ID, "SIGKILL"); killErr != nil {
				log.Printf("Failed to kill container %s: %v", resp.ID, killErr)
			}
			// Let AutoRemove handle cleanup if kill succeeds
			d.emitMetric(jobID, "failed", time.Since(start).Seconds())
			return err
		}
	case status := <-statusCh:
		exitCode = status.StatusCode
		if status.StatusCode != 0 {
			d.emitMetric(jobID, "failed", time.Since(start).Seconds())
			return fmt.Errorf("container exited with code %d", status.StatusCode)
		}
	}

	duration := time.Since(start)
	log.Printf("Job %s completed successfully in %s with exit code %d", jobID, duration, exitCode)

	// Emit metric event
	d.emitMetric(jobID, "success", duration.Seconds())
	return nil
}

func (d *DockerRuntime) streamLogs(jobID string, reader io.ReadCloser) {
	defer reader.Close()
	scanner := bufio.NewScanner(reader)
	subject := fmt.Sprintf("logs.job.%s", jobID)

	for scanner.Scan() {
		text := scanner.Text()
		if len(text) > 8 {
			text = text[8:] // Strip Docker header for tty=false
		}

		payload := LogPayload{
			JobID:     jobID,
			Timestamp: time.Now().UTC().Format(time.RFC3339Nano),
			Message:   text,
		}

		data, _ := json.Marshal(payload)
		d.nc.Publish(subject, data)
	}
}

func (d *DockerRuntime) emitMetric(jobID string, status string, durationSec float64) {
	metric := map[string]interface{}{
		"job_id":    jobID,
		"status":    status,
		"duration":  durationSec,
		"timestamp": time.Now().UTC().Format(time.RFC3339Nano),
	}
	data, _ := json.Marshal(metric)
	d.nc.Publish("metrics.jobs", data)
}
