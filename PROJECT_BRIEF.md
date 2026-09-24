# Project Brief: Client Project Portal (Multi-Tenant SaaS)

<!-- Canonical product and technical specification. -->

## 1. Goal

Build a production-style web app where **clients submit requirements**, **project managers (PMs) triage them into tasks**, **engineers work the tasks**, and **everyone sees live status**. It simulates how a software agency collaborates with its clients.

Build it end-to-end: local dev, tests, CI/CD, and deployment to AWS. Prioritize a **working, deployed MVP** over extra features.

## 2. Tech Stack (use exactly this unless blocked)

| Layer    | Choice                                                                                 |
| -------- | -------------------------------------------------------------------------------------- |
| Frontend | Next.js (App Router) + TypeScript, Tailwind CSS, TanStack Query, React Hook Form + Zod |
| Backend  | Node.js + TypeScript, Express , Zod for validation                                     |
| Database | PostgreSQL + Prisma ORM (migrations + seed script)                                     |
| Auth     | Email/password, bcrypt, JWT access token in httpOnly cookie, role-based access control |
| Realtime | Server-Sent Events (SSE) for live status updates                                       |
| Testing  | Vitest/Jest + Supertest (API), Playwright (1-2 e2e flows)                              |
| Infra    | Docker + docker-compose (local), GitHub Actions CI/CD, AWS (EC2 or ECS + RDS Postgres) |
| Repo     | Monorepo: `/apps/web`, `/apps/api`, `/packages/shared` (shared Zod schemas/types)      |

## 3. Users and Roles

- **ADMIN**: manages the organization, invites users, creates clients.
- **PM**: triages requirements, creates/assigns tasks, changes statuses, sees all projects in the org.
- **ENGINEER**: sees assigned tasks, updates task status, comments.
- **CLIENT**: sees **only their own client's** projects and requirements; can submit requirements and comment.

## 4. Multi-Tenancy Rules (critical)

- Every record is scoped by `organizationId`. Client users are further scoped by `clientId`.
- Enforce scoping in a **central middleware/service layer**, not ad hoc in each route.
- A CLIENT must never be able to read or guess another client's data (test this explicitly).

## 5. Core Features (MVP)

1. **Auth and onboarding**: register organization (creates ADMIN), login/logout, invite users by email token (no real email needed; show the invite link in the UI/log).
2. **Clients and projects**: ADMIN/PM create clients and projects; assign a client to a project.
3. **Requirement submission (CLIENT)**: title, description, priority (LOW/MEDIUM/HIGH), optional file attachment (metadata + local/S3 upload).
4. **Triage (PM)**: review requirement, set status, request more info, approve, or reject with a reason.
5. **Task breakdown (PM)**: convert an approved requirement into 1..n tasks; set assignee, estimate, due date.
6. **Task board (ENGINEER/PM)**: Kanban columns `TODO → IN_PROGRESS → IN_REVIEW → DONE` with status change via drag-and-drop or dropdown.
7. **Comments**: threaded-lite comments on requirements and tasks; visibility flag `INTERNAL` vs `CLIENT_VISIBLE` (clients never see internal comments).
8. **Live status**: status changes and new comments push to connected users via SSE; a notification bell shows unread items.
9. **Activity log**: immutable audit trail of who changed what and when, shown on each requirement.
10. **Client dashboard**: progress per project (tasks done / total), requirement statuses, recent activity.

### Requirement status flow

`SUBMITTED → IN_REVIEW → (NEEDS_INFO ↔ IN_REVIEW) → APPROVED → IN_PROGRESS → DELIVERED`, with `REJECTED` as a terminal state from `IN_REVIEW`.
Enforce valid transitions on the server. Status becomes `IN_PROGRESS` automatically when the first task starts and `DELIVERED` when all tasks are `DONE` and a PM confirms.

## 6. Data Model (Prisma, starting point)

- `Organization(id, name, createdAt)`
- `User(id, orgId, clientId?, name, email unique, passwordHash, role, createdAt)`
- `Invite(id, orgId, clientId?, email, role, token, expiresAt, acceptedAt?)`
- `Client(id, orgId, name, contactEmail)`
- `Project(id, orgId, clientId, name, description, createdAt)`
- `Requirement(id, orgId, projectId, createdById, title, description, priority, status, rejectionReason?, createdAt, updatedAt)`
- `Task(id, orgId, requirementId, title, description, status, assigneeId?, estimateHours?, dueDate?, position, createdAt, updatedAt)`
- `Comment(id, orgId, authorId, requirementId?, taskId?, body, visibility, createdAt)`
- `Attachment(id, orgId, requirementId, fileName, storageKey, size, uploadedById)`
- `ActivityLog(id, orgId, actorId, entityType, entityId, action, metadata JSON, createdAt)`
- `Notification(id, orgId, userId, type, entityType, entityId, readAt?, createdAt)`

