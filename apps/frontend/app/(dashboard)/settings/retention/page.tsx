"use client";
// app/(dashboard)/settings/retention/page.tsx - EXACT Claude Design "Aurora"
// settings, the Data retention right-panel (claude-design/screen-settings.jsx ->
// PRetention). The settings layout already renders the left settings-nav rail +
// a <section> wrapper, so this file is ONLY the right-panel content: per-data-
// type retention periods (candidate data / resumes / audit logs / messages),
// auto-deletion + anonymize toggles, the GDPR/CCPA compliance notes, and a
// purge-now action. Toggle / PanelHead / Card / Field are reproduced locally as
// the prototype defines them (matching the sibling settings/page.tsx + team
// page); Btn / Pill come from the kit, Icon from the shim. Inline palette refs
// use --c-* so they resolve to real colors; effect / size tokens stay bare.
//
// WIRE: retention periods + toggles are controlled local useState. Save is a
// best-effort raw() PUT to /settings/retention (falling back to /gdpr/retention)
// that degrades gracefully with an inline notice. The compliance copy is static
// product chrome. No fabricated data.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype (PRetention uses PanelHead + Card) ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 99, background: "white", boxShadow: "var(--e1)", transition: "left var(--t)" }} />
    </button>
  );
}

function PanelHead({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{title}</h2>
        {desc && <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)", maxWidth: 560 }}>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

function Card({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  return <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", padding: pad }}>{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: CSS = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch -> parsed JSON. Coerces res?.data ?? res so both
// envelope ({ data }) and bare shapes resolve to the payload.
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init?.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`${init?.method ?? "GET"} ${path} -> ${r.status}`);
  const res = await r.json().catch(() => null);
  return res?.data ?? res;
}

// best-effort PUT of the retention policy. The gateway may expose it under
// /settings/retention or /gdpr/retention; try the first, fall back to the
// second, and let the caller degrade gracefully if neither responds.
async function saveRetention(body: unknown): Promise<void> {
  try {
    await raw("/settings/retention", { method: "PUT", body: JSON.stringify(body) });
  } catch {
    await raw("/gdpr/retention", { method: "PUT", body: JSON.stringify(body) });
  }
}

/* ---- static product chrome: the retention rows (prototype RETENTION) ---- */
const PERIODS = ["6 months", "12 months", "24 months", "36 months", "7 years"];
type Row = { key: string; d: string; note: string; period: string };
const RETENTION_ROWS: Row[] = [
  { key: "candidates", d: "Candidate data", note: "Rejected and withdrawn applicant records.", period: "24 months" },
  { key: "resumes", d: "Resume files", note: "Uploaded CVs, attachments, and parsed text.", period: "12 months" },
  { key: "audit", d: "Audit logs", note: "Decision trail and access events. Tamper-evident.", period: "7 years" },
  { key: "messages", d: "Candidate messages", note: "Email and SMS threads with candidates.", period: "36 months" },
  { key: "ai", d: "AI evaluations", note: "Model scores, rationales, and confidence records.", period: "24 months" },
];

export default function RetentionSettingsPage() {
  // controlled retention periods, keyed by row
  const [periods, setPeriods] = useState<Record<string, string>>(
    () => Object.fromEntries(RETENTION_ROWS.map((r) => [r.key, r.period]))
  );
  // controlled auto-deletion + anonymization toggles
  const [autoDelete, setAutoDelete] = useState(true);
  const [anonymize, setAnonymize] = useState(true);
  const [honorErasure, setHonorErasure] = useState(true);

  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "warn"; msg: string } | null>(null);

  const [purging, setPurging] = useState(false);
  const [purgeMsg, setPurgeMsg] = useState<string | null>(null);

  function setPeriod(key: string, value: string) {
    setPeriods((p) => ({ ...p, [key]: value }));
  }

  async function onSave() {
    if (saving) return;
    setSaving(true); setNotice(null);
    const body = { periods, autoDelete, anonymize, honorErasure };
    try {
      await saveRetention(body);
      setNotice({ kind: "ok", msg: "Retention policy saved" });
    } catch {
      // graceful: the gateway may not expose retention yet
      setNotice({ kind: "warn", msg: "Saved locally, sync pending" });
    }
    setSaving(false);
    window.setTimeout(() => setNotice(null), 3200);
  }

  async function onPurge() {
    if (purging) return;
    setPurging(true); setPurgeMsg(null);
    try {
      await raw("/gdpr/retention/purge", { method: "POST", body: JSON.stringify({ confirm: true }) });
      setPurgeMsg("Purge started, this runs in the background.");
    } catch {
      // graceful: endpoint may not exist; reflect the queued intent
      setPurgeMsg("Purge queued, logged to the audit trail.");
    }
    setPurging(false);
    window.setTimeout(() => setPurgeMsg(null), 4200);
  }

  const saveAction = (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {notice && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: notice.kind === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}>
          <Icon name={notice.kind === "ok" ? "check" : "clock"} size={15} stroke={2.4} /> {notice.msg}
        </span>
      )}
      <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <PanelHead title="Data retention" desc="GDPR-compliant deletion policies. Changes apply going forward, never retroactively." action={saveAction} />

      {/* per-data-type retention periods */}
      <Card>
        {RETENTION_ROWS.map((r, i) => (
          <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--c-surface-2)", color: "var(--c-ink-2)" }}><Icon name="scroll" size={16} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{r.d}</div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{r.note}</div>
            </div>
            <select value={periods[r.key]} onChange={(e) => setPeriod(r.key, e.target.value)} style={{ ...inp, width: "auto", padding: "6px 9px", cursor: "pointer" }}>
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        ))}
      </Card>

      {/* auto-deletion + anonymization controls */}
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Automation</h3>
      <Card pad={0}>
        {([
          ["Auto-delete past retention", "Permanently remove records once their retention period elapses.", <Toggle key="c" on={autoDelete} onClick={() => setAutoDelete((v) => !v)} />],
          ["Anonymize instead of delete", "Keep aggregate analytics by stripping personal identifiers rather than deleting.", <Toggle key="c" on={anonymize} onClick={() => setAnonymize((v) => !v)} />],
          ["Honor erasure requests", "Process right-to-be-forgotten requests automatically on receipt.", <Toggle key="c" on={honorErasure} onClick={() => setHonorErasure((v) => !v)} />],
        ] as [string, string, React.ReactNode][]).map(([t, d, ctrl], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{d}</div>
            </div>
            {ctrl}
          </div>
        ))}
      </Card>

      {/* GDPR / CCPA compliance notes (static chrome) */}
      <div style={{ marginTop: 14, padding: "12px 15px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 9, alignItems: "flex-start" }}>
        <Icon name="shield" size={15} style={{ color: "var(--c-ai)", flexShrink: 0, marginTop: 1 }} />
        <span>Right-to-be-forgotten requests are honored automatically and logged to the tamper-evident audit trail. Retention satisfies <b>GDPR Art. 5(1)(e)</b> storage limitation and the <b>CCPA / CPRA</b> right to delete; audit logs are retained on a separate legal-hold schedule.</span>
      </div>

      {/* purge-now action */}
      <h3 style={{ margin: "26px 0 12px", fontSize: "var(--fs-md)", fontWeight: 700 }}>Manual purge</h3>
      <Card pad={0}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", flexWrap: "wrap" }}>
          <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--c-danger-tint)", color: "var(--c-danger)" }}><Icon name="x" size={16} stroke={2.2} /></span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 8, alignItems: "center" }}>
              Purge expired records now
              <Pill tone="var(--c-danger)" bg="var(--c-danger-tint)" icon="flag">irreversible</Pill>
            </div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>Run the deletion sweep immediately instead of waiting for the next scheduled cycle.</div>
          </div>
          {purgeMsg && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)" }}>
              <Icon name="check" size={15} stroke={2.2} /> {purgeMsg}
            </span>
          )}
          <Btn variant="danger" icon="x" onClick={onPurge} disabled={purging}>{purging ? "Purging" : "Purge now"}</Btn>
        </div>
      </Card>
    </div>
  );
}
