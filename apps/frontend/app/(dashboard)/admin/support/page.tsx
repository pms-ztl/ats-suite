"use client";
// app/(dashboard)/admin/support/page.tsx - EXACT Claude Design "Aurora"
// SupportScreen, reframed as the operator support console and wired to the
// real gateway. Faithful to claude-design/screen-extra.jsx SupportScreen:
// a "How can we help?" hero, three quick-action cards, then a two-column
// working surface. The left "Submit a ticket" panel becomes the selected
// ticket detail + reply; the right rail keeps "Your tickets" (now the real
// cross-tenant queue) and the "Popular FAQs" accordion.
//
// Data is real, no fabricated tickets: raw() tries GET /super-admin/support
// /tickets then GET /support/tickets, coerces res?.data ?? res to an array,
// and maps defensively. Reply/status actions are best-effort raw() POST/PATCH
// with graceful fallback. On error/404 the exact layout renders with
// EmptyState / Skeleton.
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Greeting, SectionCard, Reveal, Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

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

type TicketStatus = "OPEN" | "AWAITING_CUSTOMER" | "RESOLVED" | string;
type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;

type TicketMessage = {
  id?: string;
  authorRole?: string;
  authorEmail?: string;
  body?: string;
  isInternal?: boolean;
  createdAt?: string;
};

type Ticket = {
  id: string;
  tenantId?: string;
  subject?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: string | null;
  openedByEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  messages?: TicketMessage[];
};

// status dot color, mirrors the prototype's three-color ticket markers
const STATUS_DOT: Record<string, string> = {
  RESOLVED: "var(--c-ok)",
  AWAITING_CUSTOMER: "var(--c-warn)",
  OPEN: "var(--c-info)",
};
const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  AWAITING_CUSTOMER: "Awaiting customer",
  RESOLVED: "Resolved",
};
function statusTone(s?: string): { tone: string; bg: string } {
  if (s === "RESOLVED") return { tone: "var(--c-ok)", bg: "var(--c-ok-tint)" };
  if (s === "AWAITING_CUSTOMER") return { tone: "var(--c-warn)", bg: "var(--c-warn-tint)" };
  return { tone: "var(--c-info)", bg: "var(--c-info-tint)" };
}
function priorityTone(p?: string): { tone: string; bg: string } {
  if (p === "URGENT") return { tone: "var(--c-danger)", bg: "var(--c-danger-tint)" };
  if (p === "HIGH") return { tone: "var(--c-warn)", bg: "var(--c-warn-tint)" };
  return { tone: "var(--c-ink-2)", bg: "var(--c-surface-2)" };
}

function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function shortTenant(id?: string): string {
  if (!id) return "unknown";
  return id.length > 8 ? id.slice(0, 8) : id;
}

// Decorative chrome from the prototype, kept verbatim (static help content).
const FAQS: [string, string][] = [
  ["How do I add more seats?", "Go to Billing, Add seats, or upgrade your plan. New seats are prorated for the current period."],
  ["Why was a candidate flagged for review?", "When the screener's confidence falls below the 0.70 threshold, the verdict is held for a human decision rather than auto-advanced."],
  ["Can I export our hiring data?", "Yes. Analytics and Compliance both offer CSV and EEOC-formatted exports. API access is available on Professional and above."],
  ["How is AI used in screening?", "AI scores candidates against your requirements and shows its evidence, but it is advisory only. A human always makes the final decision."],
];

const QUICK_CARDS: [string, string, string, string, string][] = [
  ["inbox", "var(--c-brand)", "var(--c-brand-tint)", "Triage tickets", "Work the cross-tenant queue. Most replies within 4 hours."],
  ["fileText", "var(--c-info)", "var(--c-info-tint)", "Browse the docs", "Guides, API reference, and best practices."],
  ["sparkles", "var(--c-ai)", "var(--c-ai-tint)", "Ask Copilot", "Instant answers from your in-product assistant."],
];

