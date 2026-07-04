"use client";
// app/(dashboard)/hitl/[id]/page.tsx, EXACT Claude Design "Aurora" single-item
// human-review detail (the expanded view of one queue item from
// claude-design/screen-hitl.jsx). Candidate header + AI verdict (ScoreRing +
// Confidence vs 0.70 + per-requirement findings with cited evidence), the
// reasoning/why panel, and the structured human decision (approve / edit /
// reject / escalate) with reason codes and the anti-rubber-stamp gate. Matches
// the just-shipped rich list page (../page.tsx). Wired to the real verdict via
// getVerdict(id); decisions persist best-effort. Nothing is fabricated.
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, ScoreRing, Confidence, StatusBadge, SectionCard } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getVerdict, recordDecision } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult, DecisionType } from "@/lib/types";

// Structured reason codes, logged to the audit trail (verbatim from the prototype).
const REASON_CODES = [
  "Agree with AI", "Disagree, evidence weak", "Insufficient data", "Domain mismatch",
  "Bias concern", "Policy exception", "Needs more interview signal", "Escalate to compliance",
];

// Per-result score band for the verdict ring (mirrors the list page).
const BAND: Record<ScreeningResult, string> = { PASS: "var(--c-ok)", REVIEW: "var(--c-warn)", FAIL: "var(--c-danger)" };

// Result -> the human checkpoint reading: a label, a risk note, and whether this
// is a decline/escalation path (which arms the anti-rubber-stamp gate).
function checkpoint(v: ScreeningVerdict): { kind: string; risk: string; decline: boolean } {
  if (v.result === "FAIL") return { kind: "AI-flagged rejection", risk: "No solely-automated rejection, human required", decline: true };
  if (v.confidence < 0.7) return { kind: "Low-confidence verdict", risk: "Advisory verdict, human decides", decline: false };
  return { kind: "Verdict review", risk: "Advisory verdict, human decides", decline: false };
}

// The four resolve verbs map to the real DecisionType enum (HIRE | REJECT | HOLD).
const VERB_TYPE: Record<string, DecisionType> = {
  "Approved": "HIRE", "Approved (reviewed)": "HIRE", "Edited & approved": "HIRE",
  "Rejected": "REJECT", "Escalated": "HOLD",
};

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useData<ScreeningVerdict>(() => getVerdict(id), [id]);

  const [code, setCode] = useState<string | null>(null);
  const [trace, setTrace] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Reset transient resolution UI whenever a different item is opened.
  useEffect(() => { setCode(null); setTrace(false); setReviewed(false); setConfirm(false); setDone(null); setFailed(false); }, [id]);

  const meta = useMemo(() => (data ? checkpoint(data) : null), [data]);

  const resolve = async (verb: string) => {
    if (!data) return;
    setConfirm(false);
    setFailed(false);
    setDone(verb);
    // Persist the human decision via the real HITL resolution route
    // (POST /api/hitl/:id/decision). The route param id is the HitlCheckpoint id;
    // the structured reason code rides along as the decision comment.
    try {
      await recordDecision({
        checkpointId: id,
        candidateId: data.candidateId,
        requisitionId: data.requisitionId,
        type: VERB_TYPE[verb] ?? "HOLD",
        reasonCode: code as never,
      });
    } catch {
      // Surface a graceful inline note; the local resolution still stands for the reviewer.
      setFailed(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* back link, present in every state so navigation never disappears */}
      <a href="/hitl" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 14, textDecoration: "none" }}>
        <Icon name="chevsL" size={15} /> Back to review queue
      </a>

      {loading && (
        <div className="grid gap-4" aria-busy="true">
          <Skeleton className="h-[120px] rounded-[18px]" />
          <Skeleton className="h-[300px] rounded-[18px]" />
          <Skeleton className="h-[180px] rounded-[18px]" />
        </div>
      )}

      {error && (
        <ErrorState title="Review item not found" body="The verdict behind this checkpoint could not be loaded." code={`GET /api/screening/${id}`} onRetry={reload} />
      )}

      {data && !meta && (
        <EmptyState title="Nothing to review" body="This checkpoint has no verdict attached." />
      )}

      {data && meta && (
        <DetailPane
          v={data} meta={meta}
          code={code} setCode={setCode}
          trace={trace} setTrace={setTrace}
          reviewed={reviewed} setReviewed={setReviewed}
          confirm={confirm} setConfirm={setConfirm}
          done={done} failed={failed} resolve={resolve}
        />
      )}
    </div>
  );
}

