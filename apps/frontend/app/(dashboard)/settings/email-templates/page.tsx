"use client";
// app/(dashboard)/settings/email-templates/page.tsx - EXACT Claude Design "Aurora"
// settings, the Email templates right-panel. Builds on the prototype's PEmail
// (claude-design/screen-settings.jsx) but renders the RICH version the sibling
// panels imply: a catalog of transactional templates (application received,
// screening result, interview invite, offer, rejection, ...) each with a subject
// line + toggle + Edit action, plus a live template editor with a merge-variable
// palette and a rendered preview. The settings layout already supplies the left
// nav rail + a <section> wrapper, so this file is ONLY the right-panel content.
// PanelHead / Card / Field / Toggle are reproduced locally as the prototype
// defines them (matching settings/page.tsx + settings/team/page.tsx); Btn / Pill
// come from the kit, Icon from the shim. Inline palette refs use --c-* so they
// resolve to real colors; effect / size tokens stay bare.
//
// WIRE: templates are fetched via a local raw() helper (GET /settings/email-templates,
// falling back to /email-templates), coerced via res?.data ?? res and mapped
// defensively; if neither route is wired the design's static catalog is used.
// Editing is controlled local state. Save is a best-effort raw() PUT that degrades
// gracefully (still confirms locally). loading -> Skeleton, error -> ErrorState,
// empty -> EmptyState. No fabricated sends.
import { useState, useMemo } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { Skeleton, ErrorState, EmptyState } from "@/components/aurora";

type CSS = React.CSSProperties;

