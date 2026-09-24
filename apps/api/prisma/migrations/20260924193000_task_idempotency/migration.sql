ALTER TABLE "Task" ADD COLUMN "idempotencyKey" TEXT;

CREATE UNIQUE INDEX "Task_organizationId_idempotencyKey_key"
ON "Task"("organizationId", "idempotencyKey");
