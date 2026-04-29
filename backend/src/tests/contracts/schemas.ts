import { z } from 'zod';

// ── Success envelope ─────────────────────────────────────────────────────────
// Success responses: { success: true, data: <T> }
export const ApiOkSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
});

// ── Error envelope ───────────────────────────────────────────────────────────
// Error responses from errorHandler: { error: { code, message } }
// Note: the ATS errorHandler does NOT include a top-level `success` field on
// error responses — only the `error` object is present.
export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

// ── Domain schemas ───────────────────────────────────────────────────────────

export const CandidateSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  createdAt: z.string().or(z.date()),
});

export const RequisitionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  status: z.string(),
  createdAt: z.string().or(z.date()),
});

export const InterviewSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  status: z.string(),
  scheduledAt: z.string().or(z.date()).nullable().optional(),
});

export const HealthSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  version: z.string(),
});
