-- Phase 20: Per-tenant override of the default email body for a given
-- notification type. When the delivery worker renders an email it first
-- looks up (tenantId, type) here; if no row exists, it falls back to the
-- system default in renderNotificationEmail().

CREATE TABLE "EmailTemplate" (
    "id"        TEXT NOT NULL,
    "tenantId"  TEXT NOT NULL,
    "type"      TEXT NOT NULL,
    "subject"   TEXT NOT NULL,
    "bodyHtml"  TEXT NOT NULL,
    "bodyText"  TEXT NOT NULL,
    "variables" JSONB NOT NULL DEFAULT '[]',
    "enabled"   BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailTemplate_tenantId_type_key" ON "EmailTemplate"("tenantId", "type");
CREATE INDEX "EmailTemplate_tenantId_idx" ON "EmailTemplate"("tenantId");
