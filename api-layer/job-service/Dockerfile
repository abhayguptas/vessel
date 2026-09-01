FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY . .
ENV CI=true
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@vessel/job-service...
EXPOSE 3002
CMD ["node", "api-layer/job-service/dist/index.js"]
