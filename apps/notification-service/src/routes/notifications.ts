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
import { z } from "zod";
import { ok, Errors, requireRole } from "@cdc-ats/common";

// Any logged-in human (super-admin OR tenant user) can read + mark-read their own notifications.
const requireAnyAuthenticated = requireRole("SUPER_ADMIN", "ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER");
import { prisma } from "../lib/prisma.js";
import { subscribeToUser } from "../lib/redis-pubsub.js";
import { emitNotification } from "../lib/emit.js";

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
// Phase 27 F-028-micro-P2: any logged-in human (incl. SUPER_ADMIN, who
// gets platform-wide notifications) can mark their own notification read.
router.patch("/:id/read", requireAnyAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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
router.post("/read-all", requireAnyAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
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

// ── POST /internal/notifications/system ──────────────────────────────────
// Gateway-only path for orchestrated, system-level notifications (e.g.
// password reset emails). Skips the request-scoped X-Tenant-Id header
// since the gateway already validated who can call this.
const SystemNotifSchema = z.object({
  tenantId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
  type: z.enum(["SYSTEM", "PLAN_CHANGE_APPROVED", "BULK_UPLOAD_COMPLETED"]).default("SYSTEM"),
  title: z.string().min(1).max(200),
  body: z.string().max(5000).optional(),
  link: z.string().url().optional(),
  channels: z.array(z.enum(["in_app", "email", "slack"])).default(["in_app"]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
// Phase 27 F-028-micro-P0: /system is called only by the api-gateway's
// forgot-password flow, which sets a synthetic X-User-Role: SUPER_ADMIN
// header. Tightening to requireSuperAdmin closes the door on anyone else
// hitting this endpoint with a forged synthetic role through other paths.
router.post("/system", requireRole("SUPER_ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = SystemNotifSchema.parse(req.body);
    const saved = await emitNotification({
      tenantId: body.tenantId,
      userId: body.userId,
      type: body.type,
      title: body.title,
      ...(body.body ? { body: body.body } : {}),
      ...(body.link ? { link: body.link } : {}),
      channels: body.channels,
      ...(body.metadata ? { metadata: body.metadata } : {}),
    });
    ok(res, { id: saved.id });
  } catch (err) { next(err); }
});

export default router;
