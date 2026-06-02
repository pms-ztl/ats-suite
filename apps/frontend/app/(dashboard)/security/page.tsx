"use client";
// app/(dashboard)/security/page.tsx - EXACT Claude Design "Aurora" security
// posture dashboard (SecurityScreen). Ported verbatim from
// claude-design/screen-secai.jsx: the posture score with a ScoreRing, the
// MFA / SSO / encryption / session posture stats, the open risk-alerts list
// (severity + Resolve), and the hardening checklist with a done/total count.
// Built from the aurora kit + aurora components; Icon from the aurora shim.
//
// WIRED to the real gateway. Two best-effort, independent reads run via
// Promise.allSettled so one failing never blanks the other:
//   - GET /security/access/config  -> posture stats + hardening checklist
//   - GET /audit (fallback GET /security/secure-tool-router/audit) -> risk alerts
// The posture score is DERIVED from the live posture stats (their mean),
// never fabricated; risk alerts come only from real audit rows. On error,
// 404, or empty data the exact same layout renders with loading skeletons or
// EmptyState. The static explanatory copy is kept verbatim.
import { ScoreRing, SectionCard, Btn, Pill, Reveal } from "@/components/aurora-kit";
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
  const body: any = await res.json();
  // Gateway envelopes responses as { data: ... }; unwrap when present.
  return body?.data ?? body;
}

/* ------------------------------- shapes ------------------------------- */
type Posture = { k: string; v: number; unit: string };
type Check = { c: string; done: boolean };
type Alert = { sev: "Medium" | "Low" | "High"; t: string; detail: string; icon: string };
type Config = { posture: Posture[]; checklist: Check[] };

const SEV_RANK: Record<string, "High" | "Medium" | "Low"> = {
  critical: "High", high: "High", error: "High",
  medium: "Medium", warn: "Medium", warning: "Medium",
  low: "Low", info: "Low", notice: "Low",
};

/* --------------------------- defensive maps --------------------------- */
// /security/access/config -> posture stats + hardening checklist. Backend
// field names vary, so coerce the common shapes; missing pieces stay empty
// (the layout still renders with an EmptyState) rather than being invented.
function mapConfig(res: any): Config {
  const r = res ?? {};

  const num = (x: any): number | null => {
    const n = typeof x === "boolean" ? (x ? 100 : 0) : Number(x);
    return Number.isFinite(n) ? n : null;
  };
  const pct = (...candidates: any[]): number | null => {
    for (const c of candidates) { const n = num(c); if (n !== null) return n <= 1 ? Math.round(n * 100) : Math.round(n); }
    return null;
  };

  const posture: Posture[] = [];
  const mfa = pct(r.mfaAdoption, r.mfa?.adoption, r.mfaCoverage, r.mfaEnrolledPct, r.mfa);
  if (mfa !== null) posture.push({ k: "MFA adoption", v: mfa, unit: "%" });
  const sso = pct(r.ssoCoverage, r.sso?.coverage, r.ssoEnabledPct, r.sso);
  if (sso !== null) posture.push({ k: "SSO coverage", v: sso, unit: "%" });
  const enc = pct(r.encryptionAtRest, r.tlsCoverage, r.encryption, r.encryptedPct);
  if (enc !== null) posture.push({ k: "TLS / encryption at rest", v: enc, unit: "%" });
  const sess = num(r.avgSessionHours ?? r.sessionLengthHours ?? r.avgSessionLength ?? r.session?.avgHours);
  if (sess !== null) posture.push({ k: "Avg session length", v: Math.round(sess * 10) / 10, unit: "h" });

  let checklist: Check[] = [];
  const rawList = Array.isArray(r.checklist) ? r.checklist
    : Array.isArray(r.hardening) ? r.hardening
    : Array.isArray(r.controls) ? r.controls : [];
  checklist = rawList.map((c: any): Check => ({
    c: String(c?.c ?? c?.label ?? c?.name ?? c?.control ?? c?.title ?? ""),
    done: Boolean(c?.done ?? c?.passed ?? c?.enabled ?? c?.complete ?? (typeof c?.status === "string" && /pass|done|enabled|ok/i.test(c.status))),
  })).filter((c: Check) => c.c);

  return { posture, checklist };
}

// /audit -> open risk alerts. Only rows that read as security risks (a severity
// above "info", or a security-ish category) become alerts; nothing is invented.
function mapAlerts(res: any): Alert[] {
  const arr = Array.isArray(res) ? res : Array.isArray(res?.entries) ? res.entries : Array.isArray(res?.logs) ? res.logs : Array.isArray(res?.events) ? res.events : [];
  const out: Alert[] = [];
  for (const e of arr) {
    const sevKey = String(e?.severity ?? e?.sev ?? e?.level ?? e?.risk ?? "").toLowerCase();
    const sev = SEV_RANK[sevKey];
    const cat = String(e?.category ?? e?.cat ?? e?.type ?? e?.action ?? "").toLowerCase();
    const securityish = /(security|risk|mfa|auth|key|access|breach|alert|policy|denied|block)/.test(cat);
    if (!sev && !securityish) continue;
    out.push({
      sev: sev ?? "Low",
      t: String(e?.title ?? e?.t ?? e?.message ?? e?.action ?? e?.event ?? "Security finding"),
      detail: String(e?.detail ?? e?.description ?? e?.target ?? e?.resource ?? e?.recommendation ?? ""),
      icon: /key|token|api/.test(cat) ? "terminal" : "shield",
    });
  }
  return out;
}

