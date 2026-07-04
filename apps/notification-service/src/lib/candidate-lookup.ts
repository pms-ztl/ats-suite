/**
 * Lane 4 cross-service lookups for candidate-facing comms.
 *
 * Some events (application.stage.changed, application.hired) carry only ids, not
 * the candidate's email / name or the onboarding portal token. To send the
 * candidate a REAL email (never a fabricated address) we resolve the missing
 * context from the owning service over its internal HTTP API, best-effort:
 *
 *   - candidate email + name  ← candidate-service GET /internal/candidates/:id
 *   - onboarding portal token ← onboarding-service GET /internal/onboarding-cases
 *
 * Both are best-effort: any failure yields null (honest empty) and the caller
 * degrades gracefully (skip the email, or fall back to the portal landing). It
 * NEVER emails a broken link or a guessed address.
 *
 * The X-Internal-Service token is stamped when INTERNAL_SERVICE_TOKEN is set so
 * these calls satisfy readAuthHeaders on the callee (see packages/common
 * is-module-on.ts for the same pattern).
 */
import type { Logger } from "pino";

const CANDIDATE_SERVICE_URL = process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005";
const ONBOARDING_SERVICE_URL = process.env["ONBOARDING_SERVICE_URL"] ?? "http://localhost:4015";
const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

/** Identity headers for an internal call made on the platform's behalf (ADMIN
 * so role-gated fields like the candidate email are visible; tenant-scoped so
 * RLS resolves the right rows). */
function internalHeaders(tenantId: string): Record<string, string> {
  const h: Record<string, string> = {
    "content-type": "application/json",
    "x-tenant-id": tenantId,
    "x-user-id": "system",
    "x-user-role": "ADMIN",
  };
  if (INTERNAL_TOKEN) h["x-internal-service"] = INTERNAL_TOKEN;
  return h;
}

export interface CandidateContact {
  email: string | null;
  name: string | null;
}

/**
 * Resolve a candidate's email + display name from candidate-service. Returns
 * all-null on any error so the caller can skip the email honestly.
 */
export async function fetchCandidateContact(
  tenantId: string,
  candidateId: string,
  logger?: Logger,
): Promise<CandidateContact> {
  try {
    const res = await fetch(`${CANDIDATE_SERVICE_URL}/internal/candidates/${candidateId}`, {
      headers: internalHeaders(tenantId),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) {
      logger?.warn({ candidateId, status: res.status }, "candidate contact lookup failed");
      return { email: null, name: null };
    }
    const body = (await res.json()) as any;
    const c = body.data ?? body ?? {};
    const email = typeof c.email === "string" && c.email ? c.email : null;
    const first = typeof c.firstName === "string" ? c.firstName : "";
    const last = typeof c.lastName === "string" ? c.lastName : "";
    const name = `${first} ${last}`.trim() || null;
    return { email, name };
  } catch (err) {
    logger?.warn({ candidateId, err }, "candidate contact lookup error");
    return { email: null, name: null };
  }
}

/**
 * Resolve the onboarding portal token for a candidate's case from
 * onboarding-service. onboarding-service opens the case on the SAME
 * application.hired event this is called from, so a brief bounded retry absorbs
 * the create race. Returns null if no case/token is found (caller falls back to
 * the portal landing, never a fabricated token).
 */
export async function fetchOnboardingPortalToken(
  tenantId: string,
  candidateId: string,
  logger?: Logger,
): Promise<string | null> {
  const headers = internalHeaders(tenantId);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      // The list route returns the tenant's cases with their id (portalToken is
      // omitted from the list projection), so find our case id, then fetch the
      // full case which includes portalToken.
      const listRes = await fetch(`${ONBOARDING_SERVICE_URL}/internal/onboarding-cases`, {
        headers,
        signal: AbortSignal.timeout(3000),
      });
      if (listRes.ok) {
        const listBody = (await listRes.json()) as any;
        const cases: any[] = Array.isArray(listBody.data) ? listBody.data : [];
        const mine = cases.find((c) => c.candidateId === candidateId);
        if (mine?.id) {
          const detailRes = await fetch(`${ONBOARDING_SERVICE_URL}/internal/onboarding-cases/${mine.id}`, {
            headers,
            signal: AbortSignal.timeout(3000),
          });
          if (detailRes.ok) {
            const detailBody = (await detailRes.json()) as any;
            const token = detailBody.data?.portalToken ?? detailBody.portalToken ?? null;
            if (typeof token === "string" && token) return token;
          }
        }
      }
    } catch (err) {
      logger?.warn({ candidateId, attempt, err }, "onboarding token lookup error");
    }
    // Bounded backoff for the case-create race (onboarding-service consumes the
    // same event). Total wait stays well under a second.
    await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
  }
  logger?.info({ candidateId }, "onboarding portal token not available yet; falling back to portal landing");
  return null;
}
