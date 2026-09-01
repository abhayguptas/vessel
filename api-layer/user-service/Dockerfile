FROM node:22-alpine
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=@vessel/user-service...
EXPOSE 3001
CMD ["node", "api-layer/user-service/dist/index.js"]
