-- CreateEnum
CREATE TYPE "SsoProtocol" AS ENUM ('SAML', 'OIDC');

-- CreateEnum
CREATE TYPE "SsoStatus" AS ENUM ('DRAFT', 'ENABLED', 'DISABLED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "ssoLastLogin" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TenantSso" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "protocol" "SsoProtocol" NOT NULL,
    "status" "SsoStatus" NOT NULL DEFAULT 'DRAFT',
    "samlEntryPoint" TEXT,
    "samlIssuer" TEXT,
    "samlCertificate" TEXT,
    "oidcIssuerUrl" TEXT,
    "oidcClientId" TEXT,
    "oidcClientSecret" TEXT,
    "emailDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attrEmail" TEXT NOT NULL DEFAULT 'email',
    "attrFirstName" TEXT NOT NULL DEFAULT 'firstName',
    "attrLastName" TEXT NOT NULL DEFAULT 'lastName',
    "attrGroups" TEXT NOT NULL DEFAULT 'groups',
    "roleMap" JSONB NOT NULL DEFAULT '{}',
    "defaultRole" "UserRole" NOT NULL DEFAULT 'RECRUITER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SsoLoginAudit" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "protocol" "SsoProtocol" NOT NULL,
    "outcome" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SsoLoginAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantSso_tenantId_key" ON "TenantSso"("tenantId");

-- CreateIndex
CREATE INDEX "TenantSso_status_idx" ON "TenantSso"("status");

-- CreateIndex
CREATE INDEX "SsoLoginAudit_tenantId_createdAt_idx" ON "SsoLoginAudit"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "SsoLoginAudit_email_createdAt_idx" ON "SsoLoginAudit"("email", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalId_key" ON "User"("externalId");

-- CreateIndex
CREATE INDEX "User_externalId_idx" ON "User"("externalId");

