/**
 * Assessment-provider browse + connection-check router (assessment-service).
 *
 * Gives the recruiter UI a way to (a) browse a connected OA vendor's REAL test
 * library so nobody has to paste a raw HackerRank/HackerEarth test id, (b) validate
 * that a stored key actually authenticates, and (c) see per-vendor connection
 * status. It is ADDITIVE + read-only: it never issues an invite, never mutates a
 * credential, and never returns a decrypted secret.
 *
 * Mounted under /internal/assessments (reachable via the existing /api/assessments
 * gateway proxy, which is already gated behind requireModule('oa-assessments') and
 * forwards the verified JWT claims). It is mounted BEFORE the authoring router so
 * the literal `/providers` path is not shadowed by that router's `GET /:id`.
 *
 * ── HARD RULES honored here ───────────────────────────────────────────────────
 *  - REAL data or honest empty/inert ONLY. An un-keyed vendor answers "not
 *    connected" (409), NEVER a fabricated test list or a fake "connected". A test
 *    list is exactly what the vendor returned (empty array when the account has
 *    none). Validation is a live vendor call — never a hard-coded true.
 *  - CREDENTIALS never leave the server. We reuse the SAME decrypt path the
 *    provider-invite worker uses (loadProviderCredentials → notification-service
 *    server-to-server /internal/provider-credentials/:kind, AES-GCM decrypted at
 *    the point of use). We never re-implement crypto, never log a secret, and the
 *    response bodies carry only { id, name, category, durationMinutes } / booleans.
 *  - RATE LIMITS respected. The adapter's fetchJson already spaces calls + honors
 *    Retry-After (e.g. HackerRank 10 rps). A vendor 429 surfaces as a clean
 *    "rate limited, retry shortly" error, never a 500.
 *  - No auto-anything. This surface only reads; advancing/rejecting a candidate
 *    stays in the HITL flow downstream (GDPR Art. 22).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, AppError, getTenantId, getUserId, requireRole } from "@cdc-ats/common";
import { getProvider, isProviderKey, PROVIDER_KEYS } from "../providers/index.js";
import { loadProviderCredentials, ProviderCredsError } from "../lib/provider-creds.js";
import type { ProviderCredentials, ProviderTest } from "../providers/types.js";

const router = Router();

// Browsing the vendor library is a recruiting-side read — the same roles that
// author assessments + issue invites. INTERVIEWER stays out (matches invites.ts).
const requireBrowser = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");

/** Only OA assessment-provider kinds are browsable here (not slack/email/boards). */
function assertProviderKind(kind: string): asserts kind is (typeof PROVIDER_KEYS)[number] {
  if (!isProviderKey(kind)) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Unknown assessment provider "${kind}". Known: ${PROVIDER_KEYS.join(", ")}`,
      400,
    );
  }
}

/**
 * Classify an error raised while talking to a vendor (or the creds store) into an
 * HONEST, UI-actionable AppError — never a raw 500 that hides the cause:
 *
 *  - creds store unreachable (ProviderCredsError) → 502 "credential store
 *    unavailable" so the UI can say "try again", distinct from a bad key.
 *  - vendor rejected the key (401/403/419) → 422 INVALID_CREDENTIALS so the UI can
 *    say "check your key" rather than implying the vendor is down.
 *  - vendor rate limited (429) → 429 so the UI can say "retry shortly".
 *  - vendor 5xx / timeout / transport → 502 UPSTREAM_FAILURE ("vendor unavailable").
 *  - anything else (e.g. adapter "missing apiKey credential") → 422 with the
 *    adapter's own message, which is safe (it never contains the secret value).
 *
 * The returned AppError carries `provider` + `kind` in `details` so the client can
 * key its status UI. It NEVER includes the credential value.
 */
function classifyProviderError(err: unknown, kind: string): AppError {
  const details = { provider: kind, kind };

  if (err instanceof ProviderCredsError) {
    return new AppError(
      "UPSTREAM_FAILURE",
      "The credential store is temporarily unavailable. Please try again.",
      502,
      details,
    );
  }

  // ProviderHttpError from providers/http.ts carries a numeric `.status`; branch on
  // it WITHOUT importing the class (duck-typed so a future adapter transport works).
  const status =
    err && typeof err === "object" && typeof (err as { status?: unknown }).status === "number"
      ? (err as { status: number }).status
      : undefined;

  if (status === 401 || status === 403 || status === 419) {
    return new AppError(
      "INVALID_CREDENTIALS",
      "The vendor rejected the stored credentials. Check your API key for this provider.",
      422,
      details,
    );
  }
  if (status === 429) {
    return new AppError(
      "RATE_LIMITED",
      "The vendor is rate limiting requests. Please retry shortly.",
      429,
      details,
    );
  }
  if (typeof status === "number" && status >= 500) {
    return new AppError(
      "UPSTREAM_FAILURE",
      "The assessment vendor is temporarily unavailable. Please try again.",
      502,
      details,
    );
  }

  // Adapter-level input error (e.g. "[hackerrank] missing apiKey credential") or an
  // unclassified transport failure. Surface the message as a 422 so the UI shows a
  // clear "check your connection" state, never a bare 500. The adapter messages are
  // safe: they name the missing FIELD, never the secret value.
  const message =
    err instanceof Error && err.message
      ? err.message
      : "Could not reach the assessment vendor with the stored credentials.";
  return new AppError("INVALID_CREDENTIALS", message, 422, details);
}

/**
 * Load the tenant's decrypted creds for a provider kind via the SAME path the
 * invite worker uses. `null` (no integration row / disabled / no usable secret)
 * means "not connected" → the caller throws a 409 so the UI shows
 * "connect your account". A creds-store transport error propagates (classified to
 * 502 by the caller) so a store blip is never mistaken for "not connected".
 */
async function loadCredsOrNotConnected(
  tenantId: string,
  kind: string,
  userId: string,
): Promise<ProviderCredentials> {
  const creds = await loadProviderCredentials(tenantId, kind, userId);
  if (!creds) {
    throw new AppError(
      "NOT_CONNECTED",
      `No ${kind} integration is connected for this tenant. Add your ${kind} credentials in Settings → Integrations.`,
      409,
      { provider: kind, kind, connected: false },
    );
  }
  return creds;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/providers
// The tenant's assessment integrations with a per-vendor connection snapshot so
// the UI can render status chips. `connected` reflects whether USABLE, ENABLED
// credentials are present (integration row exists, enabled, carries a secret) —
// derived from the real creds loader, NEVER a fabricated "connected". We do NOT
// fire a live vendor call per row here (that would be 5 network calls on a status
// list + could trip rate limits); the dedicated /:kind/validate endpoint does the
// live check. `lastValidatedAt` is null because the platform does not persist a
// validation timestamp (honest unknown, not a fake "just now").
// ─────────────────────────────────────────────────────────────────────────────
router.get("/providers", requireBrowser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const userId = getUserId(req);

    const providers = await Promise.all(
      PROVIDER_KEYS.map(async (kind) => {
        try {
          const creds = await loadProviderCredentials(tenantId, kind, userId);
          return { kind, connected: Boolean(creds), lastValidatedAt: null as string | null };
        } catch (err) {
          // A creds-store blip must not masquerade as "not connected"; report the
          // vendor as unknown-with-error rather than a false false. Never a fake true.
          const message =
            err instanceof ProviderCredsError ? "credential store unavailable" : "unavailable";
          return { kind, connected: false, lastValidatedAt: null as string | null, error: message };
        }
      }),
    );

    ok(res, { providers });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/providers/:kind/tests
// Browse the connected vendor's REAL test library so the recruiter picks a test by
// name instead of pasting a raw vendor id. Returns [{ id, name, category,
// durationMinutes }] exactly as the vendor reported (empty array when the account
// has none — honest empty). NEVER returns the raw creds.
//
//   404/409 when the tenant has no (usable) integration for this kind.
//   422 INVALID_CREDENTIALS when the vendor rejects the key (UI: "check your key").
//   429 when the vendor rate limits; 502 on a vendor/creds-store outage.
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/providers/:kind/tests",
  requireBrowser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const kind = String(req.params["kind"]);
      assertProviderKind(kind);

      const adapter = getProvider(kind);
      // isProviderKey (via assertProviderKind) guarantees a registered adapter.
      if (!adapter) throw new AppError("NOT_CONNECTED", `Provider "${kind}" is not available.`, 409, { kind });

      const creds = await loadCredsOrNotConnected(tenantId, kind, userId);

      let tests: ProviderTest[];
      try {
        tests = await adapter.listTests(creds);
      } catch (err) {
        throw classifyProviderError(err, kind);
      }

      // Project to the UI-safe shape ONLY (no vendor `raw`, no creds). Nulls are
      // honest "not reported by the vendor", never a fabricated value.
      const shaped = tests.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category ?? null,
        durationMinutes: typeof t.durationMinutes === "number" ? t.durationMinutes : null,
      }));

      ok(res, { provider: kind, connected: true, total: shaped.length, tests: shaped });
    } catch (err) {
      next(err);
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/providers/:kind/validate
// Lightweight, LIVE connection check: loads the stored creds and makes one real
// authenticated vendor call (listTests) to confirm the key works. Returns
//   { connected: boolean, testCount?: number, error?: string }
// as a 200 in ALL outcomes (it is a status probe, not an action) so the UI can
// render a red/green chip without treating a bad key as an HTTP failure:
//   - usable creds + vendor accepts → { connected: true, testCount }
//   - no integration / disabled     → { connected: false, error: "not connected" }
//   - vendor rejects the key        → { connected: false, error: "<reason>" }
// The `error` is a human-readable reason (never the credential value).
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/providers/:kind/validate",
  requireBrowser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const userId = getUserId(req);
      const kind = String(req.params["kind"]);
      assertProviderKind(kind);

      const adapter = getProvider(kind);
      if (!adapter) {
        return ok(res, { provider: kind, connected: false, error: "provider not available" });
      }

      // No usable creds → honestly not connected (a real 200 status probe result).
      const creds = await loadProviderCredentials(tenantId, kind, userId).catch((err) => {
        // Distinguish a creds-store outage from "no row": surface the outage as an
        // error string (still connected:false) rather than throwing a 500.
        if (err instanceof ProviderCredsError) return "__store_error__" as const;
        throw err;
      });

      if (creds === "__store_error__") {
        return ok(res, {
          provider: kind,
          connected: false,
          error: "credential store temporarily unavailable",
        });
      }
      if (!creds) {
        return ok(res, { provider: kind, connected: false, error: "not connected" });
      }

      // LIVE authenticated call — a real handshake, never a hard-coded true.
      try {
        const tests = await adapter.listTests(creds);
        return ok(res, { provider: kind, connected: true, testCount: tests.length });
      } catch (err) {
        const classified = classifyProviderError(err, kind);
        return ok(res, { provider: kind, connected: false, error: classified.message });
      }
    } catch (err) {
      next(err);
    }
  },
);

export default router;
