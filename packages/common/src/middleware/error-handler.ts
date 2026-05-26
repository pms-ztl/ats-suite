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
