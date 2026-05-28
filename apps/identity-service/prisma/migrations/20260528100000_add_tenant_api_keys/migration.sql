-- CreateTable — Phase 34b
CREATE TABLE "TenantApiKey" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "TenantApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantApiKey_tenantId_revokedAt_idx" ON "TenantApiKey"("tenantId", "revokedAt");
CREATE INDEX "TenantApiKey_keyPrefix_idx" ON "TenantApiKey"("keyPrefix");
