-- AlterTable — Phase 33a
-- Adds two columns to PlanChangeRequest:
--   paymentMethod: how this plan change will be paid for. Null on legacy
--                  rows (we don't backfill since they're all already
--                  APPROVED/REJECTED/CANCELLED in terminal state).
--   activatedAt:   when Tenant.plan actually flipped. Null until then;
--                  Stripe webhook sets it for STARTER/PROFESSIONAL,
--                  the approval handler sets it for ENTERPRISE/FREE.
ALTER TABLE "PlanChangeRequest" ADD COLUMN "paymentMethod" TEXT;
ALTER TABLE "PlanChangeRequest" ADD COLUMN "activatedAt" TIMESTAMP(3);

-- Backfill: any previously-APPROVED rows are already activated (the old
-- handler flipped Tenant.plan in the same transaction).
UPDATE "PlanChangeRequest"
   SET "activatedAt" = "reviewedAt",
       "paymentMethod" = 'LEGACY'
 WHERE "status" = 'APPROVED' AND "activatedAt" IS NULL;
