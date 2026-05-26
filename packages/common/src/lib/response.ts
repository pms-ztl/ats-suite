/**
 * Standard response helpers. Every service returns
 * { success: true, data: ... } or { success: false, error: ... } via these.
 */
import type { Response } from "express";

export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export function ok<T>(res: Response, data: T, status = 200): Response {
  const body: SuccessResponse<T> = { success: true, data };
  return res.status(status).json(body);
}

export function created<T>(res: Response, data: T): Response {
  return ok(res, data, 201);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): Response {
  const body: SuccessResponse<PaginatedData<T>> = {
    success: true,
    data: { data, total, page, pages: Math.ceil(total / limit) },
  };
  return res.status(200).json(body);
}
