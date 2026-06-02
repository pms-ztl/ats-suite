"use client";
// app/(dashboard)/candidates/page.tsx - EXACT Claude Design "Aurora" port of the
// high-volume candidate triage table (claude-design/cand-table.jsx + cand-data.jsx):
// dense rows with avatar, requisition, a compact AI score (mono + verdict icon, AI
// accent on the score column), colored stage badge, a requirement-match strength bar
// derived from model confidence, source, and time-in-stage age. Header carries search +
// source/stage filters; selecting rows reveals a bulk-action bar. Every row links to the
// rich candidate profile. Wired to the real gateway; AI scores are advisory, humans move
// people forward.
import { useMemo, useState } from "react";
import { Btn, Pill, StatusBadge, SectionCard } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listCandidates } from "@/lib/api";
import type { Candidate, ApplicationStage, ScreeningResult } from "@/lib/types";

/* result -> StatusBadge kind + verdict glyph/colour for the compact AI-score cell */
const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const ST_ICON: Record<ScreeningResult, string> = { PASS: "check", REVIEW: "eye", FAIL: "x" };
const ST_COL: Record<ScreeningResult, string> = { PASS: "var(--c-ok)", REVIEW: "var(--c-warn)", FAIL: "var(--c-danger)" };

/* stages map the verbatim ApplicationStage enum to the prototype's labelled, dotted bands */
const STAGE_META: Record<ApplicationStage, { label: string; color: string }> = {
  APPLIED:      { label: "Applied",       color: "var(--c-ink-3)" },
  SCREENED:     { label: "Screened",      color: "var(--c-info)" },
  PHONE_SCREEN: { label: "Phone screen",  color: "var(--c-info)" },
  ASSESSMENT:   { label: "Assessment",    color: "var(--c-ai)" },
  INTERVIEW:    { label: "Interview",     color: "var(--c-ai)" },
  FINAL_REVIEW: { label: "Final review",  color: "var(--c-brand)" },
  OFFER:        { label: "Offer",         color: "var(--c-brand)" },
  HIRED:        { label: "Hired",         color: "var(--c-ok)" },
  REJECTED:     { label: "Rejected",      color: "var(--c-danger)" },
  WITHDRAWN:    { label: "Withdrawn",     color: "var(--c-ink-3)" },
};
const STAGE_ORDER: ApplicationStage[] = ["APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"];

const COLS = "30px 1.7fr 1fr 120px 1fr 130px 0.9fr 64px";

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] || "" : "")).toUpperCase();
}

function StageBadge({ stage }: { stage: ApplicationStage }) {
  const s = STAGE_META[stage] ?? { label: stage, color: "var(--c-ink-3)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" }}>
      <span style={{ width: 7, height: 7, borderRadius: 99, background: s.color, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

/* requirement-match strength: a 4-segment bar driven by model confidence (0..1).
   Honest about the AI's certainty without inventing per-requirement findings. */
function MatchBar({ confidence }: { confidence?: number }) {
  if (confidence == null) return <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>-</span>;
  const d = 4;
  const n = Math.max(0, Math.min(d, Math.round(confidence * d)));
  const fill = n >= d ? "var(--c-ok)" : n >= d / 2 ? "var(--c-warn)" : "var(--c-danger)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: d }).map((_, i) => (
          <span key={i} style={{ width: 12, height: 5, borderRadius: 2, background: i < n ? fill : "var(--c-surface-3)" }} />
        ))}
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>{n}/{d}</span>
    </div>
  );
}

function Check({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClick(); }}
      aria-pressed={on}
      style={{
        width: 18, height: 18, borderRadius: 5, border: "1.5px solid",
        borderColor: on ? "var(--c-brand)" : "var(--c-line-strong)",
        background: on ? "var(--c-brand)" : "transparent",
        display: "grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0,
      }}>
      {on && <Icon name="check" size={12} stroke={3} style={{ color: "var(--c-on-brand)" }} />}
    </button>
  );
}

