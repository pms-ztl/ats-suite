/**
 * In-app team messaging — tenant-isolated, real-time.
 *
 * Every query runs on the RLS client (prismaRls), so a user can only ever touch
 * conversations/messages in their own tenant; a conversation belongs to exactly
 * one tenant and RLS hides it from every other tenant's session. Within a tenant
 * the participant check (you must be a member) gates each conversation. Sends
 * fan out to the other participants' SSE channels for real-time delivery.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, created, Errors, getTenantId, getUserId } from "@cdc-ats/common";
import { prismaRls as prisma } from "../lib/prisma.js";
import { publishToUser } from "../lib/redis-pubsub.js";

const router = Router();

// GET /internal/messages/conversations — my conversations, newest first.
router.get("/conversations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const myParts = await prisma.conversationParticipant.findMany({
      where: { userId }, select: { conversationId: true, lastReadAt: true },
    });
    if (!myParts.length) { ok(res, []); return; }
    const ids = myParts.map((p) => p.conversationId);
    const lastReadMap = new Map(myParts.map((p) => [p.conversationId, p.lastReadAt]));
    const convos = await prisma.conversation.findMany({
      where: { id: { in: ids } },
      orderBy: { updatedAt: "desc" },
      include: {
        participants: { select: { userId: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    const out = await Promise.all(convos.map(async (c) => {
      const lastRead = lastReadMap.get(c.id) ?? null;
      const unread = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: userId }, ...(lastRead ? { createdAt: { gt: lastRead } } : {}) },
      });
      return {
        id: c.id, title: c.title, isGroup: c.isGroup,
        participantIds: c.participants.map((p) => p.userId),
        lastMessage: c.messages[0] ? { body: c.messages[0].body, senderId: c.messages[0].senderId, createdAt: c.messages[0].createdAt } : null,
        unread, updatedAt: c.updatedAt,
      };
    }));
    ok(res, out);
  } catch (err) { next(err); }
});

// POST /internal/messages/conversations — create (or reuse a 1:1) conversation.
const CreateConvoSchema = z.object({
  participantUserIds: z.array(z.string()).min(1).max(50),
  title: z.string().max(120).optional(),
});
router.post("/conversations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = CreateConvoSchema.parse(req.body);
    const others = [...new Set(body.participantUserIds.filter((id) => id !== userId))];
    if (!others.length) throw Errors.validation("Add at least one other participant");
    const isGroup = others.length > 1 || !!body.title;
    if (!isGroup) {
      // Reuse an existing 1:1 between exactly these two users.
      const candidates = await prisma.conversation.findMany({
        where: { isGroup: false, participants: { some: { userId: others[0] } } },
        include: { participants: { select: { userId: true } } },
      });
      const match = candidates.find((c) => c.participants.length === 2 && c.participants.every((p) => p.userId === userId || p.userId === others[0]));
      if (match) { ok(res, { id: match.id, existing: true }); return; }
    }
    const all = [userId, ...others];
    const convo = await prisma.conversation.create({
      data: {
        tenantId, title: body.title ?? null, isGroup, createdById: userId,
        participants: { create: all.map((uid) => ({ tenantId, userId: uid })) },
      },
    });
    created(res, { id: convo.id, existing: false });
  } catch (err) { next(err); }
});

// GET /internal/messages/conversations/:id/messages
router.get("/conversations/:id/messages", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    const member = await prisma.conversationParticipant.findUnique({ where: { conversationId_userId: { conversationId: id, userId } } });
    if (!member) throw Errors.notFound("Conversation");
    const messages = await prisma.message.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" }, take: 300 });
    ok(res, messages);
  } catch (err) { next(err); }
});

// POST /internal/messages/conversations/:id/messages — send + real-time fan-out.
const SendSchema = z.object({ body: z.string().min(1).max(4000) });
router.post("/conversations/:id/messages", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    const { body } = SendSchema.parse(req.body);
    const convo = await prisma.conversation.findUnique({ where: { id }, include: { participants: { select: { userId: true } } } });
    if (!convo || !convo.participants.some((p) => p.userId === userId)) throw Errors.notFound("Conversation");
    const msg = await prisma.message.create({ data: { conversationId: id, tenantId, senderId: userId, body } });
    await prisma.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
    await prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId: id, userId } }, data: { lastReadAt: new Date() } }).catch(() => {});
    const payload = { kind: "message", conversationId: id, message: { id: msg.id, conversationId: id, senderId: userId, body: msg.body, createdAt: msg.createdAt } };
    for (const p of convo.participants) {
      if (p.userId !== userId) publishToUser(p.userId, payload).catch(() => {});
    }
    created(res, msg);
  } catch (err) { next(err); }
});

// POST /internal/messages/conversations/:id/read
router.post("/conversations/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const id = req.params["id"] as string;
    await prisma.conversationParticipant.update({ where: { conversationId_userId: { conversationId: id, userId } }, data: { lastReadAt: new Date() } }).catch(() => {});
    ok(res, { ok: true });
  } catch (err) { next(err); }
});

export default router;
