.PHONY: up down restart logs build-apis run-user run-job run-scheduler run-agent

up:
	@echo "Starting Vessel infrastructure..."
	cd core-infra && docker-compose up -d

down:
	@echo "Stopping Vessel infrastructure..."
	cd core-infra && docker-compose down

restart: down up

logs:
	cd core-infra && docker-compose logs -f

build-apis:
	@echo "Building Node.js API services..."
	pnpm install
	pnpm run build

run-user:
	@echo "Starting User Service..."
	node api-layer/user-service/dist/index.js

run-job:
	@echo "Starting Job Service..."
	node api-layer/job-service/dist/index.js

run-scheduler:
	@echo "Starting Scheduler..."
	cd core-infra/scheduler && go run ./cmd/scheduler

run-agent:
	@echo "Starting Execution Agent..."
	cd core-infra/execution-agent && go run ./cmd/agent
