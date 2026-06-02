"use client";
// app/(dashboard)/admin/plan-requests/page.tsx - EXACT Claude Design "Aurora"
// PlanRequestsScreen port (claude-design/screen-platform.jsx): the operator queue
// of tenant plan-change requests awaiting approval. OpHead header with the
// platform-operator pill + live pending count, then a stack of request cards, each
// showing the tenant, the current-plan -> requested-plan transition (color-coded
// per plan), the MRR delta pill, the requester + age, the reason, and the
// Approve / Deny actions. Ported faithfully from the prototype and wired to the
// real gateway: useData tries GET /platform/plan-requests and falls back to
// GET /admin/plan-requests, coercing the payload to an array and mapping each row
// defensively so nothing is fabricated. Approve / Deny are best-effort POSTs with
// optimistic local "Approved" / "Denied" state and graceful fallback (the local
// state still flips even if the endpoint is missing). On error or an empty/404
// response the exact layout still renders with EmptyState.
import { useEffect, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";

/* ------------------------------- wiring ------------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
// Local raw() helper: unwraps the gateway envelope (res?.data ?? res). Throws on
// non-2xx so useData can surface the error / empty state and the endpoint fallback
// can kick in.
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const json: any = await res.json().catch(() => ({}));
  return json?.data ?? json;
}

// Per-plan accent (prototype PLAN_T, swapped to the resolvable --c-* tokens).
const PLAN_T: Record<string, string> = {
  FREE: "var(--c-ink-3)",
  STARTER: "var(--c-info)",
  PROFESSIONAL: "var(--c-brand)",
  ENTERPRISE: "var(--c-ai)",
};
const planTone = (p: string) => PLAN_T[(p || "").toUpperCase()] ?? "var(--c-ink-3)";

type PlanReq = {
  id: string;
  tenant: string;
  from: string;
  to: string;
  by: string;
  when: string;
  reason: string;
  mrr: string;
};

// Friendly "2h" / "5h" / "1d" age from an ISO timestamp; if the payload already
// carries a preformatted "when", we keep it.
function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

// MRR delta: prototype used a preformatted string ("+$250" / "Custom"); the live
// backend may send a number (mrrDelta / priceDelta). Normalize to a display string.
function fmtMrr(v: any): string {
  if (v == null || v === "") return "";
  if (typeof v === "number" && isFinite(v)) {
    const sign = v >= 0 ? "+" : "-";
    return `${sign}$${Math.abs(v).toLocaleString()}`;
  }
  return String(v);
}

// Defensive mapping: coerce whatever the endpoint returns into an array of
// PlanReq. Each row may use a variety of field names across the prototype and the
// live backend. No fabricated requests, anything missing simply renders blank.
function mapReqs(res: any): PlanReq[] {
  const arr = Array.isArray(res?.requests) ? res.requests
    : Array.isArray(res?.items) ? res.items
    : Array.isArray(res?.planRequests) ? res.planRequests
    : Array.isArray(res?.data) ? res.data
    : Array.isArray(res) ? res : [];
  return arr.map((r: any, i: number): PlanReq => {
    const from = String(r?.from ?? r?.fromPlan ?? r?.currentPlan ?? r?.current ?? "");
    const to = String(r?.to ?? r?.toPlan ?? r?.requestedPlan ?? r?.requested ?? r?.targetPlan ?? "");
    const whenRaw = r?.when ?? r?.age;
    const when = whenRaw != null && typeof whenRaw === "string" && !/^\d{4}-/.test(whenRaw)
      ? whenRaw
      : ago(r?.createdAt ?? r?.requestedAt ?? r?.created ?? (typeof whenRaw === "string" ? whenRaw : undefined));
    return {
      id: String(r?.id ?? r?.requestId ?? r?._id ?? `pr-${i + 1}`),
      tenant: String(r?.tenant ?? r?.tenantName ?? r?.organization ?? r?.orgName ?? r?.org ?? "Unknown tenant"),
      from,
      to,
      by: String(r?.by ?? r?.requestedBy ?? r?.requestedByEmail ?? r?.user ?? r?.email ?? ""),
      when,
      reason: String(r?.reason ?? r?.note ?? r?.message ?? r?.justification ?? ""),
      mrr: fmtMrr(r?.mrr ?? r?.mrrDelta ?? r?.priceDelta ?? r?.delta ?? ""),
    };
  });
}

// Best-effort approve / deny. Swallows failures so the optimistic local state
// (set by the caller) still reflects the operator's decision when the endpoint is
// absent (404) or rejects. Tries the platform route first, then the admin route.
async function decide(id: string, action: "approve" | "deny") {
  const bodies: [string, RequestInit][] = [
    [`/platform/plan-requests/${id}/${action}`, { method: "POST" }],
    [`/admin/plan-requests/${id}/${action}`, { method: "POST" }],
  ];
  for (const [path, init] of bodies) {
    try { await raw(path, init); return; } catch { /* try the next route */ }
  }
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

