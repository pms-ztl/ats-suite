/**
 * Phase 28 — SSO routes mounted at /internal/sso.
 *
 * Two public entry points called by the api-gateway after URL routing:
 *   POST /saml/:tenantId/callback   — IdP posts SAML assertion here
 *   GET  /oidc/:tenantId/callback   — IdP redirects with code here
 *
 * Three public lookup endpoints used by the frontend login flow:
 *   POST /discover                  — body {email} → which IdP if any
 *   GET  /saml/:tenantId/initiate   — returns 302 to IdP
 *   GET  /oidc/:tenantId/initiate   — returns 302 to IdP
 *
 * Five tenant-admin config endpoints:
 *   GET    /tenants/:tenantId/sso        — read config
 *   PUT    /tenants/:tenantId/sso        — upsert config
 *   POST   /tenants/:tenantId/sso/test   — run a DRAFT-mode test login
 *   GET    /tenants/:tenantId/sso/audit  — recent SsoLoginAudit rows
 *   DELETE /tenants/:tenantId/sso        — remove SSO config (revert to pwd-only)
 *
 * All routes are mounted at /internal/sso/* on identity-service. Gateway
 * proxies the public ones at /api/auth/sso/* (no auth) and the config
 * ones at /api/sso/config/* (auth-gated with requireTenantAdmin).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import {
  ok, created, Errors,
  requireTenantAdmin, getTenantId, getUserId,
  signSsoState, verifySsoState,
} from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";
import { buildLoginUrl, validateAssertion, buildSpMetadata } from "../lib/sso-saml.js";
import { buildAuthUrl, exchangeCode, clearOidcCache } from "../lib/sso-oidc.js";
import { findOrCreateSsoUser, type SsoAssertion } from "../lib/sso-jit.js";

const router = Router();

/** Coerce a route param to string (Express types it as string | string[] under strict). */
function param(req: Request, name: string): string {
  const v = req.params[name];
  if (typeof v !== "string") throw Errors.validation(`Missing path param: ${name}`);
  return v;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolve the SAML/OIDC callback URL we tell the IdP to POST/GET to. */
function buildCallbackUrl(req: Request, protocol: "saml" | "oidc", tenantId: string): string {
  const baseUrl = process.env["PUBLIC_API_URL"] ?? `http://localhost:4000/api`;
  return `${baseUrl}/auth/sso/${protocol}/${tenantId}/callback`;
}

/** Fetch a tenant's current plan from tenant-service. Required by JIT seat check. */
async function getTenantPlan(tenantId: string): Promise<string> {
  const tenantUrl = process.env["TENANT_SERVICE_URL"] ?? "http://localhost:4002";
  try {
    const res = await fetch(`${tenantUrl}/internal/tenants/${tenantId}`, {
      headers: {
        // tenant-service GET /:id is unguarded; identity-service is a trusted internal caller.
        "x-user-id": "system-sso",
        "x-tenant-id": tenantId,
        "x-user-role": "ADMIN",
      },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`tenant-service status ${res.status}`);
    const body = (await res.json()) as { data?: { plan?: string }; plan?: string };
    return body.data?.plan ?? body.plan ?? "FREE";
  } catch {
    return "FREE"; // fail safe — uses smallest seat allowance
  }
}

/** Write an audit row. Never throws — audit failures shouldn't break SSO. */
async function recordAudit(args: {
  tenantId: string;
  email: string;
  protocol: "SAML" | "OIDC";
  outcome: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}): Promise<void> {
  await prisma.ssoLoginAudit.create({
    data: {
      tenantId: args.tenantId,
      email: args.email,
      protocol: args.protocol,
      outcome: args.outcome,
      ipAddress: args.ipAddress ?? null,
      userAgent: args.userAgent ?? null,
      userId: args.userId ?? null,
    },
  }).catch(() => { /* swallow — audit is best-effort */ });
}

// ─── POST /internal/sso/discover ────────────────────────────────────────────
// Public. Frontend hits this on login-page email-blur. Returns the
// initiate URL if the tenant has SSO enabled for this email's domain.
router.post("/discover", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const domain = body.email.split("@")[1]?.toLowerCase();
    if (!domain) return ok(res, null);

    const config = await prisma.tenantSso.findFirst({
      where: {
        status: "ENABLED",
        emailDomains: { has: domain },
      },
    });
    if (!config) return ok(res, null);

    const baseUrl = process.env["PUBLIC_API_URL"] ?? `http://localhost:4000/api`;
    const initiateUrl = `${baseUrl}/auth/sso/${config.protocol.toLowerCase()}/${config.tenantId}/initiate`;
    ok(res, { tenantId: config.tenantId, protocol: config.protocol, initiateUrl });
  } catch (err) { next(err); }
});

