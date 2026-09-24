FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /workspace

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY tsconfig.base.json eslint.config.mjs ./
COPY apps/web apps/web
COPY packages/shared packages/shared
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @client-portal/shared build && pnpm --filter @client-portal/web build

FROM build AS runtime
ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "--filter", "@client-portal/web", "start"]
