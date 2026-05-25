-- ─────────────────────────────────────────────────────────────────────────────
-- F-024 Fix: Add tenantId to CandidateApplication for tenant isolation
-- ─────────────────────────────────────────────────────────────────────────────
-- The legacy CandidateApplication model lacks tenantId, allowing cross-tenant
-- access via routes that filter only on candidateId/requisitionId. This
-- migration adds tenantId, backfills it from Candidate.tenantId, enforces
-- NOT NULL, adds the FK to Tenant, and restructures the unique constraint
-- and indexes to be tenant-scoped.

-- Step 1 — Add tenantId as a nullable column so existing rows can be backfilled.
ALTER TABLE "CandidateApplication"
  ADD COLUMN "tenantId" TEXT;

-- Step 2 — Backfill tenantId from the related Candidate row.
UPDATE "CandidateApplication" AS ca
SET "tenantId" = c."tenantId"
FROM "Candidate" AS c
WHERE ca."candidateId" = c."id"
  AND ca."tenantId" IS NULL;

-- Step 3 — Enforce NOT NULL once every row has a tenantId.
ALTER TABLE "CandidateApplication"
  ALTER COLUMN "tenantId" SET NOT NULL;

-- Step 4 — Drop the old (candidateId, requisitionId) unique constraint;
-- replace with a tenant-scoped unique constraint.
DROP INDEX IF EXISTS "CandidateApplication_candidateId_requisitionId_key";

CREATE UNIQUE INDEX "CandidateApplication_tenantId_candidateId_requisitionId_key"
  ON "CandidateApplication" ("tenantId", "candidateId", "requisitionId");

-- Step 5 — Add tenant-aware indexes for query planner.
CREATE INDEX "CandidateApplication_tenantId_idx"
  ON "CandidateApplication" ("tenantId");

CREATE INDEX "CandidateApplication_tenantId_stage_idx"
  ON "CandidateApplication" ("tenantId", "stage");

-- Step 6 — Add the foreign key to Tenant. RESTRICT on delete to keep parity
-- with how other tenant-scoped tables are wired (Candidate, Requisition, etc.).
ALTER TABLE "CandidateApplication"
  ADD CONSTRAINT "CandidateApplication_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
