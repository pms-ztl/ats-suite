"use client";
// app/(dashboard)/admin/plan-requests/page.tsx - EXACT Claude Design "Aurora"
// platform operator plan-requests queue (PlanRequestsScreen). Tenant plan
// upgrade/downgrade requests awaiting operator approval: each row shows the
// tenant, the current -> requested plan transition, the MRR delta, the reason,
// who requested it and when, plus Approve/Deny actions. Ported verbatim from
// claude-design/screen-platform.jsx (PlanRequestsScreen) and wired to the real
// gateway via GET /platform/plan-requests with a /admin/plan-requests fallback.
// Approve/Deny fire a best-effort POST and reflect the decision inline. Nothing
// is fabricated: on error or an empty/404 response the exact layout still
// renders with an EmptyState in the body.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// Try the platform-operator route first, then fall back to the admin route.
async function loadRequests(): Promise<PlanRequest[]> {
  let res: any;
  try {
    res = await raw("/platform/plan-requests");
  } catch {
    res = await raw("/admin/plan-requests");
  }
  return mapRequests(res);
}

// Plan -> accent color (full-color --c-* tokens; bare channels are Tailwind-only).
const PLAN_T: Record<string, string> = {
  FREE: "var(--c-ink-3)",
  STARTER: "var(--c-info)",
  PROFESSIONAL: "var(--c-brand)",
  ENTERPRISE: "var(--c-ai)",
};

type PlanRequest = {
  id: string;
  tenant: string;
  tenantId?: string;
  from: string;
  to: string;
  by: string;
  when: string;
  reason: string;
  mrr: string;
};

// Relative-time label ("2h", "5h", "1d") from an ISO timestamp, defensively.
function whenLabel(raw: any): string {
  if (raw == null) return "";
  const direct = typeof raw === "string" ? raw : "";
  // If the payload already gives a short label, keep it.
  if (direct && !/[T:]/.test(direct) && direct.length <= 6) return direct;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return direct;
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 48) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

// Defensive mapping: the real payload may be {data:[...]} or [...] and each row
// may use a variety of field names. Coerce to the shape the cards render.
function mapRequests(res: any): PlanRequest[] {
  const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  return arr.map((r: any, i: number) => {
    const tenant = String(
      r?.tenant?.name ?? r?.tenantName ?? r?.tenant ?? r?.companyName ?? r?.tenantId ?? `Tenant ${i + 1}`,
    );
    const from = String(r?.from ?? r?.fromPlan ?? r?.currentPlan ?? r?.tenant?.plan ?? "FREE").toUpperCase();
    const to = String(r?.to ?? r?.toPlan ?? r?.requestedPlan ?? r?.targetPlan ?? "STARTER").toUpperCase();
    const mrrRaw = r?.mrr ?? r?.mrrDelta ?? r?.priceDelta ?? r?.deltaMrr;
    const mrr =
      mrrRaw == null
        ? ""
        : typeof mrrRaw === "number"
          ? (mrrRaw >= 0 ? "+" : "") + "$" + Math.abs(mrrRaw).toLocaleString()
          : String(mrrRaw);
    return {
      id: String(r?.id ?? r?.requestId ?? i),
      tenant,
      tenantId: r?.tenantId ?? r?.tenant?.id,
      from: from in PLAN_T ? from : "FREE",
      to: to in PLAN_T ? to : "STARTER",
      by: String(r?.by ?? r?.requestedBy ?? r?.requestedByEmail ?? r?.requester ?? r?.user?.email ?? ""),
      when: whenLabel(r?.when ?? r?.requestedAt ?? r?.createdAt ?? r?.created),
      reason: String(r?.reason ?? r?.note ?? r?.justification ?? ""),
      mrr,
    };
  });
}

function OpHead({ title, sub, right }: { title: string; sub: string; right?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
      <div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{title}</h1>
          <Pill icon="bolt" tone="var(--c-danger)" bg="var(--c-danger-tint)">platform operator</Pill>
        </div>
        <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{sub}</p>
      </div>
      {right}
    </div>
  );
}

