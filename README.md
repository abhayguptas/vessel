<p align="center">
  <img src="./assets/vessel-logo.svg" alt="Vessel logo" width="112" height="112" />
</p>

<h1 align="center">Vessel</h1>

<p align="center">
  Distributed workload orchestration with a TypeScript control plane and Go execution core.
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=white" />
  <img alt="Go" src="https://img.shields.io/badge/Go-1.26+-00ADD8?logo=go&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=111827" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Redis" src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" />
  <img alt="NATS" src="https://img.shields.io/badge/NATS-JetStream-27AAE1" />
</p>

## Overview

Vessel is a fully-functioning production-grade workload execution platform. It provides a React dashboard, Node.js API services for tenant authentication and job submission, a shared Drizzle/PostgreSQL data model, and Go services for queue scheduling and container execution.

The user and job APIs persist real data in PostgreSQL and strictly enforce JWT multi-tenancy. The Go scheduler reliably consumes Redis priority-queue entries, discovers active execution agents via Redis heartbeats, and delegates assignments via NATS JetStream. The execution agent runs real workloads using the local Docker daemon, pulls images on demand, streams stdout/stderr live logs through NATS to the frontend via Server-Sent Events, and reports metrics. 

Everything you see works end-to-end. There is no simulated execution, no fake worker states, and no hardcoded logs.

## Features

- **Multi-tenant Control Plane**: `user-service` manages organization boundaries, role-based access, JWTs, and secure API-key generation.
- **RESTful Job API**: `job-service` accepts execution requests authorized by `x-api-key` or Bearer JWT, validates payloads, and enqueues jobs in PostgreSQL and Redis.
- **Priority Queue Scheduling**: A Go-based scheduler evaluates a Redis priority-sorted set, locates active agent nodes via heartbeat lookups, and dispatches assignments via NATS JetStream.
- **Execution Agent**: An autonomous Go agent that connects to NATS, listens on assigned streams, pulls images via the Docker engine, and reliably executes containers.
- **Distributed Logging**: Live stdout and stderr from running containers are captured by the execution agent and streamed securely to the frontend dashboard through NATS and an SSE reverse-proxy.
- **Public Demo Mode**: Hardened configuration that allows safe, allowlisted public demo jobs (`hello-vessel`) while preserving execution authenticity.

## Architecture

```mermaid
flowchart LR
    Browser[React/Vite UI] --> Caddy[Caddy Proxy]
    Caddy --> UserAPI[user-service :3001]
    Caddy --> JobAPI[job-service :3002]

    UserAPI --> Auth["@vessel/auth"]
    UserAPI --> DBClient["@vessel/db-client"]
    JobAPI --> Auth
    JobAPI --> DBClient
    DBClient --> Postgres[(PostgreSQL)]

    JobAPI --> Redis[(Redis)]
    
    Scheduler[Go scheduler] --> Redis
    Scheduler --> Postgres

    NATS[(NATS JetStream)]
    Scheduler --> NATS
    Agent[Go execution-agent] --> Redis
    Agent --> NATS
    Agent --> Docker[Docker daemon]
```

### End-to-End Execution Pipeline

```mermaid
sequenceDiagram
    participant User
    participant JobAPI as job-service
    participant DB as PostgreSQL
    participant Redis
    participant Scheduler
    participant NATS
    participant Agent
    participant Docker

    User->>JobAPI: POST /api/v1/jobs { workloadId }
    JobAPI->>DB: INSERT pending job
    JobAPI->>Redis: ZADD vessel:queue:jobs (Priority Score)
    Scheduler->>Redis: ZPOPMAX vessel:queue:jobs
    Scheduler->>DB: UPDATE status='scheduled'
    Scheduler->>Redis: Query Active Workers
    Scheduler->>NATS: Publish JobAssignment to worker
    Agent->>NATS: Subscribe to jobs.assigned.<worker_id>
    Agent->>Docker: Pull Image & Create Container
    Agent->>NATS: Stream logs & events
    NATS-->>JobAPI: Read logs
    JobAPI-->>User: Server-Sent Events (SSE)
    Agent->>Docker: Wait for Exit Code
```

## Getting Started

Start the infrastructure and microservices stack locally using Docker Compose. All components, including the Go scheduler, Go execution-agent, and Node.js control plane, are containerized for immediate execution.

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Apply the database schema locally (Requires Node.js & `pnpm`):
```bash
pnpm install
DATABASE_URL=postgresql://vessel_admin:secret_password@localhost:5432/vessel_db pnpm --filter @vessel/db-client run push
```

The Vessel UI is automatically proxied by Caddy and is available at `http://localhost/`.

## API Reference

### Job Service

Base URL: `http://localhost/api/v1/jobs`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Bearer JWT or `x-api-key` | Submit a new job to the distributed queue. |
| `GET` | `/` | Bearer JWT | List jobs for the authenticated organization. |
| `GET` | `/:id/logs`| Bearer JWT | SSE endpoint streaming real-time execution logs. |

Submit a job with an API key:

```bash
curl -X POST http://localhost/api/v1/jobs \
  -H "x-api-key: vessel_live_<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "docker",
    "priority": "normal",
    "workloadId": "hello-vessel"
  }'
```

## License

This repository is licensed under the ISC License.
