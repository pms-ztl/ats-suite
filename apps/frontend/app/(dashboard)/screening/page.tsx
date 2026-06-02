"use client";
// app/(dashboard)/screening/page.tsx, EXACT Claude Design "Aurora" screening queue
// (claude-design/screen-screenq.jsx): a result-filtered queue with bulk actions and
// a slide-over verdict panel (ScoreRing + Confidence + per-requirement evidence +
// reasoning trace + a human decision bar). AI is advisory; a human always decides.
// Wired to the real gateway via listScreening + getVerdict.
import { useState, useEffect, useMemo } from "react";
import { Btn, Pill, StatusBadge, ScoreRing, Confidence } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listScreening, getVerdict } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch } from "@/lib/types";

type Kind = "pass" | "review" | "fail";
const KIND: Record<ScreeningResult, Kind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

// derived presentation per result band (advisory recommendation + tone), no data fabricated
const RESULT: Record<Kind, { code: ScreeningResult; tone: string; bg: string; rec: string; recIcon: string; band: string }> = {
  pass: { code: "PASS", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", rec: "Advance", recIcon: "check", band: "Strong match" },
  review: { code: "REVIEW", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", rec: "Human review", recIcon: "eye", band: "Strong potential" },
  fail: { code: "FAIL", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", rec: "Reject", recIcon: "x", band: "Below the bar" },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// per-requirement state, from the real RequirementMatch.met union
function reqState(met: RequirementMatch["met"]): Kind {
  return met === true ? "pass" : met === "partial" ? "review" : "fail";
}
const REQ_ICON: Record<Kind, string> = { pass: "check", review: "eye", fail: "x" };
const REQ_COLOR: Record<Kind, string> = { pass: "var(--c-ok)", review: "var(--c-warn)", fail: "var(--c-danger)" };

function ResultBadge({ kind }: { kind: Kind }) {
  const r = RESULT[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 700, color: r.tone, background: r.bg }}>
      <Icon name={kind === "pass" ? "check" : kind === "review" ? "eye" : "x"} size={12} stroke={2.4} />{r.code}
    </span>
  );
}

type Decision = "advance" | "decline" | "review";

/* slide-over verdict, fetched fresh by id when a row is opened */
function VerdictPanel({ row, onClose, onDecide }: { row: ScreeningVerdict; onClose: () => void; onDecide: (id: string, d: Decision) => void }) {
  const kind = KIND[row.result];
  const r = RESULT[kind];
  const id = row.id ?? row.candidateId;
  const [trace, setTrace] = useState(false);

  // re-fetch the full verdict for the side panel (rule 3: selecting a row shows its detail)
  const detail = useData<ScreeningVerdict>(() => (row.id ? getVerdict(row.id) : Promise.resolve(row)), [row.id]);
  const v = detail.data ?? row;
  const traceSteps = v.reasoningTrace ?? [];

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Screening verdict"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end", background: "color-mix(in oklab, var(--c-bg-deep) 45%, transparent)", animation: "fadein .2s" }}>
      <div style={{ width: "min(580px, 94vw)", height: "100%", background: "var(--c-surface)", borderLeft: "1px solid var(--c-line)", boxShadow: "var(--e3)", display: "flex", flexDirection: "column", animation: "rise .3s var(--ease-out)" }}>
        {/* header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 14 }}>{initials(v.candidateId)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)", letterSpacing: "-0.01em" }}>{v.candidateId}</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{v.agent}{v.requisitionId ? <> · <span className="mono">{v.requisitionId}</span></> : null}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {detail.loading && <div style={{ display: "grid", gap: 12 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[14px]" />)}</div>}
          {detail.error && <ErrorState title="Could not load this verdict" body="The screening service did not respond." code={`GET /api/screening/${row.id ?? ""}`} onRetry={detail.reload} />}

          {!detail.loading && !detail.error && (
            <>
              {/* verdict hero */}
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "linear-gradient(120deg, var(--c-ai-tint), transparent 70%)", padding: 18 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                  <Pill icon="sparkles" tone="var(--c-on-ai)" bg="var(--c-ai)">AI · advisory</Pill>
                  <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">{v.agent}</Pill>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <ScoreRing value={v.score} size={78} band={r.tone} label="match %" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{r.band}</span>
                      <ResultBadge kind={kind} />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>Recommends <b style={{ color: "var(--c-ink)" }}>{r.rec.toLowerCase()}</b>, not final.</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}><Confidence value={v.confidence} /></div>
              </div>

              {/* AI summary */}
              {v.summary && (
                <p style={{ marginTop: 16, fontSize: "var(--fs-sm)", lineHeight: 1.5, color: "var(--c-ink-2)" }}>{v.summary}</p>
              )}

              {/* requirements */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--c-ink-3)", marginBottom: 8 }}>Requirement breakdown</div>
                {v.requirements.length === 0 ? (
                  <EmptyState title="No requirement evidence" body="This verdict did not record per-requirement findings." />
                ) : (
                  <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", overflow: "hidden" }}>
                    {v.requirements.map((req, i) => {
                      const st = reqState(req.met);
                      return (
                        <div key={i} style={{ padding: "11px 14px", borderTop: i ? "1px solid var(--c-line)" : "none", background: "var(--c-surface)" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 10, alignItems: "center" }}>
                            <Icon name={REQ_ICON[st]} size={15} stroke={2.3} style={{ color: REQ_COLOR[st] }} />
                            <span style={{ fontSize: 12.5, fontWeight: 600 }}>{req.requirement}</span>
                            <span className="mono" style={{ fontSize: 10.5, color: st === "pass" ? "var(--c-ok)" : st === "review" ? "var(--c-warn)" : "var(--c-ink-3)", textAlign: "right" }}>
                              {st === "pass" ? "met" : st === "review" ? "partial" : "not met"}
                            </span>
                          </div>
                          {req.evidence && <div style={{ marginLeft: 30, marginTop: 5, fontSize: 11.5, color: "var(--c-ink-3)", lineHeight: 1.45, fontStyle: "italic" }}>↳ {req.evidence}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* trace toggle, only when the verdict carries a reasoning trace */}
              {traceSteps.length > 0 && (
                <>
                  <button onClick={() => setTrace((t) => !t)} style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-ai-tint)", cursor: "pointer", color: "var(--c-ai-ink)", fontWeight: 600, fontSize: 12.5 }}>
                    <Icon name="cpu" size={15} /> Reasoning trace <Icon name="chevD" size={15} style={{ marginLeft: "auto", transform: trace ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
                  </button>
                  {trace && (
                    <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", animation: "rise .25s var(--ease-out)" }}>
                      {traceSteps.map((st, i) => (
                        <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "8px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                          <Icon name="check" size={13} style={{ color: "var(--c-ai)", marginTop: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: 12 }}>
                            <span style={{ fontWeight: 600 }}>{st.step}</span>
                            {st.detail ? <span style={{ color: "var(--c-ink-3)" }}> · {st.detail}</span> : null}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* decision bar, the human is the deciding action */}
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
          <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="users" size={12} /> AI is advisory, your decision is recorded as the deciding action.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="soft" icon="flag" onClick={() => onDecide(id, "review")} style={{ flex: 1, justifyContent: "center" }}>Request review</Btn>
            <Btn variant="danger" icon="x" onClick={() => onDecide(id, "decline")} style={{ flex: 1, justifyContent: "center" }}>Decline</Btn>
            <Btn variant="primary" icon="check" onClick={() => onDecide(id, "advance")} style={{ flex: 1.3, justifyContent: "center" }}>Advance</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLS = "30px 1.6fr 0.9fr 80px 100px 130px 110px 90px";

export default function ScreeningPage() {
  const { data, loading, error, reload } = useData<ScreeningVerdict[]>(listScreening);
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [open, setOpen] = useState<ScreeningVerdict | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [decided, setDecided] = useState<Record<string, Decision>>({});

  const rows = data ?? [];
  const counts = useMemo(() => ({
    all: rows.length,
    pass: rows.filter((rw) => KIND[rw.result] === "pass").length,
    review: rows.filter((rw) => KIND[rw.result] === "review").length,
    fail: rows.filter((rw) => KIND[rw.result] === "fail").length,
  }), [rows]);
  const filtered = filter === "all" ? rows : rows.filter((rw) => KIND[rw.result] === filter);

  const rowId = (rw: ScreeningVerdict) => rw.id ?? rw.candidateId;
  const decide = (id: string, d: Decision) => { setDecided((x) => ({ ...x, [id]: d })); setOpen(null); };
  const toggle = (id: string) => { setSel((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Screening queue</h1>
            <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">candidate-screener</Pill>
          </div>
          <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>
            AI assessments awaiting a human decision · {counts.review} need review before they can advance.
          </p>
        </div>
        <Btn variant="soft" icon="arrowUpRight">Export</Btn>
      </div>

      {/* result filters */}
      <div style={{ display: "flex", gap: 8, margin: "16px 0 12px", flexWrap: "wrap" }}>
        {([["all", "All", "users"], ["pass", "PASS", "check"], ["review", "REVIEW", "eye"], ["fail", "FAIL", "x"]] as const).map(([k, l, ic]) => {
          const active = filter === k;
          const r = k !== "all" ? RESULT[k] : null;
          return (
            <button key={k} onClick={() => setFilter(k)} style={{
              display: "inline-flex", gap: 7, alignItems: "center", padding: "7px 13px", borderRadius: "var(--r-pill)", cursor: "pointer",
              border: "1px solid", borderColor: active ? "transparent" : "var(--c-line-2)",
              background: active ? (r ? r.bg : "var(--c-brand-tint)") : "var(--c-surface)",
              color: active ? (r ? r.tone : "var(--c-brand-ink)") : "var(--c-ink-2)", fontSize: 12.5, fontWeight: 700,
            }}>
              <Icon name={ic} size={14} />{l}<span className="mono" style={{ opacity: 0.7, fontWeight: 600 }}>{counts[k]}</span>
            </button>
          );
        })}
      </div>

      {/* states */}
      {loading && (
        <div style={{ display: "grid", gap: 8 }} aria-busy="true">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-[14px]" />)}</div>
      )}
      {error && <ErrorState title="Could not load screening" body="The screening service did not respond." code="GET /api/screening" onRetry={reload} />}
      {data && filtered.length === 0 && (
        <EmptyState
          title={filter === "all" ? "Nothing to screen yet" : "No matching verdicts"}
          body={filter === "all" ? "When candidates apply, the candidate-screener scores them here for your review." : "No verdicts match this filter. Try another result band."}
        />
      )}

      {/* queue table */}
      {data && filtered.length > 0 && (
        <div style={{ overflowX: "auto", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
          <div style={{ minWidth: 880 }}>
            <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", alignItems: "center" }}>
              <span></span><span>Candidate</span><span>Requisition</span><span>Score</span><span>Result</span><span>Confidence</span><span>Recommended</span><span style={{ textAlign: "right" }}>Status</span>
            </div>
            {filtered.map((row, i) => {
              const kind = KIND[row.result];
              const r = RESULT[kind];
              const id = rowId(row);
              const on = sel.has(id);
              const dec = decided[id];
              const low = row.confidence < 0.7;
              return (
                <div key={id} onClick={() => setOpen(row)} style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "11px 16px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", background: on ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t-fast)" }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <button onClick={(e) => { e.stopPropagation(); toggle(id); }} aria-label="Select row" style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid", borderColor: on ? "var(--c-brand)" : "var(--c-line-strong)", background: on ? "var(--c-brand)" : "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>{on && <Icon name="check" size={12} stroke={3} style={{ color: "var(--c-on-brand)" }} />}</button>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                    <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(row.candidateId)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.candidateId}</div>
                      <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{row.agent}</div>
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-2)" }}>{row.requisitionId || "n/a"}</span>
                  <span className="mono tnum" style={{ fontSize: 16, fontWeight: 700, color: "var(--c-ai-ink)" }}>{row.score}</span>
                  <ResultBadge kind={kind} />
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden", maxWidth: 64, position: "relative" }}>
                      <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: 1, background: "var(--c-line-strong)" }} />
                      <div style={{ height: "100%", width: (row.confidence * 100) + "%", background: low ? "var(--c-warn)" : "var(--c-ai)" }} />
                    </div>
                    <span className="mono" style={{ fontSize: 10.5, color: low ? "var(--c-warn)" : "var(--c-ink-3)" }}>{row.confidence.toFixed(2)}</span>
                  </div>
                  <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: kind === "fail" ? "var(--c-danger)" : kind === "review" ? "var(--c-warn)" : "var(--c-ink-2)" }}>
                    <Icon name={r.recIcon} size={13} />{r.rec}
                  </span>
                  <span style={{ textAlign: "right" }}>
                    {dec
                      ? <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)" style={{ fontSize: 10 }}>{dec === "advance" ? "Advanced" : dec === "decline" ? "Declined" : "In review"}</Pill>
                      : <Pill tone="var(--c-ink-3)" bg="var(--c-surface-2)">pending</Pill>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* bulk action bar */}
      {sel.size > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 40 }}>
          <div className="glass" style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px 9px 16px", borderRadius: "var(--r-pill)", boxShadow: "var(--e3)" }}>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{sel.size} selected</span>
            <div style={{ width: 1, height: 20, background: "var(--c-line)" }} />
            <Btn variant="primary" size="sm" icon="check">Advance passing</Btn>
            <Btn variant="soft" size="sm" icon="flag">Send to review</Btn>
            <button onClick={() => setSel(new Set())} aria-label="Clear selection" style={{ width: 26, height: 26, borderRadius: 99, border: "none", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={14} /></button>
          </div>
        </div>
      )}

      {open && <VerdictPanel row={open} onClose={() => setOpen(null)} onDecide={decide} />}
    </div>
  );
}
