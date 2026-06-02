"use client";
// app/(dashboard)/decisions/page.tsx - EXACT Claude Design "Aurora" decisions queue
// (claude-design/screen-decisions.jsx): a human-approval-gated master/detail.
// The AI is ADVISORY ONLY - its recommendation always sits next to a human
// action (Approve / Reject / Hold) and can never auto-decide. Wired to the real
// gateway via listDecisions + recordDecision. No fabricated decisions.
import { useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listDecisions, recordDecision } from "@/lib/api";
import type { Decision, DecisionType, DecisionStatus } from "@/lib/types";

/* ---- presentation maps, derived from the real Decision contract ---- */
const DEC_STATUS: Record<DecisionStatus, { label: string; tone: string; bg: string; icon: string }> = {
  PENDING_APPROVAL: { label: "Pending approval", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "clock" },
  APPROVED:         { label: "Approved",         tone: "var(--c-brand)", bg: "var(--c-brand-tint)", icon: "check" },
  SENT:             { label: "Offer sent",       tone: "var(--c-info)", bg: "var(--c-info-tint)", icon: "arrowUpRight" },
  ACCEPTED:         { label: "Accepted",         tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  DECLINED:         { label: "Declined",         tone: "var(--c-ink-2)", bg: "var(--c-surface-3)", icon: "x" },
};
const AI_REC: Record<DecisionType, { label: string; tone: string; bg: string; icon: string }> = {
  HIRE:   { label: "Hire", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", icon: "check" },
  REJECT: { label: "Reject", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x" },
  HOLD:   { label: "Hold", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", icon: "eye" },
};
const REASON_LABEL: Record<string, string> = {
  LOW_CONFIDENCE: "Low confidence", ADVERSE_IMPACT_FLAG: "Adverse-impact flag", POLICY_OVERRIDE: "Policy override",
  MISSING_EVIDENCE: "Missing evidence", CANDIDATE_APPEAL: "Candidate appeal",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d`;
}

/* ---- the four-step approval flow rail ---- */
function StatusFlow({ status }: { status: DecisionStatus }) {
  const order: DecisionStatus[] = ["PENDING_APPROVAL", "APPROVED", "SENT", "ACCEPTED"];
  const labels = ["Pending", "Approved", "Sent", "Accepted"];
  const idx = status === "DECLINED" ? -1 : order.indexOf(status);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {order.map((s, i) => (
        <span key={s} style={{ display: "contents" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 11, background: i <= idx ? "var(--c-brand)" : "var(--c-surface-2)", color: i <= idx ? "var(--c-on-brand)" : "var(--c-ink-3)", border: i <= idx ? "none" : "1px solid var(--c-line)" }}>{i <= idx ? <Icon name="check" size={12} stroke={3} /> : i + 1}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: i <= idx ? "var(--c-ink)" : "var(--c-ink-3)" }}>{labels[i]}</span>
          </div>
          {i < order.length - 1 && <div style={{ height: 2, flex: 1, background: i < idx ? "var(--c-brand)" : "var(--c-line)", marginBottom: 16 }} />}
        </span>
      ))}
    </div>
  );
}

type ActionState = { busy?: boolean; error?: string };

export default function DecisionsPage() {
  const { data, loading, error, reload } = useData<Decision[]>(listDecisions);
  const [selId, setSelId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [act, setAct] = useState<Record<string, ActionState>>({});

  const decisions = data ?? [];
  const pendingCount = decisions.filter((d) => d.status === "PENDING_APPROVAL").length;
  const list = decisions.filter((d) =>
    filter === "all" ? true : filter === "pending" ? d.status === "PENDING_APPROVAL" : d.status !== "PENDING_APPROVAL"
  );
  const cur = decisions.find((d) => d.id === (selId ?? decisions[0]?.id)) ?? null;

  // The human action. AI never calls this; only these buttons do.
  async function decide(d: Decision, type: DecisionType) {
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
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,400px) 1fr", gap: 0, border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", overflow: "hidden", background: "var(--c-surface)", boxShadow: "var(--e1)", minHeight: 560 }}>
        {/* list */}
        <aside style={{ borderRight: "1px solid var(--c-line)", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid var(--c-line)", background: "var(--c-bg)" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Decisions</h1>
            <p style={{ margin: "4px 0 10px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.4 }}>
              {pendingCount} awaiting your approval. The AI recommends, a human approves.
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              {(["all", "pending", "resolved"] as const).map((k) => (
                <button key={k} onClick={() => setFilter(k)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid", borderColor: filter === k ? "transparent" : "var(--c-line-2)", background: filter === k ? "var(--c-brand-tint)" : "var(--c-surface)", color: filter === k ? "var(--c-brand-ink)" : "var(--c-ink-2)", textTransform: "capitalize" }}>{k}</button>
              ))}
            </div>
          </div>

          {loading && (
            <div style={{ display: "grid", gap: 2, padding: 12 }} aria-busy="true">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          )}
          {error && <div style={{ padding: 24 }}><ErrorState title="Could not load decisions" body="The decisions service did not respond." code="GET /api/decisions" onRetry={reload} /></div>}
          {data && list.length === 0 && (
            <div style={{ padding: 24 }}>
              <EmptyState title={filter === "all" ? "No decisions yet" : "Nothing here"} body={filter === "all" ? "When candidates reach final review, they appear here for your call." : "No decisions match this filter."} />
            </div>
          )}

          {data && list.map((d) => {
            const rec = d.aiRecommendation ? AI_REC[d.aiRecommendation.type] : null;
            const st = DEC_STATUS[d.status];
            const conf = d.aiRecommendation?.confidence ?? 0;
            const active = cur?.id === d.id;
            return (
              <button key={d.id} onClick={() => { setSelId(d.id); setConfirm(false); }} style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--c-line)", cursor: "pointer", background: active ? "var(--c-brand-tint)" : "transparent", position: "relative" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                {active && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--c-brand)", borderRadius: "0 3px 3px 0" }} />}
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span className="mono" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(d.candidateId)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.candidateId}</div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.requisitionId || "Requisition"}</div>
                  </div>
                  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: st.tone, background: st.bg, padding: "2px 7px", borderRadius: 99 }}><Icon name={st.icon} size={10} />{st.label}</span>
                </div>
                {rec && (
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 9 }}>
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontSize: 10, fontWeight: 700, color: rec.tone, background: rec.bg, padding: "2px 7px 2px 6px", borderRadius: 99 }}><Icon name="sparkles" size={10} />AI: {rec.label}</span>
                    <span className="mono" style={{ fontSize: 10, color: conf < 0.7 ? "var(--c-warn)" : "var(--c-ink-3)" }}>conf {conf.toFixed(2)}</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--c-ink-3)", marginLeft: "auto" }}>{ago(d.createdAt)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </aside>

        {/* detail */}
        <div style={{ padding: "26px 30px 40px", minWidth: 0 }}>
          {!cur ? (
            <div style={{ display: "grid", placeItems: "center", height: "100%", minHeight: 360 }}>
              {loading ? <Skeleton className="h-40 w-full max-w-[560px] rounded-xl" />
                : error ? <ErrorState title="Could not load decisions" body="The decisions service did not respond." code="GET /api/decisions" onRetry={reload} />
                : <EmptyState title="No decision selected" body="Pick a candidate on the left to review the AI recommendation and record your decision." />}
            </div>
          ) : (() => {
            const rec = cur.aiRecommendation;
            const recMeta = rec ? AI_REC[rec.type] : null;
            const conf = rec?.confidence ?? 0;
            const lowConf = !!rec && conf < 0.7;
            const st = DEC_STATUS[cur.status];
            const actState = act[cur.id] ?? {};
            return (
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                  <span className="mono" style={{ width: 48, height: 48, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 16 }}>{initials(cur.candidateId)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>{cur.candidateId}</h2>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>Requisition <span className="mono">{cur.requisitionId || "unassigned"}</span></div>
                  </div>
                </div>

                {/* status flow */}
                <div style={{ padding: "18px 22px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", marginBottom: 18, boxShadow: "var(--e1)" }}>
                  <StatusFlow status={cur.status} />
                </div>

                {/* AI recommendation, advisory only */}
                <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "linear-gradient(120deg, var(--c-ai-tint), transparent 70%)", padding: 18, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <Pill icon="sparkles" tone="var(--c-on-ai)" bg="var(--c-ai)">AI recommendation - advisory</Pill>
                    {recMeta ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 13, fontWeight: 700, color: recMeta.tone }}><Icon name={recMeta.icon} size={15} />{recMeta.label}</span>
                        <Pill mono tone={lowConf ? "var(--c-warn)" : "var(--c-ai-ink)"} bg={lowConf ? "var(--c-warn-tint)" : "var(--c-ai-tint)"}>conf {conf.toFixed(2)}</Pill>
                      </div>
                    ) : (
                      <Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)">no recommendation</Pill>
                    )}
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55 }}>
                    {recMeta
                      ? `The screening agent suggests ${recMeta.label.toLowerCase()} for this candidate. This is advisory only. Review the evidence and record your own decision below.`
                      : "No AI recommendation is attached to this decision. Use your own judgement and record a decision below."}
                  </p>
                  {cur.reasonCode && (
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <div style={{ flex: 1, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px solid var(--c-line)" }}>
                        <div style={{ fontSize: 11, color: "var(--c-ink-3)", fontWeight: 600 }}>Flagged for</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-ai-ink)" }}>{REASON_LABEL[cur.reasonCode] ?? cur.reasonCode}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* human approval gate */}
                {cur.status === "PENDING_APPROVAL" ? (
                  <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                    <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center" }}><Icon name="users" size={15} /></span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Your approval is required</div>
                        <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>The decision is yours. The AI cannot approve, send, or reject on its own.</div>
                      </div>
                    </div>

                    {rec?.type === "REJECT" && lowConf && (
                      <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, var(--c-warn) 28%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
                        <Icon name="flag" size={14} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
                        <span><b style={{ color: "var(--c-ink)" }}>Resist rubber-stamping.</b> The model is only {Math.round(conf * 100)}% confident on a reject. Review the evidence yourself before upholding it.</span>
                      </div>
                    )}

                    {actState.error && (
                      <div style={{ margin: "12px 0", padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", fontSize: 12, color: "var(--c-danger)", display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.45 }}>
                        <Icon name="flag" size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>{actState.error}</span>
                      </div>
                    )}

                    {confirm ? (
                      <div style={{ marginTop: 14, padding: 14, borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)" }}>
                        <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4 }}>Confirm: uphold the reject for {cur.candidateId}?</div>
                        <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-ink-2)" }}>You are recording a human rejection. This is final and logged to the audit trail with your name.</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back and review</Btn>
                          <Btn variant="danger" icon="x" onClick={() => decide(cur, "REJECT")}>{actState.busy ? "Recording..." : "Yes, I reviewed, reject"}</Btn>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
                        <Btn variant="primary" icon="check" onClick={() => decide(cur, "HIRE")}>{actState.busy ? "Recording..." : "Approve hire"}</Btn>
                        <Btn variant="danger" icon="x" onClick={() => (rec?.type === "REJECT" ? setConfirm(true) : decide(cur, "REJECT"))}>Reject</Btn>
                        <Btn variant="soft" icon="eye" onClick={() => decide(cur, "HOLD")}>Hold</Btn>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--e1)" }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", color: st.tone, background: st.bg }}><Icon name={st.icon} size={18} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{st.label}{cur.decidedBy ? ` by ${cur.decidedBy}` : ""}</div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{ago(cur.createdAt)} ago - recorded to audit trail</div>
                    </div>
                    {cur.status === "SENT" && <Pill icon="clock" tone="var(--c-info)" bg="var(--c-info-tint)">awaiting candidate</Pill>}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
