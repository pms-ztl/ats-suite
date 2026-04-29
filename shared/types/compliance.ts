import { z } from "zod";

// ── Enums ────────────────────────────────────────────────────────────────────

export const DSARRequestTypeSchema = z.enum([
  "ACCESS",
  "DELETION",
  "CORRECTION",
  "PORTABILITY",
]);
export type DSARRequestType = z.infer<typeof DSARRequestTypeSchema>;

export const DSARStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
]);
export type DSARStatus = z.infer<typeof DSARStatusSchema>;

export const RetentionActionSchema = z.enum([
  "ARCHIVE",
  "DELETE",
  "ANONYMIZE",
]);
export type RetentionAction = z.infer<typeof RetentionActionSchema>;

// ── DSAR (Data Subject Access Request) ──────────────────────────────────────

export const DSARSchema = z.object({
  id: z.string().uuid(),
  subjectEmail: z.string().email(),
  subjectName: z.string(),
  requestType: DSARRequestTypeSchema,
  status: DSARStatusSchema,
  requestedAt: z.coerce.date(),
  dueDate: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
  tenantId: z.string().uuid(),
});
export type DSAR = z.infer<typeof DSARSchema>;

// ── Consent Record ───────────────────────────────────────────────────────────

export const ConsentRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  consentType: z.string(),
  granted: z.boolean(),
  grantedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  tenantId: z.string().uuid(),
});
export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

// ── Audit Log Entry ──────────────────────────────────────────────────────────

export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  actorId: z.string().uuid(),
  actorRole: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string(),
  changes: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  tenantId: z.string().uuid(),
  createdAt: z.coerce.date(),
});
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;

// ── Retention Policy ─────────────────────────────────────────────────────────

export const RetentionPolicySchema = z.object({
  id: z.string().uuid(),
  resource: z.string(),
  retentionDays: z.number().int().positive(),
  action: RetentionActionSchema,
  tenantId: z.string().uuid(),
});
export type RetentionPolicy = z.infer<typeof RetentionPolicySchema>;
