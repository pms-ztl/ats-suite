import { z } from "zod";

// ── Hiring Funnel ───────────────────────────────────────────────────────────
// Mirrors PipelineMetric (Engine 6) — per-stage counts, rates, and velocity

export const HiringFunnelSchema = z.object({
  stage: z.string(),
  count: z.number().int().min(0),
  conversionRate: z.number().min(0).max(1),
  averageDays: z.number().min(0),
});
export type HiringFunnel = z.infer<typeof HiringFunnelSchema>;

export const HiringFunnelListSchema = z.array(HiringFunnelSchema);
export type HiringFunnelList = z.infer<typeof HiringFunnelListSchema>;

// ── Time to Hire ────────────────────────────────────────────────────────────

export const TimeToHireByDepartmentSchema = z.object({
  department: z.string(),
  avgDaysToOffer: z.number().min(0),
  avgDaysToAccept: z.number().min(0),
  avgDaysToStart: z.number().min(0),
});
export type TimeToHireByDepartment = z.infer<typeof TimeToHireByDepartmentSchema>;

export const TimeToHireSchema = z.object({
  requisitionId: z.string().optional(),
  daysToOffer: z.number().min(0),
  daysToAccept: z.number().min(0),
  daysToStart: z.number().min(0),
  byDepartment: z.array(TimeToHireByDepartmentSchema).optional(),
});
export type TimeToHire = z.infer<typeof TimeToHireSchema>;

// ── Source of Hire ──────────────────────────────────────────────────────────

export const SourceOfHireSchema = z.object({
  source: z.string(),
  applicants: z.number().int().min(0),
  hired: z.number().int().min(0),
  conversionRate: z.number().min(0).max(1),
  costPerHire: z.number().min(0),
});
export type SourceOfHire = z.infer<typeof SourceOfHireSchema>;

export const SourceOfHireListSchema = z.array(SourceOfHireSchema);
export type SourceOfHireList = z.infer<typeof SourceOfHireListSchema>;

// ── Diversity Metrics ───────────────────────────────────────────────────────
// Aligns with DiversityMetric Prisma model (Engine 3) and bias monitor API

export const DiversityBreakdownItemSchema = z.object({
  label: z.string(),
  count: z.number().int().min(0),
  percentage: z.number().min(0).max(100),
});
export type DiversityBreakdownItem = z.infer<typeof DiversityBreakdownItemSchema>;

export const DiversityMetricsSchema = z.object({
  dimension: z.enum(["GENDER", "RACE", "AGE", "DISABILITY", "VETERAN"]),
  breakdown: z.array(DiversityBreakdownItemSchema),
  period: z.string(),
});
export type DiversityMetrics = z.infer<typeof DiversityMetricsSchema>;

export const DiversityMetricsListSchema = z.array(DiversityMetricsSchema);
export type DiversityMetricsList = z.infer<typeof DiversityMetricsListSchema>;

// ── Recruiter Productivity ──────────────────────────────────────────────────

export const RecruiterProductivitySchema = z.object({
  recruiterId: z.string(),
  recruiterName: z.string(),
  requisitionsOwned: z.number().int().min(0),
  candidatesScreened: z.number().int().min(0),
  offersExtended: z.number().int().min(0),
  hiresMade: z.number().int().min(0),
  avgTimeToFill: z.number().min(0),
});
export type RecruiterProductivity = z.infer<typeof RecruiterProductivitySchema>;

export const RecruiterProductivityListSchema = z.array(RecruiterProductivitySchema);
export type RecruiterProductivityList = z.infer<typeof RecruiterProductivityListSchema>;

// ── Dashboard KPIs ──────────────────────────────────────────────────────────
// Mirrors the dashboardKPIs shape returned by the analytics mock response
// (api-client: `{ data: timeSeriesData, kpis: data.dashboardKPIs, pipeline: data.pipelineData }`)

export const DashboardKPIsSchema = z.object({
  totalRequisitions: z.number().int().min(0),
  openRequisitions: z.number().int().min(0),
  totalCandidates: z.number().int().min(0),
  activePipeline: z.number().int().min(0),
  avgTimeToHire: z.number().min(0),
  offerAcceptanceRate: z.number().min(0).max(1),
  diversityScore: z.number().min(0).max(1),
  period: z.string(),
});
export type DashboardKPIs = z.infer<typeof DashboardKPIsSchema>;

// ── Analytics Dashboard Response ────────────────────────────────────────────
// Wraps all analytics surfaces for the pipeline/org-health dashboard endpoint

export const AnalyticsDashboardResponseSchema = z.object({
  kpis: DashboardKPIsSchema,
  funnel: HiringFunnelListSchema.optional(),
  timeToHire: TimeToHireSchema.optional(),
  sourceOfHire: SourceOfHireListSchema.optional(),
  diversity: DiversityMetricsListSchema.optional(),
  recruiterProductivity: RecruiterProductivityListSchema.optional(),
  period: z.string().optional(),
});
export type AnalyticsDashboardResponse = z.infer<typeof AnalyticsDashboardResponseSchema>;

// ── Pipeline Stage Enum ─────────────────────────────────────────────────────
// Canonical stage names used across PipelineMetric and HiringFunnel

export const PipelineStageSchema = z.enum([
  "SOURCED",
  "APPLIED",
  "SCREENED",
  "PHONE_SCREEN",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "ACCEPTED",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
]);
export type PipelineStage = z.infer<typeof PipelineStageSchema>;
