"use client";
// app/(dashboard)/hitl/page.tsx, VERBATIM port of claude-design/screen-hitl.jsx,
// the human-in-the-loop review queue (evidence pack + reason codes). Exact
// master-detail markup: left = the queue with a live SLA countdown, right = the
// evidence pack (Agent output + why-flagged), reasoning trace, structured reason
// codes, and the anti-rubber-stamp resolve controls. Every palette var() is the
// --c-* companion. Wired to the real gateway via listReviewQueue + resolveReview
// (getReviewItem hydrates the trace for the selected item); mock arrays replaced.
import { useState, useEffect } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listReviewQueue, getReviewItem, resolveReview } from "@/lib/api";
import type { ReviewItem, ReviewReasonCode } from "@/lib/types";

// Structured reason codes, logged to the audit trail (verbatim from the prototype).
const REASON_CODES = [
  "Agree with AI", "Disagree, evidence weak", "Insufficient data", "Domain mismatch",
  "Bias concern", "Policy exception", "Needs more interview signal", "Escalate to compliance",
];

// Reason-code -> the checkpoint copy the prototype hardcoded per HITL item, so the real
// queue reads like the designed one (kind drives the decline gate via the regex below).
const REASON_META: Record<ReviewReasonCode, { kind: string; risk: string }> = {
  LOW_CONFIDENCE: { kind: "Screening, escalation", risk: "Advisory verdict, human decides" },
  ADVERSE_IMPACT_FLAG: { kind: "Bias flag", risk: "Compliance, four-fifths review" },
  POLICY_OVERRIDE: { kind: "Offer approval", risk: "Out-of-band exception flagged" },
  MISSING_EVIDENCE: { kind: "Resume verification", risk: "Possible inconsistency" },
  CANDIDATE_APPEAL: { kind: "Screening, rejection review", risk: "No solely-automated rejection, human required" },
};
function reasonMeta(code: ReviewReasonCode) {
  return REASON_META[code] ?? { kind: String(code).replace(/_/g, " ").toLowerCase(), risk: "A human, not the model, must make this call." };
}

