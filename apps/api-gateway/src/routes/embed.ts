/**
 * WF9 / SLICE I1 — embed data plane.
 *
 * The embeddable widget surface (the chrome-less pages in the Next (embed) route
 * group) is UNAUTHENTICATED in the session-JWT sense: a customer iframes the
 * widget into their own site, so there is no logged-in user, no auth cookie, and
 * no Authorization session token on these calls. The ONLY credential is the
 * short-lived, signed EMBED TOKEN minted by POST /api/embed/token (WF2). That
 * token bakes the SERVER-RESOLVED authorization context — tenantId, the module,
 * the locked resourceId + params, and the frame-ancestors allowlist — so the
 * embed host trusts ONLY what is inside the verified token, never the client.
 *
 * This router is therefore mounted WITHOUT gatewayAuth: it verifies the embed
 * token itself (verifyEmbedToken) and resolves the locked resource scoped to the
 * baked tenantId via callService synthetic userHeaders (the same trusted
 * server-to-server idiom super-admin fanout + the module gate use). It NEVER
 * reads a tenantId / resourceId from the request body or query — only from the
 * verified token — so a framed page can never widen its own scope.
 *
 * It is mounted under /api/embed/*, which:
 *   - nginx serves with framing relaxed (X-Frame-Options dropped) so the widget
 *     can be iframed, and
 *   - the gateway's embedFramingHeaders() stamps the per-tenant CSP
 *     frame-ancestors from the verified token's allowlist (fail closed to 'none').
 *
 * Endpoints (all fail closed on a missing/expired/tampered token):
 *
 *   POST /api/embed/validate
 *     Body: { token } (or x-embed-token header / ?token=). Verifies the token and
 *     returns the locked context the page needs to render its chrome-less shell:
 *     { valid, module, resourceId, params, expiresAt, branding }. branding carries
 *     the tenant's white-label name + brand hex + logo (resolved server-side) so
 *     the embed applies the WF6 brand ramp. An invalid token returns
 *     { valid: false } (200) — the page renders the honest invalid/expired state.
 *
 *   GET /api/embed/data
 *     Token via x-embed-token header or ?token=. Verifies, then fetches the LOCKED
 *     resource scoped to the baked tenantId, switching on the token's module:
 *       pipeline  -> the hiring funnel (candidate applicationsByStage)
 *       screening -> the screening verdict list (locked to a requisitionId param
 *                    when present in the token)
 *       viz       -> a chosen chart's series (the funnel, same source as pipeline,
 *                    rendered as a ribbon by the page)
 *       apply     -> the public job summary + the tenant's application form schema
 *                    (the same public, no-auth source the candidate apply page uses)
 *     Returns { module, resourceId, params, data }. A 401 only ever means the
 *     TOKEN failed — never a downstream blip (those fail soft to an empty payload
 *     so the widget shows its honest empty state rather than an error).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import express from "express";
import { ok, Errors } from "@cdc-ats/common";
import { callService } from "../lib/service-client.js";
import { verifyEmbedToken, type VerifiedEmbedClaims } from "../lib/embed-token.js";

/** The ordered hiring-funnel stages (mirrors the frontend + aggregator order). */
const STAGE_ORDER = [
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED",
] as const;

/**
 * Pull the embed token from the request: a JSON body { token } (validate POST),
 * the `x-embed-token` header, the `?token=` query (the only place an iframe src
 * can carry it), or a Bearer Authorization header. Returns undefined when none.
 */
function extractToken(req: Request): string | undefined {
  const b = (req.body as { token?: unknown } | undefined)?.token;
  if (typeof b === "string" && b.length > 0) return b;
  const h = req.headers["x-embed-token"];
  if (typeof h === "string" && h.length > 0) return h;
  const q = req.query["token"];
  if (typeof q === "string" && q.length > 0) return q;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    const t = auth.slice(7);
    if (t.length > 0) return t;
  }
  return undefined;
}

/** Verify the token, returning the claims or null (never throws). Fail closed. */
function verifyOrNull(token: string | undefined): VerifiedEmbedClaims | null {
  if (!token) return null;
  try {
    return verifyEmbedToken(token);
  } catch {
    return null;
  }
}

/** Synthetic, trusted user-headers for a server-to-server call on the embed's
 *  behalf. Everything is taken from the VERIFIED token — never the request. */
function embedUserHeaders(claims: VerifiedEmbedClaims) {
  return {
    userId: claims.sub || "embed",
    tenantId: claims.tenantId,
    role: claims.role || "EMBED",
  };
}

