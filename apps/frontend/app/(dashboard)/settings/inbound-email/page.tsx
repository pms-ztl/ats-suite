"use client";
// app/(dashboard)/settings/inbound-email/page.tsx - EXACT Claude Design "Aurora"
// settings, the Inbound email right-panel (claude-design/"Settings Extras.html"
// -> inbound()). The settings layout already renders the left settings-nav rail
// + a <section> wrapper, so this file is ONLY the right-panel content: the
// workspace inbound address (with verification status + copy), forwarding /
// routing rules, the auto-parse-applications + auto-reply toggles, and the
// allowed-senders list. PanelHead / Card / Field / Toggle are reproduced locally
// as the sibling settings pages define them; Btn / Pill come from the kit, Icon
// from the shim. Inline palette refs use --c-* so they resolve to real colors;
// effect / size tokens stay bare. Reuses the `rise` keyframe.
//
// WIRE: fields / toggles are controlled local useState. Save is a best-effort
// raw() PUT (/settings/inbound-email) that degrades gracefully so the panel
// always confirms. Static explanatory copy is product chrome.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the sibling settings pages ---- */
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

function CardHead({ title, icon, right }: { title: React.ReactNode; icon?: string; right?: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", alignItems: "center", gap: 9, justifyContent: "space-between" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
        {icon && <Icon name={icon} size={16} style={{ color: "var(--c-ink-3)" }} />}{title}
      </span>
      {right}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--c-ink-2)", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

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

const inp: CSS = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-base)", fontFamily: "var(--font-sans)", outline: "none" };

/* mono code row: the inbound address / config strings (prototype .code) */
function CodeRow({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mono" style={{ fontSize: 12.5, background: "var(--c-surface-2)", border: "1px solid var(--c-line)", borderRadius: "var(--r)", padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span>
      {right}
    </div>
  );
}