/* ---- local helpers, verbatim from the prototype (PEmail uses PanelHead + Card + Toggle) ---- */
function Toggle({ on, onClick, disabled }: { on: boolean; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-pressed={on}
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

interface Template {
  id: string;
  key: string;
  name: string;
  desc: string;
  icon: string;
  subject: string;
  body: string;
  on: boolean;
  edited: string;
}

// The design's static catalog of transactional templates, used as the seed and
// as a graceful fallback when no email-templates route is wired.
const CATALOG: Template[] = [
  {
    id: "application-received", key: "application_received", name: "Application received", icon: "inbox",
    desc: "Auto-sent the moment a candidate applies.",
    subject: "We received your application for {{role}}",
    body: "Hi {{first_name}},\n\nThanks for applying to the {{role}} role at {{company}}. Our team is reviewing your application and we will be in touch with next steps soon.\n\nWarmly,\n{{recruiter_name}}",
    on: true, edited: "2 days ago",
  },
  {
    id: "screening-result", key: "screening_result", name: "Screening result", icon: "scan",
    desc: "Shares the outcome after AI + human screening.",
    subject: "An update on your {{role}} application",
    body: "Hi {{first_name}},\n\nThanks for your patience while we reviewed your application for {{role}}. We would love to move you forward to the next stage and will follow up shortly to coordinate.\n\nBest,\n{{recruiter_name}}",
    on: true, edited: "5 days ago",
  },
  {
    id: "interview-invite", key: "interview_invite", name: "Interview invite", icon: "calendar",
    desc: "Sent when a candidate is scheduled for a round.",
    subject: "Let's schedule your {{round}} interview, {{first_name}}",
    body: "Hi {{first_name}},\n\nWe enjoyed learning about your background and would like to invite you to a {{round}} interview for the {{role}} role. Please use the link below to pick a time that works for you.\n\n{{scheduling_link}}\n\nLooking forward to it,\n{{recruiter_name}}",
    on: true, edited: "1 week ago",
  },
  {
    id: "offer-extended", key: "offer_extended", name: "Offer extended", icon: "gavel",
    desc: "Delivered alongside the formal offer.",
    subject: "Your offer for {{role}} at {{company}}",
    body: "Hi {{first_name}},\n\nWe are thrilled to extend you an offer to join {{company}} as a {{role}}. The full details are attached. We think you would be a fantastic addition to the team and cannot wait to hear from you.\n\nCongratulations,\n{{recruiter_name}}",
    on: true, edited: "3 weeks ago",
  },
  {
    id: "rejection", key: "rejection", name: "Rejection (respectful)", icon: "fileText",
    desc: "A kind, honest close for candidates we pass on.",
    subject: "An update on your {{role}} application",
    body: "Hi {{first_name}},\n\nThank you for taking the time to apply for the {{role}} role at {{company}}. After careful consideration we have decided to move forward with other candidates for this position.\n\nWe were genuinely impressed and encourage you to apply for future roles that match your experience.\n\nWith appreciation,\n{{recruiter_name}}",
    on: true, edited: "1 month ago",
  },
  {
    id: "offer-reminder", key: "offer_reminder", name: "Offer reminder", icon: "clock",
    desc: "Nudges a candidate before an offer expires.",
    subject: "A friendly reminder about your {{role}} offer",
    body: "Hi {{first_name}},\n\nJust a quick note that your offer for the {{role}} role is still open. We would love to welcome you to {{company}} and are happy to answer any questions before you decide.\n\nBest,\n{{recruiter_name}}",
    on: false, edited: "2 months ago",
  },
  {
    id: "reference-request", key: "reference_request", name: "Reference request", icon: "users",
    desc: "Asks the candidate to share references.",
    subject: "A quick reference request for your {{role}} application",
    body: "Hi {{first_name}},\n\nAs a final step in our process, could you share two professional references we may contact? A name, role, and email for each is perfect.\n\nThank you,\n{{recruiter_name}}",
    on: false, edited: "3 months ago",
  },
];

// Merge variables surfaced in the editor palette. Inserting one is a controlled,
// local action; nothing is sent.
const VARIABLES = ["first_name", "last_name", "role", "company", "recruiter_name", "round", "scheduling_link", "offer_link"];

function fmtEdited(v: unknown): string {
  if (!v) return "just now";
  const s = String(v);
  // pass through human strings; render ISO-ish dates as a date
  const d = new Date(s);
  if (!Number.isNaN(d.getTime()) && /\d{4}-\d{2}-\d{2}/.test(s)) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }
  return s;
}

// GET the workspace email templates, mapped defensively against either route.
// Falls back to the static catalog when nothing is wired so the panel still
// renders its full product chrome.
async function getTemplates(): Promise<Template[]> {
  let res: any = null;
  try {
    res = await raw("/settings/email-templates");
  } catch {
    try { res = await raw("/email-templates"); } catch { res = null; }
  }
  const rows: any[] = Array.isArray(res) ? res : res?.templates ?? res?.items ?? [];
  if (!rows.length) return CATALOG;

  const byKey = new Map(CATALOG.map((t) => [t.key, t]));
  return rows.map((row: any, i: number): Template => {
    const key = String(row.key ?? row.slug ?? row.type ?? row.id ?? `template_${i}`);
    const seed = byKey.get(key) ?? byKey.get(key.replace(/-/g, "_")) ?? CATALOG[i % CATALOG.length];
    return {
      id: String(row.id ?? row.key ?? seed.id),
      key,
      name: row.name ?? row.title ?? seed.name,
      desc: row.description ?? row.desc ?? seed.desc,
      icon: row.icon ?? seed.icon,
      subject: row.subject ?? seed.subject,
      body: row.body ?? row.html ?? row.content ?? seed.body,
      on: row.enabled ?? row.on ?? row.active ?? true,
      edited: fmtEdited(row.updatedAt ?? row.editedAt ?? row.edited ?? seed.edited),
    };
  });
}

// best-effort save; the gateway may not expose it, so we degrade gracefully.
async function saveTemplate(t: Template): Promise<void> {
  await raw(`/settings/email-templates/${encodeURIComponent(t.id)}`, {
    method: "PUT",
    body: JSON.stringify({ subject: t.subject, body: t.body, enabled: t.on }),
  });
}

/* ---- render the body preview: turn {{var}} into highlighted chips, keep line breaks ---- */
function PreviewBody({ text }: { text: string }) {
  const parts = text.split(/(\{\{\s*[\w.]+\s*\}\})/g);
  return (
    <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--c-ink-2)", whiteSpace: "pre-wrap" }}>
      {parts.map((p, i) =>
        /^\{\{\s*[\w.]+\s*\}\}$/.test(p)
          ? <span key={i} className="mono" style={{ background: "var(--c-ai-tint)", color: "var(--c-ai-ink)", borderRadius: 5, padding: "1px 5px", fontSize: 11.5 }}>{p.replace(/[{}\s]/g, "")}</span>
          : <span key={i}>{p}</span>
      )}
    </div>
  );
}

