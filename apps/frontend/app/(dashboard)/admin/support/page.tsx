"use client";
// app/(dashboard)/admin/support/page.tsx
// EXACT Claude Design "Aurora" SupportScreen port (claude-design/screen-extra.jsx),
// adapted into the operator support console: a stats strip, a tickets list
// (status / priority / tenant / subject / age) on the left, and a detail + reply
// panel on the right. Built from the Aurora kit + aurora primitives; Icon from
// "@/components/aurora-icon". Palette colors use var(--c-*); effect/size tokens
// are bare. Gated to super-admin by app/(dashboard)/admin/layout.tsx (untouched),
// so this surface cannot be reached by a non-operator; the backend re-enforces it.
//
// HONEST WIRING: useData tries GET /super-admin/support/tickets (cross-tenant,
// the real super-admin path) then falls back to GET /support/tickets. The
// payload is coerced to an array and mapped defensively (subject / tenant /
// status / priority / createdAt). Selecting a ticket loads its detail+messages
// best-effort. A reply is a best-effort raw() POST, and a status change a
// best-effort raw() PATCH, each degrading gracefully with inline feedback.
// Nothing is fabricated: loading -> Skeleton, error -> ErrorState, empty ->
// EmptyState.
import { useEffect, useMemo, useState } from "react";
import { Greeting, SectionCard, Btn, Pill, Reveal } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { toTitleCase } from "@/lib/utils";

/* ------------------------------- wiring ------------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
// Local raw() helper: unwraps res?.data ?? res. Throws on non-2xx so callers
// can try/catch or fall back to a sibling path.
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  const json = await res.json().catch(() => ({}));
  return json?.data ?? json;
}

/* ------------------------------- types -------------------------------- */
type Ticket = {
  id: string;
  subject: string;
  tenant: string;
  status: string;
  priority: string;
  category: string;
  email: string;
  createdAt: string;
};
type Message = { id: string; role: string; email: string; body: string; createdAt: string };
type Detail = { messages: Message[] } & Partial<Ticket>;

/* --------------------------- normalisation ---------------------------- */
function asArray(res: any): any[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.tickets)) return res.tickets;
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}
function mapTicket(t: any, i: number): Ticket {
  return {
    id: String(t?.id ?? t?.ticketId ?? i),
    subject: String(t?.subject ?? t?.title ?? t?.summary ?? "Untitled ticket"),
    tenant: String(t?.tenantName ?? t?.tenant?.name ?? t?.companyName ?? t?.tenantId ?? "Unknown tenant"),
    status: String(t?.status ?? t?.state ?? "OPEN").toUpperCase(),
    priority: String(t?.priority ?? "NORMAL").toUpperCase(),
    category: t?.category ? String(t.category) : "",
    email: String(t?.openedByEmail ?? t?.email ?? t?.requesterEmail ?? ""),
    createdAt: String(t?.createdAt ?? t?.updatedAt ?? ""),
  };
}
function mapMessage(m: any, i: number): Message {
  return {
    id: String(m?.id ?? i),
    role: String(m?.authorRole ?? m?.role ?? "CUSTOMER").toUpperCase(),
    email: String(m?.authorEmail ?? m?.email ?? ""),
    body: String(m?.body ?? m?.message ?? ""),
    createdAt: String(m?.createdAt ?? ""),
  };
}

// Try the super-admin cross-tenant path first, then the tenant-scoped path.
async function fetchTickets(): Promise<Ticket[]> {
  let res: any;
  try {
    res = await raw("GET", "/super-admin/support/tickets");
  } catch {
    res = await raw("GET", "/support/tickets");
  }
  return asArray(res).map(mapTicket);
}

