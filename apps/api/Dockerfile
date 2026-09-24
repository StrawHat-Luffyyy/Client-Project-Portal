FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /workspace

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS build
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages/shared packages/shared
RUN pnpm --filter @client-portal/api db:generate
RUN pnpm --filter @client-portal/shared build && pnpm --filter @client-portal/api build

FROM build AS runtime
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "apps/api/dist/src/server.js"]

