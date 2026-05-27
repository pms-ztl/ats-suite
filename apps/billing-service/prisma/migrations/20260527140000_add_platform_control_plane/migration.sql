-- Phase 21: Super-admin platform control plane.

-- Global kill switch — one row per agentType. Default disabled = false
-- so all existing agents continue to run after migration.
CREATE TABLE "PlatformAgentKillSwitch" (
    "agentType"       TEXT NOT NULL,
    "disabled"        BOOLEAN NOT NULL DEFAULT false,
    "reason"          TEXT,
    "updatedByUserId" TEXT,
    "updatedAt"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformAgentKillSwitch_pkey" PRIMARY KEY ("agentType")
);

-- Central prompt overrides. Versioned, so super-admin can roll back.
-- isActive = true means ai-engine uses this row's values; only one row
-- per (agentType, isActive=true) is enforced via a partial unique index.
CREATE TABLE "PromptOverride" (
    "id"              TEXT NOT NULL,
    "agentType"       TEXT NOT NULL,
    "systemPrompt"    TEXT,
    "modelName"       TEXT,
    "temperature"     DOUBLE PRECISION,
    "version"         INTEGER NOT NULL DEFAULT 1,
    "isActive"        BOOLEAN NOT NULL DEFAULT true,
    "notes"           TEXT,
    "createdByUserId" TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptOverride_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PromptOverride_agentType_isActive_idx" ON "PromptOverride"("agentType", "isActive");
CREATE INDEX "PromptOverride_agentType_createdAt_idx" ON "PromptOverride"("agentType", "createdAt");

-- Enforce at most one active override per agentType (partial unique index).
CREATE UNIQUE INDEX "PromptOverride_agentType_active_unique" ON "PromptOverride"("agentType") WHERE "isActive" = true;
