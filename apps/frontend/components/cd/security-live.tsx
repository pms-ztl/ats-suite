"use client";
// components/cd/security-live.tsx
// Mounts the byte-exact CD SecurityScreen wired to the real gateway: posture stats +
// hardening checklist from GET /security/access/config, risk alerts from GET /audit
// (fallback /security/secure-tool-router/audit). The posture score is derived as the
// mean of the percentage stats (never fabricated). Sections stay empty where the
// gateway has no data for this tenant.
import { SecurityScreen } from "./SecAiScreens";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";
import type { SecurityData, SecurityAlert } from "./types";
import type { IconName } from "./icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string): Promise<unknown> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const body = await res.json();
  return (body as { data?: unknown })?.data ?? body;
}

type Posture = { k: string; v: number; unit: string };
type Check = { c: string; done: boolean };
type Config = { posture: Posture[]; checklist: Check[] };

const SEV_RANK: Record<string, string> = {
  critical: "High", high: "High", error: "High",
  medium: "Medium", warn: "Medium", warning: "Medium",
  low: "Low", info: "Low", notice: "Low",
};

function mapConfig(res: any): Config {
  const r = res ?? {};
  const num = (x: any): number | null => { const n = typeof x === "boolean" ? (x ? 100 : 0) : Number(x); return Number.isFinite(n) ? n : null; };
  const pct = (...cs: any[]): number | null => { for (const c of cs) { const n = num(c); if (n !== null) return n <= 1 ? Math.round(n * 100) : Math.round(n); } return null; };
  const posture: Posture[] = [];
  const mfa = pct(r.mfaAdoption, r.mfa?.adoption, r.mfaCoverage, r.mfaEnrolledPct, r.mfa);
  if (mfa !== null) posture.push({ k: "MFA adoption", v: mfa, unit: "%" });
  const sso = pct(r.ssoCoverage, r.sso?.coverage, r.ssoEnabledPct, r.sso);
  if (sso !== null) posture.push({ k: "SSO coverage", v: sso, unit: "%" });
  const enc = pct(r.encryptionAtRest, r.tlsCoverage, r.encryption, r.encryptedPct);
  if (enc !== null) posture.push({ k: "TLS / encryption at rest", v: enc, unit: "%" });
  const sess = num(r.avgSessionHours ?? r.sessionLengthHours ?? r.avgSessionLength ?? r.session?.avgHours);
  if (sess !== null) posture.push({ k: "Avg session length", v: Math.round(sess * 10) / 10, unit: "h" });
  const rawList = Array.isArray(r.checklist) ? r.checklist : Array.isArray(r.hardening) ? r.hardening : Array.isArray(r.controls) ? r.controls : [];
  const checklist: Check[] = rawList.map((c: any): Check => ({
    c: String(c?.c ?? c?.label ?? c?.name ?? c?.control ?? c?.title ?? ""),
    done: Boolean(c?.done ?? c?.passed ?? c?.enabled ?? c?.complete ?? (typeof c?.status === "string" && /pass|done|enabled|ok/i.test(c.status))),
  })).filter((c: Check) => c.c);
  return { posture, checklist };
}

function mapAlerts(res: any): SecurityAlert[] {
  const arr = Array.isArray(res) ? res : Array.isArray(res?.entries) ? res.entries : Array.isArray(res?.logs) ? res.logs : Array.isArray(res?.events) ? res.events : [];
  const out: SecurityAlert[] = [];
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
      icon: (/key|token|api/.test(cat) ? "terminal" : "shield") as IconName,
    });
  }
  return out;
}

export function SecurityLive() {
  const { user } = useCurrentUser();
  const config = useData<Config>(async () => {
    const r = await Promise.allSettled([raw("/security/access/config")]);
    const ok = r.find((x) => x.status === "fulfilled") as PromiseFulfilledResult<unknown> | undefined;
    return mapConfig(ok?.value);
  });
  const alerts = useData<SecurityAlert[]>(async () => {
    const r = await Promise.allSettled([raw("/audit"), raw("/security/secure-tool-router/audit")]);
    const ok = r.find((x) => x.status === "fulfilled") as PromiseFulfilledResult<unknown> | undefined;
    return mapAlerts(ok?.value);
  });

  const posture = config.data?.posture ?? [];
  const checklist = config.data?.checklist ?? [];
  const list = alerts.data ?? [];
  const pctStats = posture.filter((p) => p.unit === "%");
  const score = pctStats.length ? Math.round(pctStats.reduce((a, p) => a + p.v, 0) / pctStats.length) : 0;

  const data: SecurityData = {
    orgName: user?.tenant?.name ?? "Your workspace",
    score,
    posture,
    alerts: list,
    checklist,
  };

  // Functional report export: writes whatever telemetry actually loaded; with
  // nothing wired yet it says so instead of downloading an empty file.
  const onReport = () => {
    const rows: string[][] = [
      ...posture.map((p) => ["Posture", p.k, `${p.v}${p.unit}`]),
      ...checklist.map((c) => ["Hardening", c.c, c.done ? "Done" : "To do"]),
      ...list.map((a) => ["Risk alert", `${a.t} - ${a.detail}`, a.sev]),
    ];
    if (!rows.length) { toast.info("No security telemetry to export yet - it appears once the security service is connected."); return; }
    exportToCSV(
      `security-report-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Section", "Item", "Value"],
      [["Score", "Security score", `${score} / 100`], ...rows],
    );
    toast.success("Security report exported.");
  };

  return <SecurityScreen data={data} onReport={onReport} />;
}
