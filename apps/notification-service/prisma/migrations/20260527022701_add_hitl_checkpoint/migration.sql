-- CreateEnum
CREATE TYPE "HitlStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "HitlCheckpoint" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "HitlStatus" NOT NULL DEFAULT 'PENDING',
    "slaMinutes" INTEGER NOT NULL DEFAULT 240,
    "assignedTo" TEXT,
    "assignedToName" TEXT,
    "resolution" JSONB,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HitlCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HitlCheckpoint_tenantId_status_idx" ON "HitlCheckpoint"("tenantId", "status");

-- CreateIndex
CREATE INDEX "HitlCheckpoint_tenantId_createdAt_idx" ON "HitlCheckpoint"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "HitlCheckpoint_agentRunId_idx" ON "HitlCheckpoint"("agentRunId");
