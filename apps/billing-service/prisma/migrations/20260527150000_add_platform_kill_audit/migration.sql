-- Phase 22: Append-only audit log of platform-wide kill switch toggles.

CREATE TABLE "PlatformKillAudit" (
    "id"          TEXT NOT NULL,
    "agentType"   TEXT NOT NULL,
    "disabled"    BOOLEAN NOT NULL,
    "reason"      TEXT,
    "actorUserId" TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlatformKillAudit_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlatformKillAudit_createdAt_idx" ON "PlatformKillAudit"("createdAt");
CREATE INDEX "PlatformKillAudit_agentType_createdAt_idx" ON "PlatformKillAudit"("agentType", "createdAt");