Add indexes on `(orgId)`, `(projectId, status)`, `(assigneeId, status)`. Provide a **seed script** with 1 org, 2 clients, 1 user per role, sample projects, requirements, and tasks.

## 7. API (REST, JSON, prefix `/api/v1`)

- `POST /auth/register-org`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `POST /invites`, `POST /invites/:token/accept`
- `GET/POST /clients`, `GET/POST /projects`, `GET /projects/:id`
- `GET/POST /projects/:id/requirements`, `GET/PATCH /requirements/:id`
- `POST /requirements/:id/transition` (body: `{ to, reason? }`)
- `GET/POST /requirements/:id/tasks`, `PATCH /tasks/:id`, `POST /tasks/:id/move`
- `GET/POST /requirements/:id/comments`, `GET/POST /tasks/:id/comments`
- `GET /requirements/:id/activity`
- `GET /notifications`, `POST /notifications/:id/read`
- `GET /events` (SSE stream, auth required)
- `GET /health`

Requirements for the API: input validation with Zod, consistent error format (`{ error: { code, message } }`), pagination on list endpoints, rate limiting on auth routes, an OpenAPI/Swagger doc, and structured logging.

## 8. Frontend Pages

- `/login`, `/register`, `/invite/[token]`
- `/dashboard` (role-aware: client view vs internal view)
- `/projects`, `/projects/[id]` (requirements list with status filters)
- `/requirements/[id]` (details, comments, activity, tasks)
- `/board` (Kanban of tasks, filter by project/assignee)
- `/admin` (users, clients, invites)

UI expectations: responsive, loading and empty states, form validation errors, toast feedback, accessible components. Keep the design clean and consistent, not elaborate.

## 9. Non-Functional Requirements

- **Security**: hashed passwords, httpOnly + SameSite cookies, CSRF protection for cookie auth, input validation, no secrets in the repo, `.env.example` provided.
- **Quality**: strict TypeScript, ESLint + Prettier, no `any` without justification.
- **Tests (minimum)**: unit tests for the status-transition logic; API tests for auth, RBAC, and tenant isolation (a CLIENT cannot access another client's data; a CLIENT cannot see INTERNAL comments); 1-2 Playwright flows (client submits requirement, PM approves and creates task, engineer moves it, client sees status update).
- **Docs**: README with architecture diagram (Mermaid), setup steps, env vars, API overview, and a "Tradeoffs and decisions" section.

## 10. Deployment and CI/CD

- `docker-compose.yml` runs web, api, and Postgres locally with one command.
- GitHub Actions: on every PR run lint, typecheck, and tests; on merge to `main` build Docker images and deploy to AWS.
- AWS target: API + web containers on ECS Fargate (or EC2 with Docker), RDS Postgres, S3 for attachments, secrets via SSM Parameter Store or Secrets Manager. Provide deploy steps in `docs/deploy.md`.

## 11. Suggested Build Order (work in phases, commit after each)

1. **Foundation**: monorepo, Docker Compose, Prisma schema, migrations, seed, health check, CI running lint/tests.
2. **Auth + RBAC + tenancy middleware**, with tests.
3. **Clients, projects, requirements** (API + UI).
4. **Triage flow + status-transition rules + activity log**.
5. **Tasks + Kanban board**.
6. **Comments with visibility rules**.
7. **SSE live updates + notifications**.
8. **Dashboards, polish, empty/error states**.
9. **e2e tests, docs, deployment**.

## 12. Definition of Done

- All MVP features above work locally with `docker compose up` and seeded demo data.
- Tenant isolation and role permissions are covered by passing automated tests.
- CI is green; the app is deployed at a public URL with demo credentials listed in the README.
- README includes architecture diagram, tradeoffs, and a short demo script (client -> PM -> engineer -> client).

## 13. Instructions for the Agent

- Before coding, restate the plan briefly and flag any ambiguity; otherwise make sensible assumptions and document them in the README.
- Work phase by phase. After each phase: run lint, typecheck, and tests, then summarize what changed.
- Prefer simple, readable solutions over clever ones. Do not add features outside this brief without asking.
- Keep shared types/schemas in `/packages/shared` to avoid frontend/backend drift.
- Never hardcode secrets. Use environment variables and provide `.env.example`.

## 14. Stretch Goals (only after the MVP is deployed)

- Email notifications (SES), Slack webhook on status changes.
- Requirement templates and full-text search.
- Client-facing weekly progress summary.
- Time tracking on tasks and burndown chart.
