# Deploying Vessel to a Single VPS

This guide provides step-by-step instructions for deploying the entire Vessel monorepo (Frontend, Node.js API, Go Scheduler, Go Execution Agent, PostgreSQL, Redis, and NATS) onto a single Virtual Private Server (VPS) such as DigitalOcean, Hetzner, or AWS EC2, without relying on Vercel or other PaaS providers.

## Prerequisites

1. A Linux VPS (Ubuntu 22.04+ recommended) with at least 2GB of RAM.
2. A registered domain name pointing to your VPS public IP address (A record).
3. SSH access to the VPS.

## Step 1: Install Dependencies

Log into your VPS and install Docker, Docker Compose, and Node.js/pnpm (needed for database migrations).

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Node.js (via NVM or directly)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Enable Corepack and pnpm
sudo corepack enable
```

## Step 2: Clone the Repository

```bash
git clone https://github.com/your-username/vessel.git
cd vessel
```

## Step 3: Configure the Domain & Caddy

Vessel uses Caddy as an automatic HTTPS reverse proxy for both the frontend UI and the backend APIs.

Open `Caddyfile` in the root of the repository and replace `:80` with your actual domain name to enable automatic Let's Encrypt SSL.

```caddyfile
# Change :80 to your domain (e.g., vessel.yourdomain.com)
vessel.yourdomain.com {
    # Enable compression for static assets
    encode gzip zstd
    
    # ... rest of the file
}
```

## Step 4: Configure Secrets

The `docker-compose.prod.yml` uses default environment variables that must be overridden for a public deployment. Set the JWT secret securely.

```bash
export JWT_SECRET=$(openssl rand -hex 32)
```

*(Note: It's highly recommended to place these variables inside a `.env` file in the root directory so Docker Compose picks them up automatically).*

## Step 5: Start the Cluster

Use Docker Compose to build all services, compile the Vite frontend into a static bundle, and start the system.

```bash
# Build and run in detached mode
sudo -E docker compose -f docker-compose.prod.yml up --build -d
```

## Step 6: Apply Database Migrations

The database schema must be pushed to the PostgreSQL container. Since the PostgreSQL container does not expose port `5432` to the host machine for security reasons, we will temporarily run the migration from the host by connecting to the container's internal network IP, or by executing it via one of the Node.js containers.

First, install the local dependencies:
```bash
pnpm install
```

Then, execute the migration inside the running `user-service` container:
```bash
sudo docker exec -it atlas-user-service-1 pnpm exec drizzle-kit push --config=packages/db-client/drizzle.config.ts
```
*(Alternatively, you can expose `5432:5432` temporarily in the `docker-compose.prod.yml`, run `DATABASE_URL=postgresql://vessel_admin:secret_password@localhost:5432/vessel_db pnpm --filter @vessel/db-client run push`, and then remove the port mapping).*

## Step 7: Verify the Deployment

1. Visit `https://vessel.yourdomain.com` in your browser.
2. Register an organization.
3. Submit a workload through the dashboard (e.g., `hello-vessel`).
4. Watch the live Server-Sent Events (SSE) logs stream from the Go execution agent back to your browser!

### Security Note

By design, this deployment:
- Does **not** expose PostgreSQL (`5432`), Redis (`6379`), or NATS (`4222`, `8222`) to the public internet.
- Restricts job execution to predefined allowlisted images (e.g., `alpine:latest`) and commands to prevent arbitrary code execution on your server.
- Limits Docker container resources (50% CPU, 256MB RAM) and log sizes (5MB).
- Enforces strict execution timeouts (default 15s for the demo).
