import { z } from "zod";

// ── Enums (mirror Prisma ApplicationStage & ApplicationStatus) ────────────────

/**
 * Pipeline stage a candidate has reached within a specific requisition.
 * Mirrors Prisma enum ApplicationStage.
 */
export const ApplicationStageSchema = z.enum([
  "APPLIED",
  "SCREENED",
  "PHONE_SCREEN",
  "ASSESSMENT",
  "INTERVIEW",
  "FINAL_REVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "WITHDRAWN",
]);
export type ApplicationStage = z.infer<typeof ApplicationStageSchema>;

/**
 * Administrative lifecycle status of an application.
 * Mirrors Prisma enum ApplicationStatus.
 */
export const ApplicationStatusSchema = z.enum([
  "ACTIVE",
  "ON_HOLD",
  "REJECTED",
  "WITHDRAWN",
  "HIRED",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

// ── Candidate (mirrors Prisma Candidate model) ────────────────────────────────
export const CandidateSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  summary: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isAnonymized: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// ── CandidateApplication (mirrors Prisma CandidateApplication model) ──────────
// Included here so API responses can embed application context alongside a candidate.
export const CandidateApplicationSchema = z.object({
  id: z.string(),
  candidateId: z.string(),
  requisitionId: z.string(),
  stage: ApplicationStageSchema.default("APPLIED"),
  status: ApplicationStatusSchema.default("ACTIVE"),
  appliedAt: z.coerce.date(),
  movedAt: z.coerce.date(),
  rejectedAt: z.coerce.date().optional(),
  rejectionReason: z.string().optional(),
  score: z.number().optional(),
  ranking: z.number().int().optional(),
  isBlindReview: z.boolean().default(false),
  metadata: z.record(z.unknown()).default({}),
});
export type CandidateApplication = z.infer<typeof CandidateApplicationSchema>;

// ── Create ────────────────────────────────────────────────────────────────────
// tenantId is injected server-side from the authenticated session.
// id, createdAt, updatedAt are DB-generated.
export const CreateCandidateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  summary: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  /** Optionally create the first application at the same time */
  requisitionId: z.string().optional(),
});
export type CreateCandidate = z.infer<typeof CreateCandidateSchema>;

// ── Update ────────────────────────────────────────────────────────────────────
// All profile fields are optional (PATCH semantics).
export const UpdateCandidateSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  portfolioUrl: z.string().url().optional(),
  summary: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isAnonymized: z.boolean().optional(),
});
export type UpdateCandidate = z.infer<typeof UpdateCandidateSchema>;

// ── Update application stage/status ──────────────────────────────────────────
export const UpdateApplicationSchema = z.object({
  stage: ApplicationStageSchema.optional(),
  status: ApplicationStatusSchema.optional(),
  rejectionReason: z.string().optional(),
  score: z.number().optional(),
  ranking: z.number().int().optional(),
  isBlindReview: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type UpdateApplication = z.infer<typeof UpdateApplicationSchema>;