/* ------------------------------ helpers ------------------------------- */
function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}
function fmtWhen(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Status -> dot color + label. Defensive: unknown statuses fall back to a calm tone.
const STATUS_META: Record<string, { dot: string; tone: string; bg: string; label: string }> = {
  OPEN: { dot: "var(--c-warn)", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", label: "Open" },
  AWAITING_CUSTOMER: { dot: "var(--c-info)", tone: "var(--c-info)", bg: "var(--c-info-tint)", label: "Awaiting customer" },
  RESOLVED: { dot: "var(--c-ok)", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", label: "Resolved" },
};
function statusMeta(s: string) {
  return STATUS_META[s] ?? { dot: "var(--c-ink-3)", tone: "var(--c-ink-2)", bg: "var(--c-surface-2)", label: s ? toTitleCase(s) : "Unknown" };
}
const PRIORITY_META: Record<string, { tone: string; bg: string }> = {
  URGENT: { tone: "var(--c-danger)", bg: "var(--c-danger-tint)" },
  HIGH: { tone: "var(--c-warn)", bg: "var(--c-warn-tint)" },
  NORMAL: { tone: "var(--c-ink-2)", bg: "var(--c-surface-2)" },
  LOW: { tone: "var(--c-ink-3)", bg: "var(--c-surface-3)" },
};
function priorityMeta(p: string) {
  return PRIORITY_META[p] ?? PRIORITY_META.NORMAL;
}

const STATUS_ACTIONS: { value: string; label: string; icon: string }[] = [
  { value: "OPEN", label: "Reopen", icon: "dot" },
  { value: "AWAITING_CUSTOMER", label: "Awaiting customer", icon: "clock" },
  { value: "RESOLVED", label: "Mark resolved", icon: "check" },
];

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)",
};
const inpX: React.CSSProperties = {
  width: "100%", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)",
  background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none",
};

