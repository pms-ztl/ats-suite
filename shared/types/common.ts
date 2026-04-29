import { z } from "zod";

// ── Pagination ──────────────────────────────────────────────────────────────
export const PaginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Error envelope ──────────────────────────────────────────────────────────
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ── Success envelope ────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// ── Base entity ─────────────────────────────────────────────────────────────
export const BaseEntitySchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type BaseEntity = z.infer<typeof BaseEntitySchema>;