// ─── GET /internal/sso/saml/:tenantId/initiate ──────────────────────────────
router.get("/saml/:tenantId/initiate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = param(req, "tenantId");
    const config = await prisma.tenantSso.findUnique({ where: { tenantId } });
    if (!config || config.protocol !== "SAML" || config.status !== "ENABLED") {
      throw Errors.notFound("SAML config");
    }
    const callbackUrl = buildCallbackUrl(req, "saml", tenantId);
    const relayState = signSsoState({ tenantId });
    const url = await buildLoginUrl(config, callbackUrl, relayState);
    res.redirect(302, url);
  } catch (err) { next(err); }
});

// ─── POST /internal/sso/saml/:tenantId/callback ─────────────────────────────
// Body comes from IdP as form-urlencoded { SAMLResponse, RelayState }.
// IMPORTANT: route mounted with express.urlencoded() upstream in app.ts.
router.post("/saml/:tenantId/callback", async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = param(req, "tenantId");
  const ipAddress = req.ip;
  const userAgent = req.get("user-agent") ?? undefined;

  try {
    const samlResponse = req.body?.SAMLResponse as string | undefined;
    const relayState = req.body?.RelayState as string | undefined;
    if (!samlResponse) {
      await recordAudit({ tenantId, email: "(unknown)", protocol: "SAML", outcome: "fail:missing_response", ipAddress, userAgent });
      throw Errors.validation("Missing SAMLResponse");
    }
    if (relayState) {
      try { verifySsoState(relayState); }
      catch {
        await recordAudit({ tenantId, email: "(unknown)", protocol: "SAML", outcome: "fail:invalid_relay_state", ipAddress, userAgent });
        throw Errors.unauthorized("Invalid RelayState (CSRF)");
      }
    }

    const config = await prisma.tenantSso.findUnique({ where: { tenantId } });
    if (!config || config.protocol !== "SAML") {
      throw Errors.notFound("SAML config");
    }
    if (config.status === "DISABLED") {
      await recordAudit({ tenantId, email: "(unknown)", protocol: "SAML", outcome: "fail:sso_disabled", ipAddress, userAgent });
      throw Errors.forbidden("SSO disabled for this tenant");
    }

    const callbackUrl = buildCallbackUrl(req, "saml", tenantId);
    const assertion = await validateAssertion(samlResponse, config, callbackUrl);

    if (config.status === "DRAFT") {
      // Test-mode: don't create users, return the parsed assertion so the
      // tenant admin can validate their config before flipping to ENABLED.
      await recordAudit({ tenantId, email: assertion.email, protocol: "SAML", outcome: "test_success", ipAddress, userAgent });
      return ok(res, { mode: "test", assertion });
    }

    const plan = await getTenantPlan(tenantId);
    const result = await findOrCreateSsoUser(assertion, { tenantId, config, plan });
    await recordAudit({
      tenantId, email: result.user.email, protocol: "SAML",
      outcome: result.created ? "success:jit_created" : result.linked ? "success:linked" : "success",
      ipAddress, userAgent, userId: result.user.id,
    });
    // Phase 31a — surface `jitCreated` so the gateway can fire a welcome
    // email on first-ever SSO login. `linked` means we joined them to a
    // pre-existing invited account, so no welcome email needed.
    ok(res, { user: result.user, externalId: assertion.externalId, jitCreated: result.created });
  } catch (err: any) {
    const outcome = err?.code ? `fail:${String(err.code).toLowerCase()}` : "fail:unknown";
    await recordAudit({ tenantId, email: "(unknown)", protocol: "SAML", outcome, ipAddress, userAgent });
    next(err);
  }
});