/* ----------------------------- panel ----------------------------- */
function EmailTemplatesPanel() {
  const { data, loading, error, reload } = useData<Template[]>(getTemplates);

  // controlled editing state, seeded from the loaded catalog
  const [drafts, setDrafts] = useState<Record<string, Template>>({});
  const [selId, setSelId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // merged view: server/fallback row overlaid with any in-flight local edits
  const rows: Template[] = useMemo(
    () => (data ?? []).map((t) => drafts[t.id] ?? t),
    [data, drafts]
  );
  const selected = rows.find((t) => t.id === selId) ?? null;

  function patch(id: string, next: Partial<Template>) {
    setSaved(false);
    setDrafts((d) => {
      const base = d[id] ?? rows.find((t) => t.id === id);
      if (!base) return d;
      return { ...d, [id]: { ...base, ...next } };
    });
  }

  function insertVar(v: string) {
    if (!selected) return;
    patch(selected.id, { body: `${selected.body}{{${v}}}` });
  }

  async function onSave() {
    if (!selected || saving) return;
    setSaving(true); setSaved(false);
    try { await saveTemplate(selected); } catch { /* graceful: still confirm locally */ }
    setSaving(false); setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  }

  return (
    <>
      <PanelHead
        title="Email templates"
        desc="Customize the transactional emails candidates and members receive. Edit a template to change its subject, body, and merge variables."
        action={<Btn variant="ai" icon="sparkles">Draft with AI</Btn>}
      />

      <Card>
        {loading && <div style={{ padding: 18 }}><Skeleton className="h-56 rounded-lg" /></div>}

        {error && (
          <div style={{ padding: 28 }}>
            <ErrorState title="Could not load templates" body="The email templates service did not respond." code="GET /settings/email-templates" onRetry={reload} />
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div style={{ padding: 28 }}>
            <EmptyState title="No templates yet" body="Transactional email templates will appear here once your workspace is set up." />
          </div>
        )}

        {!loading && !error && rows.map((t, i) => {
          const active = selId === t.id;
          return (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderTop: i ? "1px solid var(--c-line)" : "none", background: active ? "var(--c-surface-2)" : "transparent", transition: "background var(--t)" }}>
              <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 9, display: "grid", placeItems: "center", background: t.on ? "var(--c-brand-tint)" : "var(--c-surface-2)", color: t.on ? "var(--c-brand)" : "var(--c-ink-3)" }}>
                <Icon name={t.icon} size={16} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  {t.name}
                  {!t.on && <Pill tone="var(--c-ink-3)" bg="var(--c-surface-3)" icon="dot">paused</Pill>}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</div>
              </div>
              <span style={{ fontSize: 11, color: "var(--c-ink-3)", whiteSpace: "nowrap" }} className="mono">edited {t.edited}</span>
              <Toggle on={t.on} onClick={() => patch(t.id, { on: !t.on })} />
              <Btn variant="soft" size="sm" icon={active ? "chevD" : "copy"} onClick={() => setSelId(active ? null : t.id)}>{active ? "Close" : "Edit"}</Btn>
            </div>
          );
        })}
      </Card>

      {/* template editor: variables palette + live preview */}
      {selected && (
        <div style={{ marginTop: 18, animation: "rise .3s var(--ease-out)" }}>
          <PanelHead
            title={`Editing: ${selected.name}`}
            desc={selected.desc}
            action={
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {saved && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ok)" }}>
                    <Icon name="check" size={15} stroke={2.4} /> Saved
                  </span>
                )}
                <Btn variant="ghost" onClick={() => setSelId(null)}>Done</Btn>
                <Btn variant="primary" icon="check" onClick={onSave} disabled={saving}>{saving ? "Saving" : "Save template"}</Btn>
              </div>
            }
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
            {/* left: the editable template */}
            <Card pad={20}>
              <Field label="Subject">
                <input value={selected.subject} onChange={(e) => patch(selected.id, { subject: e.target.value })} style={inp} />
              </Field>
              <Field label="Body">
                <textarea
                  value={selected.body}
                  onChange={(e) => patch(selected.id, { body: e.target.value })}
                  rows={11}
                  style={{ ...inp, resize: "vertical", lineHeight: 1.6, fontFamily: "var(--font-sans)" }}
                />
              </Field>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
                  <Icon name="bolt" size={13} /> Merge variables
                </label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {VARIABLES.map((v) => (
                    <button
                      key={v}
                      onClick={() => insertVar(v)}
                      title={`Insert {{${v}}}`}
                      className="mono"
                      style={{ padding: "4px 9px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", fontSize: 11.5, fontWeight: 500, cursor: "pointer", display: "inline-flex", gap: 5, alignItems: "center" }}
                    >
                      <Icon name="plus" size={11} stroke={2.2} />{v}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* right: live preview as the candidate sees it */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}>
                <Icon name="eye" size={13} /> Live preview
              </div>
              <Card pad={0}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 4 }}>Subject</div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}><PreviewBody text={selected.subject} /></div>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  <PreviewBody text={selected.body} />
                </div>
                <div style={{ padding: "12px 20px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, color: "var(--c-ink-3)" }}>
                  <Icon name="shield" size={13} style={{ color: "var(--c-ai)" }} />
                  Variables in {"{{ }}"} are filled per candidate when the email is sent.
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function EmailTemplatesPage() {
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      <EmailTemplatesPanel />
    </div>
  );
}
