# Project State

Last updated: 2026-09-24

## Current phase

Phase 6 — Comments with visibility rules: complete.

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
- PM-only requirement triage endpoint with validated state transitions
- required explanations for request-information and rejection decisions
- atomic status changes and immutable requirement activity entries
- tenant- and client-scoped paginated requirement activity API
- role-aware PM triage controls and requirement activity timeline
- rejection explanations surfaced on requirement details
- PM-only task breakdown for approved requirements with assignee, estimate, and due date
- idempotent task creation with tenant-scoped database uniqueness
- forward-only task transitions through `TODO`, `IN_PROGRESS`, `IN_REVIEW`, and `DONE`
- assigned-engineer task isolation and organization-wide PM board access
- automatic requirement start when its first task enters progress
- PM delivery confirmation gated on every task being done
- tenant/client-scoped task summaries on requirement details
- responsive PM/ENGINEER board with project and assignee filtering
- transactional task and automatic requirement activity entries
- paginated comments on requirements and tasks
- one-level threaded-lite replies with parent visibility enforcement
- internal and client-visible discussion channels
- client creation restricted to client-visible comments
- assigned-engineer comment scope for tasks and their requirements
- client/organization isolation for every comment target and parent
- internal comment activity filtered from client audit history
- transactional immutable `COMMENT_CREATED` activity entries
- accessible requirement discussions and lazy-loaded board-card task discussions

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
- `pnpm typecheck` — passed after Phase 4
- `pnpm lint` — passed after Phase 4
- `pnpm test` — passed with 30 API tests after Phase 4
- `pnpm build` — passed for shared, API, and web packages after Phase 4
- PM transition-policy unit tests — passed for every requirement status
- triage API tests — passed for RBAC, required reasons, invalid transitions, terminal rejection, activity ordering, and tenant/client isolation
- Phase 4 requirement UI production build — passed
- Phase 4 API and web images — built and unpacked successfully in Docker Desktop
- live Phase 4 Compose stack — PostgreSQL and API healthy; requirement page returned HTTP 200
- live CLIENT requirement submission — created in `SUBMITTED`
- live CLIENT transition attempt — rejected with HTTP 403
- live invalid PM transition — rejected with HTTP 409 and the consistent transition error
- live PM triage workflow — `SUBMITTED -> IN_REVIEW -> NEEDS_INFO -> IN_REVIEW -> APPROVED`
- live request-information reason — visible to the scoped CLIENT in requirement activity
- live requirement status and five immutable activity rows — verified in PostgreSQL
- `pnpm typecheck` — passed after Phase 5
- `pnpm lint` — passed after Phase 5
- `pnpm test` — passed with 38 API tests after Phase 5
- `pnpm build` — passed for shared, API, and web packages after Phase 5, including `/board`
- Prisma schema generation and validation — passed after adding task idempotency
- task transition-policy unit tests — passed for the complete forward-only state sequence
- task API tests — passed for RBAC, assignment scope, tenant/client isolation, idempotency, invalid transitions, automatic requirement start, delivery gating, filtering, and activity logging
- Phase 5 API and web images — built successfully in Docker Desktop
- live Phase 5 Compose stack — PostgreSQL and API healthy; board and requirement routes returned HTTP 200
- live CLIENT submission and PM approval — passed
- live PM task breakdown — created two assigned tasks with estimates and due dates
- live duplicate task retry — returned the original task and persisted exactly two tasks
- live CLIENT board access — rejected with HTTP 403 while scoped requirement tasks remained visible
- live assigned ENGINEER board — contained both assigned tasks
- live skipped task transition — rejected with HTTP 409
- live first task start — automatically changed the requirement to `IN_PROGRESS`
- live premature PM delivery confirmation — rejected with HTTP 409
- live task workflow — both tasks advanced through every status to `DONE`
- live PM delivery confirmation — changed the requirement to `DELIVERED`
- task idempotency migration, final task rows, assignees, and 13 immutable activity rows — verified in PostgreSQL
- `pnpm typecheck` — passed after Phase 6
- `pnpm lint` — passed after Phase 6
- `pnpm test` — passed with 42 API tests after Phase 6
- `pnpm build` — passed for shared, API, and web packages after Phase 6
- Prisma generation and schema validation — passed with the comment parent index
- comment API tests — passed for CSRF, visibility, one-level replies, assignment scope, client isolation, organization isolation, and activity filtering
- Phase 6 API and web images — built successfully in Docker Desktop
- live Phase 6 Compose stack — PostgreSQL and API healthy; requirement and board routes returned HTTP 200
- live PM requirement discussion — created internal and client-visible comments
- live CLIENT requirement view — returned the visible comment and excluded the internal comment
- live CLIENT internal-comment attempt — rejected with HTTP 403
- live one-level CLIENT reply — created successfully
- live nested reply and visibility-changing reply — rejected with HTTP 409
- live assigned ENGINEER task comment — created successfully
- live CLIENT task discussion — excluded the engineer's internal note and accepted a client-visible question
- live client activity — included visible comment mutations and excluded internal requirement/task comment activity
- comment parent index, five target-specific rows, reply relationship, visibility values, and five activity entries — verified in PostgreSQL

Phase 6 live verification is complete. Named PostgreSQL and attachment volumes remain preserved for local development.

## Next phase

Phase 7 — tenant-filtered SSE live updates and notifications.
