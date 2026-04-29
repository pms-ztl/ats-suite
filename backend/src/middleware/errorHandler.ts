import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { logger } from "../lib/logger";
import { captureException } from "../lib/sentry";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id ?? "unknown";

  // Zod validation error
  if (err instanceof ZodError) {
    logger.warn({ requestId, errors: err.flatten() }, "Validation error");
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // App-level known error
  if (err instanceof AppError) {
    logger.warn({ requestId, code: err.code, message: err.message }, "App error");
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Prisma known request errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        error: { code: "CONFLICT", message: "Resource already exists" },
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "Resource not found" },
      });
      return;
    }
  }

  // AI not configured — return 503 with setup instructions, NOT 500
  if (err instanceof Error && err.message?.startsWith('AI_NOT_CONFIGURED:')) {
    logger.info({ requestId, message: err.message }, 'AI feature requested but provider not configured');
    res.status(503).json({
      error: {
        code: 'AI_NOT_CONFIGURED',
        message: err.message.replace('AI_NOT_CONFIGURED: ', ''),
        aiRequired: true,
        setupGuide: 'Set ANTHROPIC_API_KEY in your .env file. Get a key at https://console.anthropic.com',
      },
    });
    return;
  }

  // Agent disabled or budget exceeded — return 403 with clear reason
  if (err instanceof Error && (err.message?.startsWith('AGENT_DISABLED:') || err.message?.startsWith('TENANT_BUDGET_EXCEEDED:'))) {
    logger.info({ requestId, message: err.message }, 'Agent access denied');
    res.status(403).json({
      error: {
        code: err.message.split(':')[0],
        message: err.message.split(': ').slice(1).join(': '),
      },
    });
    return;
  }

  // Unknown error — report to Sentry
  const errMsg = err instanceof Error ? err.message : String(err);
  const errStack = err instanceof Error ? err.stack : undefined;
  logger.error({ requestId, errMsg, errStack }, "Unhandled error");

  captureException(err instanceof Error ? err : new Error(String(err)), {
    requestId: req.headers['x-request-id'],
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : String(err),
    },
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Endpoint not found" } });
}
