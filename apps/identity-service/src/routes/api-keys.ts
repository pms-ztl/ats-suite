/**
 * Phase 34b — Tenant API key CRUD + verification.
 *
 * Routes:
 *   GET    /internal/api-keys        — list (admin only, redacted)
 *   POST   /internal/api-keys        — create + return plaintext ONCE
 *   DELETE /internal/api-keys/:id    — revoke (sets revokedAt; key still exists for audit)
 *   POST   /internal/api-keys/verify — internal; validates a bearer key, returns tenantId + scopes
 *
 * The verify endpoint is what the gateway hits for incoming /api/v1/* requests.
 * Kept inside identity-service because we don't want the gateway holding
 * argon2 hashes or doing key lookups directly.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { randomBytes } from "crypto";
import { ok, created, Errors, getTenantId, getUserId, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();

// ─── GET /internal/api-keys ──────────────────────────────────────────────
router.get("/", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const keys = await prisma.tenantApiKey.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, keyPrefix: true, scopes: true,
        createdByUserId: true, createdAt: true, lastUsedAt: true, revokedAt: true,
      },
    });
    ok(res, keys);
  } catch (err) { next(err); }
});

// ─── POST /internal/api-keys ─────────────────────────────────────────────
// Returns: { id, name, plaintext } — plaintext shown ONCE
const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  scopes: z.array(z.string()).default(["candidates:write"]),
});

router.post("/", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);
    const body = CreateSchema.parse(req.body);

    // Generate plaintext key: "ats_<24 random bytes hex>" — 48 chars total + prefix.
    // The "ats_" prefix makes leaked keys greppable in customer code (a la GitHub's gh_*).
    const plaintext = `ats_${randomBytes(24).toString("hex")}`;
    const keyPrefix = plaintext.slice(0, 8);   // "ats_abcd" — safe to display in lists
    const keyHash = await argon2.hash(plaintext, { type: argon2.argon2id });

    const key = await prisma.tenantApiKey.create({
      data: {
        tenantId,
        name: body.name,
        keyPrefix,
        keyHash,
        createdByUserId: userId,
        scopes: body.scopes,
      },
      select: { id: true, name: true, keyPrefix: true, scopes: true, createdAt: true },
    });

    created(res, { ...key, plaintext });  // last + only time plaintext is in a response
  } catch (err) { next(err); }
});

// ─── DELETE /internal/api-keys/:id ───────────────────────────────────────
// Soft-delete via revokedAt. Audit-friendly — keys never disappear.
router.delete("/:id", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const { count } = await prisma.tenantApiKey.updateMany({
      where: { id, tenantId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw Errors.notFound("API key");
    ok(res, { revoked: true });
  } catch (err) { next(err); }
});

// ─── POST /internal/api-keys/verify ──────────────────────────────────────
// Body: { key: "ats_..." }
// Returns: { valid, tenantId?, scopes?, keyId? }
// Called by the gateway on every /api/v1/* request. NOT authenticated —
// the bearer key IS the auth; we just need internal-network reachability.
const VerifySchema = z.object({ key: z.string().min(8).max(120) });

router.post("/verify", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = VerifySchema.parse(req.body);
    if (!key.startsWith("ats_")) {
      return ok(res, { valid: false, reason: "Wrong format" });
    }
    const prefix = key.slice(0, 8);
    // Lookup by prefix — narrow the candidate set before doing the expensive argon2 verify.
    const candidates = await prisma.tenantApiKey.findMany({
      where: { keyPrefix: prefix, revokedAt: null },
      take: 20,    // 20 keys sharing the same 8-char prefix is already astronomically unlikely
    });
    for (const c of candidates) {
      const matches = await argon2.verify(c.keyHash, key);
      if (matches) {
        // Best-effort lastUsedAt — don't block on this.
        prisma.tenantApiKey.update({ where: { id: c.id }, data: { lastUsedAt: new Date() } })
          .catch(() => undefined);
        return ok(res, {
          valid: true,
          tenantId: c.tenantId,
          scopes: c.scopes,
          keyId: c.id,
          keyName: c.name,
        });
      }
    }
    ok(res, { valid: false, reason: "No match" });
  } catch (err) { next(err); }
});

export default router;
