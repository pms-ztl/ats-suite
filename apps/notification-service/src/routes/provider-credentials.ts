/**
 * Internal provider-credentials router (notification-service) — WF8 / SLICE H3.
 *
 * The TenantIntegration `config` column is the single store for OA-vendor secrets
 * (HackerRank/Codility/... API keys, tokens, webhook secrets). It is AES-GCM
 * encrypted at rest (sealConfig) and the public GET /internal/integrations
 * endpoint REDACTS every secret before returning it to a client. But the
 * assessment-service provider-invite worker (and the inbound-webhook reaper) need
 * the DECRYPTED creds to actually call a vendor. This router is the ONLY path that
 * returns them, and it is server-to-server ONLY:
 *
 *   GET /internal/provider-credentials/:kind  → { kind, enabled, config }  (DECRYPTED)
 *
 *   - It is mounted at a base the api-gateway does NOT proxy (no /api/* mapping
 *     points here), so a browser/tenant client can never reach it. The redacting
 *     /internal/integrations stays the only client-visible view.
 *   - readAuthHeaders() enforces the gateway's X-Internal-Service shared secret
 *     (when INTERNAL_SERVICE_TOKEN is set), so a call without the service token is
 *     403 — exactly the billing check-module / check-agent server-to-server posture.
 *   - The caller's X-Tenant-Id scopes the read; secrets for one tenant are never
 *     returned to another. The decrypted secret is returned ONLY in this response
 *     body and is never logged.
 *
 * Backward-compatible read: unsealConfig() transparently decrypts an `__enc`
 * envelope and passes a legacy plaintext row through unchanged — so existing
 * slack/email rows (and any pre-encryption OA row) are read without breaking.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { ok, Errors, getTenantId } from "@cdc-ats/common";
// Decrypted creds are a per-tenant read → RLS-scoped client (same as the
// integrations router). RLS is the second guard behind the X-Tenant-Id scope.
import { prismaRls as prisma } from "../lib/prisma.js";
import { INTEGRATION_KINDS, unsealConfig, isAssessmentKind } from "../lib/integration-config.js";

const router = Router();

const KindSchema = z.enum(INTEGRATION_KINDS);

// ── GET /internal/provider-credentials/:kind ────────────────────────────────
// Returns the DECRYPTED config for one assessment-provider kind. Server-to-server
// only (see file header). 404 when the tenant has no integration of that kind.
router.get("/:kind", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const kind = KindSchema.parse(req.params["kind"]);
    // This route only vends OA-provider creds. slack/email secrets stay behind the
    // redacting integrations endpoint + their own point-of-use decrypt in-service.
    if (!isAssessmentKind(kind)) {
      throw Errors.validation("Provider credentials are only available for assessment-provider kinds");
    }

    const row = await prisma.tenantIntegration.findUnique({
      where: { tenantId_kind: { tenantId, kind } },
    });
    if (!row) throw Errors.notFound("Provider integration");

    // Decrypt at the point of use (backward-compatible with legacy plaintext rows).
    const config = unsealConfig(row.config);
    ok(res, { kind: row.kind, enabled: row.enabled, config });
  } catch (err) {
    next(err);
  }
});

export default router;
