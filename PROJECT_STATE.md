# Project State

Last updated: 2026-09-24

## Current phase

Phase 2 — Authentication, RBAC, and tenancy: complete.

## Completed

- pnpm workspace with `apps/web`, `apps/api`, and `packages/shared`
- strict shared TypeScript and ESLint/Prettier configuration
- Next.js App Router shell with Tailwind and accessible base states
- layered Express API with structured logging and `/api/v1/health`
- shared Zod domain and API schemas
- Prisma PostgreSQL schema covering the MVP entities, indexes, and seed data
- Dockerfiles and Docker Compose for web, API, and PostgreSQL
- GitHub Actions verification and container-build jobs
- architecture, deployment, setup, environment, demo, and tradeoff documentation
- organization registration, login, logout, and current-user API
- signed CSRF protection and JWT access cookies
- auth rate limiting and generic credential errors
- ADMIN-created, hashed, expiring, one-time invitations
- central authentication, RBAC, and tenant/client scope policy
- login, registration, invite acceptance, authenticated dashboard, logout, and invitation UI
- authentication, authorization, CSRF, invitation replay, and tenant isolation tests

## Verification

Completed on 2026-09-24:

- `pnpm db:generate` — passed
- `prisma validate` — passed
- initial PostgreSQL migration SQL generated and checked in
- `pnpm lint` — passed
- `pnpm typecheck` — passed
- `pnpm test` — passed (2 API tests)
- `pnpm build` — passed for shared, API, and web packages
- `pnpm format:check` — passed
- `docker compose config --quiet` — passed
- Docker images for API and web — built successfully
- Docker Compose stack — started successfully
- PostgreSQL health check — passed
- initial migration applied successfully to PostgreSQL 17
- idempotent seed executed twice successfully
- seed counts verified: 1 organization, 2 clients, 4 users, 2 projects, 2 requirements, and 1 task
- API container health check and `GET /api/v1/health` — passed
- web container smoke request — HTTP 200 with expected portal content
- `pnpm test` — passed with 13 API tests after Phase 2
- live Docker ADMIN and CLIENT login — passed
- missing-CSRF request — rejected with HTTP 403
- CLIENT invitation attempt — rejected with HTTP 403
- live invitation creation and acceptance — passed
- invited ENGINEER organization assignment — verified in API and PostgreSQL
- invitation token stored as a 64-character SHA-256 hash — verified
- `INVITE_CREATED` and `INVITE_ACCEPTED` activity entries — verified

The Phase 2 verification containers and network were removed after testing. The PostgreSQL volume was preserved for local development.

## Next phase

Phase 3 — tenant-scoped clients, projects, and requirement submission APIs and UI, including pagination, validation, authorization, and isolation tests.
