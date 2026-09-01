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

Vessel is a monorepo implementation of a workload orchestration platform. It provides a React dashboard, Node.js API services for tenant authentication and job submission, a shared Drizzle/PostgreSQL data model, and Go services for queue scheduling and container execution.

The project is a fully functioning production-grade scheduler. The user and job APIs persist real data in PostgreSQL and strictly enforce JWT multi-tenancy. The Go scheduler reliably consumes Redis priority-queue entries and delegates assignments via NATS JetStream. The execution agent runs Docker containers with rigid 5-minute execution timeouts and poison-pill retry prevention. Live metrics and streaming stdout/stderr logs are published securely from the agent directly to the UI via Server-Sent Events, supported by durable 7-day retention in JetStream.

## Features

- **Multi-tenant registration and login**: `user-service` creates an organization and owner user, hashes passwords with bcrypt, and issues JWT access/refresh tokens.
- **JWT protected dashboard flows**: the React app stores access tokens in local storage and protects the dashboard route.
- **API key management**: authenticated users can create and list hashed API keys scoped to their organization.
- **Job submission API**: `job-service` accepts jobs through either `x-api-key` or bearer JWT authentication, validates payloads with Zod, and stores tenant-scoped jobs in PostgreSQL.
- **Priority queue primitive**: the Go scheduler includes a Redis sorted-set queue using `high`, `normal`, and `low` scores.
- **Worker heartbeat primitive**: the execution agent records worker liveness in Redis with a 15 second TTL.
- **Container runtime**: assigned jobs can run as Docker containers with automatic image pull attempts, a 512 MB memory cap, log streaming, and success/failure metrics published to NATS.
- **Dashboard UI**: the Vite app includes landing, docs, login, registration, workload listing, workload submission, API-key generation, and basic charts derived from job data.

## Architecture

```mermaid
flowchart LR
    Browser[React/Vite UI] --> UserAPI[user-service :3001]
    Browser --> JobAPI[job-service :3002]

    UserAPI --> Auth["@vessel/auth"]
    UserAPI --> DBClient["@vessel/db-client"]
    JobAPI --> Auth
    JobAPI --> DBClient
    DBClient --> Postgres[(PostgreSQL)]

    Redis[(Redis)]
    Scheduler[Go scheduler] --> Redis
    Scheduler --> Postgres

    NATS[(NATS JetStream)]
    Agent[Go execution-agent] --> Redis
    Agent --> NATS
    Agent --> Docker[Docker daemon]

    JobAPI -. not implemented yet .-> Redis
    Scheduler -. TODO JobQueued event .-> NATS
```

### Implemented Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as React dashboard
    participant Users as user-service
    participant Jobs as job-service
    participant DB as PostgreSQL

    User->>UI: Register organization
    UI->>Users: POST /api/v1/users/register
    Users->>DB: Insert organization and owner user
    Users-->>UI: JWT tokens and user profile
    UI->>Jobs: POST /api/v1/jobs with bearer token
    Jobs->>DB: Insert pending job for token organization
    Jobs-->>UI: Created job
    UI->>Jobs: GET /api/v1/jobs
    Jobs->>DB: Select latest 50 org jobs
    Jobs-->>UI: Job list for dashboard
```

### Core Execution Primitives

```mermaid
sequenceDiagram
    participant Redis
    participant Scheduler
    participant Postgres
    participant NATS
    participant Agent
    participant Docker

    Scheduler->>Redis: ZPOPMAX vessel:queue:jobs
    Scheduler->>Postgres: UPDATE jobs SET status='queued'
    Note over Scheduler,NATS: Publishing assignment events is still TODO
    Agent->>NATS: Fetch jobs.assigned.worker_id
    Agent->>Docker: Pull image, create container, start container
    Agent->>NATS: Publish logs.job.job_id and metrics.jobs
    Agent->>Redis: Pulse vessel:worker:<id>:status
```

## Project Structure

```text
Vessel/
├── api-layer/
│   ├── user-service/          # Express auth, organization, role, and API-key endpoints
│   ├── job-service/           # Express job submission and listing endpoints
│   ├── api-gateway/           # Package placeholder
│   └── analytics-service/     # Package placeholder
├── core-infra/
│   ├── scheduler/             # Go Redis priority-queue consumer and job-state updater
│   ├── execution-agent/       # Go NATS consumer, Docker runtime, Redis heartbeats
│   ├── event-processor/       # Go module placeholder
│   └── worker-manager/        # Go module placeholder
├── packages/
│   ├── auth/                  # JWT helpers and SHA-256 API-key hashing
│   ├── db-client/             # Drizzle schema, migrations, and Postgres client
│   ├── logger/                # Pino logger package
│   └── types/                 # Package placeholder
├── web-layer/
│   └── landing-page/          # React 19 + Vite frontend
├── assets/                    # Repository branding assets
├── plan/                      # Roadmap and architecture planning notes
├── docker-compose.yml         # Local Postgres, Redis, ClickHouse, and NATS
├── Makefile                   # Convenience commands, see setup notes below
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js 22 or compatible modern Node runtime
- pnpm 11.6.0 or newer through Corepack
- Go 1.26 or newer for the full `core-infra/go.work` workspace
- Docker Desktop or Docker Engine
- A running Docker daemon if you run `execution-agent`

## Configuration

No `.env.example` file is currently checked in. The services use these defaults when environment variables are absent:

