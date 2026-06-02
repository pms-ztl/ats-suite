"use client";
// app/(dashboard)/hitl/page.tsx, EXACT Claude Design "Aurora" human-in-the-loop
// review queue (claude-design/screen-hitl.jsx): a master-detail surface where every
// machine decision that needs a human lands. Left = the queue; right = the evidence
// pack (Agent output, why-flagged, ScoreRing + Confidence, reasoning trace) plus the
// structured human resolve actions with the anti-rubber-stamp gate. Wired to the real
// gateway via listReviewQueue/resolveReview; nothing is fabricated.
import { useEffect, useMemo, useState } from "react";
import { Btn, Pill, ScoreRing, Confidence } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listReviewQueue, resolveReview } from "@/lib/api";
import type { ReviewItem, ReviewReasonCode, ScreeningResult } from "@/lib/types";

// Structured reason codes, logged to the audit trail (verbatim from the prototype).
const REASON_CODES = [
  "Agree with AI", "Disagree, evidence weak", "Insufficient data", "Domain mismatch",
  "Bias concern", "Policy exception", "Needs more interview signal", "Escalate to compliance",
];

// Reason-code -> human-readable checkpoint label, risk note, and the decline/escalation
// gate, so the real queue reads like the designed one without inventing per-item copy.
const REASON_META: Record<ReviewReasonCode, { kind: string; risk: string; decline: boolean }> = {
  LOW_CONFIDENCE: { kind: "Low-confidence verdict", risk: "Advisory verdict, human decides", decline: false },
  ADVERSE_IMPACT_FLAG: { kind: "Adverse-impact flag", risk: "Compliance, four-fifths review", decline: false },
  POLICY_OVERRIDE: { kind: "Policy override", risk: "Out-of-band exception flagged", decline: false },
  MISSING_EVIDENCE: { kind: "Missing-evidence review", risk: "Possible inconsistency", decline: false },
  CANDIDATE_APPEAL: { kind: "Candidate appeal", risk: "No solely-automated rejection, human required", decline: true },
};
function reasonMeta(code: ReviewReasonCode) {
  return REASON_META[code] ?? { kind: String(code).replace(/_/g, " ").toLowerCase(), risk: "A human, not the model, must make this call.", decline: false };
}

