"use client";
// app/(dashboard)/hitl/[id]/page.tsx - EXACT Claude Design "Aurora" layout.
// Single-candidate human-in-the-loop review: the expanded detail / decision
// panel for one queue item. Reproduces claude-design/screen-hitl.jsx (the
// right-hand evidence + resolution pane) and wires it to the real gateway:
// getVerdict(id) for the AI verdict, recordDecision (+ a best-effort resolve
// POST) for the human decision. The list itself lives at /hitl.
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, ScoreRing, Confidence, StatusBadge } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getVerdict, recordDecision } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch, DecisionType } from "@/lib/types";

const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<ScreeningResult, string> = { PASS: "var(--c-ok)", REVIEW: "var(--c-warn)", FAIL: "var(--c-danger)" };

// Structured, audit-logged reason codes (the prototype's REASON_CODES).
const REASON_CODES = [
  "Strong evidence",
  "Edge case, judgement call",
  "Insufficient evidence",
  "Policy exception",
  "Bias / fairness concern",
];

type Verb = "Approved" | "Overridden" | "Rejected";

// Best-effort gateway POST for the human resolution. Mirrors lib/api's raw()
// but stays inline here so we do not touch shared files. Never throws to the UI.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function resolveOnGateway(id: string, status: "APPROVED" | "REJECTED", reason?: string): Promise<void> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  await fetch(`${API_BASE}/agents/hitl/${id}/resolve`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify({ status, ...(reason ? { resolution: { reason } } : {}) }),
  });
}

