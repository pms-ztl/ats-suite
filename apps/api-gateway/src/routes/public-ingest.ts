/**
 * Phase 34b — Public ingest API. Authenticated by tenant API key bearer.
 *
 *   POST /api/v1/candidates
 *     Headers: Authorization: Bearer ats_...
 *     Body: { email, firstName, lastName, ... } OR an adapter-recognised format
 *
 * Adapter pattern: if the body matches a known external format (Indeed XML,
 * Workday HRXML, ZipRecruiter ApplyAPI, generic LinkedIn snapshot), we
 * normalize before forwarding to candidate-service.
 *
 * Per-key rate limit: 60 requests / minute. Defends against a leaked key
 * being used to scrape or DoS.
 *
 * Versioning: kept under /api/v1/ deliberately. Schema changes that break
 * external callers will land at /api/v2/ with a deprecation timeline.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { Errors, created } from "@cdc-ats/common";
import rateLimit from "express-rate-limit";
import { createHash } from "crypto";
import { callService } from "../lib/service-client.js";

export const publicIngestRouter = Router();

// ─── auth middleware ─────────────────────────────────────────────────────
// Validates the bearer token against identity-service /verify, attaches
// { tenantId, scopes } to req. Caches positive results for 60s in-process
// to avoid hitting identity-service on every request.
const cache = new Map<string, { tenantId: string; scopes: string[]; expiresAt: number }>();

async function apiKeyAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return next(Errors.unauthorized("Bearer ats_... token required in Authorization header"));
    }
    const key = header.slice(7);
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expiresAt > now) {
      (req as any).apiKey = { tenantId: cached.tenantId, scopes: cached.scopes };
      return next();
    }
    const result = await callService<{ valid: boolean; tenantId?: string; scopes?: string[]; keyId?: string }>(
      "identity",
      { method: "POST", path: "/internal/api-keys/verify", body: { key } },
    );
    if (!result.valid || !result.tenantId) {
      return next(Errors.unauthorized("Invalid or revoked API key"));
    }
    cache.set(key, { tenantId: result.tenantId, scopes: result.scopes ?? [], expiresAt: now + 60_000 });
    (req as any).apiKey = { tenantId: result.tenantId, scopes: result.scopes ?? [] };
    next();
  } catch (err) {
    next(err);
  }
}

function requireScope(scope: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const scopes = (req as any).apiKey?.scopes as string[] | undefined;
    if (!scopes?.includes(scope)) {
      return next(Errors.forbidden(`Scope "${scope}" required; key has [${scopes?.join(", ") ?? ""}]`));
    }
    next();
  };
}

// Per-key rate limit. Hash the bearer header so the rate-limit store never
// contains plaintext keys (defense in depth if Redis is ever compromised).
const keyRateLimit = rateLimit({
  windowMs: 60_000,
  max: 60,
  keyGenerator: (req: Request): string => {
    const header = req.headers.authorization ?? "";
    return createHash("sha256").update(header).digest("hex").slice(0, 16);
  },
  message: { success: false, error: { code: "RATE_LIMIT", message: "60 requests per minute per key" } },
});

// ─── adapters ────────────────────────────────────────────────────────────
// Normalize known external formats. Detection is body-shape based — if a
// request matches a known schema's marker keys we treat it as that format;
// else we fall through to the generic CDC ATS shape.

interface NormalizedCandidate {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  source: string;
  resumeUrl?: string;
  metadata?: Record<string, unknown>;
}

function detectFormat(body: any): "indeed" | "ziprecruiter" | "linkedin" | "generic" {
  if (body?.indeedApplyData) return "indeed";
  if (body?.zipApply || body?.zip_apply_id) return "ziprecruiter";
  if (body?.linkedinProfileUrl || body?.publicProfileUrl) return "linkedin";
  return "generic";
}

function normalize(body: any): NormalizedCandidate {
  switch (detectFormat(body)) {
    case "indeed": {
      // Indeed Apply API v3 payload shape (subset)
      const a = body.indeedApplyData ?? body;
      return {
        email: a.candidate?.email ?? a.email,
        firstName: a.candidate?.firstName ?? a.firstName ?? "Unknown",
        lastName: a.candidate?.lastName ?? a.lastName ?? "Unknown",
        phone: a.candidate?.phone ?? a.phone,
        location: a.candidate?.locationFreeFormText ?? a.location,
        resumeUrl: a.resume?.fileUrl ?? a.resumeUrl,
        source: "INDEED",
        metadata: { indeedApplyId: a.applyId ?? null, jobKey: a.jobKey ?? null },
      };
    }
    case "ziprecruiter": {
      return {
        email: body.email,
        firstName: body.first_name ?? body.firstName ?? "Unknown",
        lastName: body.last_name ?? body.lastName ?? "Unknown",
        phone: body.phone,
        location: body.location,
        resumeUrl: body.resume_url ?? body.resumeUrl,
        source: "ZIPRECRUITER",
        metadata: { zipApplyId: body.zip_apply_id ?? null, jobId: body.job_id ?? null },
      };
    }
    case "linkedin": {
      const fullName = body.fullName ?? `${body.firstName ?? ""} ${body.lastName ?? ""}`.trim();
      const [first, ...rest] = fullName.split(" ");
      return {
        email: body.email,
        firstName: body.firstName ?? first ?? "Unknown",
        lastName: body.lastName ?? rest.join(" ") ?? "Unknown",
        location: body.location ?? body.geoLocation,
        linkedinUrl: body.linkedinProfileUrl ?? body.publicProfileUrl,
        source: body.source ?? "LINKEDIN",
        metadata: {
          headline: body.headline ?? null,
          currentTitle: body.currentTitle ?? null,
          currentCompany: body.currentCompany ?? null,
        },
      };
    }
    case "generic":
    default:
      return {
        email: body.email,
        firstName: body.firstName ?? body.first_name ?? "Unknown",
        lastName: body.lastName ?? body.last_name ?? "Unknown",
        phone: body.phone,
        location: body.location,
        linkedinUrl: body.linkedinUrl ?? body.linkedin_url,
        portfolioUrl: body.portfolioUrl ?? body.portfolio_url,
        resumeUrl: body.resumeUrl ?? body.resume_url,
        source: body.source ?? "API_INGEST",
        metadata: body.metadata,
      };
  }
}

// ─── POST /api/v1/candidates ─────────────────────────────────────────────
publicIngestRouter.post(
  "/candidates",
  apiKeyAuth,
  keyRateLimit,
  requireScope("candidates:write"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).apiKey.tenantId as string;
      const normalized = normalize(req.body);

      // Validate the normalized shape — caller's payload is untrusted.
      const schema = z.object({
        email: z.string().email(),
        firstName: z.string().min(1).max(80),
        lastName: z.string().min(1).max(80),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedinUrl: z.string().url().optional(),
        portfolioUrl: z.string().url().optional(),
        source: z.string().min(1).max(80),
        resumeUrl: z.string().url().optional(),
        metadata: z.record(z.unknown()).optional(),
      });
      const parsed = schema.parse(normalized);

      // Upsert via candidate-service. Same idempotency story as the public
      // apply flow (Phase 4) — same email = same tenant candidate row.
      const candidate = await callService<any>("candidate", {
        method: "POST",
        path: "/internal/candidates/upsert-from-application",
        userHeaders: {
          tenantId,
          userId: "api-ingest",
          role: "ADMIN",
          email: "system@cdc-ats.local",
        },
        body: parsed,
      });

      created(res, { candidateId: candidate.id, email: candidate.email, source: parsed.source });
    } catch (err) {
      next(err);
    }
  },
);
