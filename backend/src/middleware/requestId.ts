import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { logger } from "../lib/logger";

declare global {
  namespace Express {
    interface Request {
      id: string;
      log: import("pino").Logger;
    }
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-request-id"] as string) ?? randomUUID();
  req.id = id;
  req.log = logger.child({ requestId: id });
  res.setHeader("x-request-id", id);
  next();
}
