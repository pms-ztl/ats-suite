-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ScreeningOutcome" AS ENUM ('PASS', 'FAIL', 'REVIEW');

-- CreateTable
CREATE TABLE "Screening" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "applicationId" TEXT,
    "screeningType" TEXT NOT NULL DEFAULT 'AI_ASSISTED',
    "status" "ScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "result" "ScreeningOutcome",
    "score" DOUBLE PRECISION,
    "matchPercentage" DOUBLE PRECISION,
    "signals" JSONB NOT NULL DEFAULT '[]',
    "reasoning" TEXT,
    "agentRunId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Screening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "tokensIn" INTEGER NOT NULL,
    "tokensOut" INTEGER NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "modelName" TEXT NOT NULL,
    "triggeredByUserId" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Screening_tenantId_status_idx" ON "Screening"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Screening_candidateId_idx" ON "Screening"("candidateId");

-- CreateIndex
CREATE INDEX "Screening_applicationId_idx" ON "Screening"("applicationId");

-- CreateIndex
CREATE INDEX "AgentRun_tenantId_createdAt_idx" ON "AgentRun"("tenantId", "createdAt");
