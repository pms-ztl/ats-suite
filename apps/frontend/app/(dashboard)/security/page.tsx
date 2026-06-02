"use client";
// app/(dashboard)/security/page.tsx - EXACT Claude Design "Aurora" Security
// screen (security posture, access, and risk). Ported from
// claude-design/screen-secai.jsx (SecurityScreen) and wired to the real
// gateway. The header band, posture stats, "Risk alerts" card and "Hardening
// checklist" card reproduce the prototype layout faithfully. Real data:
//   GET /security/secure-tool-router/audit -> risk alerts
//   GET /security/access/config            -> posture + checklist toggle state
// No fake security events are invented; empty/error states degrade gracefully.
import { useEffect, useState } from "react";
import { Btn, Pill, ScoreRing, SectionCard, Reveal } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

/* -------- inline fetch helper (guide pattern; do NOT edit lib/api) -------- */
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

/* ----------------------------- shapes ----------------------------------- */
type Alert = { id?: string; sev: string; t: string; detail: string; icon: string };
type Posture = { k: string; v: number; unit: string };
type Check = { c: string; done: boolean };

type AccessConfig = {
  mfaEnabled?: boolean; ssoEnabled?: boolean;
  ipWhitelistEnabled?: boolean; sessionTimeoutMinutes?: number;
  mfaAdoption?: number; ssoCoverage?: number;
};