// ─── GET /internal/sso/oidc/:tenantId/initiate ──────────────────────────────
router.get("/oidc/:tenantId/initiate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = param(req, "tenantId");
    const config = await prisma.tenantSso.findUnique({ where: { tenantId } });
    if (!config || config.protocol !== "OIDC" || config.status !== "ENABLED") {
      throw Errors.notFound("OIDC config");
    }
    const callbackUrl = buildCallbackUrl(req, "oidc", tenantId);
    const state = signSsoState({ tenantId });
    const url = await buildAuthUrl(config, callbackUrl, state);
    res.redirect(302, url.toString());
  } catch (err) { next(err); }
});

// ─── GET /internal/sso/oidc/:tenantId/callback ──────────────────────────────
router.get("/oidc/:tenantId/callback", async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = param(req, "tenantId");
  const ipAddress = req.ip;
  const userAgent = req.get("user-agent") ?? undefined;

  try {
    const state = req.query["state"] as string | undefined;
    const code = req.query["code"] as string | undefined;
    if (!state || !code) {
      await recordAudit({ tenantId, email: "(unknown)", protocol: "OIDC", outcome: "fail:missing_state_or_code", ipAddress, userAgent });
      throw Errors.validation("Missing state/code");
    }

    let verified: ReturnType<typeof verifySsoState>;
    try { verified = verifySsoState(state); }
    catch {
      await recordAudit({ tenantId, email: "(unknown)", protocol: "OIDC", outcome: "fail:invalid_state", ipAddress, userAgent });
      throw Errors.unauthorized("Invalid state (CSRF)");
    }
    if (verified.tenantId !== tenantId) {
      await recordAudit({ tenantId, email: "(unknown)", protocol: "OIDC", outcome: "fail:state_tenant_mismatch", ipAddress, userAgent });
      throw Errors.unauthorized("State tenant mismatch");
    }

    const config = await prisma.tenantSso.findUnique({ where: { tenantId } });
    if (!config || config.protocol !== "OIDC") throw Errors.notFound("OIDC config");
    if (config.status === "DISABLED") {
      await recordAudit({ tenantId, email: "(unknown)", protocol: "OIDC", outcome: "fail:sso_disabled", ipAddress, userAgent });
      throw Errors.forbidden("SSO disabled");
    }

    const callbackUrlObj = new URL(`${process.env["PUBLIC_API_URL"] ?? "http://localhost:4000/api"}/auth/sso/oidc/${tenantId}/callback`);
    // Copy through query params openid-client needs
    for (const [k, v] of Object.entries(req.query)) {
      if (typeof v === "string") callbackUrlObj.searchParams.set(k, v);
    }

    const assertion = await exchangeCode(config, callbackUrlObj, state);

    if (config.status === "DRAFT") {
      await recordAudit({ tenantId, email: assertion.email, protocol: "OIDC", outcome: "test_success", ipAddress, userAgent });
      return ok(res, { mode: "test", assertion });
    }

    const plan = await getTenantPlan(tenantId);
    const result = await findOrCreateSsoUser(assertion, { tenantId, config, plan });
    await recordAudit({
      tenantId, email: result.user.email, protocol: "OIDC",
      outcome: result.created ? "success:jit_created" : result.linked ? "success:linked" : "success",
      ipAddress, userAgent, userId: result.user.id,
    });
    // Phase 31a — surface `jitCreated` so the gateway can fire a welcome
    // email on first-ever SSO login. `linked` means we joined them to a
    // pre-existing invited account, so no welcome email needed.
    ok(res, { user: result.user, externalId: assertion.externalId, jitCreated: result.created });
  } catch (err: any) {
    const outcome = err?.code ? `fail:${String(err.code).toLowerCase()}` : "fail:unknown";
    await recordAudit({ tenantId, email: "(unknown)", protocol: "OIDC", outcome, ipAddress, userAgent });
    next(err);
  }
});

// ─── Tenant-admin config endpoints (auth-gated by gateway) ──────────────────