// Live SLA countdown derived from slaDueAt, mirroring the prototype's it.sla / it.slaTone.
type Sla = { sla: string; slaTone: "ok" | "warn" | "danger" };
function slaFor(iso: string, now: number): Sla {
  const ms = new Date(iso).getTime() - now;
  if (!isFinite(ms)) return { sla: "No SLA", slaTone: "ok" };
  const mins = Math.max(0, Math.round(Math.abs(ms) / 60000));
  const human = mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.round(mins / 60)}h` : `${Math.round(mins / 1440)}d`;
  if (ms < 0) return { sla: `Overdue ${human}`, slaTone: "danger" };
  if (ms < 2 * 3600000) return { sla: `Due in ${human}`, slaTone: "warn" };
  return { sla: `Due in ${human}`, slaTone: "ok" };
}
function priorityFor(slaTone: Sla["slaTone"], isDecline: boolean): "High" | "Medium" {
  return slaTone === "danger" || isDecline ? "High" : "Medium";
}

export default function HitlPage() {
  const { data, loading, error, reload } = useData<ReviewItem[]>(listReviewQueue);
  const items = data ?? [];

  const [sel, setSel] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [trace, setTrace] = useState(false);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState(false);
  // Ticking clock so the SLA countdown counts down live (prototype showed it static).
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);

  // Seed + keep the selection valid as the queue loads.
  useEffect(() => {
    if (items.length && (sel === null || !items.some((i) => i.id === sel))) setSel(items[0].id);
  }, [items, sel]);

  const cur = items.find((i) => i.id === sel) ?? null;
  const slaTone: Record<string, [string, string]> = {
    ok: ["var(--c-ok)", "var(--c-ok-tint)"], warn: ["var(--c-warn)", "var(--c-warn-tint)"], danger: ["var(--c-danger)", "var(--c-danger-tint)"],
  };
  const resolve = (verb: string) => {
    if (!cur) return;
    setDone((d) => ({ ...d, [sel as string]: verb }));
    setConfirm(false);
    const result = /reject|escalat/i.test(verb) ? "FAIL" : "PASS";
    void resolveReview(cur.id, { result, note: code ? `${verb}, ${code}` : verb });
  };
  useEffect(() => { setCode(null); setTrace(false); setConfirm(false); }, [sel]);

  // Hydrate the selected item's reasoning trace by id (the list verdict may be partial).
  const detail = useData<ReviewItem | null>(() => (sel ? getReviewItem(sel) : Promise.resolve(null)), [sel]);
  const traceSteps = detail.data?.verdict?.reasoningTrace ?? cur?.verdict?.reasoningTrace ?? [];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18, alignItems: "start" }} aria-busy="true">
          <div style={{ display: "grid", gap: 12 }}>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[14px]" />)}</div>
          <Skeleton className="h-[520px] rounded-[18px]" />
        </div>
      )}

      {error && <ErrorState title="Could not load the review queue" body="The HITL service did not respond." code="GET /api/agents/hitl" onRetry={reload} />}

      {data && items.length === 0 && (
        <EmptyState title="You are all caught up" body="Nothing is waiting on a human right now. Flagged verdicts arrive here with a full evidence pack." />
      )}

      {data && items.length > 0 && cur && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "100%", minHeight: 0 }}>
          {/* queue */}
          <aside style={{ borderRight: "1px solid var(--c-line)", overflowY: "auto", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
            <div style={{ padding: "18px 18px 12px", position: "sticky", top: 0, background: "var(--c-bg)", zIndex: 2, borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Review queue</h1>
                <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">AI checkpoints</Pill>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.4 }}>Every machine decision that needs a human passes through here. Resolve fast, but never rubber-stamp.</p>
            </div>
            {items.map((it) => {
              const meta = reasonMeta(it.reasonCode);
              const isDeclineItem = /reject|escalation/i.test(meta.kind);
              const { sla, slaTone: tone } = slaFor(it.slaDueAt, now);
              const priority = priorityFor(tone, isDeclineItem);
              const conf = it.verdict?.confidence ?? 0;
              const agent = it.verdict?.agent || "agent";
              const who = it.candidateId || "Candidate";
              const role = it.requisitionId || "Requisition";
              const [tc, tb] = slaTone[tone];
              const isDone = done[it.id];
              return (
                <button key={it.id} onClick={() => setSel(it.id)} style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--c-line)", cursor: "pointer",
                  background: sel === it.id ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t-fast)", position: "relative", opacity: isDone ? 0.6 : 1 }}
                  onMouseEnter={e => { if (sel !== it.id) e.currentTarget.style.background = "var(--c-surface-2)"; }} onMouseLeave={e => { if (sel !== it.id) e.currentTarget.style.background = "transparent"; }}>
                {sel === it.id && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--c-brand)", borderRadius: "0 3px 3px 0" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11, fontWeight: 700, color: priority === "High" ? "var(--c-danger)" : "var(--c-ink-3)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: 99, background: priority === "High" ? "var(--c-danger)" : "var(--c-ink-3)" }} />{priority}
                  </span>
                  <Pill mono tone={tc} bg={tb} icon="clock">{sla}</Pill>
                </div>
                <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginTop: 7 }}>{meta.kind}</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 1 }}>{who} · {role}</div>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8 }}>
                  <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 10 }}>{agent}</Pill>
                  {isDone ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)" style={{ fontSize: 10 }}>{isDone}</Pill>
                    : <span className="mono" style={{ fontSize: 10.5, color: conf < 0.7 ? "var(--c-warn)" : "var(--c-ink-3)" }}>conf {conf.toFixed(2)}</span>}
                </div>
              </button>
              );
            })}
          </aside>

          {/* evidence pack + resolution */}
          <div style={{ overflowY: "auto", padding: "26px 30px 40px" }}>
            <div style={{ maxWidth: 760, margin: "0 auto" }}>
              {(() => {
                const meta = reasonMeta(cur.reasonCode);
                const isDecline = /reject|escalation/i.test(meta.kind);
                const conf = cur.verdict?.confidence ?? 0;
                const who = cur.candidateId || "Candidate";
                const role = cur.requisitionId || "Requisition";
                const why = cur.verdict?.summary || "Confidence is below the auto-advance threshold, so this verdict is routed to a human.";
                const gated = isDecline && !(reviewed[sel as string] && code);
                return (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <Pill mono>{cur.id}</Pill>
                      <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{meta.kind}</h2>
                    </div>
                    <div style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)" }}>{who} · {role}</div>

                    {/* risk banner */}
                    <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 24%, transparent)", display: "flex", gap: 11, alignItems: "center" }}>
                      <Icon name="shield" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
                      <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>{meta.risk}</div>
                        <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 1 }}>This checkpoint exists because a human, not the model, must make this call.</div></div>
                    </div>

                    {/* evidence pack */}
                    <div style={{ marginTop: 18, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
                      <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}><Icon name="scroll" size={15} /> Evidence pack</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                        {[["Agent output", why], ["Why it was flagged", "Confidence " + conf.toFixed(2) + (conf < 0.7 ? ", below the 0.70 auto-advance threshold." : ", exception rule triggered.")]].map(([t, b], i) => (
                          <div key={t} style={{ padding: "14px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 6 }}>{t}</div>
                            <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink)", lineHeight: 1.55 }}>{b}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "12px 18px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 8 }}>
                        <a href={`/hitl/${cur.id}`}><Btn variant="soft" size="sm" icon="eye" onClick={() => setReviewed(r => ({ ...r, [sel as string]: true }))}>Open full verdict</Btn></a>
                        <Btn variant="soft" size="sm" icon="cpu" onClick={() => { setTrace(t => !t); setReviewed(r => ({ ...r, [sel as string]: true })); }}>{trace ? "Hide" : "View"} reasoning trace</Btn>
                        {reviewed[sel as string] && <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)" style={{ marginLeft: "auto", alignSelf: "center" }}>evidence reviewed</Pill>}
                      </div>
                      {trace && (
                        <div style={{ padding: "8px 18px 16px", borderTop: "1px solid var(--c-line)", background: "var(--c-ai-tint)", animation: "rise .25s var(--ease-out)" }}>
                          {detail.loading && traceSteps.length === 0 && <div style={{ padding: "10px 0", fontSize: 12, color: "var(--c-ink-3)" }}>Loading reasoning trace...</div>}
                          {!detail.loading && traceSteps.length === 0 && <div style={{ padding: "10px 0", fontSize: 12, color: "var(--c-ink-3)" }}>No reasoning trace was recorded for this verdict.</div>}
                          {traceSteps.map((st, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderTop: i ? "1px solid color-mix(in oklab, var(--c-ai) 12%, transparent)" : "none" }}>
                              <Icon name="check" size={13} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{st.step}</span>
                              <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>· {st.detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* resolution */}
                    <div style={{ marginTop: 18 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Your decision</span>
                        <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Pick a structured reason, it is logged to the audit trail</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                        {REASON_CODES.map(rc => (
                          <button key={rc} onClick={() => setCode(rc)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer",
                            border: "1px solid", borderColor: code === rc ? "transparent" : "var(--c-line-2)", background: code === rc ? "var(--c-brand-tint)" : "var(--c-surface)", color: code === rc ? "var(--c-brand-ink)" : "var(--c-ink-2)", transition: "all var(--t-fast)" }}>{rc}</button>
                        ))}
                      </div>
                      {done[sel as string] ? (
                        <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-ok-tint)", border: "1px solid color-mix(in oklab, var(--c-ok) 30%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
                          <Icon name="check" size={18} style={{ color: "var(--c-ok)" }} />
                          <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Resolved, <b>{done[sel as string]}</b>{code ? " · " + code : ""}. Logged to audit trail.</span>
                        </div>
                      ) : confirm ? (
                        <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)" }}>
                          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4, display: "flex", gap: 7, alignItems: "center" }}><Icon name="flag" size={15} style={{ color: "var(--c-danger)" }} /> Uphold the AI call for {who}?</div>
                          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>You are recording a human decision that ends this candidate path. Confirm you reviewed the evidence and reasoning, not just the AI summary.</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back</Btn>
                            <Btn variant="danger" icon="check" onClick={() => resolve("Approved (reviewed)")}>I reviewed, confirm</Btn>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {isDecline && (
                            <div style={{ marginBottom: 11, padding: "10px 13px", borderRadius: "var(--r)", background: reviewed[sel as string] && code ? "var(--c-ok-tint)" : "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, " + (reviewed[sel as string] && code ? "var(--c-ok)" : "var(--c-warn)") + " 26%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
                              <Icon name={reviewed[sel as string] && code ? "check" : "flag"} size={14} style={{ color: reviewed[sel as string] && code ? "var(--c-ok)" : "var(--c-warn)", flexShrink: 0 }} />
                              {reviewed[sel as string] && code ? "Evidence reviewed and a reason is set, you can resolve." : "Anti-rubber-stamp: open the evidence/trace and pick a reason before resolving an AI-driven decline."}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", opacity: 1 }}>
                            {(() => { return (<>
                              <Btn variant="primary" icon="check" onClick={() => gated ? null : (isDecline ? setConfirm(true) : resolve("Approved"))} style={{ opacity: gated ? .45 : 1, pointerEvents: gated ? "none" : "auto" }}>Approve <kbd className="mono" style={{ fontSize: 10, opacity: .7, marginLeft: 4 }}>A</kbd></Btn>
                              <Btn variant="soft" icon="copy" onClick={() => resolve("Edited & approved")}>Edit <kbd className="mono" style={{ fontSize: 10, opacity: .6, marginLeft: 4 }}>E</kbd></Btn>
                              <Btn variant="danger" icon="x" onClick={() => resolve("Rejected")}>Reject <kbd className="mono" style={{ fontSize: 10, opacity: .6, marginLeft: 4 }}>R</kbd></Btn>
                              <Btn variant="outlineAi" icon="arrowUpRight" onClick={() => resolve("Escalated")}>Escalate <kbd className="mono" style={{ fontSize: 10, opacity: .6, marginLeft: 4 }}>X</kbd></Btn>
                            </>); })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
