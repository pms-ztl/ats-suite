/**
 * Phase 32a + 32c — AuditEvent management.
 *
 *   POST /internal/audit            — gateway/services write an audit row
 *   GET  /internal/audit            — super-admin paginated query
 *   GET  /internal/audit/export.csv — super-admin CSV download
 *
 * The AuditEvent table already exists (Phase 6). This router adds the
 * write + read paths around it. Direct-DB writes from other services would
 * be cleaner long-term, but the central HTTP endpoint keeps "who can write
 * to the audit log" enforceable (and lets us add validation/rate limits).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, requireSuperAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// ─── POST /internal/audit ────────────────────────────────────────────────
// Write endpoint. Trusted internally; the gateway is the only caller in
// practice. tenantId may be null for platform-wide events (super-admin
// actions across tenants).
const WriteSchema = z.object({
  tenantId: z.string().uuid().nullable(),
  actorUserId: z.string().uuid().nullable().optional(),
  action: z.string().min(1).max(100),
  resourceType: z.string().min(1).max(100),
  resourceId: z.string().min(1).max(200).optional(),
  metadata: z.record(z.unknown()).optional(),
  ipAddress: z.string().optional(),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = WriteSchema.parse(req.body);
    const event = await prisma.auditEvent.create({
      data: {
        tenantId: body.tenantId ?? undefined,        // Prisma optional column accepts undefined, not null
        actorUserId: body.actorUserId ?? undefined,
        action: body.action,
        resourceType: body.resourceType,
        resourceId: body.resourceId ?? "",     // table requires non-null; empty for actions with no specific resource
        metadata: (body.metadata ?? {}) as any,
        ipAddress: body.ipAddress ?? undefined,
      },
    });
    created(res, event);
  } catch (err) { next(err); }
});

// ─── GET /internal/audit ─────────────────────────────────────────────────
// Phase 32c — paginated query for the super-admin /admin/audit page.
// Filters: tenantId, actorUserId, action, resourceType, from/to dates.
router.get("/", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query;
    const where: any = {};
    if (typeof q["tenantId"] === "string")     where.tenantId = q["tenantId"];
    if (typeof q["actorUserId"] === "string")  where.actorUserId = q["actorUserId"];
    if (typeof q["action"] === "string")       where.action = { contains: q["action"], mode: "insensitive" };
    if (typeof q["resourceType"] === "string") where.resourceType = q["resourceType"];
    if (typeof q["from"] === "string" || typeof q["to"] === "string") {
      where.createdAt = {};
      if (typeof q["from"] === "string") where.createdAt.gte = new Date(q["from"]);
      if (typeof q["to"] === "string")   where.createdAt.lte = new Date(q["to"]);
    }
    const page = Math.max(1, Number(q["page"]) || 1);
    const limit = Math.min(200, Math.max(1, Number(q["limit"]) || 50));

    const [total, events] = await Promise.all([
      prisma.auditEvent.count({ where }),
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    ok(res, { data: events, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// ─── GET /internal/audit/export.csv ──────────────────────────────────────
// Phase 32c — same filter set as GET, dumps the matching rows as CSV.
// No pagination — caller can constrain via from/to. Streams to avoid
// loading huge result sets into memory.
router.get("/export.csv", requireSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query;
    const where: any = {};
    if (typeof q["tenantId"] === "string")     where.tenantId = q["tenantId"];
    if (typeof q["actorUserId"] === "string")  where.actorUserId = q["actorUserId"];
    if (typeof q["action"] === "string")       where.action = { contains: q["action"], mode: "insensitive" };
    if (typeof q["resourceType"] === "string") where.resourceType = q["resourceType"];
    if (typeof q["from"] === "string" || typeof q["to"] === "string") {
      where.createdAt = {};
      if (typeof q["from"] === "string") where.createdAt.gte = new Date(q["from"]);
      if (typeof q["to"] === "string")   where.createdAt.lte = new Date(q["to"]);
    }
    // Hard cap — anyone asking for >100k rows should be using a DB dump,
    // not a CSV download.
    const rows = await prisma.auditEvent.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100_000,
    });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="audit-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.write("createdAt,tenantId,actorUserId,action,resourceType,resourceId,ipAddress,metadata\n");
    for (const r of rows) {
      const cells = [
        r.createdAt.toISOString(),
        r.tenantId ?? "",
        r.actorUserId ?? "",
        r.action,
        r.resourceType,
        r.resourceId ?? "",
        r.ipAddress ?? "",
        JSON.stringify(r.metadata ?? {}),
      ].map(csvEscape);
      res.write(cells.join(",") + "\n");
    }
    res.end();
  } catch (err) { next(err); }
});

function csvEscape(v: string): string {
  // Quote-wrap if the cell contains comma, quote, or newline; escape
  // embedded quotes by doubling.
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export default router;
