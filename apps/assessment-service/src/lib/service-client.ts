/**
 * Internal HTTP clients for assessment-service → other services.
 *
 * Clones screening-service/src/lib/service-client.ts: a 3s-timeout fetch that
 * stamps X-Tenant-Id / X-User-Id / X-User-Role + the X-Internal-Service token so
 * the call clears the internal-service-token enforcement, and unwraps the
 * { data } envelope. Used by the grading worker to (a) plan-gate the essay
 * autoscore via billing check-agent and (b) resolve the candidate's application
 * so candidate-service can advance the right ApplicationStage on completion.
 *
 * Fail posture matches screening: a billing/candidate outage NEVER hard-blocks
 * grading — the gate fails OPEN (do the work) and the application resolve fails
 * to null (the completion event still publishes, applicationId omitted).
 */
const URLS = {
  billing: process.env["BILLING_SERVICE_URL"] ?? "http://localhost:4003",
  candidate: process.env["CANDIDATE_SERVICE_URL"] ?? "http://localhost:4005",
};

const INTERNAL_TOKEN = process.env["INTERNAL_SERVICE_TOKEN"];

async function call<T>(service: keyof typeof URLS, path: string, tenantId: string, userId = "system"): Promise<T | null> {
  const url = `${URLS[service]}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Tenant-Id": tenantId,
    "X-User-Id": userId,
    "X-User-Role": "ADMIN", // internal call, granted full read
  };
  if (INTERNAL_TOKEN) headers["X-Internal-Service"] = INTERNAL_TOKEN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const body: any = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Plan-gate the essay autoscore through the agent-plan path (billing check-agent),
 * the same source of truth the screening worker uses for candidate-screener. The
 * essay/long-form rubric grader is the `oa-grader` agent (oa-assessments module,
 * PROFESSIONAL+). Fails OPEN on a billing outage so a blip never silently drops
 * grading.
 */
export async function isEssayGraderAllowed(tenantId: string, agentType = "oa-grader"): Promise<boolean> {
  const r = await call<{ allowed?: boolean }>(
    "billing",
    `/internal/billing/check-agent?agentType=${encodeURIComponent(agentType)}`,
    tenantId,
  );
  if (r === null) return true; // billing unreachable — do not hard-block
  return r.allowed === true;
}

interface CandidateApplication {
  id: string;
  requisitionId: string;
  stage?: string;
  status?: string;
  createdAt?: string;
}

/**
 * Resolve the application this assessment result should advance. Pulls the
 * candidate's applications from candidate-service and prefers the one whose
 * requisitionId matches the assessment's requisitionId; otherwise falls back to
 * the most-recent ACTIVE application. Returns null when none can be resolved (the
 * completion event still fires; candidate-service simply has no stage to advance).
 *
 * @param requisitionId  the assessment's requisitionId (may be null — assessments
 *                       can be standalone). When null, the most recent active
 *                       application is used.
 */
export async function fetchApplicationForCandidate(
  candidateId: string,
  tenantId: string,
  requisitionId: string | null,
): Promise<string | null> {
  const apps = await call<CandidateApplication[]>(
    "candidate",
    `/internal/candidates/${encodeURIComponent(candidateId)}/applications`,
    tenantId,
  );
  if (!Array.isArray(apps) || apps.length === 0) return null;

  if (requisitionId) {
    const match = apps.find((a) => a.requisitionId === requisitionId);
    if (match) return match.id;
  }
  // Fall back to the most recent ACTIVE application (apps come back newest-first).
  const active = apps.find((a) => (a.status ?? "ACTIVE") === "ACTIVE");
  return (active ?? apps[0])?.id ?? null;
}