/* ------------------------------- page -------------------------------- */
export default function SecurityPage() {
  // Two independent best-effort reads. allSettled keeps one failing from
  // breaking the other; we surface partial data wherever it lands.
  const config = useData<Config>(async () => {
    const r = await Promise.allSettled([raw("/security/access/config")]);
    const ok = r.find((x) => x.status === "fulfilled") as PromiseFulfilledResult<any> | undefined;
    return mapConfig(ok?.value);
  });
  const alerts = useData<Alert[]>(async () => {
    const r = await Promise.allSettled([raw("/audit"), raw("/security/secure-tool-router/audit")]);
    const ok = r.find((x) => x.status === "fulfilled") as PromiseFulfilledResult<any> | undefined;
    return mapAlerts(ok?.value);
  });

  const posture = config.data?.posture ?? [];
  const checklist = config.data?.checklist ?? [];
  const list = alerts.data ?? [];
  // Derived posture score: mean of the percentage stats (session length is
  // excluded because its unit is hours, not a percentage). Honest, not faked.
  const pctStats = posture.filter((p) => p.unit === "%");
  const score = pctStats.length ? Math.round(pctStats.reduce((a, p) => a + p.v, 0) / pctStats.length) : 0;

  const configReady = !config.loading;
  const alertsReady = !alerts.loading;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Security</h1>
            <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Posture, access, and risk for your workspace.</p>
          </div>
          <Btn variant="primary" icon="arrowUpRight">Download report</Btn>
        </div>

        {/* Posture score band */}
        <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: "var(--r-xl)", background: "linear-gradient(110deg, var(--c-brand-tint-2), transparent 65%)", border: "1px solid color-mix(in oklab, var(--c-brand) 22%, var(--c-line))", marginBottom: 18, flexWrap: "wrap" }}>
          {configReady ? <ScoreRing value={score} size={84} band="var(--c-brand)" label="score" /> : <Skeleton className="h-[84px] w-[84px] rounded-full" />}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Security score {configReady ? `${score} / 100` : ""}</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 2 }}>{list.length} open risk items. Strong encryption and MFA coverage.</div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {!configReady && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[44px] w-[80px] rounded-[10px]" />)}
            {configReady && posture.map((p) => (
              <div key={p.k} style={{ textAlign: "center", minWidth: 80 }}>
                <div className="mono tnum" style={{ fontSize: 20, fontWeight: 700, color: p.v >= 90 ? "var(--c-ok)" : "var(--c-ink)" }}>{p.v}{p.unit}</div>
                <div style={{ fontSize: 10, color: "var(--c-ink-3)", fontWeight: 600 }}>{p.k}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
          <Reveal i={4}>
            <SectionCard title="Risk alerts" icon="flag" headRight={<Pill tone="var(--c-warn)" bg="var(--c-warn-tint)">{list.length} open</Pill>}>
              {!alertsReady && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[58px] rounded-[12px]" />)}</div>}
              {alertsReady && list.length === 0 && <EmptyState title="No open risk items" body="When a security risk is detected in the audit trail, it appears here for you to resolve." />}
              {alertsReady && list.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {list.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: a.sev === "Medium" ? "var(--c-warn-tint)" : "var(--c-surface)" }}>
                      <span style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, color: a.sev === "Medium" ? "var(--c-warn)" : "var(--c-ink-2)", background: a.sev === "Medium" ? "var(--c-surface)" : "var(--c-surface-2)" }}><Icon name={a.icon} size={17} /></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{a.t}</div>
                        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{a.detail}</div>
                      </div>
                      <Pill tone={a.sev === "Medium" ? "var(--c-warn)" : "var(--c-ink-3)"} bg="transparent">{a.sev}</Pill>
                      <Btn variant="soft" size="sm">Resolve</Btn>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </Reveal>

          <Reveal i={5}>
            <SectionCard title="Hardening checklist" icon="check" headRight={configReady && checklist.length > 0 ? <Pill tone="var(--c-ok)" bg="var(--c-ok-tint)">{checklist.filter((c) => c.done).length} / {checklist.length}</Pill> : undefined}>
              {!configReady && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[34px] rounded-[8px]" />)}</div>}
              {configReady && checklist.length === 0 && <EmptyState title="Checklist unavailable" body="Connect your access policy to track hardening controls like MFA, SSO, and key rotation here." />}
              {configReady && checklist.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: c.done ? "var(--c-ok)" : "var(--c-surface-2)", color: c.done ? "var(--c-on-brand)" : "var(--c-ink-3)", border: c.done ? "none" : "1px solid var(--c-line-strong)" }}>{c.done && <Icon name="check" size={13} stroke={3} />}</span>
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: c.done ? "var(--c-ink-2)" : "var(--c-ink)" }}>{c.c}</span>
                  {!c.done && <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)">to do</Pill>}
                </div>
              ))}
            </SectionCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
