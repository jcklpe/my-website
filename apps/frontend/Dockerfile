FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/styles/package.json ./packages/styles/package.json

RUN pnpm install --filter @my-website/frontend... --frozen-lockfile=false

COPY apps/frontend ./apps/frontend
COPY packages/styles ./packages/styles

WORKDIR /app/apps/frontend

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]
