/**
 * Phase 32b — support ticket routes.
 *
 * Customer flow:
 *   POST   /internal/support/tickets       — open a ticket
 *   GET    /internal/support/tickets       — list my tenant's tickets
 *   GET    /internal/support/tickets/:id   — single ticket + messages
 *   POST   /internal/support/tickets/:id/messages  — add a reply
 *
 * Super-admin (cross-tenant) flow:
 *   GET    /internal/support/admin/tickets       — list all tickets across tenants
 *   PATCH  /internal/support/admin/tickets/:id   — change status/priority, assign
 *
 * Auth: role gates are inside each handler (mixed tenant + super-admin
 * routes share this router for simplicity).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

function getRole(req: Request): string {
  return (req.user?.role ?? "") as string;
}

// ─── POST /tickets — open a ticket ────────────────────────────────────────
const OpenTicketSchema = z.object({
  subject: z.string().min(3).max(200),
  body: z.string().min(10).max(20_000),
  category: z.string().max(60).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

router.post("/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const email = req.user?.email ?? "";
    if (!email) throw Errors.unauthorized("Missing user email");

    const body = OpenTicketSchema.parse(req.body);

    const ticket = await prisma.supportTicket.create({
      data: {
        tenantId,
        openedByUserId: userId,
        openedByEmail: email,
        subject: body.subject,
        priority: body.priority,
        category: body.category ?? null,
        messages: {
          create: {
            authorRole: "CUSTOMER",
            authorUserId: userId,
            authorEmail: email,
            body: body.body,
          },
        },
      },
      include: { messages: true },
    });
    created(res, ticket);
  } catch (err) { next(err); }
});

// ─── GET /tickets — list my tenant's tickets ──────────────────────────────
router.get("/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const where: any = { tenantId };
    if (status) where.status = status;
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
    });
    ok(res, tickets);
  } catch (err) { next(err); }
});

// ─── GET /tickets/:id — single ticket with messages ───────────────────────
router.get("/tickets/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, tenantId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          // Hide internal notes from customers — only super-admins see them.
          where: getRole(req) === "SUPER_ADMIN" ? undefined : { isInternal: false },
        },
      },
    });
    if (!ticket) throw Errors.notFound("Support ticket");
    ok(res, ticket);
  } catch (err) { next(err); }
});

// ─── POST /tickets/:id/messages — add a reply ─────────────────────────────
const MessageSchema = z.object({
  body: z.string().min(1).max(20_000),
  isInternal: z.boolean().default(false),
});

router.post("/tickets/:id/messages", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const email = req.user?.email ?? "";
    const role = getRole(req);
    const id = req.params["id"] as string;
    const body = MessageSchema.parse(req.body);

    // isInternal=true only allowed for SUPER_ADMIN (customers shouldn't
    // be able to hide messages from themselves).
    if (body.isInternal && role !== "SUPER_ADMIN") {
      throw Errors.forbidden("Only support staff can post internal notes");
    }

    // Customers can only reply to their tenant's tickets; super-admins can
    // reply to any. F-027-style scoping: lookup with both id AND tenantId
    // (super-admin can override by sending X-Tenant-Id of the right tenant,
    // which is the existing impersonation/admin pattern).
    const ticket = await prisma.supportTicket.findFirst({
      where: role === "SUPER_ADMIN" ? { id } : { id, tenantId },
    });
    if (!ticket) throw Errors.notFound("Support ticket");

    const authorRole = role === "SUPER_ADMIN" ? "SUPPORT" : "CUSTOMER";
    const newStatus = role === "SUPER_ADMIN" ? "AWAITING_CUSTOMER" : "OPEN";

    const [message] = await prisma.$transaction([
      prisma.supportTicketMessage.create({
        data: {
          ticketId: id,
          authorRole,
          authorUserId: userId,
          authorEmail: email,
          body: body.body,
          isInternal: body.isInternal,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: { status: newStatus as any, updatedAt: new Date() },
      }),
    ]);
    created(res, message);
  } catch (err) { next(err); }
});

// ─── GET /admin/tickets — super-admin cross-tenant view ───────────────────
router.get("/admin/tickets", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (getRole(req) !== "SUPER_ADMIN") throw Errors.forbidden("Super-admin only");
    const status = typeof req.query["status"] === "string" ? req.query["status"] : undefined;
    const where: any = {};
    if (status) where.status = status;
    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
    });
    ok(res, tickets);
  } catch (err) { next(err); }
});

// ─── PATCH /admin/tickets/:id — super-admin status/priority update ────────
const AdminPatchSchema = z.object({
  status: z.enum(["OPEN", "AWAITING_CUSTOMER", "RESOLVED"]).optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
});

router.patch("/admin/tickets/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (getRole(req) !== "SUPER_ADMIN") throw Errors.forbidden("Super-admin only");
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    const patch = AdminPatchSchema.parse(req.body);

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(patch.status ? { status: patch.status as any } : {}),
        ...(patch.priority ? { priority: patch.priority as any } : {}),
        ...(patch.status === "RESOLVED"
          ? { resolvedAt: new Date(), resolvedByUserId: userId }
          : {}),
      },
    });
    ok(res, ticket);
  } catch (err) { next(err); }
});

export default router;