export default function AdminSupportPage() {
  const { isSuperAdmin } = usePermissions();
  if (!isSuperAdmin) return <AccessDenied />;
  return <SupportConsole />;
}

function SupportConsole() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    setErrored(false);
    // Try the super-admin cross-tenant console first, then the tenant list.
    for (const path of ["/super-admin/support/tickets", "/support/tickets"]) {
      try {
        const res = await raw(path);
        const arr = res?.data ?? res;
        if (Array.isArray(arr)) {
          const mapped: Ticket[] = arr.map((t: any, i: number) => ({
            id: String(t?.id ?? `t-${i}`),
            tenantId: t?.tenantId,
            subject: t?.subject,
            status: t?.status,
            priority: t?.priority,
            category: t?.category ?? null,
            openedByEmail: t?.openedByEmail,
            createdAt: t?.createdAt,
            updatedAt: t?.updatedAt,
          }));
          setTickets(mapped);
          setLoading(false);
          return;
        }
      } catch {
        // try the next path
      }
    }
    // Both endpoints failed or 404'd: render the exact layout, no fake data.
    setTickets([]);
    setErrored(true);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const list = tickets ?? [];
    const open = list.filter((t) => t.status === "OPEN").length;
    const awaiting = list.filter((t) => t.status === "AWAITING_CUSTOMER").length;
    const resolved = list.filter((t) => t.status === "RESOLVED").length;
    return { total: list.length, open, awaiting, resolved };
  }, [tickets]);

  const selected = useMemo(
    () => (tickets ?? []).find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <Greeting title="How can we help?" sub="Triage the cross-tenant ticket queue, reply to customers, and keep statuses honest." />

      {/* quick-action cards (decorative chrome from the prototype) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 16 }}>
        {QUICK_CARDS.map((c, i) => (
          <Reveal key={c[3]} i={i}>
            <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", padding: 18, boxShadow: "var(--e1)" }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, display: "grid", placeItems: "center", background: c[2], color: c[1], marginBottom: 12 }}><Icon name={c[0]} size={21} /></span>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{c[3]}</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", marginTop: 3, lineHeight: 1.45 }}>{c[4]}</div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* live stats from the real queue */}
      <Reveal i={3}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
          {([
            ["Total tickets", stats.total, "lifebuoy", "var(--c-ink-3)", "var(--c-surface-2)"],
            ["Open", stats.open, "inbox", "var(--c-info)", "var(--c-info-tint)"],
            ["Awaiting customer", stats.awaiting, "clock", "var(--c-warn)", "var(--c-warn-tint)"],
            ["Resolved", stats.resolved, "check", "var(--c-ok)", "var(--c-ok-tint)"],
          ] as [string, number, string, string, string][]).map(([label, value, icon, color, bg]) => (
            <div key={label} style={{ background: "var(--c-surface)", border: "1px solid var(--c-line)", borderRadius: "var(--r-lg)", padding: "15px 16px", boxShadow: "var(--e1)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--c-ink-2)", fontWeight: 600 }}>
                <span style={{ width: 26, height: 26, borderRadius: 8, display: "grid", placeItems: "center", background: bg, color }}><Icon name={icon} size={14} /></span>
                {label}
              </span>
              <div className="mono tnum" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 12 }}>{loading ? "-" : value}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* working surface: ticket detail / reply (left) + queue + FAQs (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, alignItems: "start" }}>
        <Reveal i={4}>
          <SectionCard title={selected ? selected.subject || "Ticket" : "Selected ticket"} icon="inbox">
            {selected ? (
              <TicketDetail key={selected.id} ticket={selected} onChanged={load} />
            ) : (
              <div style={{ padding: "10px 4px" }}>
                <EmptyState
                  title="No ticket selected"
                  body="Pick a ticket from the queue on the right to read the thread and reply. Replies post as support and move the ticket to awaiting customer."
                />
              </div>
            )}
          </SectionCard>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={5}>
            <SectionCard title="Ticket queue" icon="lifebuoy" pad={6}>
              {loading && (
                <div style={{ display: "grid", gap: 8, padding: 6 }}>
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}
                </div>
              )}
              {!loading && (tickets?.length ?? 0) === 0 && (
                <div style={{ padding: "8px 4px" }}>
                  <EmptyState
                    title={errored ? "Could not load tickets" : "No tickets"}
                    body={errored
                      ? "The support service did not respond. The queue will appear here once it is reachable."
                      : "When customers open tickets across any tenant, they show up here for triage."}
                  />
                </div>
              )}
              {!loading && (tickets?.length ?? 0) > 0 && (tickets ?? []).map((t) => {
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    aria-pressed={active}
                    style={{
                      width: "100%", display: "flex", gap: 11, alignItems: "center", padding: "11px 12px",
                      borderRadius: "var(--r)", cursor: "pointer", textAlign: "left", border: "1px solid",
                      borderColor: active ? "var(--c-line-2)" : "transparent",
                      background: active ? "var(--c-surface-2)" : "transparent",
                      fontFamily: "var(--font-sans)", transition: "background var(--t-fast), border-color var(--t-fast)",
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: STATUS_DOT[t.status as string] || "var(--c-ink-3)", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject || "Untitled ticket"}</span>
                        {t.priority && t.priority !== "NORMAL" && (
                          <Pill tone={priorityTone(t.priority).tone} bg={priorityTone(t.priority).bg} style={{ fontSize: 10, padding: "1px 7px" }}>{String(t.priority)}</Pill>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <span className="mono">{shortTenant(t.tenantId)}</span>
                        {t.status ? ` · ${STATUS_LABEL[t.status as string] || String(t.status)}` : ""}
                        {t.updatedAt ? ` · ${ago(t.updatedAt)}` : t.createdAt ? ` · ${ago(t.createdAt)}` : ""}
                      </div>
                    </div>
                    <Icon name="chevR" size={15} style={{ color: "var(--c-ink-3)", flexShrink: 0 }} />
                  </button>
                );
              })}
            </SectionCard>
          </Reveal>

          <Reveal i={6}>
            <SectionCard title="Popular FAQs" icon="fileText" pad={6}>
              {FAQS.map((f, i) => (
                <div key={f[0]} style={{ borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "12px 8px", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{f[0]}</span>
                    <Icon name="chevD" size={17} style={{ color: "var(--c-ink-3)", flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
                  </button>
                  {openFaq === i && <div style={{ padding: "0 8px 13px", fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.55 }}>{f[1]}</div>}
                </div>
              ))}
            </SectionCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

// ----- Selected ticket: thread + controlled reply panel (best-effort POST) -----
function TicketDetail({ ticket, onChanged }: { ticket: Ticket; onChanged: () => void }) {
  const [full, setFull] = useState<Ticket>(ticket);
  const [loadingThread, setLoadingThread] = useState(true);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    setLoadingThread(true);
    try {
      const res = await raw(`/support/tickets/${ticket.id}`);
      const data = res?.data ?? res;
      if (data && typeof data === "object") setFull(data as Ticket);
    } catch {
      // graceful fallback: keep the summary row we already have
      setFull(ticket);
    } finally {
      setLoadingThread(false);
    }
  }, [ticket]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  const sendReply = async () => {
    if (reply.trim().length < 1) return;
    setSending(true);
    setNotice(null);
    try {
      await raw(`/support/tickets/${ticket.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ body: reply, isInternal: internal }),
      });
      setReply("");
      setInternal(false);
      await fetchThread();
      onChanged();
    } catch {
      setNotice("Could not send the reply. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    setNotice(null);
    try {
      await raw(`/super-admin/support/tickets/${ticket.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await fetchThread();
      onChanged();
    } catch {
      setNotice("Could not update the status.");
    }
  };

  const st = statusTone(full.status);
  const pr = priorityTone(full.priority);
  const messages = full.messages ?? [];
  const resolved = full.status === "RESOLVED";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
      {/* header meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <Pill tone={st.tone} bg={st.bg}>{STATUS_LABEL[full.status as string] || String(full.status ?? "Open")}</Pill>
        {full.priority && <Pill tone={pr.tone} bg={pr.bg}>{String(full.priority)}</Pill>}
        {full.category && <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{full.category}</Pill>}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
        Tenant <span className="mono">{full.tenantId || "unknown"}</span>
        {full.openedByEmail ? <> · Opened by {full.openedByEmail}</> : null}
        {full.createdAt ? <> · {new Date(full.createdAt).toLocaleString()}</> : null}
      </div>

      {/* thread */}
      {loadingThread ? (
        <div style={{ display: "grid", gap: 8 }}>
          {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[11px]" />)}
        </div>
      ) : messages.length === 0 ? (
        <div style={{ padding: "8px 4px" }}>
          <EmptyState title="No messages yet" body="This ticket has no readable messages. Reply below to start the thread." />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "38vh", overflowY: "auto", paddingRight: 2 }}>
          {messages.map((m, i) => {
            const isSupport = m.authorRole === "SUPPORT";
            const bg = m.isInternal ? "var(--c-warn-tint)" : isSupport ? "var(--c-brand-tint)" : "var(--c-surface-2)";
            const border = m.isInternal ? "var(--c-warn)" : isSupport ? "var(--c-brand)" : "var(--c-line)";
            return (
              <div key={m.id || i} style={{ borderRadius: "var(--r)", border: `1px solid ${border}`, background: bg, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 5, fontSize: 11, color: "var(--c-ink-3)" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                    <strong style={{ color: "var(--c-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.authorEmail || "unknown"}</strong>
                    <span>{m.authorRole || "CUSTOMER"}</span>
                    {m.isInternal && <Pill tone="var(--c-warn)" bg="var(--c-warn-tint)" icon="eye" style={{ fontSize: 9, padding: "0 6px" }}>internal</Pill>}
                  </span>
                  {m.createdAt && <span className="mono" style={{ whiteSpace: "nowrap" }}>{new Date(m.createdAt).toLocaleString()}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{m.body || ""}</div>
              </div>
            );
          })}
        </div>
      )}

      {notice && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--c-danger)" }}>
          <Icon name="flag" size={14} /> {notice}
        </div>
      )}

      {/* reply panel */}
      {resolved ? (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "var(--fs-sm)", color: "var(--c-ok)", borderTop: "1px solid var(--c-line)", paddingTop: 13 }}>
          <Icon name="check" size={15} stroke={2.2} /> This ticket is resolved.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9, borderTop: "1px solid var(--c-line)", paddingTop: 13 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <div style={fieldLbl}>Reply</div>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--c-ink-3)", cursor: "pointer" }}>
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} style={{ width: 13, height: 13 }} />
              Internal note (customer will not see)
            </label>
          </div>
          <textarea
            rows={3}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply. Steps to reproduce help us help you faster."
            style={{ ...inpX, resize: "vertical", lineHeight: 1.5 }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn variant="soft" size="sm" icon="check" onClick={() => updateStatus("RESOLVED")}>Mark resolved</Btn>
              {full.status === "OPEN" && (
                <Btn variant="soft" size="sm" icon="clock" onClick={() => updateStatus("AWAITING_CUSTOMER")}>Awaiting customer</Btn>
              )}
            </div>
            <Btn variant="primary" icon="enter" onClick={sendReply} style={{ justifyContent: "center", opacity: sending || reply.trim().length < 1 ? 0.55 : 1, pointerEvents: sending ? "none" : "auto" }}>
              {sending ? "Sending..." : "Send reply"}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldLbl: CSSProperties = { fontSize: "var(--fs-xs)", fontWeight: 600, color: "var(--c-ink-2)" };
const inpX: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
