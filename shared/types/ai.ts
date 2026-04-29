import { z } from "zod";

// ── AI Job ──────────────────────────────────────────────────────────────────

export const AIJobStatusSchema = z.enum(["QUEUED", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]);
export type AIJobStatus = z.infer<typeof AIJobStatusSchema>;

export const AIJobTypeSchema = z.enum([
  "RESUME_PARSE",
  "CANDIDATE_MATCH",
  "BIAS_CHECK",
  "SKILL_EXTRACT",
  "JOB_DESCRIPTION_OPTIMIZE",
  "INTERVIEW_ANALYSIS",
]);
export type AIJobType = z.infer<typeof AIJobTypeSchema>;

export const AIJobSchema = z.object({
  id: z.string(),
  type: AIJobTypeSchema,
  status: AIJobStatusSchema,
  input: z.record(z.unknown()),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  modelId: z.string().optional(),
  startedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().optional(),
  tenantId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type AIJob = z.infer<typeof AIJobSchema>;

export const CreateAIJobSchema = AIJobSchema.pick({
  type: true,
  input: true,
  modelId: true,
  tenantId: true,
});
export type CreateAIJob = z.infer<typeof CreateAIJobSchema>;

// ── Model Registry ──────────────────────────────────────────────────────────

export const ModelRegistryEntrySchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  type: z.enum(["MATCHING", "BIAS_DETECTION", "NLP", "CLASSIFICATION", "RANKING"]),
  status: z.enum(["ACTIVE", "DEPRECATED", "TESTING"]),
  accuracy: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
  tenantId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ModelRegistryEntry = z.infer<typeof ModelRegistryEntrySchema>;

// ── AI Decision ─────────────────────────────────────────────────────────────
// Mirrors the AIDecision + AIDecisionOverride Prisma models (Engine 5)

export const AIDecisionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  modelId: z.string().optional(),
  decisionType: z.string(),
  resourceType: z.string(),
  resourceId: z.string(),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()),
  confidence: z.number().min(0).max(1),
  explanation: z.record(z.unknown()).optional(),
  reasonCodes: z.array(z.string()).optional(),
  traceMap: z.record(z.unknown()).optional(),
  chainOfThought: z.array(z.unknown()).optional(),
  humanOverridden: z.boolean().default(false),
  createdAt: z.coerce.date(),
});
export type AIDecision = z.infer<typeof AIDecisionSchema>;

export const AIDecisionOverrideSchema = z.object({
  id: z.string(),
  decisionId: z.string(),
  userId: z.string(),
  reason: z.string(),
  newOutput: z.record(z.unknown()),
  createdAt: z.coerce.date(),
});
export type AIDecisionOverride = z.infer<typeof AIDecisionOverrideSchema>;

// ── Bias Report ─────────────────────────────────────────────────────────────
// Aligns with BiasAnalysis model (Engine 3) and BiasAuditRequest API surface

export const BiasDimensionSchema = z.enum(["GENDER", "RACE", "AGE", "DISABILITY", "VETERAN"]);
export type BiasDimension = z.infer<typeof BiasDimensionSchema>;

export const BiasRiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type BiasRiskLevel = z.infer<typeof BiasRiskLevelSchema>;

export const BiasFindingSchema = z.object({
  dimension: z.string(),
  metric: z.string(),
  value: z.number(),
  threshold: z.number(),
  flagged: z.boolean(),
  detail: z.string().optional(),
});
export type BiasFinding = z.infer<typeof BiasFindingSchema>;

export const BiasReportSchema = z.object({
  id: z.string(),
  requisitionId: z.string().optional(),
  scope: z.enum(["REQUISITION", "TENANT", "GLOBAL"]),
  dimensions: z.array(BiasDimensionSchema),
  findings: z.array(BiasFindingSchema),
  overallRisk: BiasRiskLevelSchema,
  recommendations: z.array(z.string()),
  tenantId: z.string(),
  generatedAt: z.coerce.date(),
});
export type BiasReport = z.infer<typeof BiasReportSchema>;

// ── AI Model (governance / registry, mirrors AIModel Prisma model) ───────────

export const AIModelStatusSchema = z.enum([
  "PENDING_APPROVAL",
  "APPROVED",
  "DEPLOYED",
  "SHADOW_EVAL",
  "FROZEN",
  "RETIRED",
  "REJECTED",
]);
export type AIModelStatus = z.infer<typeof AIModelStatusSchema>;

export const AIModelSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  provider: z.string(),
  version: z.string(),
  status: AIModelStatusSchema,
  riskTier: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  modelCard: z.record(z.unknown()).optional(),
  config: z.record(z.unknown()).optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.coerce.date().optional(),
  deployedAt: z.coerce.date().optional(),
  retiredAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type AIModel = z.infer<typeof AIModelSchema>;

// ── Model Drift Alert ───────────────────────────────────────────────────────

export const ModelDriftAlertSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  metric: z.string(),
  baselineValue: z.number(),
  currentValue: z.number(),
  driftPercentage: z.number(),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  resolved: z.boolean().default(false),
  createdAt: z.coerce.date(),
});
export type ModelDriftAlert = z.infer<typeof ModelDriftAlertSchema>;

// ── AI Explainability ───────────────────────────────────────────────────────

export const ExplanationSchema = z.object({
  decisionId: z.string(),
  humanReadable: z.string(),
  technicalDetail: z.record(z.unknown()).optional(),
  reasonCodes: z.array(z.object({
    code: z.string(),
    label: z.string(),
    weight: z.number(),
  })).optional(),
  counterfactuals: z.array(z.object({
    change: z.string(),
    impact: z.string(),
  })).optional(),
  generatedAt: z.coerce.date(),
});
export type Explanation = z.infer<typeof ExplanationSchema>;