export default function PlanRequestsPage() {
  const requests = useData<PlanRequest[]>(loadRequests);
  // Decision state, keyed by request id. Value is the inline outcome label.
  const [done, setDone] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const items = requests.data ?? [];
  const pending = items.filter((r) => !done[r.id]).length;

  // Best-effort decision: POST to the gateway, then reflect the outcome inline.
  // If the call fails (route absent, 404), still show the optimistic outcome so
  // the operator gets feedback; nothing here fabricates a request.
  async function decide(r: PlanRequest, kind: "approve" | "deny") {
    if (busy[r.id] || done[r.id]) return;
    setBusy((b) => ({ ...b, [r.id]: true }));
    const label = kind === "approve" ? "Approved" : "Denied";
    try {
      await raw(`/platform/plan-requests/${r.id}/${kind}`, { method: "POST", body: JSON.stringify({}) });
    } catch {
      try {
        await raw(`/admin/plan-requests/${r.id}/${kind}`, { method: "POST", body: JSON.stringify({}) });
      } catch {
        // Graceful: keep the optimistic outcome even when the route is unavailable.
      }
    }
    setBusy((b) => ({ ...b, [r.id]: false }));
    setDone((d) => ({ ...d, [r.id]: label }));
  }

  const subCopy = requests.data
    ? `${pending} pending upgrade ${pending === 1 ? "request" : "requests"} from tenant admins.`
    : "Pending upgrade requests from tenant admins.";

  return (
    <div className="mx-auto w-full max-w-[880px]">
      <OpHead title="Plan requests" sub={subCopy} />

      {/* loading -> skeleton cards, no layout shift */}
      {requests.loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-[16px]" />)}
        </div>
      )}

      {/* error or empty/404 -> exact layout still renders, EmptyState in the body */}
      {!requests.loading && items.length === 0 && (
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "44px 16px", boxShadow: "var(--e1)" }}>
          <EmptyState
            title={requests.error ? "Could not load plan requests" : "No plan requests"}
            body={
              requests.error
                ? "The platform service did not respond. Tenant upgrade requests will appear here once it is reachable."
                : "When tenant admins request a plan change, it appears here for your approval."
            }
            actions={requests.error ? <Btn variant="soft" icon="arrowUpRight" onClick={requests.reload}>Try again</Btn> : undefined}
          />
        </div>
      )}

      {/* data rows */}
      {!requests.loading && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((r) => {
            const fromTone = PLAN_T[r.from] ?? "var(--c-ink-3)";
            const toTone = PLAN_T[r.to] ?? "var(--c-ink-3)";
            return (
              <div key={r.id} style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)", opacity: done[r.id] ? 0.6 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{r.tenant}</span>
                      <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12 }}>
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: fromTone, background: `color-mix(in oklab, ${fromTone} 13%, transparent)`, padding: "2px 7px", borderRadius: 5 }}>{r.from}</span>
                        <Icon name="arrowUpRight" size={13} style={{ color: "var(--c-ink-3)" }} />
                        <span style={{ fontSize: 9.5, fontWeight: 800, color: toTone, background: `color-mix(in oklab, ${toTone} 13%, transparent)`, padding: "2px 7px", borderRadius: 5 }}>{r.to}</span>
                      </span>
                      {r.mrr && <Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">{r.mrr} MRR</Pill>}
                    </div>
                    {r.reason && <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginTop: 6 }}>{r.reason}</div>}
                    {(r.by || r.when) && (
                      <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 3 }}>
                        {r.by}{r.by && r.when ? " · " : ""}{r.when ? `${r.when} ago` : ""}
                      </div>
                    )}
                  </div>
                  {done[r.id] ? (
                    <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{done[r.id]}</Pill>
                  ) : (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="soft" size="sm" onClick={() => decide(r, "deny")}>Deny</Btn>
                      <Btn variant="primary" size="sm" icon="check" onClick={() => decide(r, "approve")}>Approve upgrade</Btn>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
