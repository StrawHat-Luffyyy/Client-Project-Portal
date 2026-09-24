# Client Project Portal

A production-style, multi-tenant project operations portal for clients, project managers, engineers, and organization administrators. The MVP follows a requirement from client intake through triage, task delivery, comments, live updates, and client-visible progress.

## Status

Phase 3 is complete: authentication and tenancy now support scoped clients, projects, requirement submission, content updates, and local attachments. Requirement triage begins in Phase 4; see `PROJECT_STATE.md`.

## Architecture

```mermaid
flowchart LR
  Web[Next.js App Router] -->|REST + cookie auth| API[Express /api/v1]
  Web <-->|SSE| API
  API --> Domain[Services and domain rules]
  Domain --> Data[Scoped repositories + Prisma]
  Data --> DB[(PostgreSQL)]
  API --> Files[(Local / S3 attachments)]
  Shared[Shared Zod schemas] --> Web
  Shared --> API
```

The backend is deliberately layered: route → controller → service → repository/Prisma → database. `organizationId` is the canonical tenancy key. See `docs/architecture.md` for boundaries and decisions.

## Local setup

Requirements: Node.js 22+, pnpm 11, Docker, and Docker Compose.

```bash
cp .env.example .env
pnpm install
pnpm db:generate
docker compose up postgres -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

PowerShell equivalent for the first command:

```powershell
Copy-Item .env.example .env
```

Alternatively, start the complete container stack with `docker compose up --build`.

## Environment variables

| Variable                  | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection used by Prisma        |
| `API_PORT`                | Express listen port; defaults to `4000`     |
| `WEB_ORIGIN`              | Allowed credentialed browser origin         |
| `NEXT_PUBLIC_API_URL`     | Browser-visible API base URL                |
| `JWT_SECRET`              | Access-token signing secret (phase 2)       |
| `CSRF_SECRET`             | CSRF-token secret (phase 2)                 |
| `JWT_EXPIRES_IN_SECONDS`  | Access-cookie lifetime; defaults to 8 hours |
| `COOKIE_SECURE`           | Secure-cookie override for local HTTP only  |
| `ATTACHMENT_STORAGE`      | Attachment adapter; currently `local`       |
| `UPLOAD_DIRECTORY`        | Local attachment directory                  |
| `AWS_REGION`, `S3_BUCKET` | Production attachment storage settings      |

Never commit a populated `.env` file.

## Workspace commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:migrate
pnpm db:seed
```

## API overview

All endpoints use `/api/v1` and the standard error envelope.

| Method    | Endpoint                     | Purpose                                            |
| --------- | ---------------------------- | -------------------------------------------------- |
| GET       | `/health`                    | Service health                                     |
| GET       | `/auth/csrf`                 | Issue a signed double-submit CSRF token            |
| POST      | `/auth/register-org`         | Create an organization and its ADMIN               |
| POST      | `/auth/login`                | Authenticate and set the JWT cookie                |
| POST      | `/auth/logout`               | Clear authentication cookies                       |
| GET       | `/auth/me`                   | Return the authenticated server-derived user scope |
| POST      | `/invites`                   | Create an invitation; ADMIN only                   |
| POST      | `/invites/:token/accept`     | Accept a one-time invitation                       |
| GET/POST  | `/clients`                   | List scoped clients or create one (ADMIN/PM)       |
| GET/POST  | `/projects`                  | List scoped projects or create one (ADMIN/PM)      |
| GET       | `/projects/:id`              | Read a tenant- and client-scoped project           |
| GET/POST  | `/projects/:id/requirements` | List requirements or submit one (CLIENT)           |
| GET/PATCH | `/requirements/:id`          | Read or edit eligible submitted content            |

State-changing requests require the CSRF token from `/auth/csrf` in the `x-csrf-token` header. Browser requests must include credentials. Requirement creation accepts `multipart/form-data` with an optional `attachment` field; supported files are PDF, Word, text, PNG, and JPEG up to 10 MB.

## Demo credentials

The seed creates these planned phase-2 accounts with password `DemoPass123!`:

| Role     | Email                 |
| -------- | --------------------- |
| ADMIN    | `admin@demo.local`    |
| PM       | `pm@demo.local`       |
| ENGINEER | `engineer@demo.local` |
| CLIENT   | `client@demo.local`   |

These accounts can sign in at `/login`.

## Demo workflow

The current workflow supports: ADMIN/PM creates a client and project → ADMIN invites a client user → CLIENT opens its scoped project and submits a requirement with an optional attachment. Subsequent phases add PM triage, tasks, comments, and live delivery status. The seed data includes two client accounts to support isolation testing.

## Deployment summary

Local development uses Docker Compose. The production target is ECS Fargate, RDS PostgreSQL, S3, an Application Load Balancer, and AWS-managed secrets. See `docs/deploy.md`.

## Tradeoffs and decisions

- Modular monolith over microservices: simpler transactions and deployment fit the MVP.
- SSE over WebSockets: the required realtime traffic is server-to-client.
- Global unique email: matches the source model and makes tenant discovery during login unnecessary.
- Local storage is implemented behind an attachment-storage interface for development and Compose. The S3 adapter is bound during the deployment phase without changing requirement services.
- No speculative event bus or cache: PostgreSQL-backed workflows come first; scaling mechanisms will be added only if required.
