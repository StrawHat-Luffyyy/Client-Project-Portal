# Deployment

## Local containers

Copy `.env.example` to `.env`, then run:

```bash
docker compose up --build
```

The web app is available at `http://localhost:3000`, the API at `http://localhost:4000/api/v1`, and PostgreSQL at `localhost:5432`.

## AWS target

The MVP deployment target is:

- ECS Fargate services for the web and API containers
- Application Load Balancer with TLS termination
- RDS PostgreSQL in private subnets
- S3 for attachments
- Secrets Manager or SSM Parameter Store for database, JWT, and CSRF secrets
- CloudWatch Logs for container output and alarms

CI currently verifies the workspace and builds both images. Registry publishing, migrations as a one-off ECS task, service rollout, and public environment verification are intentionally scheduled for phase 9, once application workflows are stable. Do not run migrations concurrently in every API task.
