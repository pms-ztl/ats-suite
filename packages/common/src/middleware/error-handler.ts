/**
 * Global error handler — last middleware mounted in every service's express
 * app. Converts AppError → consistent error response shape; falls back to
 * 500 for unknown errors.
 */
import type { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from "express";
import type { Logger } from "pino";
import { AppError } from "../lib/error.js";

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) return; // can't write again

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

    // Zod validation errors (duck-typed so this survives multiple zod copies
    // across workspaces, where `instanceof` would fail). Map to 400 instead of
    // letting an unmapped throw fall through to a generic 500.
    if (
      err && typeof err === "object" &&
      (err as { name?: string }).name === "ZodError" &&
      Array.isArray((err as { issues?: unknown }).issues)
    ) {
      const issues = (err as { issues: Array<{ path?: Array<string | number>; message?: string }> }).issues;
      logger.warn({ requestId: req.id, path: req.path, issues }, "Validation error");
      res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: issues.map((i) => ({ field: (i.path ?? []).join("."), message: i.message })),
        },
      });
      return;
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
