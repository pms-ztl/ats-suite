/**
 * Global error handler — last middleware mounted in every service's express
 * app. Converts AppError → consistent error response shape; falls back to
 * 500 for unknown errors.
 */
import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express";
import type { Logger } from "pino";
import { AppError } from "../lib/error.js";

// Best-effort handle on the zod `ZodError` constructor for an `instanceof`
// check. `@cdc-ats/common` declares no hard dependency on zod, and services
// can ship their own (possibly mismatched) copy, so we resolve it optionally:
// if it isn't present, `ZodErrorCtor` stays undefined and we fall back to the
// duck-typed checks below — which are the reliable cross-copy path anyway.
let ZodErrorCtor: (new (...args: never[]) => unknown) | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  ZodErrorCtor = (require("zod") as { ZodError?: new (...args: never[]) => unknown }).ZodError;
} catch {
  ZodErrorCtor = undefined;
}

interface ZodIssueLike {
  path?: Array<string | number>;
  message?: string;
}

/**
 * Robustly detect a Zod validation error and extract its issues, regardless of
 * which zod copy threw it. Matches if ANY of:
 *   - `err instanceof ZodError` (when zod is resolvable from this package), OR
 *   - `err.name === "ZodError"`, OR
 *   - `err.issues` (or the legacy `err.errors`) is a non-empty issue array.
 * Returns the issue array on a match, otherwise null.
 */
function extractZodIssues(err: unknown): ZodIssueLike[] | null {
  if (!err || typeof err !== "object") return null;
  const e = err as { name?: string; issues?: unknown; errors?: unknown };
  const issues = Array.isArray(e.issues)
    ? (e.issues as ZodIssueLike[])
    : Array.isArray(e.errors)
      ? (e.errors as ZodIssueLike[])
      : null;
  const isZod =
    (ZodErrorCtor !== undefined && err instanceof ZodErrorCtor) ||
    e.name === "ZodError" ||
    issues !== null;
  return isZod && issues !== null ? issues : null;
}

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return; // can't write again

    // Any error carrying a numeric HTTP `.status` (AppError and the Errors.*
    // factories) is honored as-is.
    if (err instanceof AppError) {
      logger.warn(
        { err: { code: err.code, message: err.message }, requestId: req.id, path: req.path },
        "Handled error"
      );
      res.status(err.status).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      });
      return;
    }

    // Zod validation errors → 400. Detected robustly (instanceof + name +
    // issues duck-typing) so this survives multiple zod copies across
    // workspaces, where `instanceof` alone would miss. Map to 400 instead of
    // letting an unmapped throw fall through to a generic 500.
    const zodIssues = extractZodIssues(err);
    if (zodIssues) {
      logger.warn({ requestId: req.id, path: req.path, issues: zodIssues }, "Validation error");
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: zodIssues.map((i) => ({ field: (i.path ?? []).join("."), message: i.message })),
        },
      });
      return;
    }

    // Defensive: honor any error carrying a sane numeric HTTP `.status` even if
    // it isn't an `instanceof AppError` — e.g. an AppError thrown by a
    // different copy of `@cdc-ats/common`, or an http-style error. This keeps a
    // legitimate 4xx from being masked as a generic 500.
    if (err && typeof err === "object") {
      const e = err as { status?: unknown; statusCode?: unknown; code?: unknown; message?: unknown; details?: unknown };
      const rawStatus = typeof e.status === "number" ? e.status : e.statusCode;
      if (typeof rawStatus === "number" && rawStatus >= 400 && rawStatus <= 599) {
        const msg = typeof e.message === "string" ? e.message : "Request failed";
        logger.warn({ err: { status: rawStatus, message: msg }, requestId: req.id, path: req.path }, "Handled error");
        res.status(rawStatus).json({
          success: false,
          error: {
            code: typeof e.code === "string" ? e.code : "ERROR",
            message: msg,
            ...(e.details ? { details: e.details } : {}),
          },
        });
        return;
      }
    }

    const message = err instanceof Error ? err.message : "Internal server error";
    logger.error({ err, requestId: req.id, path: req.path }, "Unhandled error");
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: process.env["NODE_ENV"] === "production" ? "Internal server error" : message,
      },
    });
  };
}

/** 404 handler — mount BEFORE the error handler. */
export function notFoundHandler(): RequestHandler {
  return (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: "ROUTE_NOT_FOUND", message: `No route matches ${req.method} ${req.path}` },
    });
  };
}
