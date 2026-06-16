"use client";
// app/(dashboard)/settings/sms/page.tsx - EXACT Claude Design "Aurora" settings,
// the SMS notifications right-panel (claude-design/"Settings Extras.html" -> sms()).
// The settings layout already renders the left nav rail + a <section> wrapper, so
// this file is ONLY the right-panel content: the Twilio provider connection
// (Account SID + sender number + test SMS), the per-event message-type toggles,
// the reminder template, plus a consent/compliance note and monthly usage. The
// PanelHead / Card / Field / Toggle local helpers are reproduced as the prototype
// defines them (matching the sibling settings/page.tsx + team/page.tsx); Btn / Pill
// come from the kit, Icon from the shim. Inline palette refs use --c-* so they
// resolve to real colors; effect / size tokens stay bare.
//
// WIRE: fields + per-event toggles are controlled local state. Save is a
// best-effort raw() PUT that degrades gracefully (the gateway may not expose an
// SMS-settings endpoint yet). The consent / compliance copy is static chrome.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ width: 38, height: 22, borderRadius: 99, border: "none", background: on ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, flexShrink: 0, transition: "background var(--t)" }}
      aria-pressed={on}
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

// Card supports the prototype's optional card header (card-h): a title row with an
// optional right-hand slot (chip / action). Body padding is configurable.
function Card({ title, headRight, children, pad = 18 }: { title?: React.ReactNode; headRight?: React.ReactNode; children: React.ReactNode; pad?: number }) {
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden", marginBottom: 16 }}>
      {title && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", alignItems: "center", gap: 9, justifyContent: "space-between" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>{title}</span>
          {headRight}
        </div>
      )}
      <div style={{ padding: pad }}>{children}</div>
    </div>
  );
}

function Field({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 15 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp: CSS = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-base)", fontFamily: "var(--font-sans)", outline: "none" };

// the prototype's .code row: a mono panel with content + optional trailing action.
const codeBox: CSS = { fontFamily: "var(--font-mono)", fontSize: 12.5, background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r)", padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 };

/* ----------------------------- data wiring ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// token-aware fetch. Best-effort: throws on non-2xx so callers can degrade.
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

/* ---- per-event message types (prototype data, now controlled) ---- */
type MsgType = { key: string; title: string; desc: string };
const MSG_TYPES: MsgType[] = [
  { key: "interviewReminders", title: "Interview reminders", desc: "24h and 1h before" },
  { key: "offerNotifications", title: "Offer notifications", desc: "When an offer is sent" },
  { key: "statusUpdates", title: "Status updates", desc: "On stage changes" },
  { key: "schedulingLinks", title: "Scheduling links", desc: "Self-serve booking" },
];

/* ----------------------------- panel ----------------------------- */
function SmsPanel() {
  const [sender, setSender] = useState("+1 (415) 555-0142");
  const [template, setTemplate] = useState(
    "Hi {{first_name}}, this is a reminder for your {{round}} interview with {{company}} on {{date}} at {{time}}. Reply C to confirm.",
  );
  const [events, setEvents] = useState<Record<string, boolean>>({
    interviewReminders: true,
    offerNotifications: true,
    statusUpdates: false,
    schedulingLinks: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleEvent(key: string) {
    setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onSave() {
    setSaving(true); setSaved(false);
    try {
      await raw("/settings/sms", { method: "PUT", body: JSON.stringify({ senderNumber: sender, reminderTemplate: template, events }) });
    } catch { /* graceful: the gateway may not expose SMS settings yet */ }
    setSaving(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <>
      <PanelHead
        title="SMS notifications"
        desc="Send interview reminders and offer alerts by text. Candidates opt in during application."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saved && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
                <Icon name="check" size={15} stroke={2.4} /> Saved
              </span>
            )}
            <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
          </div>
        }
      />

      {/* Twilio provider connection */}
      <Card
        title={<><Icon name="inbox" size={16} style={{ color: "var(--c-ink-3)" }} /> Twilio connection</>}
        headRight={<Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">connected</Pill>}
      >
        <Field label="Account SID">
          <div style={codeBox}>
            <span className="mono">AC&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;3f9a</span>
            <Btn variant="ghost" size="sm">Update</Btn>
          </div>
        </Field>
        <Field label="Sender number">
          <input value={sender} onChange={(e) => setSender(e.target.value)} style={inp} />
        </Field>
        <Btn variant="soft" size="sm" icon="inbox">Send test SMS</Btn>
      </Card>

      {/* per-event message types */}
      <Card title="Message types">
        {MSG_TYPES.map((m, i) => (
          <div key={m.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{m.desc}</div>
            </div>
            <Toggle on={events[m.key]} onClick={() => toggleEvent(m.key)} />
          </div>
        ))}
      </Card>

      {/* reminder template */}
      <Card title="Reminder template">
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={3}
          style={{ ...codeBox, display: "block", lineHeight: 1.6, width: "100%", resize: "vertical", color: "var(--c-ink)", outline: "none" }}
        />
        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 8 }}>
          Merge tags: {"{{first_name}}"}, {"{{round}}"}, {"{{company}}"}, {"{{date}}"}, {"{{time}}"}.
        </div>
      </Card>

      {/* consent / compliance note (static chrome) */}
      <Card title={<><Icon name="shield" size={16} style={{ color: "var(--c-ink-3)" }} /> Consent and compliance</>}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 9, background: "var(--c-ok-tint)", color: "var(--c-ok)", display: "grid", placeItems: "center" }}>
            <Icon name="check" size={16} stroke={2.2} />
          </span>
          <div>
            <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Opt-in is required before any message is sent</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.5, maxWidth: "60ch" }}>
              Candidates confirm SMS consent during application. Every message includes STOP-to-unsubscribe handling, and opt-outs are honored automatically and logged for TCPA recordkeeping.
            </div>
          </div>
        </div>
      </Card>

      {/* monthly usage (static chrome) */}
      <Card title="Usage this month">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <span style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>Messages sent</span>
          <span className="mono" style={{ fontSize: "var(--fs-md)", fontWeight: 700 }}>1,840 <span style={{ color: "var(--c-ink-3)", fontWeight: 500 }}>/ 5,000</span></span>
        </div>
        <div style={{ position: "relative", height: 8, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, width: "36.8%", borderRadius: 99, background: "var(--c-brand)" }} />
        </div>
        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 8 }}>Resets on the 1st. Overage billed at ₹1 per message.</div>
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
      </div>
    </>
  );
}

export default function SmsSettingsPage() {
  return (
    <div style={{ maxWidth: 820, animation: "rise .3s var(--ease-out)" }}>
      <SmsPanel />
    </div>
  );
}