/** Read a string param off the locked token params (never off the request). */
function param(claims: VerifiedEmbedClaims, key: string): string | undefined {
  const v = claims.params?.[key];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function embedRouter(): Router {
  const router = Router();

  // POST /api/embed/validate — verify the token + return the locked render
  // context (module / resourceId / params) and the tenant's white-label branding.
  // A bad/expired token returns { valid:false } with a 200 so the page can render
  // its honest invalid state without treating it as a transport error.
  router.post(
    "/validate",
    express.json({ limit: "16kb" }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const claims = verifyOrNull(extractToken(req));
        if (!claims) {
          ok(res, { valid: false });
          return;
        }

        // Resolve the tenant's white-label branding (server-side, scoped to the
        // baked tenantId). Fail soft to null so a tenant-service blip never blocks
        // the embed — the page just renders with the default theme.
        let branding: { name?: string; brandPrimaryColor?: string | null; logoUrl?: string | null } | null = null;
        try {
          const b = await callService<{ name?: string; brandPrimaryColor?: string | null; logoUrl?: string | null }>(
            "tenant",
            { method: "GET", path: "/internal/branding", userHeaders: embedUserHeaders(claims), timeoutMs: 4000 },
          );
          if (b && typeof b === "object") {
            branding = {
              name: typeof b.name === "string" ? b.name : undefined,
              brandPrimaryColor: typeof b.brandPrimaryColor === "string" ? b.brandPrimaryColor : null,
              logoUrl: typeof b.logoUrl === "string" ? b.logoUrl : null,
            };
          }
        } catch {
          branding = null;
        }

        ok(res, {
          valid: true,
          module: claims.module,
          resourceId: claims.resourceId,
          params: claims.params ?? {},
          expiresAt: claims.exp,
          branding,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  // GET /api/embed/data — verify the token, then fetch the LOCKED resource scoped
  // to the baked tenantId, switching on the token's module. A failed token is a
  // hard 401; a downstream blip fails soft to an empty payload (honest empty
  // state on the widget) rather than a 500.
  router.get("/data", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const claims = verifyOrNull(extractToken(req));
      if (!claims) throw Errors.unauthorized("Invalid or expired embed token");
      const uh = embedUserHeaders(claims);
      const mod = claims.module;

      // ── pipeline + viz: the hiring funnel (candidate applicationsByStage) ──
      // Both surfaces render the same real funnel source: pipeline as the
      // FlowRibbon, viz as a chosen chart over the same series.
      if (mod === "pipeline" || mod === "viz") {
        let stages: Record<string, number> = {};
        try {
          const cand = await callService<{ applicationsByStage?: Record<string, number> }>(
            "candidate",
            { path: "/internal/candidates/overview", userHeaders: uh, timeoutMs: 4000 },
          );
          if (cand?.applicationsByStage && typeof cand.applicationsByStage === "object") {
            stages = cand.applicationsByStage;
          }
        } catch {
          stages = {};
        }
        const funnel = STAGE_ORDER.map((stage) => ({ stage, count: Number(stages[stage] ?? 0) }));
        ok(res, { module: mod, resourceId: claims.resourceId, params: claims.params ?? {}, data: { funnel } });
        return;
      }

      // ── screening: the verdict list, locked to a requisitionId when the token
      // carries one (so the embed can't widen past the requisition it was minted
      // for). The list is already tenant-scoped by the forwarded X-Tenant-Id. ──
      if (mod === "screening") {
        const reqId = param(claims, "requisitionId") || (claims.resourceId !== claims.tenantId ? claims.resourceId : undefined);
        let rows: unknown[] = [];
        try {
          const qs = reqId ? `?requisitionId=${encodeURIComponent(reqId)}` : "";
          const list = await callService<unknown>(
            "screening",
            { path: `/internal/screening${qs}`, userHeaders: uh, timeoutMs: 4000 },
          );
          rows = Array.isArray(list) ? list : [];
        } catch {
          rows = [];
        }
        ok(res, { module: mod, resourceId: claims.resourceId, params: claims.params ?? {}, data: { screenings: rows } });
        return;
      }

      // ── apply: the public job summary + the tenant's application form schema.
      // These are the SAME public, no-auth job-service routes the candidate apply
      // page reads; the embed token's resourceId is the job posting slug. We call
      // them server-side so the widget gets a single, ready-to-render payload. ──
      if (mod === "apply") {
        const slug = param(claims, "slug") || claims.resourceId;
        let job: unknown = null;
        let form: unknown = null;
        if (slug) {
          const [j, f] = await Promise.allSettled([
            callService<unknown>("job", { path: `/public/jobs/${encodeURIComponent(slug)}`, timeoutMs: 4000 }),
            callService<unknown>("job", { path: `/public/jobs/${encodeURIComponent(slug)}/form`, timeoutMs: 4000 }),
          ]);
          job = j.status === "fulfilled" ? j.value : null;
          form = f.status === "fulfilled" ? f.value : null;
        }
        ok(res, { module: mod, resourceId: claims.resourceId, params: { ...(claims.params ?? {}), slug }, data: { job, form } });
        return;
      }

      // Unknown module on a VALID token — return an empty payload (honest empty
      // state) rather than an error; the token was authentic, the surface just
      // isn't an embeddable one.
      ok(res, { module: mod, resourceId: claims.resourceId, params: claims.params ?? {}, data: null });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