function DetailPane({
  v, meta, code, setCode, trace, setTrace, reviewed, setReviewed, confirm, setConfirm, done, failed, resolve,
}: {
  v: ScreeningVerdict;
  meta: { kind: string; risk: string; decline: boolean };
  code: string | null; setCode: (c: string | null) => void;
  trace: boolean; setTrace: (fn: (t: boolean) => boolean) => void;
  reviewed: boolean; setReviewed: (v: boolean) => void;
  confirm: boolean; setConfirm: (v: boolean) => void;
  done: string | null; failed: boolean; resolve: (verb: string) => void;
}) {
  const conf = v.confidence ?? 0;
  const isDecline = meta.decline;
  const steps = v.reasoningTrace ?? [];
  const gated = isDecline && !(reviewed && code);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* candidate header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
        <Pill mono>{v.id ?? v.candidateId}</Pill>
        <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{meta.kind}</h1>
        <StatusBadge kind={v.result === "PASS" ? "pass" : v.result === "FAIL" ? "fail" : "review"} />
      </div>
      <div style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)" }}>
        {v.candidateId}{v.requisitionId ? ` · ${v.requisitionId}` : ""}
      </div>

      {/* risk banner */}
      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 24%, transparent)", display: "flex", gap: 11, alignItems: "center" }}>
        <Icon name="shield" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>{meta.risk}</div>
          <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 1 }}>This checkpoint exists because a human, not the model, must make this call.</div>
        </div>
      </div>

      {/* AI verdict: ScoreRing + Confidence + evidence pack */}
      <div style={{ marginTop: 18, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
          <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)" }} /> AI verdict
          <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ marginLeft: "auto" }}>{v.agent || "agent"}</Pill>
        </div>
        <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "16px 18px" }}>
          <ScoreRing value={v.score ?? 0} size={68} band={BAND[v.result] ?? "var(--c-warn)"} label="match" />
          <div style={{ flex: 1, minWidth: 0 }}><Confidence value={conf} /></div>
        </div>

        {/* reasoning / why panel: agent output + why it was flagged */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
          <Icon name="scroll" size={15} /> Evidence pack
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--c-line)" }}>
          {[["Agent output", v.summary || "No summary provided."],
            ["Why it was flagged", "Confidence " + conf.toFixed(2) + (conf < 0.7 ? ", below the 0.70 auto-advance threshold." : ", exception rule triggered.")]].map(([t, b], i) => (
            <div key={t} style={{ padding: "14px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink)", lineHeight: 1.55 }}>{b}</div>
            </div>
          ))}
        </div>

        {/* per-requirement findings, with AI-cited evidence */}
        {v.requirements && v.requirements.length > 0 && (
          <div style={{ padding: "14px 18px", borderTop: "1px solid var(--c-line)", display: "flex", flexDirection: "column", gap: 8 }}>
            {v.requirements.map((r, i) => (
              <div key={i} style={{ borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "10px 13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                  <span>{r.requirement}</span>
                  <span style={{ color: r.met === true ? "var(--c-ok)" : r.met === "partial" ? "var(--c-warn)" : "var(--c-ink-3)" }}>
                    {r.met === true ? "Met" : r.met === "partial" ? "Partial" : "Not met"}
                  </span>
                </div>
                {r.evidence && <div style={{ display: "flex", gap: 6, marginTop: 4, fontSize: 12, color: "var(--c-ink-3)", lineHeight: 1.5 }}><span style={{ color: "var(--c-ai)", fontWeight: 700 }}>AI</span>{r.evidence}</div>}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="soft" size="sm" icon="cpu" onClick={() => { setTrace((t) => !t); setReviewed(true); }}>{trace ? "Hide" : "View"} reasoning trace</Btn>
          {reviewed && <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)" style={{ marginLeft: "auto", alignSelf: "center" }}>evidence reviewed</Pill>}
        </div>
        {trace && (
          <div style={{ padding: "8px 18px 16px", borderTop: "1px solid var(--c-line)", background: "var(--c-ai-tint)", animation: "rise .25s var(--ease-out)" }}>
            {steps.length === 0 && <div style={{ padding: "10px 0", fontSize: 12, color: "var(--c-ink-3)" }}>No reasoning trace was recorded for this verdict.</div>}
            {steps.map((st, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderTop: i ? "1px solid color-mix(in oklab, var(--c-ai) 12%, transparent)" : "none" }}>
                <Icon name="check" size={13} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{st.step}</span>
                <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{"·"} {st.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* the human decision */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Your decision</span>
          <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>Pick a structured reason, it is logged to the audit trail</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
          {REASON_CODES.map((rc) => (
            <button key={rc} onClick={() => setCode(rc)}
              style={{ fontSize: 12, fontWeight: 600, padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid",
                borderColor: code === rc ? "transparent" : "var(--c-line-2)", background: code === rc ? "var(--c-brand-tint)" : "var(--c-surface)", color: code === rc ? "var(--c-brand-ink)" : "var(--c-ink-2)", transition: "all var(--t-fast)" }}>
              {rc}
            </button>
          ))}
        </div>

        {done ? (
          <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: failed ? "var(--c-warn-tint)" : "var(--c-ok-tint)", border: "1px solid color-mix(in oklab, " + (failed ? "var(--c-warn)" : "var(--c-ok)") + " 30%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
            <Icon name={failed ? "flag" : "check"} size={18} style={{ color: failed ? "var(--c-warn)" : "var(--c-ok)" }} />
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
              {failed
                ? <>Recorded locally, <b>{done}</b>{code ? " · " + code : ""}. The audit-trail write did not confirm; retry from the queue if needed.</>
                : <>Resolved, <b>{done}</b>{code ? " · " + code : ""}. Logged to audit trail.</>}
            </span>
          </div>
        ) : confirm ? (
          <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4, display: "flex", gap: 7, alignItems: "center" }}>
              <Icon name="flag" size={15} style={{ color: "var(--c-danger)" }} /> Uphold the AI verdict for {v.candidateId}?
            </div>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>
              You are recording a human decision that ends this candidate&apos;s path. Confirm you reviewed the evidence and reasoning, not just the AI summary.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={() => setConfirm(false)}>Go back</Btn>
              <Btn variant="danger" icon="check" onClick={() => resolve("Approved (reviewed)")}>I reviewed, confirm</Btn>
            </div>
          </div>
        ) : (
          <div>
            {isDecline && (
              <div style={{ marginBottom: 11, padding: "10px 13px", borderRadius: "var(--r)", background: reviewed && code ? "var(--c-ok-tint)" : "var(--c-warn-tint)",
                border: "1px solid color-mix(in oklab, " + (reviewed && code ? "var(--c-ok)" : "var(--c-warn)") + " 26%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
                <Icon name={reviewed && code ? "check" : "flag"} size={14} style={{ color: reviewed && code ? "var(--c-ok)" : "var(--c-warn)", flexShrink: 0 }} />
                {reviewed && code
                  ? "Evidence reviewed and a reason is set, you can resolve."
                  : "Anti-rubber-stamp: open the reasoning trace and pick a reason before resolving an AI-driven decline."}
              </div>
            )}
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
              <Btn variant="primary" icon="check" disabled={gated} onClick={() => (gated ? undefined : isDecline ? setConfirm(true) : resolve("Approved"))}>
                Approve <kbd className="mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>A</kbd>
              </Btn>
              <Btn variant="soft" icon="copy" onClick={() => resolve("Edited & approved")}>
                Edit <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>E</kbd>
              </Btn>
              <Btn variant="danger" icon="x" onClick={() => resolve("Rejected")}>
                Reject <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>R</kbd>
              </Btn>
              <Btn variant="outlineAi" icon="arrowUpRight" onClick={() => resolve("Escalated")}>
                Escalate <kbd className="mono" style={{ fontSize: 10, opacity: 0.6, marginLeft: 4 }}>X</kbd>
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