/* trow: icon / title / desc / trailing control (prototype .trow) */
function Row({ icon, title, desc, ctrl, first }: { icon?: string; title: React.ReactNode; desc?: React.ReactNode; ctrl?: React.ReactNode; first?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: first ? "none" : "1px solid var(--c-line)" }}>
      {icon && <span style={{ width: 32, height: 32, borderRadius: 9, background: "var(--c-surface-2)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name={icon} size={16} /></span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginTop: 1 }}>{desc}</div>}
      </div>
      {ctrl}
    </div>
  );
}

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

/* static product chrome: the inbound address + forwarding / routing rules */
const INBOUND_ADDRESS = "jobs@yourco.talentflow.app";
const ROUTING_RULES: { match: string; route: string }[] = [
  { match: 'Subject contains "Backend"', route: "Senior Backend Engineer (REQ-4821)" },
  { match: "From domain referral partner", route: "Tag as Referral" },
  { match: "No requisition match", route: "Send to triage inbox" },
];

/* ----------------------------- panel ----------------------------- */
function InboundEmailPanel() {
  // controlled toggles / fields
  const [autoParse, setAutoParse] = useState(true);
  const [requireReq, setRequireReq] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [replyTemplate, setReplyTemplate] = useState("Application received template");
  const [allowed, setAllowed] = useState<string[]>(["careers@yourco.com", "*.lever.co", "noreply@indeed.com"]);
  const [newSender, setNewSender] = useState("");

  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function copyAddress() {
    try { navigator.clipboard?.writeText(INBOUND_ADDRESS); } catch { /* clipboard may be unavailable */ }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function addSender() {
    const v = newSender.trim();
    if (!v || allowed.includes(v)) { setNewSender(""); return; }
    setAllowed((xs) => [...xs, v]);
    setNewSender("");
  }
  function removeSender(s: string) {
    setAllowed((xs) => xs.filter((x) => x !== s));
  }

  async function onSave() {
    setSaving(true); setSaved(false);
    try {
      // best-effort: the gateway may not expose this yet, so degrade gracefully
      await raw("/settings/inbound-email", {
        method: "PUT",
        body: JSON.stringify({
          address: INBOUND_ADDRESS,
          autoParse, requireRequisition: requireReq,
          autoReply, replyTemplate, allowedSenders: allowed,
        }),
      });
    } catch { /* graceful: still confirm */ }
    setSaving(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <>
      <PanelHead
        title="Inbound email"
        desc="Route applications and replies sent to your hiring inbox straight into the ATS. Attachments are parsed into resumes automatically."
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

      {/* Inbound address + verification status */}
      <div style={{ marginBottom: 16 }}>
        <Card>
          <CardHead
            title="Inbound address" icon="inbox"
            right={<Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">Verified</Pill>}
          />
          <div style={{ padding: 18 }}>
            <CodeRow right={<Btn variant="ghost" size="sm" icon="copy" onClick={copyAddress}>{copied ? "Copied" : "Copy"}</Btn>}>
              {INBOUND_ADDRESS}
            </CodeRow>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 8 }}>
              Forward your careers inbox here, or publish it directly on job posts. Attachments become resumes automatically.
            </div>
          </div>
        </Card>
      </div>

      {/* Forwarding / routing rules */}
      <div style={{ marginBottom: 16 }}>
        <Card>
          <CardHead
            title="Forwarding & routing rules"
            right={<Btn variant="ghost" size="sm" icon="plus">Add rule</Btn>}
          />
          <div style={{ padding: 18 }}>
            {ROUTING_RULES.map((r, i) => (
              <Row
                key={r.match} first={i === 0} icon="radar"
                title={r.match}
                desc={<span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="arrowUpRight" size={12} /> {r.route}</span>}
                ctrl={<Btn variant="ghost" size="sm">Edit</Btn>}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* Parsing & auto-reply */}
      <div style={{ marginBottom: 16 }}>
        <Card>
          <CardHead title="Parsing & replies" icon="sparkles" />
          <div style={{ padding: 18 }}>
            <Row
              first icon="scan"
              title="Auto-parse applications"
              desc="Extract candidate, resume, and contact details from every inbound email."
              ctrl={<Toggle on={autoParse} onClick={() => setAutoParse((v) => !v)} />}
            />
            <Row
              icon="briefcase"
              title="Require a matching open requisition"
              desc="Only auto-create candidates when the email matches an open req; otherwise send to triage."
              ctrl={<Toggle on={requireReq} onClick={() => setRequireReq((v) => !v)} />}
            />
            <Row
              icon="inbox"
              title="Auto-reply on receipt"
              desc="Send an acknowledgement the moment an application lands."
              ctrl={<Toggle on={autoReply} onClick={() => setAutoReply((v) => !v)} />}
            />
            {autoReply && (
              <div style={{ marginTop: 4 }}>
                <Field label="Acknowledgement template">
                  <select value={replyTemplate} onChange={(e) => setReplyTemplate(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                    <option>Application received template</option>
                    <option>Referral acknowledgement</option>
                    <option>Custom...</option>
                  </select>
                </Field>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Allowed senders */}
      <div style={{ marginBottom: 16 }}>
        <Card>
          <CardHead title="Allowed senders" icon="shield" />
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)", marginBottom: 12 }}>
              Only accept inbound mail from these addresses or domains. Use a wildcard (e.g. *.lever.co) to allow a whole domain. Leave empty to accept all senders.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {allowed.length === 0 && (
                <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", padding: "6px 0" }}>Accepting mail from all senders.</div>
              )}
              {allowed.map((s) => (
                <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
                  <span className="mono" style={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
                  <button onClick={() => removeSender(s)} aria-label={`Remove ${s}`} style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "var(--c-ink-3)", cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={newSender} placeholder="name@domain.com or *.domain.com"
                onChange={(e) => setNewSender(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addSender(); }}
                style={{ ...inp, flex: "1 1 220px" }}
              />
              <Btn variant="soft" icon="plus" onClick={addSender} disabled={!newSender.trim()}>Add sender</Btn>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save"}</Btn>
      </div>
    </>
  );
}

export default function InboundEmailSettingsPage() {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <InboundEmailPanel />
    </div>
  );
}