const ConfigUpsertSchema = z.object({
  protocol: z.enum(["SAML", "OIDC"]),
  status: z.enum(["DRAFT", "ENABLED", "DISABLED"]).optional(),
  samlEntryPoint: z.string().url().nullable().optional(),
  samlIssuer: z.string().nullable().optional(),
  samlCertificate: z.string().nullable().optional(),
  oidcIssuerUrl: z.string().url().nullable().optional(),
  oidcClientId: z.string().nullable().optional(),
  oidcClientSecret: z.string().nullable().optional(),
  emailDomains: z.array(z.string()).default([]),
  attrEmail: z.string().optional(),
  attrFirstName: z.string().optional(),
  attrLastName: z.string().optional(),
  attrGroups: z.string().optional(),
  roleMap: z.record(z.string(), z.string()).optional(),
  defaultRole: z.enum(["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"]).optional(),
});

// GET /internal/sso/tenants/:tenantId/sso
router.get("/tenants/:tenantId/sso", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerTenant = getTenantId(req);
    const tenantId = param(req, "tenantId");
    if (callerTenant !== tenantId) throw Errors.forbidden("Cannot read another tenant's SSO config");
    const config = await prisma.tenantSso.findUnique({ where: { tenantId } });
    if (!config) return ok(res, null);
    // Redact secret when reading (admin can re-enter it but never see it)
    ok(res, { ...config, oidcClientSecret: config.oidcClientSecret ? "***REDACTED***" : null });
  } catch (err) { next(err); }
});

// PUT /internal/sso/tenants/:tenantId/sso
router.put("/tenants/:tenantId/sso", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerTenant = getTenantId(req);
    const tenantId = param(req, "tenantId");
    if (callerTenant !== tenantId) throw Errors.forbidden("Cannot write another tenant's SSO config");
    const body = ConfigUpsertSchema.parse(req.body);

    // Auto-derive samlIssuer if SAML and not provided
    const baseApi = process.env["PUBLIC_API_URL"] ?? "http://localhost:4000/api";
    const derivedIssuer = body.protocol === "SAML" && !body.samlIssuer
      ? `${baseApi}/auth/sso/saml/${tenantId}`
      : body.samlIssuer;

    const data: any = {
      ...body,
      samlIssuer: derivedIssuer,
      roleMap: body.roleMap ?? {},
    };
    // Don't overwrite secret with the redaction marker if frontend round-tripped it
    if (data.oidcClientSecret === "***REDACTED***") delete data.oidcClientSecret;

    const saved = await prisma.tenantSso.upsert({
      where: { tenantId },
      create: { tenantId, ...data },
      update: data,
    });
    clearOidcCache(); // force re-discovery on next OIDC call
    ok(res, { ...saved, oidcClientSecret: saved.oidcClientSecret ? "***REDACTED***" : null });
  } catch (err) { next(err); }
});

// DELETE /internal/sso/tenants/:tenantId/sso
router.delete("/tenants/:tenantId/sso", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerTenant = getTenantId(req);
    const tenantId = param(req, "tenantId");
    if (callerTenant !== tenantId) throw Errors.forbidden("Cannot delete another tenant's SSO config");
    await prisma.tenantSso.deleteMany({ where: { tenantId } });
    clearOidcCache();
    ok(res, { deleted: tenantId });
  } catch (err) { next(err); }
});

// GET /internal/sso/tenants/:tenantId/sso/audit
router.get("/tenants/:tenantId/sso/audit", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerTenant = getTenantId(req);
    const tenantId = param(req, "tenantId");
    if (callerTenant !== tenantId) throw Errors.forbidden("Cannot read another tenant's SSO audit");
    const limit = Math.max(1, Math.min(500, Number(req.query["limit"]) || 100));
    const rows = await prisma.ssoLoginAudit.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    ok(res, { audit: rows, limit });
  } catch (err) { next(err); }
});

// GET /internal/sso/tenants/:tenantId/sso/metadata — SAML SP metadata XML
router.get("/tenants/:tenantId/sso/metadata", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const callerTenant = getTenantId(req);
    const tenantId = param(req, "tenantId");
    if (callerTenant !== tenantId) throw Errors.forbidden();
    const config = await prisma.tenantSso.findUnique({ where: { tenantId } });
    if (!config || config.protocol !== "SAML") throw Errors.notFound("SAML config");
    const callbackUrl = buildCallbackUrl(req, "saml", tenantId);
    const xml = buildSpMetadata(config, callbackUrl);
    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) { next(err); }
});

export default router;
