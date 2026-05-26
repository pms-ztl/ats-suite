/**
 * Request ID middleware.
 *
 * Reads X-Request-Id from incoming request (set by gateway) or generates a
 * new one. Adds it to req.id, response header, and a child pino logger
 * (if provided).
 */
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestId(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.headers["x-request-id"] as string | undefined;
    const id = incoming && incoming.length <= 100 ? incoming : randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}