| Variable | Used by | Default |
| --- | --- | --- |
| `DATABASE_URL` | Node services, Drizzle, scheduler | `postgresql://vessel_admin:secret_password@localhost:5432/vessel_db` for Node; `postgres://vessel_admin:secret_password@localhost:5432/vessel_db` for Go |
| `USER_SERVICE_PORT` | `user-service` | `3001` |
| `JOB_SERVICE_PORT` | `job-service` | `3002` |
| `JWT_SECRET` | `@vessel/auth` | development fallback secret |
| `JWT_EXPIRES_IN` | `@vessel/auth` | `1h` |
| `REFRESH_SECRET` | `@vessel/auth` | development fallback secret |
| `REFRESH_EXPIRES_IN` | `@vessel/auth` | `7d` |
| `REDIS_URL` | scheduler, execution-agent | `localhost:6379` |
| `NATS_URL` | execution-agent | `nats://localhost:4222` |
| `WORKER_NODE_ID` | execution-agent | `worker-local-1` |
| `LOG_LEVEL` | `@vessel/logger` | `info` |

Replace the fallback JWT secrets before using the services outside local development.

## Getting Started

Install dependencies from the repository root:

```bash
corepack enable
pnpm install
```

Start the local infrastructure:

```bash
docker compose up -d
```

Apply the database schema:

```bash
pnpm --filter @vessel/db-client build
pnpm --filter @vessel/db-client migrate
```

Build the TypeScript workspace:

```bash
pnpm build
```

Run the backend services in separate terminals:

```bash
pnpm --filter @vessel/user-service dev
pnpm --filter @vessel/job-service dev
```

Run the frontend:

```bash
pnpm --filter @vessel/landing-page dev
```

Open the Vite URL shown by the frontend command, register an organization, and use the dashboard to create jobs and API keys.

### Optional Core Services

The Go services are useful for developing the scheduler and worker primitives, but they are not yet connected to submitted API jobs end to end.

```bash
cd core-infra/scheduler
go run ./cmd/scheduler
```

```bash
cd core-infra/execution-agent
go run ./cmd/agent
```

The execution agent requires access to the local Docker daemon and a reachable NATS server.

## API Reference

### User Service

Base URL: `http://localhost:3001/api/v1/users`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Create an organization and owner user. |
| `POST` | `/login` | No | Authenticate an existing user and return tokens. |
| `GET` | `/me` | Bearer JWT | Return decoded token user context. |
| `GET` | `/apikeys` | Bearer JWT | List API-key metadata for the current organization. |
| `POST` | `/apikeys` | Bearer JWT | Generate a new API key and return the raw key once. |
| `GET` | `/admin` | Bearer JWT, owner/admin | Verify role-protected access. |

Register:

```bash
curl -X POST http://localhost:3001/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "organizationName": "Example Org"
  }'
```

### Job Service

Base URL: `http://localhost:3002/api/v1/jobs`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Bearer JWT or `x-api-key` | Create a pending job for the authenticated organization. |
| `GET` | `/` | Bearer JWT | List the latest 50 jobs for the authenticated organization. |

Submit a job with a JWT:

```bash
curl -X POST http://localhost:3002/api/v1/jobs \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video-processor",
    "priority": "high",
    "payload": {
      "video_url": "s3://demo/video.mp4"
    }
  }'
```

Submit a job with an API key:

```bash
curl -X POST http://localhost:3002/api/v1/jobs \
  -H "x-api-key: vessel_live_<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "report-generator",
    "priority": "normal",
    "payload": {
      "report_id": "demo-001"
    }
  }'
```

## Development Commands

```bash
pnpm build                              # Build TypeScript packages, services, and frontend through Turbo
pnpm --filter @vessel/db-client generate # Generate Drizzle migrations from schema changes
pnpm --filter @vessel/db-client migrate  # Run Drizzle migrations
docker compose logs -f                  # Follow local infrastructure logs
docker compose down                     # Stop local infrastructure
```

The root `Makefile` contains convenience targets, but its compose targets currently run from `core-infra/` while `docker-compose.yml` is at the repository root. Use the direct `docker compose ...` commands above unless that target is corrected.

Frontend linting is configured with `pnpm --filter @vessel/landing-page lint`, but it currently reports existing React hook and TypeScript lint violations in the frontend source.

## Data Model

The current Drizzle schema contains:

- `organizations`: tenant boundary for users, API keys, and jobs.
- `users`: organization-scoped users with `owner`, `admin`, `member`, or `viewer` roles.
- `api_keys`: organization-scoped API keys stored as SHA-256 hashes with a visible prefix.
- `jobs`: organization-scoped workload records with `pending`, `queued`, `running`, `completed`, `failed`, or `cancelled` status.

## Failure Handling

- Invalid request bodies are rejected by Zod in the Node services.
- Invalid JWTs and API keys return unauthorized responses.
- Duplicate registration emails return a client error.
- API service failures are logged with Pino and returned as generic 500 responses.
- Scheduler Redis pop or Postgres update failures are logged and retried on the next tick.
- Execution-agent failures NAK the NATS message; successful runs ACK the message.
- Malformed NATS job assignments are terminated with `Term()`.
- Worker heartbeats expire automatically when the agent stops or stops refreshing Redis.

## Current Limitations

- Submitted HTTP jobs are not automatically pushed into the Redis scheduler queue.
- The scheduler does not yet publish `jobs.assigned.<worker-id>` events to NATS.
- The execution agent does not update Postgres job status after container execution.
- `api-gateway`, `analytics-service`, `event-processor`, `worker-manager`, and `packages/types` are placeholders.
- There are no checked-in automated tests or CI workflows.
- The frontend lint command currently fails on existing `AuthContext`, `Dashboard`, `Login`, and `Register` issues.
- The frontend docs page contains future-state copy that is ahead of the implemented API contract.
- ClickHouse is started by Docker Compose but no analytics service currently writes to it.
- No `.env.example` is present.

## License

This repository currently declares `ISC` in the root `package.json`.