/* Maps a raw secure-tool-router audit row to a prototype-shaped risk alert. */
function toAlert(r: any, i: number): Alert {
  const blocked = r?.blocked === true || r?.allowed === false;
  const risk = String(r?.risk ?? "").toUpperCase();
  const sev = risk === "HIGH" || risk === "CRITICAL" ? "High" : blocked || risk === "MEDIUM" ? "Medium" : "Low";
  const action = r?.action ?? r?.toolName ?? r?.tool ?? "Tool action";
  const when = r?.timestamp ?? r?.createdAt;
  const detail = blocked
    ? `Blocked${when ? ` · ${new Date(when).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}`
    : when ? new Date(when).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recorded";
  return { id: r?.id ?? String(i), sev, t: String(action), detail, icon: blocked ? "shield" : "scan" };
}

export default function SecurityPage() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [alertsErr, setAlertsErr] = useState(false);
  const [access, setAccess] = useState<AccessConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setAlertsErr(false);
    Promise.allSettled([
      raw("/security/secure-tool-router/audit?page=1&pageSize=10"),
      raw("/security/access/config"),
    ]).then(([auditRes, accessRes]) => {
      if (auditRes.status === "fulfilled") {
        const d: any = auditRes.value;
        const rows = d?.data?.data ?? d?.data ?? d ?? [];
        setAlerts(Array.isArray(rows) ? rows.slice(0, 10).map(toAlert) : []);
      } else {
        setAlerts([]);
        setAlertsErr(true);
      }
      if (accessRes.status === "fulfilled") {
        const a: any = accessRes.value;
        setAccess((a?.data ?? a) as AccessConfig);
      } else {
        setAccess(null);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Posture stats: prefer real access-config figures, else static prototype copy.
  const posture: Posture[] = [
    { k: "MFA adoption", v: access?.mfaAdoption ?? (access?.mfaEnabled ? 100 : 0), unit: "%" },
    { k: "SSO coverage", v: access?.ssoCoverage ?? (access?.ssoEnabled ? 100 : 0), unit: "%" },
    { k: "IP allow-list", v: access?.ipWhitelistEnabled ? 100 : 0, unit: "%" },
    { k: "Session timeout", v: access?.sessionTimeoutMinutes ?? 0, unit: "m" },
  ];
  const hasPosture = access != null;

  // Hardening checklist: structure is static product copy; "done" reflects the
  // real access-config toggles where the gateway provides them.
  const checklist: Check[] = [
    { c: "Enforce MFA for all admins", done: access?.mfaEnabled === true },
    { c: "SSO / SAML configured", done: access?.ssoEnabled === true },
    { c: "IP allow-list for super-admin", done: access?.ipWhitelistEnabled === true },
    { c: "Session timeout policy", done: (access?.sessionTimeoutMinutes ?? 0) > 0 },
    { c: "API key rotation policy", done: false },
    { c: "Quarterly access review", done: false },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  const openAlerts = alerts?.length ?? 0;
  // A coarse posture score from coverage metrics; falls back to a neutral value.
  const covered = [access?.mfaEnabled, access?.ssoEnabled, access?.ipWhitelistEnabled, (access?.sessionTimeoutMinutes ?? 0) > 0]
    .filter(Boolean).length;
  const score = hasPosture ? Math.round((covered / 4) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Security</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Posture, access, and risk for your workspace.</p>
        </div>
        <Btn variant="primary" icon="arrowUpRight">Download report</Btn>
      </div>

      {/* score band */}
      <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: "var(--r-xl)", background: "linear-gradient(110deg, var(--c-brand-tint-2), transparent 65%)", border: "1px solid color-mix(in oklab, var(--c-brand) 22%, var(--c-line))", marginBottom: 18, flexWrap: "wrap" }}>
        <ScoreRing value={score} size={84} band="var(--c-brand)" label="score" />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Security score {score} / 100</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 2 }}>
            {openAlerts} open risk {openAlerts === 1 ? "item" : "items"} · encryption and access controls monitored.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[44px] w-[80px] rounded-[10px]" />)
          ) : hasPosture ? (
            posture.map((p) => (
              <div key={p.k} style={{ textAlign: "center", minWidth: 80 }}>
                <div className="mono tnum" style={{ fontSize: 20, fontWeight: 700, color: p.v >= 90 ? "var(--c-ok)" : "var(--c-ink)" }}>{p.v}{p.unit}</div>
                <div style={{ fontSize: 10, color: "var(--c-ink-3)", fontWeight: 600 }}>{p.k}</div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", maxWidth: 200 }}>Access posture metrics are unavailable.</div>
          )}
        </div>
      </div>

      {/* two-column working surface */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
        <Reveal i={2}>
          <SectionCard
            title="Risk alerts"
            icon="flag"
            headRight={<Pill tone="var(--c-warn)" bg="var(--c-warn-tint)">{openAlerts} open</Pill>}
          >
            {loading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[58px] rounded-[12px]" />)}
              </div>
            )}
            {!loading && alertsErr && (
              <ErrorState
                title="Could not load risk alerts"
                body="The security audit service did not respond."
                code="GET /security/secure-tool-router/audit"
                onRetry={load}
              />
            )}
            {!loading && !alertsErr && alerts && alerts.length === 0 && (
              <EmptyState title="No open risk items" body="When the secure tool router flags or blocks an action, it shows up here." />
            )}
            {!loading && !alertsErr && alerts && alerts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.map((a, i) => (
                  <div key={a.id ?? i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: a.sev === "Medium" || a.sev === "High" ? "var(--c-warn-tint)" : "var(--c-surface)" }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, color: a.sev === "Medium" || a.sev === "High" ? "var(--c-warn)" : "var(--c-ink-2)", background: a.sev === "Medium" || a.sev === "High" ? "var(--c-surface)" : "var(--c-surface-2)" }}>
                      <Icon name={a.icon} size={17} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.t}</div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{a.detail}</div>
                    </div>
                    <Pill tone={a.sev === "Medium" || a.sev === "High" ? "var(--c-warn)" : "var(--c-ink-3)"} bg="transparent">{a.sev}</Pill>
                    <Btn variant="soft" size="sm">Resolve</Btn>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </Reveal>

        <Reveal i={3}>
          <SectionCard
            title="Hardening checklist"
            icon="check"
            headRight={<Pill tone="var(--c-ok)" bg="var(--c-ok-tint)">{doneCount} / {checklist.length}</Pill>}
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[34px] rounded-[8px]" />)}
              </div>
            ) : (
              checklist.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: c.done ? "var(--c-ok)" : "var(--c-surface-2)", color: c.done ? "var(--c-on-brand)" : "var(--c-ink-3)", border: c.done ? "none" : "1px solid var(--c-line-strong)" }}>
                    {c.done && <Icon name="check" size={13} stroke={3} />}
                  </span>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: c.done ? "var(--c-ink-2)" : "var(--c-ink)" }}>{c.c}</span>
                  {!c.done && <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)">to do</Pill>}
                </div>
              ))
            )}
          </SectionCard>
        </Reveal>
      </div>
    </div>
  );
}