export default function SupportPage() {
  const tickets = useData<Ticket[]>(fetchTickets);
  const rows = tickets.data ?? [];

  // Live counts for the stats strip (derived from the real list, never invented).
  const counts = useMemo(() => {
    const c = { OPEN: 0, AWAITING_CUSTOMER: 0, RESOLVED: 0 };
    for (const t of rows) if (t.status in c) (c as any)[t.status]++;
    return c;
  }, [rows]);

  // Selected ticket (first one once the list loads).
  const [selId, setSelId] = useState<string>("");
  useEffect(() => {
    if (rows.length && (!selId || !rows.some((t) => t.id === selId))) setSelId(rows[0].id);
  }, [rows, selId]);
  const sel = rows.find((t) => t.id === selId);

  // Per-ticket detail (messages), best-effort. Tries the super-admin path then
  // the tenant path; on failure resolves to an empty thread so the panel still
  // renders the ticket header rather than an error wall.
  const detail = useData<Detail>(async () => {
    if (!selId) return { messages: [] };
    let res: any;
    try { res = await raw("GET", `/super-admin/support/tickets/${selId}`); }
    catch {
      try { res = await raw("GET", `/support/tickets/${selId}`); }
      catch { return { messages: [] }; }
    }
    const msgs = Array.isArray(res?.messages) ? res.messages.map(mapMessage) : [];
    return { messages: msgs };
  }, [selId]);

  // Reply + status mutation state (graceful, inline).
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<null | "reply" | "status">(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "danger"; msg: string } | null>(null);
  useEffect(() => { setReply(""); setFeedback(null); }, [selId]);

  async function onReply() {
    if (!sel || !reply.trim() || busy) return;
    setBusy("reply"); setFeedback(null);
    const payload = { body: reply.trim() };
    try {
      // Reply route lives on the tenant mount; try it, then the admin mount.
      try { await raw("POST", `/support/tickets/${sel.id}/messages`, payload); }
      catch { await raw("POST", `/super-admin/support/tickets/${sel.id}/messages`, payload); }
      setReply("");
      setFeedback({ tone: "ok", msg: "Reply sent. The customer has been notified and the ticket is awaiting their response." });
      detail.reload(); tickets.reload();
    } catch {
      setFeedback({ tone: "danger", msg: "Could not send the reply. You may not have operator rights, or the service did not respond." });
    } finally { setBusy(null); }
  }

  async function onStatus(next: string) {
    if (!sel || sel.status === next || busy) return;
    setBusy("status"); setFeedback(null);
    try {
      try { await raw("PATCH", `/super-admin/support/tickets/${sel.id}`, { status: next }); }
      catch { await raw("PATCH", `/support/admin/tickets/${sel.id}`, { status: next }); }
      setFeedback({ tone: "ok", msg: `Ticket marked ${statusMeta(next).label.toLowerCase()}.` });
      tickets.reload();
    } catch {
      setFeedback({ tone: "danger", msg: "Could not update the status. You may not have operator rights, or the service did not respond." });
    } finally { setBusy(null); }
  }

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <Greeting title="Support console" sub="Every ticket across all tenants. Triage, reply, and resolve.">
        <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Replies within 4 hours</Pill>
        <Btn variant="soft" icon="arrowUpRight" onClick={() => tickets.reload()}>Refresh</Btn>
      </Greeting>

      {/* stats strip - live counts derived from the real list */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
        {([
          ["lifebuoy", "var(--c-warn)", "var(--c-warn-tint)", "Open", counts.OPEN],
          ["clock", "var(--c-info)", "var(--c-info-tint)", "Awaiting customer", counts.AWAITING_CUSTOMER],
          ["check", "var(--c-ok)", "var(--c-ok-tint)", "Resolved", counts.RESOLVED],
        ] as const).map((c, i) => (
          <Reveal key={c[3]} i={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", padding: 16, boxShadow: "var(--e1)" }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: c[2], color: c[1], flexShrink: 0 }}><Icon name={c[0]} size={21} /></span>
              <div>
                <div className="mono tnum" style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{tickets.loading ? "-" : c[4]}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", marginTop: 2 }}>{c[3]}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* working surface: tickets list + detail/reply */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 16, alignItems: "start" }}>
        {/* ---------------- tickets list ---------------- */}
        <Reveal i={3}>
          <SectionCard title="Tickets" icon="lifebuoy" headRight={!tickets.loading && rows.length > 0 ? <Pill mono tone="var(--c-ink-2)" bg="var(--c-surface-2)">{rows.length}</Pill> : undefined} pad={6}>
            {tickets.loading && (
              <div style={{ display: "grid", gap: 6 }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[62px] rounded-[11px]" />)}
              </div>
            )}
            {tickets.error && (
              <ErrorState title="Could not load tickets" body="The support service did not respond, or you do not have operator access." code="GET /api/super-admin/support/tickets" onRetry={tickets.reload} />
            )}
            {tickets.data && rows.length === 0 && (
              <EmptyState title="No tickets" body="When tenants open support tickets, they land here for triage across the platform." />
            )}
            {tickets.data && rows.map((t) => {
              const sm = statusMeta(t.status);
              const active = t.id === selId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelId(t.id)}
                  style={{
                    width: "100%", textAlign: "left", display: "block", padding: "11px 12px", borderRadius: "var(--r)", marginBottom: 2,
                    border: "1px solid", borderColor: active ? "var(--c-brand)" : "transparent", background: active ? "var(--c-brand-tint)" : "transparent",
                    cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background var(--t-fast)",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: sm.dot, flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: "var(--fs-sm)", fontWeight: 600, color: active ? "var(--c-brand-ink)" : "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject}</span>
                    {t.priority !== "NORMAL" && <Pill tone={priorityMeta(t.priority).tone} bg={priorityMeta(t.priority).bg} style={{ fontSize: 9, padding: "1px 6px" }}>{toTitleCase(t.priority)}</Pill>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4, paddingLeft: 17 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--c-ink-3)", minWidth: 0 }}>
                      <Icon name="building" size={12} style={{ flexShrink: 0 }} />
                      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.tenant}</span>
                    </span>
                    <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", flexShrink: 0 }}>{ago(t.createdAt)}</span>
                  </div>
                </button>
              );
            })}
          </SectionCard>
        </Reveal>

        {/* ---------------- detail + reply ---------------- */}
        <Reveal i={4}>
          {tickets.loading ? (
            <Skeleton className="h-[420px] rounded-[14px]" />
          ) : !sel ? (
            <SectionCard title="Ticket" icon="inbox">
              <EmptyState title="No ticket selected" body="Pick a ticket from the list to read the conversation and reply." />
            </SectionCard>
          ) : (
            <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", boxShadow: "var(--e1)", display: "flex", flexDirection: "column", minHeight: 0 }}>
              {/* header */}
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--c-line)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 800, letterSpacing: "-0.02em" }}>{sel.subject}</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap", fontSize: 12, color: "var(--c-ink-3)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="building" size={13} /> {sel.tenant}</span>
                      {sel.email && <span className="mono" style={{ color: "var(--c-ink-2)" }}>{sel.email}</span>}
                      {sel.createdAt && <span>· opened {ago(sel.createdAt)}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                    <Pill tone={statusMeta(sel.status).tone} bg={statusMeta(sel.status).bg}>{statusMeta(sel.status).label}</Pill>
                    <Pill tone={priorityMeta(sel.priority).tone} bg={priorityMeta(sel.priority).bg}>{toTitleCase(sel.priority)}</Pill>
                    {sel.category && <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{toTitleCase(sel.category)}</Pill>}
                  </div>
                </div>
                {/* status actions */}
                <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
                  {STATUS_ACTIONS.map((a) => {
                    const current = sel.status === a.value;
                    return (
                      <button
                        key={a.value}
                        onClick={() => onStatus(a.value)}
                        disabled={current || busy !== null}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: current || busy ? "default" : "pointer",
                          fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)", border: "1px solid",
                          borderColor: current ? "transparent" : "var(--c-line-2)", background: current ? statusMeta(a.value).bg : "var(--c-surface)",
                          color: current ? statusMeta(a.value).tone : "var(--c-ink-2)", opacity: !current && busy ? 0.55 : 1,
                        }}
                      >
                        <Icon name={a.icon} size={13} />{a.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* conversation thread */}
              <div style={{ flex: 1, overflowY: "auto", padding: "18px", maxHeight: "calc(100vh - 360px)", minHeight: 200, display: "flex", flexDirection: "column", gap: 12 }}>
                {detail.loading && (
                  <div style={{ display: "grid", gap: 10 }}>
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[11px]" />)}
                  </div>
                )}
                {!detail.loading && (!detail.data || detail.data.messages.length === 0) && (
                  <div style={{ textAlign: "center", padding: "20px 10px", fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>
                    No messages to show. The conversation thread loads here, or reply below to start it.
                  </div>
                )}
                {!detail.loading && detail.data && detail.data.messages.map((m) => {
                  const support = m.role === "SUPPORT";
                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: support ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth: "82%", padding: "11px 13px", borderRadius: "var(--r-lg)", fontSize: "var(--fs-sm)", lineHeight: 1.55,
                        background: support ? "var(--c-brand-tint)" : "var(--c-surface-2)", color: support ? "var(--c-brand-ink)" : "var(--c-ink)", border: "1px solid var(--c-line)" }}>
                        {m.body}
                      </div>
                      <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)", marginTop: 4 }}>
                        {support ? "Support" : "Customer"}{m.email ? ` · ${m.email}` : ""}{m.createdAt ? ` · ${fmtWhen(m.createdAt)}` : ""}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* reply composer */}
              <div style={{ padding: "14px 18px", borderTop: "1px solid var(--c-line)" }}>
                {feedback && (
                  <div
                    role="status"
                    style={{ marginBottom: 11, display: "flex", gap: 9, alignItems: "center", padding: "10px 13px", borderRadius: "var(--r-lg)", fontSize: 12.5, fontWeight: 600,
                      color: feedback.tone === "ok" ? "var(--c-ok)" : "var(--c-danger)",
                      background: feedback.tone === "ok" ? "var(--c-ok-tint)" : "var(--c-danger-tint)",
                      border: `1px solid color-mix(in oklab, ${feedback.tone === "ok" ? "var(--c-ok)" : "var(--c-danger)"} 24%, transparent)` }}
                  >
                    <Icon name={feedback.tone === "ok" ? "check" : "flag"} size={15} style={{ flexShrink: 0 }} />
                    <span>{feedback.msg}</span>
                  </div>
                )}
                <div style={{ ...labelStyle, marginBottom: 6 }}>Reply to {sel.tenant}</div>
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply. The customer is notified by email and the ticket moves to awaiting their response."
                  style={{ ...inpX, resize: "vertical", lineHeight: 1.5 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--c-ink-3)" }}>
                    <Icon name="shield" size={13} /> Replies are logged to the platform audit trail.
                  </span>
                  <Btn variant="primary" icon="enter" onClick={onReply} disabled={busy !== null || !reply.trim()}>
                    {busy === "reply" ? "Sending…" : "Send reply"}
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
