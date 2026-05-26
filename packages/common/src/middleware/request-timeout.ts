/**
 * Request timeout middleware — kills slow requests so a slowloris-style
 * client can't hold a worker forever.
 *
 *   app.use(requestTimeout({ defaultMs: 30_000 }));
 *
 * Per-route overrides: set req.timeoutMs in a prior middleware.
 */
import type { Request, Response, NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request {
    timeoutMs?: number;
  }
}

export interface RequestTimeoutOptions {
  /** Default timeout in ms (30s). Overridable per-request via req.timeoutMs. */
  defaultMs?: number;
  /** Status code to send on timeout (504). */
  status?: number;
  /** Body to send. */
  message?: string;
}

export function requestTimeout(opts: RequestTimeoutOptions = {}) {
  const defaultMs = opts.defaultMs ?? 30_000;
  const status = opts.status ?? 504;
  const message = opts.message ?? "Request timed out";

  return (req: Request, res: Response, next: NextFunction) => {
    const ms = req.timeoutMs ?? defaultMs;
    const timer = setTimeout(() => {
      if (res.headersSent) return;
      res.status(status).json({
        success: false,
        error: { code: "REQUEST_TIMEOUT", message: `${message} after ${ms}ms` },
      });
      // Destroy the underlying socket so any in-flight work upstream stops
      // wasting cycles trying to write to a dead connection.
      req.socket.destroy();
    }, ms);

    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    next();
  };
}
