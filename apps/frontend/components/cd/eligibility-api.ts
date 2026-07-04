// components/cd/eligibility-api.ts
// Lane-local data access for AUTHORING a requisition's eligibility spec. The
// gating engine (job-service requisitions.ts + public.ts) already enforces these
// rules on the apply path; this only reads/writes the stored spec.
//
// This is deliberately self-contained (it does not touch the shared lib/api.ts):
// it reads the requisition row directly (which carries `eligibilityRules`, a
// column lib/api.ts's toRequisition() view-model intentionally drops) and PATCHes
// only `eligibilityRules` back, an additive backward-compatible payload that
// leaves every other requisition field untouched.

// One eligibility rule as stored on the requisition. Mirrors
// @cdc-ats/contracts EligibilityRule (kept lane-local so this file owns its shape
// and does not depend on shared frontend type files).
export type EligibilityOp = "eq" | "neq" | "in" | "not_in" | "gte" | "lte" | "between";
export interface EligibilityRuleDef {
  /** FormField id whose submitted answer is evaluated (e.g. "department"). */
  field: string;
  op: EligibilityOp;
  /** Comparison operand(s). in/not_in use the whole array; numeric ops use [0] (+[1] for between). */
  values: string[];
  /** Shown to the candidate when this rule fails. */
  errorMessage: string;
  /** Optional human label for the rule in the authoring UI. */
  label?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function call(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  return res.json().catch(() => ({}));
}

function toRule(r: any): EligibilityRuleDef | null {
  const field = typeof r?.field === "string" ? r.field.trim() : "";
  const op = r?.op as EligibilityOp;
  const errorMessage = typeof r?.errorMessage === "string" ? r.errorMessage : "";
  const VALID_OPS = ["eq", "neq", "in", "not_in", "gte", "lte", "between"];
  if (!field || !VALID_OPS.includes(op)) return null;
  return {
    field,
    op,
    values: Array.isArray(r?.values) ? r.values.map((v: any) => String(v)) : [],
    errorMessage,
    ...(typeof r?.label === "string" && r.label ? { label: r.label } : {}),
  };
}

/** Read the requisition's currently-stored eligibility rules (empty = open to all). */
export async function getEligibilityRules(requisitionId: string): Promise<EligibilityRuleDef[]> {
  try {
    const res: any = await call("GET", `/requisitions/${encodeURIComponent(requisitionId)}`);
    const d = res?.data ?? res ?? {};
    const raw = Array.isArray(d?.eligibilityRules) ? d.eligibilityRules : [];
    return raw.map(toRule).filter((r: EligibilityRuleDef | null): r is EligibilityRuleDef => r != null);
  } catch { return []; }
}

/**
 * Persist the eligibility spec on the requisition. Sends ONLY eligibilityRules on
 * a PATCH (additive, backward-compatible) so no other requisition field is touched.
 */
export async function saveEligibilityRules(requisitionId: string, rules: EligibilityRuleDef[]): Promise<void> {
  await call("PATCH", `/requisitions/${encodeURIComponent(requisitionId)}`, { eligibilityRules: rules });
}
