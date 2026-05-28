-- CreateEnum — Phase 34e
CREATE TYPE "SmsConvoStep" AS ENUM ('GREETING', 'AWAITING_NAME', 'AWAITING_EMAIL', 'AWAITING_RESUME', 'COMPLETED');

-- CreateTable
CREATE TABLE "SmsConversation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromNumber" TEXT NOT NULL,
    "toNumber" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "step" "SmsConvoStep" NOT NULL DEFAULT 'GREETING',
    "collectedName" TEXT,
    "collectedEmail" TEXT,
    "collectedResumeUrl" TEXT,
    "candidateId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmsConversation_tenantId_fromNumber_key" ON "SmsConversation"("tenantId", "fromNumber");
CREATE INDEX "SmsConversation_tenantId_completedAt_idx" ON "SmsConversation"("tenantId", "completedAt");
