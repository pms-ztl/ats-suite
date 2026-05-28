-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingDismissedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingSteps" JSONB NOT NULL DEFAULT '{}';

