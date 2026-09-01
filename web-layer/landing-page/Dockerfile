FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# Copy root config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy packages and frontend
COPY packages ./packages
COPY web-layer/landing-page ./web-layer/landing-page

# Install and build
ENV CI=true
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@vessel/landing-page...

FROM caddy:2-alpine
# Copy Caddyfile (we'll provide this at root and mount it, or copy it here)
# Copy built static files
COPY --from=builder /app/web-layer/landing-page/dist /srv

EXPOSE 80 443
