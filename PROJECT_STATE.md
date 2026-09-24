# Project State

Last updated: 2026-09-24

## Current phase

Phase 3 — Clients, projects, and requirements: complete.

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
- tenant-scoped client and project list/create/detail APIs
- paginated project and requirement listings with status filtering
- client-only requirement submission and eligible content updates
- optional local requirement attachments with type and size validation
- transactional activity entries for clients, projects, and requirements
- role-aware projects, project detail, requirement detail, and client/team UI
- client selectors for project creation and CLIENT invitations
- cross-client and cross-organization project/requirement isolation tests

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
- `pnpm test` — passed with 21 API tests after Phase 3
- CLIENT project listing limited to its authenticated `clientId` — passed
- cross-client and cross-organization project/requirement access — rejected with HTTP 404
- CLIENT requirement submission with attachment — passed
- direct arbitrary requirement status update — rejected with HTTP 400
- organization-wide client/project reads by ENGINEER — rejected with HTTP 403
- local and container production compilation — passed, including all Phase 3 routes
- Phase 3 API and web images — built and unpacked successfully in Docker Desktop
- live Phase 3 Compose stack — PostgreSQL and API healthy; web route returned HTTP 200
- live ADMIN client and project creation — passed
- live CLIENT project list — limited to the authenticated client's project
- live multipart requirement submission with a text attachment — passed
- live cross-client project access — concealed with HTTP 404
- live direct requirement status mutation — rejected with HTTP 400
- live ENGINEER portfolio access — rejected with HTTP 403
- live requirement, attachment metadata, and attachment file persistence — verified
- `CLIENT_CREATED`, `PROJECT_CREATED`, and `REQUIREMENT_SUBMITTED` activity entries — verified in PostgreSQL

The Docker host issue is resolved. PostgreSQL and attachment volumes are preserved for local development.

## Next phase

Phase 4 — requirement triage, validated status transitions, rejection/request-information reasons, and requirement activity history.
