# Deployment

## Local containers

Copy `.env.example` to `.env`, then run:

```bash
docker compose up --build --wait
```

The web app is available at `http://localhost:3000`, the API at `http://localhost:4000/api/v1`, Swagger UI at `http://localhost:4000/api/docs`, and PostgreSQL at `localhost:5432`. Compose applies migrations and idempotently seeds demo data before starting the API.

## Production topology

Use one public Application Load Balancer and two private ECS Fargate services. Route `/api/*` to the API target group on port 4000 and the default path to the web target group on port 3000. Terminate TLS with an ACM certificate and redirect HTTP to HTTPS. Keep ECS tasks and RDS in private subnets; only the load balancer belongs in public subnets.

The API connects to a private RDS PostgreSQL instance and a private S3 bucket. CloudWatch receives structured container logs. Secrets Manager (or SSM SecureString) supplies `DATABASE_URL`, `JWT_SECRET`, and `CSRF_SECRET`; these values do not belong in task-definition environment entries or GitHub.

## One-time AWS setup

1. Create two ECR repositories, conventionally `client-project-portal-api` and `client-project-portal-web`.
2. Create an RDS PostgreSQL instance with automated backups and deletion protection. Permit port 5432 only from the API task security group. Create the application database and store the full Prisma connection URL as an AWS-managed secret.
3. Create an S3 bucket with Block Public Access enabled, default encryption, and versioning. The API task role needs only `s3:PutObject` and `s3:DeleteObject` on `<bucket>/production/attachments/*`.
4. Create 32-byte-or-longer random JWT and CSRF secrets in Secrets Manager or SSM Parameter Store.
5. Create CloudWatch log groups `/ecs/client-project-portal/api` and `/ecs/client-project-portal/web` with an explicit retention period.
6. Create an ECS cluster, task execution role, and API task role. The execution role needs ECR pull, CloudWatch log, and secret-read permissions. The API task role receives only the scoped S3 object permissions above.
7. Replace every `REPLACE_*` value in `infra/aws/api-task-definition.example.json` and `infra/aws/web-task-definition.example.json`, then register both task definitions. The deployment workflow runs migrations in a one-off API task; it deliberately does not seed production.
8. Create the two Fargate services with at least two tasks each across private subnets, attach their target groups, enable deployment circuit breakers with rollback, and use `/api/v1/health` and `/login` as the respective load-balancer health paths.
9. Create DNS for the portal host. Build the initial web image with `NEXT_PUBLIC_API_URL=https://<portal-host>/api/v1`; this value is compiled into the browser bundle. Set API `WEB_ORIGIN=https://<portal-host>` and leave `COOKIE_SECURE=true`.

The example task definitions are starting templates, not credentials or complete network infrastructure. Account IDs, role ARNs, secret ARNs, bucket names, hostnames, subnet IDs, and security groups remain deployment-specific.

## GitHub OIDC and deployment variables

Configure GitHub as an IAM OIDC provider with audience `sts.amazonaws.com`. Create a deployment role whose trust policy is restricted to this repository, the `main` branch, and preferably the GitHub `production` environment. Grant only ECR push, the required ECS task-definition/service actions, `iam:PassRole` for the two ECS roles, and read access to the active task definitions.

Set these GitHub repository or production-environment variables:

| Variable                       | Example                             |
| ------------------------------ | ----------------------------------- |
| `AWS_REGION`                   | `us-east-1`                         |
| `AWS_ROLE_ARN`                 | GitHub OIDC deployment role ARN     |
| `ECR_API_REPOSITORY`           | `client-project-portal-api`         |
| `ECR_WEB_REPOSITORY`           | `client-project-portal-web`         |
| `ECS_CLUSTER`                  | `client-project-portal`             |
| `ECS_RUN_TASK_SUBNETS`         | Comma-separated private subnet IDs  |
| `ECS_RUN_TASK_SECURITY_GROUPS` | API task security group ID          |
| `ECS_API_SERVICE`              | `client-project-portal-api`         |
| `ECS_WEB_SERVICE`              | `client-project-portal-web`         |
| `ECS_API_TASK_DEFINITION`      | `client-project-portal-api`         |
| `ECS_WEB_TASK_DEFINITION`      | `client-project-portal-web`         |
| `API_CONTAINER_NAME`           | `api`                               |
| `WEB_CONTAINER_NAME`           | `web`                               |
| `NEXT_PUBLIC_API_URL`          | `https://portal.example.com/api/v1` |

No long-lived AWS access keys are required. The CI workflow fails early with the exact missing variable if deployment is not configured.

## CI/CD behavior

Pull requests and pushes to `main` run installation, Prisma generation, lint, typecheck, API/unit tests, and production builds. A second job installs Chromium, starts the real Docker Compose stack, and runs the two Playwright flows serially. It uploads the HTML report and container logs on failure.

After both verification jobs pass on `main`, the deployment job:

1. Exchanges the GitHub OIDC token for short-lived AWS credentials.
2. Builds and pushes API and web images tagged with the immutable Git commit SHA.
3. Downloads each active ECS task definition and replaces only its container image.
4. Runs `prisma migrate deploy` as a one-off Fargate task and stops if it fails.
5. Deploys the API and web services and waits for service stability.

Migrations must remain backward-compatible with the previous running API revision so the rolling deployment is safe.

## Production verification and rollback

After rollout, verify:

```bash
curl --fail https://<portal-host>/api/v1/health
curl --fail https://<portal-host>/login
curl --fail https://<portal-host>/api/v1/openapi.json
```

Then run `PLAYWRIGHT_TEST_BASE_URL=https://<portal-host> pnpm test:e2e` against a dedicated seeded demo environment. Confirm that CloudWatch contains no secret values and that the ALB and both target groups are healthy.

For an application rollback, update each ECS service to its previous task-definition revision. Database migrations must use additive/expand-contract changes; do not roll back a destructive migration by simply reverting the container. Restore RDS from a point-in-time backup only for a genuine data incident.

## Required account-specific handoff

This repository intentionally cannot create or deploy into an AWS account without the target account, DNS name, network, IAM role, and GitHub environment configuration. Once those values exist, the checked-in pipeline performs subsequent main-branch deployments. Record the final public URL in the README after the first successful rollout.