// A single color-coded plan badge (prototype's inline plan chip).
function PlanBadge({ plan }: { plan: string }) {
  const tone = planTone(plan);
  return (
    <span style={{ fontSize: 9.5, fontWeight: 800, color: tone, background: `color-mix(in oklab, ${tone} 13%, transparent)`, padding: "2px 7px", borderRadius: 5 }}>
      {plan}
    </span>
  );
}

export default function PlanRequestsPage() {
  const reqs = useData<PlanReq[]>(() =>
    raw("/platform/plan-requests")
      .then(mapReqs)
      .catch(() => raw("/admin/plan-requests").then(mapReqs))
  );

  // Optimistic local copy so the queue + pending count stay in sync, plus the
  // per-request "Approved" / "Denied" resolution map (mirrors the prototype's
  // `done` state). Seeded once the live data lands.
  const [items, setItems] = useState<PlanReq[]>([]);
  const [done, setDone] = useState<Record<string, string>>({});
  useEffect(() => { if (reqs.data) setItems(reqs.data.map((r) => ({ ...r }))); }, [reqs.data]);

  const resolve = (id: string, label: "Approved" | "Denied", action: "approve" | "deny") => {
    setDone((d) => ({ ...d, [id]: label }));
    void decide(id, action);
  };

  const pending = items.filter((r) => !done[r.id]).length;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <OpHead title="Plan requests" sub={`${pending} pending upgrade requests from tenant admins.`} />

        {/* loading skeletons */}
        {reqs.loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[16px]" />)}
          </div>
        )}

        {/* error or empty/404 -> exact layout still renders, EmptyState in the body */}
        {!reqs.loading && items.length === 0 && (
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "44px 16px", boxShadow: "var(--e1)" }}>
            <EmptyState
              title={reqs.error ? "Could not load plan requests" : "No pending plan requests"}
              body={
                reqs.error
                  ? "The platform service did not respond. Tenant plan-change requests will appear here once it is reachable."
                  : "When tenant admins request a plan change, the upgrade transition, MRR delta, and approval actions appear here."
              }
              actions={reqs.error ? <Btn variant="soft" icon="arrowUpRight" onClick={reqs.reload}>Try again</Btn> : undefined}
            />
          </div>
        )}

        {/* request cards */}
        {!reqs.loading && items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {items.map((r) => (
              <div key={r.id} style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)", opacity: done[r.id] ? 0.6 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{r.tenant}</span>
                      <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12 }}>
                        <PlanBadge plan={r.from} />
                        <Icon name="arrowUpRight" size={13} style={{ color: "var(--c-ink-3)" }} />
                        <PlanBadge plan={r.to} />
                      </span>
                      {r.mrr && <Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">{r.mrr} MRR</Pill>}
                    </div>
                    {r.reason && <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", marginTop: 6 }}>{r.reason}</div>}
                    {(r.by || r.when) && (
                      <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 3 }}>
                        {[r.by, r.when ? `${r.when} ago` : ""].filter(Boolean).join(" · ")}
                      </div>
                    )}
                  </div>
                  {done[r.id]
                    ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{done[r.id]}</Pill>
                    : (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="soft" size="sm" onClick={() => resolve(r.id, "Denied", "deny")}>Deny</Btn>
                        <Btn variant="primary" size="sm" icon="check" onClick={() => resolve(r.id, "Approved", "approve")}>Approve upgrade</Btn>
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
