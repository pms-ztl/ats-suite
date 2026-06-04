/**
 * Tenant webhook management.
 *   GET    /internal/webhooks         — list (secret redacted)
 *   POST   /internal/webhooks         — register { url, events? } → returns secret ONCE
 *   DELETE /internal/webhooks/:id     — remove
 *   POST   /internal/webhooks/:id/test — send a signed test delivery
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { randomBytes } from "crypto";
import { z } from "zod";
import { ok, created, Errors, getTenantId, requireTenantAdmin } from "@cdc-ats/common";
// Per-tenant router → RLS-scoped client.
import { prismaRls as prisma } from "../lib/prisma.js";
import { deliverWebhooks } from "../lib/webhooks.js";

const router = Router();

const CreateSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).max(50).optional(),
});

function redact(h: any) {
  return { ...h, secret: `whsec_…${String(h.secret).slice(-6)}` };
}

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const rows = await prisma.webhook.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    ok(res, rows.map(redact));
  } catch (err) { next(err); }
});

router.post("/", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateSchema.parse(req.body);
    const secret = `whsec_${randomBytes(24).toString("hex")}`;
    const hook = await prisma.webhook.create({
      data: { tenantId, url: body.url, secret, events: body.events ?? [] },
    });
    // Return the FULL secret exactly once (like Stripe). Subsequent reads redact it.
    created(res, { ...hook, secret, _note: "Store this secret now — it is not shown again. Verify deliveries via HMAC-SHA256 of the raw body in X-CDC-Signature." });
  } catch (err) { next(err); }
});

router.delete("/:id", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = String(req.params["id"]);
    const r = await prisma.webhook.deleteMany({ where: { id, tenantId } });
    if (r.count === 0) throw Errors.notFound("Webhook");
    ok(res, { deleted: true });
  } catch (err) { next(err); }
});

router.post("/:id/test", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = String(req.params["id"]);
    const hook = await prisma.webhook.findFirst({ where: { id, tenantId } });
    if (!hook) throw Errors.notFound("Webhook");
    await deliverWebhooks(tenantId, "webhook.test", { tenantId, message: "This is a test delivery from CDC ATS." });
    ok(res, { sent: true });
  } catch (err) { next(err); }
});

export default router;
