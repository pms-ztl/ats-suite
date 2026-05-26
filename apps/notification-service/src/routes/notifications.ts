/**
 * Notification API.
 *
 *   GET    /internal/notifications?unread=&limit=
 *   GET    /internal/notifications/unread-count
 *   PATCH  /internal/notifications/:id/read
 *   POST   /internal/notifications/read-all
 *   GET    /internal/notifications/stream   (SSE)
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { subscribeToUser } from "../lib/redis-pubsub.js";

const router = Router();

/**
 * Build a Prisma WHERE that scopes notifications correctly:
 *   - SUPER_ADMIN:    own user + platform-wide (tenantId=null) + tenant broadcast
 *   - everyone else:  own user + tenant broadcast (NEVER platform-wide)
 */
function userScopeWhere(req: Request): any {
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId;
  const role = req.user!.role;

  if (role === "SUPER_ADMIN") {
    return {
      OR: [
        { userId },
        { tenantId: null },
        { tenantId, userId: null },
      ],
    };
  }
  return {
    OR: [
      { userId, tenantId },
      { tenantId, userId: null },
    ],
  };
}

// GET /internal/notifications
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    const limit = Math.min(Number(req.query["limit"]) || 50, 200);
    const unreadOnly = req.query["unread"] === "true";
    const where = userScopeWhere(req);
    if (unreadOnly) where.AND = [{ readAt: null }];
    const rows = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    ok(res, rows);
  } catch (err) { next(err); }
});

// GET /internal/notifications/unread-count
router.get("/unread-count", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    const where = { ...userScopeWhere(req), readAt: null };
    const count = await prisma.notification.count({ where });
    ok(res, { count });
  } catch (err) { next(err); }
});

// PATCH /internal/notifications/:id/read
router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    const id = req.params["id"] as string;
    const where = { ...userScopeWhere(req), id };
    const result = await prisma.notification.updateMany({
      where,
      data: { readAt: new Date() },
    });
    if (result.count === 0) throw Errors.notFound("Notification");
    ok(res, { marked: result.count });
  } catch (err) { next(err); }
});

// POST /internal/notifications/read-all
router.post("/read-all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw Errors.unauthorized();
    const where = { ...userScopeWhere(req), readAt: null };
    const result = await prisma.notification.updateMany({
      where,
      data: { readAt: new Date() },
    });
    ok(res, { marked: result.count });
  } catch (err) { next(err); }
});

// GET /internal/notifications/stream  (SSE)
router.get("/stream", async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).end();
    return;
  }
  const userId = req.user.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  // Initial hello
  res.write(`event: hello\ndata: ${JSON.stringify({ userId, at: new Date().toISOString() })}\n\n`);

  // Keep-alive ping every 25s
  const keepAlive = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 25_000);

  let unsubscribe: (() => Promise<void>) | null = null;
  try {
    unsubscribe = await subscribeToUser(userId, (notif) => {
      try {
        res.write(`event: notification\ndata: ${JSON.stringify(notif)}\n\n`);
      } catch {
        // socket closed
      }
    });
  } catch {
    // Redis not available — degrade to keep-alive only, client will fall back to polling
  }

  req.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe?.().catch(() => {});
  });
});

export default router;
