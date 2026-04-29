import { Router } from "express";
import prisma from "../utils/prisma";

const router = Router();

const startTime = Date.now();

// Liveness probe — always returns 200 if process is alive
router.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe — checks DB connectivity
router.get("/readyz", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ready",
      db: "connected",
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "not_ready",
      db: "disconnected",
      error: err instanceof Error ? err.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
