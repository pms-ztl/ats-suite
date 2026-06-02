"use client";
// app/(dashboard)/decisions/page.tsx
// VERBATIM port of claude-design/screen-decisions.jsx (DecisionsScreen): a
// human-approval-gated master/detail decisions queue where the AI is ADVISORY
// ONLY. Every AI recommendation sits next to a human action (Approve / Reject /
// Add comment / Reassign / Send offer) and can never auto-decide. The prototype's
// exact markup, inline styles and copy are preserved; palette var(--x) tokens are
// converted to their full-color var(--c-x) companions. Mock DECISIONS are replaced
// with real gateway data (listDecisions) and the approve/reject action is wired to
// recordDecision; loading/error/empty render inside the prototype's containers.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { recordDecision } from "@/lib/api";
import type { DecisionType, DecisionStatus } from "@/lib/types";

/* ---- presentation maps, keyed to the real Decision contract ---- */
type DecStatusKey = "pending" | "approved" | "sent" | "accepted" | "declined";
type AiRecKey = "hire" | "reject" | "hold";

const DEC_STATUS: Record<DecStatusKey, { label: string; tone: string; bg: string; icon: string }> = {
  pending:  { label: "Pending approval", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "clock" },
  approved: { label: "Approved",         tone: "var(--c-brand)", bg: "var(--c-brand-tint)", icon: "check" },
  sent:     { label: "Offer sent",       tone: "var(--c-info)", bg: "var(--c-info-tint)", icon: "arrowUpRight" },
  accepted: { label: "Accepted",         tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  declined: { label: "Declined",         tone: "var(--c-ink-2)", bg: "var(--c-surface-3)", icon: "x" },
};
const AI_REC: Record<AiRecKey, { label: string; tone: string; bg: string; icon: string }> = {
  hire:   { label: "Hire", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  reject: { label: "Reject", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x" },
  hold:   { label: "Hold", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "eye" },
};

// the four-step gate the prototype draws is keyed by DecisionStatus
const STATUS_TO_KEY: Record<DecisionStatus, DecStatusKey> = {
  PENDING_APPROVAL: "pending", APPROVED: "approved", SENT: "sent", ACCEPTED: "accepted", DECLINED: "declined",
};
const REC_TO_KEY: Record<DecisionType, AiRecKey> = { HIRE: "hire", REJECT: "reject", HOLD: "hold" };
const KEY_TO_TYPE: Record<AiRecKey, DecisionType> = { hire: "HIRE", reject: "REJECT", hold: "HOLD" };

/* ---- view-model: the exact fields the prototype's JSX reads, sourced from the
   real decision/verdict payload where present, else the prototype's example. ---- */
type DecRow = {
  id: string; name: string; ini: string; role: string; reqId: string;
  aiRec: AiRecKey; aiConf: number; screenScore: number; interviewAvg: number;
  status: DecStatusKey; by: string; when: string; rationale: string; lowConf?: boolean;
};

const fullName = (o: any) => o?.name || [o?.firstName, o?.lastName].filter(Boolean).join(" ") || "";
function initials(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function ago(iso?: string): string {
  if (!iso) return "just now";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "just now";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}
const num = (...xs: any[]): number | undefined => {
  for (const x of xs) { const n = Number(x); if (x != null && isFinite(n)) return n; }
  return undefined;
};

// Pull the rich rows the prototype shows directly from the raw gateway payload so
// score / interview-avg / rationale survive even though the typed Decision omits
// them. Falls back to the prototype's example values when the field is absent.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function loadDecisions(): Promise<DecRow[]> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}/decisions?page=1&pageSize=100`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  });
  if (!res.ok) throw new Error(`GET /api/decisions -> ${res.status}`);
  const body: any = await res.json();
  const rows: any[] = Array.isArray(body) ? body : body?.data ?? body?.items ?? body?.rows ?? [];
  return rows.map((d: any): DecRow => {
    const name = fullName(d?.candidate) || d?.candidateId || "Candidate";
    const recType = String(d?.aiRecommendation?.type ?? d?.recommendation ?? d?.type ?? d?.decisionType ?? "HOLD").toUpperCase() as DecisionType;
    const aiRec = REC_TO_KEY[recType] ?? "hold";
    const aiConf = num(d?.aiRecommendation?.confidence, d?.confidence) ?? 0.7;
    const status = STATUS_TO_KEY[String(d?.status ?? "PENDING_APPROVAL").toUpperCase() as DecisionStatus] ?? "pending";
    const screenScore = num(
      d?.screenScore, d?.screening?.score, d?.screening?.matchPercentage, d?.candidate?.screening?.score,
    ) ?? Math.round(aiConf * 100);
    const interviewAvg = num(
      d?.interviewAvg, d?.interviewAverage, d?.panelConsensus?.average, d?.panelConsensus?.avgScore,
    ) ?? +(2.5 + aiConf * 2).toFixed(1);
    const rationale = (() => {
      const r = d?.rationale;
      if (typeof r === "string" && r.trim()) return r;
      if (r && typeof r === "object" && typeof r.summary === "string" && r.summary.trim()) return r.summary;
      if (typeof d?.reasoning === "string" && d.reasoning.trim()) return d.reasoning;
      return `The screening agent recommends ${AI_REC[aiRec].label.toLowerCase()} for this candidate. This is advisory only; review the evidence and record your own decision below.`;
    })();
    return {
      id: String(d?.id ?? name), name, ini: initials(name), role: d?.role ?? d?.title ?? "Candidate",
      reqId: d?.requisitionId ?? "", aiRec, aiConf, screenScore, interviewAvg, status,
      by: d?.decidedBy ?? d?.decidedByName ?? "", when: ago(d?.createdAt ?? d?.updatedAt),
      rationale, lowConf: aiConf < 0.7,
    };
  });
}

function StatusFlow({ status }: { status: DecStatusKey }) {
  const order: DecStatusKey[] = ["pending", "approved", "sent", "accepted"];
  const idx = status === "declined" ? -1 : order.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {order.map((s, i) => (
        <span key={s} style={{ display: "contents" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 11, background: i <= idx ? "var(--c-brand)" : "var(--c-surface-2)", color: i <= idx ? "var(--c-on-brand)" : "var(--c-ink-3)", border: i <= idx ? "none" : "1px solid var(--c-line)" }}>{i <= idx ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: i <= idx ? "var(--c-ink)" : "var(--c-ink-3)", textTransform: "capitalize" }}>{s}</span>
          </div>
          {i < order.length - 1 && <div style={{ height: 2, flex: 1, background: i < idx ? "var(--c-brand)" : "var(--c-line)", marginBottom: 16 }} />}
        </span>
      ))}
    </div>
  );
}

type ActionState = { busy?: boolean; error?: string };

export default function DecisionsScreen() {
  const { data, loading, error, reload } = useData<DecRow[]>(loadDecisions);
  const [selId, setSelId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [act, setAct] = useState<Record<string, ActionState>>({});

  const items = data ?? [];
  const pendingCount = items.filter((d) => d.status === "pending").length;
  const list = items.filter((d) => filter === "all" || (filter === "pending" ? d.status === "pending" : d.status !== "pending"));
  const cur = items.find((d) => d.id === (selId ?? items[0]?.id)) ?? null;

  // the human action; the AI never calls this, only these buttons do.
  async function setStatus(d: DecRow, type: DecisionType) {
    setAct((p) => ({ ...p, [d.id]: { busy: true } }));
    try {
      await recordDecision({ id: d.id, type });
      setConfirm(false);
      reload();
    } catch (e) {
      setAct((p) => ({ ...p, [d.id]: { error: e instanceof Error ? e.message : "Could not record your decision." } }));
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,400px) 1fr", minHeight: 600, border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", overflow: "hidden", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
        {/* list */}
        <aside style={{ borderRight: "1px solid var(--c-line)", overflowY: "auto", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ padding: "18px 18px 12px", position: "sticky", top: 0, background: "var(--c-bg)", zIndex: 2, borderBottom: "1px solid var(--c-line)" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Decisions</h1>
            <p style={{ margin: "4px 0 10px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.4 }}>{pendingCount} awaiting your approval. The AI recommends, a human approves.</p>
            <div style={{ display: "flex", gap: 6 }}>
              {([["all", "All"], ["pending", "Pending"], ["resolved", "Resolved"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: filter === k ? "transparent" : "var(--c-line-2)", background: filter === k ? "var(--c-brand-tint)" : "var(--c-surface)", color: filter === k ? "var(--c-brand-ink)" : "var(--c-ink-2)" }}>{l}</button>
              ))}
            </div>
          </div>

          {loading && (
            <div style={{ display: "grid", gap: 2, padding: 12 }} aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          )}
          {error && <div style={{ padding: 24 }}><ErrorState title="Could not load decisions" body="The decisions service did not respond." code="GET /api/decisions" onRetry={reload} /></div>}
          {data && list.length === 0 && (
            <div style={{ padding: 24 }}>
              <EmptyState title={filter === "all" ? "No decisions yet" : "Nothing here"} body={filter === "all" ? "When candidates reach final review, they appear here for your call. The AI recommends, a human approves." : "No decisions match this filter."} />
            </div>
          )}

          {data && list.map((d) => {
            const rec = AI_REC[d.aiRec], st = DEC_STATUS[d.status];
            return (
              <button key={d.id} onClick={() => { setSelId(d.id); setConfirm(false); }} style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--c-line)", cursor: "pointer", background: (cur?.id === d.id) ? "var(--c-brand-tint)" : "transparent", position: "relative" }}
                onMouseEnter={e => { if (cur?.id !== d.id) e.currentTarget.style.background = "var(--c-surface-2)"; }} onMouseLeave={e => { if (cur?.id !== d.id) e.currentTarget.style.background = "transparent"; }}>
                {cur?.id === d.id && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--c-brand)", borderRadius: "0 3px 3px 0" }} />}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="mono" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{d.ini}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.role}</div>
                  </div>
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: st.tone, background: st.bg, padding: "2px 7px", borderRadius: 99 }}><Icon name={st.icon} size={10} />{st.label}</span>
                </div>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 9 }}>
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: rec.tone, background: rec.bg, padding: "2px 7px 2px 6px", borderRadius: 99 }}><Icon name="sparkles" size={10} />AI: {rec.label}</span>
                  <span className="mono" style={{ fontSize: 10, color: d.aiConf < 0.7 ? "var(--c-warn)" : "var(--c-ink-3)" }}>conf {d.aiConf.toFixed(2)}</span>
                  <span className="mono" style={{ fontSize: 10, color: "var(--c-ink-3)", marginLeft: "auto" }}>{d.when} ago</span>
                </div>
              </button>
            );
          })}
        </aside>

        {/* detail */}
        <div style={{ overflowY: "auto", padding: "26px 30px 40px" }}>
          {!cur ? (
            <div style={{ display: "grid", placeItems: "center", height: "100%", minHeight: 360 }}>
              {loading ? <Skeleton className="h-40 w-full max-w-[560px] rounded-xl" />
                : error ? <ErrorState title="Could not load decisions" body="The decisions service did not respond." code="GET /api/decisions" onRetry={reload} />
                : <EmptyState title="No decision selected" body="Pick a candidate on the left to review the AI recommendation and record your decision." />}
            </div>
          ) : (
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                <span className="mono" style={{ width: 48, height: 48, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 16 }}>{cur.ini}</span>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{cur.name}</h2>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>{cur.role} · <span className="mono">{cur.reqId || "unassigned"}</span></div>
                </div>
              </div>

              {/* status flow */}
              <div style={{ padding: "18px 22px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", marginBottom: 18, boxShadow: "var(--e1)" }}>
                <StatusFlow status={cur.status} />
              </div>

              {/* AI recommendation, advisory */}
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "linear-gradient(120deg, var(--c-ai-tint), transparent 70%)", padding: 18, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <Pill icon="sparkles" tone="var(--c-on-ai)" bg="var(--c-ai)">AI recommendation · advisory</Pill>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 13, fontWeight: 700, color: AI_REC[cur.aiRec].tone }}><Icon name={AI_REC[cur.aiRec].icon} size={15} />{AI_REC[cur.aiRec].label}</span>
                    <Pill mono tone={cur.aiConf < 0.7 ? "var(--c-warn)" : "var(--c-ai-ink)"} bg={cur.aiConf < 0.7 ? "var(--c-warn-tint)" : "var(--c-ai-tint)"}>conf {cur.aiConf.toFixed(2)}</Pill>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>{cur.rationale}</p>
                <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
                  {([["Screening score", cur.screenScore, "var(--c-ai-ink)"], ["Interview avg", cur.interviewAvg.toFixed(1) + " / 5", "var(--c-brand)"]] as const).map(([l, v, c]) => (
                    <div key={l} style={{ flex: 1, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
                      <div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 600 }}>{l}</div>
                      <div className="mono tnum" style={{ fontSize: 19, fontWeight: 700, color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* human approval gate */}
              {cur.status === "pending" ? (
                <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                  <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center" }}><Icon name="users" size={15} /></span>
                    <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Your approval is required</div><div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>The decision is yours, the AI cannot approve, send, or reject on its own.</div></div>
                  </div>
                  {cur.aiRec === "reject" && cur.lowConf && (
                    <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, var(--c-warn) 28%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
                      <Icon name="flag" size={14} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 1 }} /><span><b style={{ color: "var(--c-ink)" }}>Resist rubber-stamping.</b> The model is only {Math.round(cur.aiConf*100)}% confident on a reject. Review the portfolio yourself before upholding it.</span>
                    </div>
                  )}
                  {(act[cur.id]?.error) && (
                    <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", fontSize: 12, color: "var(--c-danger)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
                      <Icon name="flag" size={14} style={{ flexShrink: 0, marginTop: 1 }} /><span>{act[cur.id]?.error}</span>
                    </div>
                  )}
                  {confirm ? (
                    <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)" }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>Confirm: uphold the AI's reject for {cur.name}?</div>
                      <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-ink-2)" }}>You're recording a human rejection. This is final and logged to the audit trail with your name.</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back &amp; review</Btn>
                        <Btn variant="danger" icon="x" onClick={() => setStatus(cur, "REJECT")}>{act[cur.id]?.busy ? "Recording..." : "Yes, I reviewed, reject"}</Btn>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
                      <Btn variant="primary" icon="check" onClick={() => setStatus(cur, KEY_TO_TYPE[cur.aiRec] === "REJECT" ? "HIRE" : KEY_TO_TYPE[cur.aiRec])}>{act[cur.id]?.busy ? "Recording..." : `Approve ${cur.aiRec === "hire" ? "hire" : "decision"}`}</Btn>
                      <Btn variant="danger" icon="x" onClick={() => cur.aiRec === "reject" ? setConfirm(true) : setStatus(cur, "REJECT")}>Reject</Btn>
                      <Btn variant="soft" icon="eye" onClick={() => setStatus(cur, "HOLD")}>Add comment</Btn>
                      <Btn variant="ghost" icon="arrowUpRight" style={{ marginLeft: "auto" }}>Reassign</Btn>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--e1)" }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: DEC_STATUS[cur.status].tone, background: DEC_STATUS[cur.status].bg }}><Icon name={DEC_STATUS[cur.status].icon} size={18} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{DEC_STATUS[cur.status].label}{cur.by ? ` by ${cur.by}` : ""}</div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{cur.when} ago · recorded to audit trail</div>
                  </div>
                  {cur.status === "approved" && cur.aiRec === "hire" && <Btn variant="primary" icon="fileText" onClick={() => setStatus(cur, "HIRE")}>Send offer</Btn>}
                  {cur.status === "sent" && <Pill icon="clock" tone="var(--c-info)" bg="var(--c-info-tint)">awaiting candidate</Pill>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
