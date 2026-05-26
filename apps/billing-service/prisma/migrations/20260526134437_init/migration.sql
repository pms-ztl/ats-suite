-- CreateTable
CREATE TABLE "TenantPlanCache" (
    "tenantId" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPlanCache_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "AgentKillSwitch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentKillSwitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRunCost" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL,
    "tokensOut" INTEGER NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "triggeredByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRunCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentKillSwitch_tenantId_idx" ON "AgentKillSwitch"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentKillSwitch_tenantId_agentType_key" ON "AgentKillSwitch"("tenantId", "agentType");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRunCost_agentRunId_key" ON "AgentRunCost"("agentRunId");

-- CreateIndex
CREATE INDEX "AgentRunCost_tenantId_createdAt_idx" ON "AgentRunCost"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AgentRunCost_tenantId_agentType_idx" ON "AgentRunCost"("tenantId", "agentType");

-- CreateIndex
CREATE INDEX "FeatureFlag_tenantId_idx" ON "FeatureFlag"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_tenantId_name_key" ON "FeatureFlag"("tenantId", "name");
