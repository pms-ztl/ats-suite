# Migration Rollback Runbook

Prisma Migrate does not generate down-migrations. If a migration must be rolled back, use the manual SQL below then run `prisma migrate resolve --rolled-back <migration_name>`.

---

## Migration 1: `20260401105219_init`

Core schema. Rolling this back means dropping the entire database.

**Key tables:** Tenant, User, Requisition, RequisitionSnapshot, Skill, ConsentRecord, SensitiveDataVault, AccessLog, DataRetentionPolicy, ErasureRequest, PromptFirewallLog, DataSubjectRequest, BiasAnalysis, BiasDriftAlert, FairnessMetric, BiasAuditSchedule, DiversityMetric, AuditTrailEntry, CompliancePolicy, HumanReviewItem, DecisionOverride, EvidencePackage, LegalHold, JurisdictionRule, ComplianceReport, AccommodationRequest, AIModel, AIModelVersion, ModelDriftAlert, AIDecision

**Key enums:** UserRole, RequisitionStatus, ErasureStatus, BiasAnalysisType, ReviewStatus, AIModelStatus, ApplicationStage, ApplicationStatus, InterviewStatus, OfferStatus

**Rollback:** Not recommended in production -- this is the foundation migration. Restore from a pre-migration database backup instead.

---

## Migration 2: `20260409123408_add_talent_governance_ops_models`

Adds talent pipeline, governance, and operational models.

**Key tables created:** ScreeningRecord, Application, Screening, PipelineStage, Resume, CandidateNote, Integration, Webhook, ScheduleEvent, MobilityCase, AuditLog, BiasReport, AIJob

**Key enums created:** InterviewType, InterviewRecommendation, ScreeningType, ScreeningStatus, ScreeningOutcome, IntegrationStatus, WebhookStatus, WebhookEventType, MobilityCaseStatus, AuditAction, BiasRiskLevel, AIJobType, AIJobStatus, ModelType

**Dropped:** ScreeningResult table (replaced by ScreeningRecord)

**Rollback SQL:**

```sql
-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS "AIJob" CASCADE;
DROP TABLE IF EXISTS "BiasReport" CASCADE;
DROP TABLE IF EXISTS "AuditLog" CASCADE;
DROP TABLE IF EXISTS "MobilityCase" CASCADE;
DROP TABLE IF EXISTS "ScheduleEvent" CASCADE;
DROP TABLE IF EXISTS "Webhook" CASCADE;
DROP TABLE IF EXISTS "Integration" CASCADE;
DROP TABLE IF EXISTS "CandidateNote" CASCADE;
DROP TABLE IF EXISTS "Resume" CASCADE;
DROP TABLE IF EXISTS "PipelineStage" CASCADE;
DROP TABLE IF EXISTS "Screening" CASCADE;
DROP TABLE IF EXISTS "Application" CASCADE;
DROP TABLE IF EXISTS "ScreeningRecord" CASCADE;

-- Drop enums
DROP TYPE IF EXISTS "AIJobStatus";
DROP TYPE IF EXISTS "AIJobType";
DROP TYPE IF EXISTS "ModelType";
DROP TYPE IF EXISTS "BiasRiskLevel";
DROP TYPE IF EXISTS "AuditAction";
DROP TYPE IF EXISTS "MobilityCaseStatus";
DROP TYPE IF EXISTS "WebhookEventType";
DROP TYPE IF EXISTS "WebhookStatus";
DROP TYPE IF EXISTS "IntegrationStatus";
DROP TYPE IF EXISTS "ScreeningOutcome";
DROP TYPE IF EXISTS "ScreeningStatus";
DROP TYPE IF EXISTS "ScreeningType";
DROP TYPE IF EXISTS "InterviewRecommendation";
DROP TYPE IF EXISTS "InterviewType";

-- Recreate dropped table (if data matters, restore from backup instead)
-- CREATE TABLE "ScreeningResult" (...); -- restore from backup

-- Then mark as rolled back:
-- npx prisma migrate resolve --rolled-back 20260409123408_add_talent_governance_ops_models
```

---

## Migration 3: `20260410050511_add_agentic_platform_models`

Adds agent infrastructure, HITL, job postings, and offer approvals.

**Key tables created:** AgentRun, AgentTrace, PromptVersion, HITLCheckpoint, JobPosting, OfferApproval

**Key enums created:** AgentRunStatus, HITLStatus, ApprovalStatus

**Rollback SQL:**

```sql
DROP TABLE IF EXISTS "OfferApproval" CASCADE;
DROP TABLE IF EXISTS "JobPosting" CASCADE;
DROP TABLE IF EXISTS "HITLCheckpoint" CASCADE;
DROP TABLE IF EXISTS "PromptVersion" CASCADE;
DROP TABLE IF EXISTS "AgentTrace" CASCADE;
DROP TABLE IF EXISTS "AgentRun" CASCADE;

DROP TYPE IF EXISTS "ApprovalStatus";
DROP TYPE IF EXISTS "HITLStatus";
DROP TYPE IF EXISTS "AgentRunStatus";

-- Then mark as rolled back:
-- npx prisma migrate resolve --rolled-back 20260410050511_add_agentic_platform_models
```

---

## General Procedure

1. **Take a full database backup** before any rollback.
2. Run the rollback SQL for the target migration.
3. Run `npx prisma migrate resolve --rolled-back <migration_name>`.
4. Verify with `npx prisma migrate status`.
5. Re-deploy the application code matching the rolled-back schema.