export default function CandidatesPage() {
  const { data, loading, error, reload } = useData<Candidate[]>(() => listCandidates());
  const [q, setQ] = useState("");
  const [source, setSource] = useState("All sources");
  const [stage, setStage] = useState<ApplicationStage | "ALL">("ALL");
  const [sel, setSel] = useState<Set<string>>(new Set());

  const cands = data ?? [];

  const sources = useMemo(() => {
    const s = new Set<string>();
    cands.forEach((c) => { if (c.source) s.add(c.source); });
    return ["All sources", ...Array.from(s).sort()];
  }, [cands]);

  const stages = useMemo(() => {
    const present = new Set(cands.map((c) => c.stage));
    return STAGE_ORDER.filter((s) => present.has(s));
  }, [cands]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cands.filter((c) =>
      (source === "All sources" || c.source === source) &&
      (stage === "ALL" || c.stage === stage) &&
      (needle === "" || c.name.toLowerCase().includes(needle) || c.email.toLowerCase().includes(needle) || (c.requisitionId ?? "").toLowerCase().includes(needle))
    );
  }, [cands, q, source, stage]);

  const allSel = rows.length > 0 && rows.every((c) => sel.has(c.id));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(rows.map((c) => c.id)));
  const toggle = (id: string) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Candidates</h1>
          <p className="mt-1 text-ink-2">Triage at volume. AI scores are advisory; you move people forward.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/candidates/import"><Btn variant="soft" icon="inbox">Import</Btn></a>
          <a href="/sourcing"><Btn variant="ai" icon="radar">AI sourcing</Btn></a>
        </div>
      </header>

      {/* filter bar: search + source + stage. Disabled while there is nothing to filter. */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
          <Icon name="search" size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-3)" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, or requisition"
            disabled={!data}
            style={{
              width: "100%", padding: "8px 12px 8px 34px", borderRadius: "var(--r)", outline: "none",
              border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)",
              fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)",
            }} />
        </div>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          disabled={!data}
          style={{ padding: "8px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", fontWeight: 600, cursor: "pointer" }}>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={stage}
          onChange={(e) => setStage(e.target.value as ApplicationStage | "ALL")}
          disabled={!data}
          style={{ padding: "8px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", fontWeight: 600, cursor: "pointer" }}>
          <option value="ALL">All stages</option>
          {stages.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
        </select>
      </div>

      {/* bulk-action bar, revealed once rows are selected */}
      {sel.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-[var(--r-lg)] border border-line bg-surface-2 px-4 py-[10px]" style={{ animation: "rise .3s var(--ease-out) both" }}>
          <span className="text-[13px] font-semibold">{sel.size} selected</span>
          <span style={{ width: 1, height: 18, background: "var(--c-line)" }} />
          <Btn variant="ai" size="sm" icon="sparkles">Re-screen</Btn>
          <Btn variant="soft" size="sm" icon="arrowUpRight">Advance stage</Btn>
          <Btn variant="soft" size="sm" icon="enter">Message</Btn>
          <Btn variant="ghost" size="sm" icon="x" onClick={() => setSel(new Set())} style={{ marginLeft: "auto" }}>Clear</Btn>
        </div>
      )}

      {loading && (
        <div className="grid gap-2" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}
        </div>
      )}

      {error && <ErrorState title="Could not load candidates" body="The candidate service did not respond." code="GET /api/candidates" onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState title="No candidates yet" body="Import a list or open AI sourcing to start your pipeline." actions={<a href="/sourcing"><Btn variant="ai" icon="radar">AI sourcing</Btn></a>} />
      )}

      {data && data.length > 0 && rows.length === 0 && (
        <SectionCard title="Candidates" icon="users" pad={0}>
          <EmptyState title="No matches" body="No candidates match your search and filters. Try clearing them." />
        </SectionCard>
      )}

      {data && rows.length > 0 && (
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
          {/* sticky header row */}
          <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", alignItems: "center" }}>
            <Check on={allSel} onClick={toggleAll} />
            <span>Candidate</span>
            <span>Requisition</span>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="sparkles" size={11} style={{ color: "var(--c-ai)" }} />AI score</span>
            <span>Stage</span>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="sparkles" size={11} style={{ color: "var(--c-ai)" }} />Requirement match</span>
            <span>Source</span>
            <span style={{ textAlign: "right" }}>Age</span>
          </div>

          {rows.map((c, i) => {
            const on = sel.has(c.id);
            const days = c.timeInStageDays ?? 0;
            return (
              <a
                key={c.id}
                href={`/candidates/${c.id}`}
                style={{
                  display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "9px 14px", alignItems: "center",
                  borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", textDecoration: "none", color: "inherit",
                  background: on ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t-fast)",
                }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--c-surface-2)"; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                <Check on={on} onClick={() => toggle(c.id)} />

                {/* candidate: avatar + name / role + location */}
                <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                  <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(c.name)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                    {c.location && <div style={{ fontSize: 11, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.location}</div>}
                  </div>
                </div>

                {/* requisition */}
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.requisitionId || "-"}</span>

                {/* AI score: compact mono number + verdict glyph, or a queued pill */}
                <div>
                  {c.aiScore != null && c.result ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: "var(--c-ai-ink)" }}>{c.aiScore}</span>
                      <Icon name={ST_ICON[c.result]} size={13} stroke={2.3} style={{ color: ST_COL[c.result] }} />
                    </span>
                  ) : c.aiScore != null ? (
                    <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: "var(--c-ai-ink)" }}>{c.aiScore}</span>
                  ) : (
                    <Pill icon="clock" tone="var(--c-ink-3)" bg="var(--c-surface-2)">queued</Pill>
                  )}
                </div>

                {/* stage */}
                <StageBadge stage={c.stage} />

                {/* requirement match (confidence-derived) */}
                <MatchBar confidence={c.confidence} />

                {/* source */}
                <span style={{ fontSize: 12, color: "var(--c-ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.source || "-"}</span>

                {/* age in current stage */}
                <span className="mono" style={{ fontSize: 11.5, textAlign: "right", color: days >= 6 ? "var(--c-danger)" : "var(--c-ink-3)", fontWeight: days >= 6 ? 600 : 400 }}>{days === 0 ? "new" : `${days}d`}</span>
              </a>
            );
          })}
        </div>
      )}

      {data && rows.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
          <span>{rows.length} of {cands.length} candidates</span>
          <span className="inline-flex items-center gap-1.5"><Icon name="sparkles" size={12} style={{ color: "var(--c-ai)" }} />Scores and confidence are advisory. A human moves every candidate forward.</span>
        </div>
      )}
    </div>
  );
}
