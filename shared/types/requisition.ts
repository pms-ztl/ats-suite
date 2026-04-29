import { z } from "zod";

// ── Enums (mirror Prisma RequisitionStatus) ───────────────────────────────────
export const RequisitionStatusSchema = z.enum([
  "DRAFT",
  "OPEN",
  "ON_HOLD",
  "FILLED",
  "CANCELLED",
  "CLOSED",
]);
export type RequisitionStatus = z.infer<typeof RequisitionStatusSchema>;

// ── Full requisition (mirrors Prisma Requisition model) ───────────────────────
export const RequisitionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  department: z.string(),
  location: z.string(),
  country: z.string().default("US"),
  jobFamily: z.string().optional(),
  description: z.string().optional(),
  /** JSON array of requirement strings / objects stored in DB */
  requirements: z.array(z.unknown()).default([]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default("USD"),
  status: RequisitionStatusSchema.default("DRAFT"),
  /** 1 = highest priority, 5 = lowest (Prisma default: 3) */
  priority: z.number().int().min(1).max(5).default(3),
  hiringManagerId: z.string().optional(),
  recruiterId: z.string().optional(),
  headcount: z.number().int().min(1).default(1),
  targetStartDate: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  closedAt: z.coerce.date().optional(),
});
export type Requisition = z.infer<typeof RequisitionSchema>;

// ── Create ────────────────────────────────────────────────────────────────────
// tenantId is injected server-side from the authenticated session.
// id, createdAt, updatedAt are DB-generated.
export const CreateRequisitionSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  location: z.string().min(1),
  country: z.string().default("US"),
  jobFamily: z.string().optional(),
  description: z.string().optional(),
  requirements: z.array(z.unknown()).default([]),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  salaryCurrency: z.string().default("USD"),
  status: RequisitionStatusSchema.optional().default("DRAFT"),
  priority: z.number().int().min(1).max(5).optional().default(3),
  hiringManagerId: z.string().optional(),
  recruiterId: z.string().optional(),
  headcount: z.number().int().min(1).optional().default(1),
  targetStartDate: z.coerce.date().optional(),
});
export type CreateRequisition = z.infer<typeof CreateRequisitionSchema>;

// ── Update ────────────────────────────────────────────────────────────────────
// All fields are optional — callers send only what changed (PATCH semantics).
export const UpdateRequisitionSchema = CreateRequisitionSchema.partial().extend({
  closedAt: z.coerce.date().optional(),
});
export type UpdateRequisition = z.infer<typeof UpdateRequisitionSchema>;