export default function HitlDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const fetcher = useCallback(() => getVerdict(id), [id]);
  const { data, loading, error, reload } = useData<ScreeningVerdict>(fetcher, [id]);
  // toVerdict never returns null; treat a verdict with no real identity as empty.
  const v = data && (data.id || data.requisitionId || data.requirements.length > 0 || data.summary !== "No summary provided.") ? data : null;

  const [code, setCode] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<Verb | null>(null);
  const [submitting, setSubmitting] = useState<Verb | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  // Reset transient decision state whenever the reviewed item changes.
  useEffect(() => { setCode(null); setConfirm(false); setDone(null); setSubmitting(null); setFailed(null); }, [id]);

  const isDecline = v ? v.result === "FAIL" : false;
  const lowConf = v ? v.confidence < 0.7 : false;

  // Record the human decision: typed recordDecision + a best-effort resolve POST.
  const resolve = useCallback(
    async (verb: Verb, decision: DecisionType, gatewayStatus: "APPROVED" | "REJECTED") => {
      if (!id) return;
      setSubmitting(verb);
      setFailed(null);
      try {
        await recordDecision({ id, type: decision });
        try { await resolveOnGateway(id, gatewayStatus, code ?? undefined); } catch { /* resolve is best-effort */ }
        setDone(verb);
        setConfirm(false);
      } catch {
        setFailed("Could not record the decision. The decisions service did not respond. Please try again.");
      } finally {
        setSubmitting(null);
      }
    },
    [id, code]
  );

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* back link */}
      <a
        href="/hitl"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 16 }}
      >
        <Icon name="chevR" size={15} style={{ transform: "rotate(180deg)" }} /> Back to review queue
      </a>

      {loading && (
        <div className="grid gap-4" aria-busy="true">
          <Skeleton className="h-9 w-72 rounded-[10px]" />
          <Skeleton className="h-16 rounded-[14px]" />
          <Skeleton className="h-56 rounded-[16px]" />
          <Skeleton className="h-40 rounded-[16px]" />
        </div>
      )}

      {error && (
        <ErrorState
          title="Could not load this review"
          body="The screening service did not return this verdict."
          code={`GET /api/screening/${id}`}
          onRetry={reload}
        />
      )}

      {v === null && !loading && !error && (
        <EmptyState
          title="Nothing to review here"
          body="This checkpoint has no verdict attached, or it has already been resolved."
          actions={<a href="/hitl"><Btn variant="primary" icon="enter">Back to queue</Btn></a>}
        />
      )}

      {v && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* candidate header */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
              {id && <Pill mono>{id.slice(0, 8)}</Pill>}
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{v.candidateId}</h1>
              <StatusBadge kind={KIND[v.result]} />
            </div>
            <div style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", display: "inline-flex", alignItems: "center", gap: 7 }}>
              <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">{v.agent}</Pill>
              <span>flagged this verdict for a human.</span>
            </div>
          </div>

          {/* why this is a checkpoint */}
          <div
            style={{
              padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)",
              border: "1px solid color-mix(in oklab, var(--c-ai) 24%, transparent)", display: "flex", gap: 11, alignItems: "center",
            }}
          >
            <Icon name="shield" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>
                {lowConf ? "Low model confidence, human verification required" : "Exception routed for human verification"}
              </div>
              <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 1 }}>
                This checkpoint exists because a human, not the model, must make this call.
              </div>
            </div>
          </div>

          {/* AI verdict: score + confidence */}
          <div
            style={{
              borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)",
              boxShadow: "var(--e1)", overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)" }} /> AI verdict
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "center", padding: "18px" }}>
              <ScoreRing value={v.score} size={92} band={BAND[v.result]} label="match" />
              <Confidence value={v.confidence} />
            </div>
          </div>

          {/* requirement findings, AI-cited evidence */}
          <div
            style={{
              borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)",
              boxShadow: "var(--e1)", overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="listChecks" size={15} /> Requirement findings
            </div>
            {v.requirements.length === 0 ? (
              <div style={{ padding: "16px 18px", fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>
                No structured requirement findings were attached to this verdict.
              </div>
            ) : (
              <div>
                {v.requirements.map((r: RequirementMatch, i) => {
                  const tone = r.met === true ? ["var(--c-ok)", "var(--c-ok-tint)", "check"]
                    : r.met === "partial" ? ["var(--c-warn)", "var(--c-warn-tint)", "eye"]
                    : ["var(--c-danger)", "var(--c-danger-tint)", "x"];
                  const [tc, tb, ic] = tone;
                  return (
                    <div
                      key={`${r.requirement}-${i}`}
                      style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 12, padding: "13px 18px", borderTop: i ? "1px solid var(--c-line)" : "none" }}
                    >
                      <span style={{ width: 26, height: 26, borderRadius: "var(--r-sm)", display: "grid", placeItems: "center", flexShrink: 0, color: tc, background: tb }}>
                        <Icon name={ic} size={15} stroke={2.2} />
                      </span>
                      <div>
                        <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink)" }}>{r.requirement}</div>
                        {r.evidence && (
                          <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 3, lineHeight: 1.5 }}>
                            <span style={{ color: "var(--c-ink-3)", fontWeight: 600 }}>Evidence: </span>{r.evidence}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* reasoning / why panel */}
          <div
            style={{
              borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)",
              boxShadow: "var(--e1)", overflow: "hidden",
            }}
          >
            <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
              <Icon name="cpu" size={15} /> Why the agent decided this
            </div>
            <div style={{ padding: "14px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 6 }}>
                Agent reasoning
              </div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink)", lineHeight: 1.55 }}>{v.summary}</div>
            </div>
            {v.reasoningTrace && v.reasoningTrace.length > 0 && (
              <div style={{ padding: "8px 18px 16px", borderTop: "1px solid var(--c-line)", background: "var(--c-ai-tint)" }}>
                {v.reasoningTrace.map((st, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderTop: i ? "1px solid color-mix(in oklab, var(--c-ai) 12%, transparent)" : "none" }}
                  >
                    <Icon name="check" size={13} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{st.step}</span>
                    <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>· {st.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* human decision */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Your decision</span>
              <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Pick a structured reason, it is logged to the audit trail</span>
            </div>

            {/* reason codes */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
              {REASON_CODES.map((rc) => (
                <button
                  key={rc}
                  type="button"
                  onClick={() => setCode(rc)}
                  disabled={!!done}
                  style={{
                    fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: done ? "default" : "pointer",
                    border: "1px solid", borderColor: code === rc ? "transparent" : "var(--c-line-2)",
                    background: code === rc ? "var(--c-brand-tint)" : "var(--c-surface)",
                    color: code === rc ? "var(--c-brand-ink)" : "var(--c-ink-2)", transition: "all var(--t-fast)",
                    opacity: done && code !== rc ? 0.55 : 1,
                  }}
                >
                  {rc}
                </button>
              ))}
            </div>

            {done ? (
              <div
                style={{
                  padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-ok-tint)",
                  border: "1px solid color-mix(in oklab, var(--c-ok) 30%, transparent)", display: "flex", gap: 10, alignItems: "center",
                }}
              >
                <Icon name="check" size={18} style={{ color: "var(--c-ok)" }} />
                <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                  Resolved, <b>{done}</b>{code ? " · " + code : ""}. Logged to the audit trail.
                </span>
              </div>
            ) : confirm ? (
              <div
                style={{
                  padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)",
                  border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4, display: "flex", gap: 7, alignItems: "center" }}>
                  <Icon name="flag" size={15} style={{ color: "var(--c-danger)" }} /> Uphold the AI&apos;s call for {v.candidateId}?
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>
                  You are recording a human decision that ends this candidate&apos;s path. Confirm you reviewed the evidence and reasoning, not just the AI summary.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back</Btn>
                  <Btn variant="danger" icon="check" onClick={() => resolve("Rejected", "REJECT", "REJECTED")}>
                    {submitting === "Rejected" ? "Recording..." : "I reviewed, confirm reject"}
                  </Btn>
                </div>
              </div>
            ) : (
              <div>
                {isDecline && (
                  <div
                    style={{
                      marginBottom: 11, padding: "10px 13px", borderRadius: "var(--r)",
                      background: code ? "var(--c-ok-tint)" : "var(--c-warn-tint)",
                      border: "1px solid color-mix(in oklab, " + (code ? "var(--c-ok)" : "var(--c-warn)") + " 26%, transparent)",
                      fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center",
                    }}
                  >
                    <Icon name={code ? "check" : "flag"} size={14} style={{ color: code ? "var(--c-ok)" : "var(--c-warn)", flexShrink: 0 }} />
                    {code
                      ? "A reason is set, you can resolve this AI-driven decline."
                      : "Anti-rubber-stamp: pick a reason before resolving an AI-driven decline."}
                  </div>
                )}

                {failed && (
                  <div
                    style={{
                      marginBottom: 11, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)",
                      border: "1px solid color-mix(in oklab, var(--c-danger) 26%, transparent)", fontSize: 12,
                      color: "var(--c-danger)", display: "flex", gap: 8, alignItems: "center",
                    }}
                  >
                    <Icon name="flag" size={14} style={{ flexShrink: 0 }} /> {failed}
                  </div>
                )}

                {(() => {
                  const gated = isDecline && !code;
                  const busy = submitting !== null;
                  return (
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                      <Btn
                        variant="primary"
                        icon="check"
                        onClick={() => (gated || busy ? null : resolve("Approved", "HIRE", "APPROVED"))}
                        style={{ opacity: gated || busy ? 0.45 : 1, pointerEvents: gated || busy ? "none" : "auto" }}
                      >
                        {submitting === "Approved" ? "Recording..." : "Approve"}
                        <kbd className="mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>A</kbd>
                      </Btn>
                      <Btn
                        variant="soft"
                        icon="copy"
                        onClick={() => (busy ? null : resolve("Overridden", "HOLD", "APPROVED"))}
                        style={{ opacity: busy ? 0.45 : 1, pointerEvents: busy ? "none" : "auto" }}
                      >
                        {submitting === "Overridden" ? "Recording..." : "Override"}
                        <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>O</kbd>
                      </Btn>
                      <Btn
                        variant="danger"
                        icon="x"
                        onClick={() => (busy ? null : isDecline ? setConfirm(true) : resolve("Rejected", "REJECT", "REJECTED"))}
                        style={{ opacity: busy ? 0.45 : 1, pointerEvents: busy ? "none" : "auto" }}
                      >
                        {submitting === "Rejected" ? "Recording..." : "Reject"}
                        <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>R</kbd>
                      </Btn>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
