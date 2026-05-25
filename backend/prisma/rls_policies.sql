-- Row Level Security (RLS) Policies for Tenant Isolation
-- Generated for all tenant-scoped tables (those with tenantId column)
-- 
-- IMPORTANT: These policies ensure that each tenant can only access their own data.
-- The app.tenant_id session variable is set by the Prisma RLS middleware on each request.
--
-- Admin bypass: When app.tenant_id is NOT set (NULL or empty), all rows are visible.
-- This allows migrations, seeding, and admin operations to work without restriction.

-- ── AIDecision ──────────────────────────────────────────────────────────────
ALTER TABLE "AIDecision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIDecision" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_aidecision ON "AIDecision"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_aidecision ON "AIDecision"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AIJob ──────────────────────────────────────────────────────────────
ALTER TABLE "AIJob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIJob" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_aijob ON "AIJob"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_aijob ON "AIJob"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AIModel ──────────────────────────────────────────────────────────────
ALTER TABLE "AIModel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIModel" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_aimodel ON "AIModel"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_aimodel ON "AIModel"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AIPrompt ──────────────────────────────────────────────────────────────
ALTER TABLE "AIPrompt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIPrompt" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_aiprompt ON "AIPrompt"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_aiprompt ON "AIPrompt"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AccessLog ──────────────────────────────────────────────────────────────
ALTER TABLE "AccessLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccessLog" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_accesslog ON "AccessLog"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_accesslog ON "AccessLog"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AccommodationRequest ──────────────────────────────────────────────────────────────
ALTER TABLE "AccommodationRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AccommodationRequest" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_accommodationrequest ON "AccommodationRequest"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_accommodationrequest ON "AccommodationRequest"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AgentRun ──────────────────────────────────────────────────────────────
ALTER TABLE "AgentRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AgentRun" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_agentrun ON "AgentRun"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_agentrun ON "AgentRun"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Application ──────────────────────────────────────────────────────────────
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Application" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_application ON "Application"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_application ON "Application"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ApprovalWorkflow ──────────────────────────────────────────────────────────────
ALTER TABLE "ApprovalWorkflow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApprovalWorkflow" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_approvalworkflow ON "ApprovalWorkflow"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_approvalworkflow ON "ApprovalWorkflow"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Assessment ──────────────────────────────────────────────────────────────
ALTER TABLE "Assessment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Assessment" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_assessment ON "Assessment"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_assessment ON "Assessment"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AssessmentResult ──────────────────────────────────────────────────────────────
ALTER TABLE "AssessmentResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssessmentResult" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_assessmentresult ON "AssessmentResult"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_assessmentresult ON "AssessmentResult"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AuditLog ──────────────────────────────────────────────────────────────
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_auditlog ON "AuditLog"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_auditlog ON "AuditLog"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── AuditTrailEntry ──────────────────────────────────────────────────────────────
ALTER TABLE "AuditTrailEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditTrailEntry" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_audittrailentry ON "AuditTrailEntry"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_audittrailentry ON "AuditTrailEntry"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── BackgroundCheck ──────────────────────────────────────────────────────────────
ALTER TABLE "BackgroundCheck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BackgroundCheck" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_backgroundcheck ON "BackgroundCheck"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_backgroundcheck ON "BackgroundCheck"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── BiasAnalysis ──────────────────────────────────────────────────────────────
ALTER TABLE "BiasAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BiasAnalysis" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_biasanalysis ON "BiasAnalysis"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_biasanalysis ON "BiasAnalysis"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── BiasAuditSchedule ──────────────────────────────────────────────────────────────
ALTER TABLE "BiasAuditSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BiasAuditSchedule" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_biasauditschedule ON "BiasAuditSchedule"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_biasauditschedule ON "BiasAuditSchedule"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── BiasDriftAlert ──────────────────────────────────────────────────────────────
ALTER TABLE "BiasDriftAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BiasDriftAlert" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_biasdriftalert ON "BiasDriftAlert"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_biasdriftalert ON "BiasDriftAlert"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── BiasReport ──────────────────────────────────────────────────────────────
ALTER TABLE "BiasReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BiasReport" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_biasreport ON "BiasReport"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_biasreport ON "BiasReport"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Candidate ──────────────────────────────────────────────────────────────
ALTER TABLE "Candidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Candidate" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidate ON "Candidate"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_candidate ON "Candidate"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── CandidateAppeal ──────────────────────────────────────────────────────────────
ALTER TABLE "CandidateAppeal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CandidateAppeal" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidateappeal ON "CandidateAppeal"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_candidateappeal ON "CandidateAppeal"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── CandidateCommunication ──────────────────────────────────────────────────────────────
ALTER TABLE "CandidateCommunication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CandidateCommunication" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidatecommunication ON "CandidateCommunication"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_candidatecommunication ON "CandidateCommunication"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── CandidateNote ──────────────────────────────────────────────────────────────
ALTER TABLE "CandidateNote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CandidateNote" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidatenote ON "CandidateNote"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_candidatenote ON "CandidateNote"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── CompensationBenchmark ──────────────────────────────────────────────────────────────
ALTER TABLE "CompensationBenchmark" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompensationBenchmark" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_compensationbenchmark ON "CompensationBenchmark"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_compensationbenchmark ON "CompensationBenchmark"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── CompliancePolicy ──────────────────────────────────────────────────────────────
ALTER TABLE "CompliancePolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CompliancePolicy" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_compliancepolicy ON "CompliancePolicy"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_compliancepolicy ON "CompliancePolicy"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ComplianceReport ──────────────────────────────────────────────────────────────
ALTER TABLE "ComplianceReport" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ComplianceReport" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_compliancereport ON "ComplianceReport"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_compliancereport ON "ComplianceReport"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ConsentRecord ──────────────────────────────────────────────────────────────
ALTER TABLE "ConsentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ConsentRecord" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_consentrecord ON "ConsentRecord"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_consentrecord ON "ConsentRecord"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── DashboardWidget ──────────────────────────────────────────────────────────────
ALTER TABLE "DashboardWidget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DashboardWidget" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dashboardwidget ON "DashboardWidget"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_dashboardwidget ON "DashboardWidget"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── DataRetentionPolicy ──────────────────────────────────────────────────────────────
ALTER TABLE "DataRetentionPolicy" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataRetentionPolicy" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_dataretentionpolicy ON "DataRetentionPolicy"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_dataretentionpolicy ON "DataRetentionPolicy"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── DataSubjectRequest ──────────────────────────────────────────────────────────────
ALTER TABLE "DataSubjectRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataSubjectRequest" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_datasubjectrequest ON "DataSubjectRequest"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_datasubjectrequest ON "DataSubjectRequest"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── DecisionOverride ──────────────────────────────────────────────────────────────
ALTER TABLE "DecisionOverride" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DecisionOverride" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_decisionoverride ON "DecisionOverride"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_decisionoverride ON "DecisionOverride"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── DiversityMetric ──────────────────────────────────────────────────────────────
ALTER TABLE "DiversityMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DiversityMetric" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_diversitymetric ON "DiversityMetric"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_diversitymetric ON "DiversityMetric"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ErasureRequest ──────────────────────────────────────────────────────────────
ALTER TABLE "ErasureRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ErasureRequest" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_erasurerequest ON "ErasureRequest"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_erasurerequest ON "ErasureRequest"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── EvidencePackage ──────────────────────────────────────────────────────────────
ALTER TABLE "EvidencePackage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EvidencePackage" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_evidencepackage ON "EvidencePackage"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_evidencepackage ON "EvidencePackage"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── FairnessMetric ──────────────────────────────────────────────────────────────
ALTER TABLE "FairnessMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FairnessMetric" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_fairnessmetric ON "FairnessMetric"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_fairnessmetric ON "FairnessMetric"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── HITLCheckpoint ──────────────────────────────────────────────────────────────
ALTER TABLE "HITLCheckpoint" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HITLCheckpoint" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_hitlcheckpoint ON "HITLCheckpoint"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_hitlcheckpoint ON "HITLCheckpoint"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── HiringDecision ──────────────────────────────────────────────────────────────
ALTER TABLE "HiringDecision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HiringDecision" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_hiringdecision ON "HiringDecision"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_hiringdecision ON "HiringDecision"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── HiringEvent ──────────────────────────────────────────────────────────────
ALTER TABLE "HiringEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HiringEvent" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_hiringevent ON "HiringEvent"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_hiringevent ON "HiringEvent"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── HumanReviewItem ──────────────────────────────────────────────────────────────
ALTER TABLE "HumanReviewItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "HumanReviewItem" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_humanreviewitem ON "HumanReviewItem"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_humanreviewitem ON "HumanReviewItem"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Integration ──────────────────────────────────────────────────────────────
ALTER TABLE "Integration" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Integration" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_integration ON "Integration"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_integration ON "Integration"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── IntegrationConfig ──────────────────────────────────────────────────────────────
ALTER TABLE "IntegrationConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationConfig" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_integrationconfig ON "IntegrationConfig"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_integrationconfig ON "IntegrationConfig"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── IntegrationEvent ──────────────────────────────────────────────────────────────
ALTER TABLE "IntegrationEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "IntegrationEvent" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_integrationevent ON "IntegrationEvent"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_integrationevent ON "IntegrationEvent"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── InternalOpportunity ──────────────────────────────────────────────────────────────
ALTER TABLE "InternalOpportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InternalOpportunity" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_internalopportunity ON "InternalOpportunity"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_internalopportunity ON "InternalOpportunity"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Interview ──────────────────────────────────────────────────────────────
ALTER TABLE "Interview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Interview" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_interview ON "Interview"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_interview ON "Interview"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── InterviewGuide ──────────────────────────────────────────────────────────────
ALTER TABLE "InterviewGuide" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InterviewGuide" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_interviewguide ON "InterviewGuide"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_interviewguide ON "InterviewGuide"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── JobPosting ──────────────────────────────────────────────────────────────
ALTER TABLE "JobPosting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JobPosting" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_jobposting ON "JobPosting"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_jobposting ON "JobPosting"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── JurisdictionRule ──────────────────────────────────────────────────────────────
ALTER TABLE "JurisdictionRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JurisdictionRule" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_jurisdictionrule ON "JurisdictionRule"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_jurisdictionrule ON "JurisdictionRule"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── LegalHold ──────────────────────────────────────────────────────────────
ALTER TABLE "LegalHold" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LegalHold" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_legalhold ON "LegalHold"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_legalhold ON "LegalHold"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── MobilityCase ──────────────────────────────────────────────────────────────
ALTER TABLE "MobilityCase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MobilityCase" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_mobilitycase ON "MobilityCase"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_mobilitycase ON "MobilityCase"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Offer ──────────────────────────────────────────────────────────────
ALTER TABLE "Offer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Offer" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_offer ON "Offer"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_offer ON "Offer"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── OfferApproval ──────────────────────────────────────────────────────────────
ALTER TABLE "OfferApproval" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OfferApproval" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_offerapproval ON "OfferApproval"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_offerapproval ON "OfferApproval"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── OnboardingHandoff ──────────────────────────────────────────────────────────────
ALTER TABLE "OnboardingHandoff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OnboardingHandoff" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_onboardinghandoff ON "OnboardingHandoff"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_onboardinghandoff ON "OnboardingHandoff"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── OnboardingTask ──────────────────────────────────────────────────────────────
ALTER TABLE "OnboardingTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OnboardingTask" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_onboardingtask ON "OnboardingTask"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_onboardingtask ON "OnboardingTask"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── PipelineMetric ──────────────────────────────────────────────────────────────
ALTER TABLE "PipelineMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PipelineMetric" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_pipelinemetric ON "PipelineMetric"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_pipelinemetric ON "PipelineMetric"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── PipelineStage ──────────────────────────────────────────────────────────────
ALTER TABLE "PipelineStage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PipelineStage" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_pipelinestage ON "PipelineStage"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_pipelinestage ON "PipelineStage"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── PromptFirewallLog ──────────────────────────────────────────────────────────────
ALTER TABLE "PromptFirewallLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromptFirewallLog" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_promptfirewalllog ON "PromptFirewallLog"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_promptfirewalllog ON "PromptFirewallLog"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── PromptVersion ──────────────────────────────────────────────────────────────
ALTER TABLE "PromptVersion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PromptVersion" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_promptversion ON "PromptVersion"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_promptversion ON "PromptVersion"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ReferenceCheck ──────────────────────────────────────────────────────────────
ALTER TABLE "ReferenceCheck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReferenceCheck" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_referencecheck ON "ReferenceCheck"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_referencecheck ON "ReferenceCheck"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Requisition ──────────────────────────────────────────────────────────────
ALTER TABLE "Requisition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Requisition" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_requisition ON "Requisition"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_requisition ON "Requisition"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Resume ──────────────────────────────────────────────────────────────
ALTER TABLE "Resume" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resume" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_resume ON "Resume"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_resume ON "Resume"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ScheduleEvent ──────────────────────────────────────────────────────────────
ALTER TABLE "ScheduleEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScheduleEvent" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_scheduleevent ON "ScheduleEvent"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_scheduleevent ON "ScheduleEvent"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ScheduleRequest ──────────────────────────────────────────────────────────────
ALTER TABLE "ScheduleRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScheduleRequest" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_schedulerequest ON "ScheduleRequest"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_schedulerequest ON "ScheduleRequest"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ScheduleSlot ──────────────────────────────────────────────────────────────
ALTER TABLE "ScheduleSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScheduleSlot" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_scheduleslot ON "ScheduleSlot"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_scheduleslot ON "ScheduleSlot"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Screening ──────────────────────────────────────────────────────────────
ALTER TABLE "Screening" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Screening" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_screening ON "Screening"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_screening ON "Screening"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── ScreeningRecord ──────────────────────────────────────────────────────────────
ALTER TABLE "ScreeningRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ScreeningRecord" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_screeningrecord ON "ScreeningRecord"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_screeningrecord ON "ScreeningRecord"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── SensitiveDataVault ──────────────────────────────────────────────────────────────
ALTER TABLE "SensitiveDataVault" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SensitiveDataVault" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_sensitivedatavault ON "SensitiveDataVault"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_sensitivedatavault ON "SensitiveDataVault"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── SourcingSearch ──────────────────────────────────────────────────────────────
ALTER TABLE "SourcingSearch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SourcingSearch" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_sourcingsearch ON "SourcingSearch"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_sourcingsearch ON "SourcingSearch"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── TalentPool ──────────────────────────────────────────────────────────────
ALTER TABLE "TalentPool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TalentPool" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_talentpool ON "TalentPool"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_talentpool ON "TalentPool"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── User ──────────────────────────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_user ON "User"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_user ON "User"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Webhook ──────────────────────────────────────────────────────────────
ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_webhook ON "Webhook"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_webhook ON "Webhook"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── Embedding (added Batch E) ────────────────────────────────────────────
ALTER TABLE "Embedding" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Embedding" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_embedding ON "Embedding"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_embedding ON "Embedding"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

-- ── CandidateApplication (added via F-024 fix) ────────────────────────────
ALTER TABLE "CandidateApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CandidateApplication" FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_candidateapplication ON "CandidateApplication"
  USING ("tenantId" = current_setting('app.tenant_id', true)::text);

CREATE POLICY admin_bypass_candidateapplication ON "CandidateApplication"
  USING (current_setting('app.tenant_id', true) IS NULL OR current_setting('app.tenant_id', true) = '');