// SLA -> human label + tone, computed live from slaDueAt (mirrors the prototype's slaTone).
function slaFor(iso?: string): { label: string; tone: "ok" | "warn" | "danger" } {
  if (!iso) return { label: "No SLA", tone: "ok" };
  const ms = new Date(iso).getTime() - Date.now();
  if (!isFinite(ms)) return { label: "No SLA", tone: "ok" };
  const mins = Math.round(Math.abs(ms) / 60000);
  const human = mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.round(mins / 60)}h` : `${Math.round(mins / 1440)}d`;
  if (ms < 0) return { label: `Overdue ${human}`, tone: "danger" };
  if (ms < 2 * 3600000) return { label: `Due in ${human}`, tone: "warn" };
  return { label: `Due in ${human}`, tone: "ok" };
}

const SLA_TONE: Record<"ok" | "warn" | "danger", [string, string]> = {
  ok: ["var(--c-ok)", "var(--c-ok-tint)"],
  warn: ["var(--c-warn)", "var(--c-warn-tint)"],
  danger: ["var(--c-danger)", "var(--c-danger-tint)"],
};

// Per-requirement score band for the verdict ring.
const BAND: Record<ScreeningResult, string> = { PASS: "var(--c-ok)", REVIEW: "var(--c-warn)", FAIL: "var(--c-danger)" };

export default function HitlPage() {
  const { data, loading, error, reload } = useData<ReviewItem[]>(listReviewQueue);

  const [sel, setSel] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, string>>({});
  const [trace, setTrace] = useState(false);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [confirm, setConfirm] = useState(false);

  const items = data ?? [];
  // Seed the selection with the first fetched item, and keep it valid as data loads.
  useEffect(() => {
    if (items.length && (sel === null || !items.some((i) => i.id === sel))) setSel(items[0].id);
  }, [items, sel]);
  // Reset the transient resolution UI whenever the selected item changes.
  useEffect(() => { setCode(null); setTrace(false); setConfirm(false); }, [sel]);

  const cur = useMemo(() => items.find((i) => i.id === sel) ?? null, [items, sel]);

  const resolve = (verb: string) => {
    if (!cur) return;
    setDone((d) => ({ ...d, [cur.id]: verb }));
    setConfirm(false);
    // Persist to the audit trail; PASS upholds the AI verdict, FAIL/escalate overrides it.
    const result = /reject|escalat/i.test(verb) ? "FAIL" : "PASS";
    void resolveReview(cur.id, { result, note: code ? `${verb}, ${code}` : verb });
  };

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {loading && (
        <div className="grid gap-3" style={{ gridTemplateColumns: "380px 1fr" }} aria-busy="true">
          <div className="grid gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[14px]" />)}</div>
          <Skeleton className="h-[520px] rounded-[18px]" />
        </div>
      )}

      {error && (
        <ErrorState title="Could not load the review queue" body="The HITL service did not respond." code="GET /api/agents/hitl" onRetry={reload} />
      )}

      {data && items.length === 0 && (
        <EmptyState title="You're all caught up" body="Nothing is waiting on a human right now. Flagged verdicts arrive here with a full evidence pack." />
      )}

      {data && items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 18, alignItems: "start" }}>
          {/* queue */}
          <aside style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
            <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid var(--c-line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Review queue</h1>
                <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">AI checkpoints</Pill>
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.4 }}>
                Every machine decision that needs a human passes through here. Resolve fast, but never rubber-stamp.
              </p>
            </div>
            {items.map((it) => {
              const sla = slaFor(it.slaDueAt);
              const [tc, tb] = SLA_TONE[sla.tone];
              const meta = reasonMeta(it.reasonCode);
              const isDone = done[it.id];
              const conf = it.verdict?.confidence ?? 0;
              const highPriority = meta.decline || sla.tone === "danger";
              return (
                <button key={it.id} onClick={() => setSel(it.id)}
                  style={{ width: "100%", textAlign: "left", display: "block", padding: "13px 18px", border: "none", borderBottom: "1px solid var(--c-line)", cursor: "pointer",
                    background: sel === it.id ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t-fast)", position: "relative", opacity: isDone ? 0.6 : 1 }}
                  onMouseEnter={(e) => { if (sel !== it.id) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={(e) => { if (sel !== it.id) e.currentTarget.style.background = "transparent"; }}>
                  {sel === it.id && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, background: "var(--c-brand)", borderRadius: "0 3px 3px 0" }} />}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 11, fontWeight: 700, color: highPriority ? "var(--c-danger)" : "var(--c-ink-3)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: highPriority ? "var(--c-danger)" : "var(--c-ink-3)" }} />{highPriority ? "High" : "Normal"}
                    </span>
                    <Pill mono tone={tc} bg={tb} icon="clock">{sla.label}</Pill>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", marginTop: 7 }}>{meta.kind}</div>
                  <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 1 }}>{it.candidateId}{it.requisitionId ? ` · ${it.requisitionId}` : ""}</div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 8 }}>
                    <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 10 }}>{it.verdict?.agent || "agent"}</Pill>
                    {isDone
                      ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)" style={{ fontSize: 10 }}>{isDone}</Pill>
                      : <span className="mono" style={{ fontSize: 10.5, color: conf < 0.7 ? "var(--c-warn)" : "var(--c-ink-3)" }}>conf {conf.toFixed(2)}</span>}
                  </div>
                </button>
              );
            })}
          </aside>

          {/* evidence pack + resolution */}
          {cur && <DetailPane
            cur={cur}
            code={code} setCode={setCode}
            trace={trace} setTrace={setTrace}
            reviewed={reviewed} setReviewed={setReviewed}
            confirm={confirm} setConfirm={setConfirm}
            done={done} resolve={resolve}
          />}
        </div>
      )}
    </div>
  );
}

function DetailPane({
  cur, code, setCode, trace, setTrace, reviewed, setReviewed, confirm, setConfirm, done, resolve,
}: {
  cur: ReviewItem;
  code: string | null; setCode: (c: string | null) => void;
  trace: boolean; setTrace: (fn: (t: boolean) => boolean) => void;
  reviewed: Record<string, boolean>; setReviewed: (fn: (r: Record<string, boolean>) => Record<string, boolean>) => void;
  confirm: boolean; setConfirm: (v: boolean) => void;
  done: Record<string, string>; resolve: (verb: string) => void;
}) {
  const sel = cur.id;
  const v = cur.verdict;
  const meta = reasonMeta(cur.reasonCode);
  const conf = v?.confidence ?? 0;
  const isDecline = meta.decline || /reject|escalat|appeal/i.test(meta.kind);
  const steps = v?.reasoningTrace ?? [];
  const gated = isDecline && !(reviewed[sel] && code);

  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: "26px 30px 32px", minWidth: 0 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
          <Pill mono>{cur.id}</Pill>
          <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{meta.kind}</h2>
        </div>
        <div style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)" }}>{cur.candidateId}{cur.requisitionId ? ` · ${cur.requisitionId}` : ""}</div>

        {/* risk banner */}
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 24%, transparent)", display: "flex", gap: 11, alignItems: "center" }}>
          <Icon name="shield" size={18} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", color: "var(--c-ai-ink)" }}>{meta.risk}</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 1 }}>This checkpoint exists because a human, not the model, must make this call.</div>
          </div>
        </div>

        {/* verdict: ScoreRing + Confidence */}
        <div style={{ marginTop: 18, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)" }} /> AI verdict
            <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ marginLeft: "auto" }}>{v?.agent || "agent"}</Pill>
          </div>
          <div style={{ display: "flex", gap: 22, alignItems: "center", padding: "16px 18px" }}>
            <ScoreRing value={v?.score ?? 0} size={68} band={BAND[v?.result ?? "REVIEW"]} label="match" />
            <div style={{ flex: 1, minWidth: 0 }}><Confidence value={conf} /></div>
          </div>

          {/* evidence pack */}
          <div style={{ padding: "12px 18px", borderTop: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="scroll" size={15} /> Evidence pack
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--c-line)" }}>
            {[["Agent output", v?.summary || "No summary provided."],
              ["Why it was flagged", "Confidence " + conf.toFixed(2) + (conf < 0.7 ? ", below the 0.70 auto-advance threshold." : ", exception rule triggered.")]].map(([t, b], i) => (
              <div key={t} style={{ padding: "14px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink)", lineHeight: 1.55 }}>{b}</div>
              </div>
            ))}
          </div>

          {/* per-requirement evidence */}
          {v?.requirements && v.requirements.length > 0 && (
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
            <a href={`/hitl/${cur.id}`}><Btn variant="soft" size="sm" icon="eye" onClick={() => setReviewed((r) => ({ ...r, [sel]: true }))}>Open full verdict</Btn></a>
            <Btn variant="soft" size="sm" icon="cpu" onClick={() => { setTrace((t) => !t); setReviewed((r) => ({ ...r, [sel]: true })); }}>{trace ? "Hide" : "View"} reasoning trace</Btn>
            {reviewed[sel] && <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)" style={{ marginLeft: "auto", alignSelf: "center" }}>evidence reviewed</Pill>}
          </div>
          {trace && (
            <div style={{ padding: "8px 18px 16px", borderTop: "1px solid var(--c-line)", background: "var(--c-ai-tint)", animation: "rise .25s var(--ease-out)" }}>
              {steps.length === 0 && <div style={{ padding: "10px 0", fontSize: 12, color: "var(--c-ink-3)" }}>No reasoning trace was recorded for this verdict.</div>}
              {steps.map((st, i) => (
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

          {done[sel] ? (
            <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-ok-tint)", border: "1px solid color-mix(in oklab, var(--c-ok) 30%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
              <Icon name="check" size={18} style={{ color: "var(--c-ok)" }} />
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Resolved, <b>{done[sel]}</b>{code ? " · " + code : ""}. Logged to audit trail.</span>
            </div>
          ) : confirm ? (
            <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", marginBottom: 4, display: "flex", gap: 7, alignItems: "center" }}>
                <Icon name="flag" size={15} style={{ color: "var(--c-danger)" }} /> Uphold the AI verdict for {cur.candidateId}?
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
                <div style={{ marginBottom: 11, padding: "10px 13px", borderRadius: "var(--r)", background: reviewed[sel] && code ? "var(--c-ok-tint)" : "var(--c-warn-tint)",
                  border: "1px solid color-mix(in oklab, " + (reviewed[sel] && code ? "var(--c-ok)" : "var(--c-warn)") + " 26%, transparent)", fontSize: 12, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
                  <Icon name={reviewed[sel] && code ? "check" : "flag"} size={14} style={{ color: reviewed[sel] && code ? "var(--c-ok)" : "var(--c-warn)", flexShrink: 0 }} />
                  {reviewed[sel] && code
                    ? "Evidence reviewed and a reason is set, you can resolve."
                    : "Anti-rubber-stamp: open the evidence/trace and pick a reason before resolving an AI-driven decline."}
                </div>
              )}
              <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
                <Btn variant="primary" icon="check" onClick={() => (gated ? undefined : isDecline ? setConfirm(true) : resolve("Approved"))} style={{ opacity: gated ? 0.45 : 1, pointerEvents: gated ? "none" : "auto" }}>
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
    </div>
  );
}
