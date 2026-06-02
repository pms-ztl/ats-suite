"use client";
// app/(dashboard)/candidates/page.tsx - VERBATIM Aurora port of the Candidates
// controller (claude-design/cand-screen.jsx) that switches between the dense
// triage TABLE (cand-table.jsx) and the kanban BOARD (cand-board.jsx), with the
// saved-views chips + search + source filter + blind/density chrome and the
// floating bulk-action bar (BulkBar). All three prototype files' exact markup and
// inline styles are reproduced here in one page. Mock CANDIDATES is replaced with
// the real gateway (useData + listCandidates); every mock field is mapped onto the
// real Candidate shape (initials from name, st from result, score from aiScore,
// match from confidence, days from timeInStageDays, board stage folded from the
// 10-value ApplicationStage enum into the 5 prototype columns). Row/card click
// links to /candidates/{id}; Import links to /candidates/import. Palette var(--x)
// tokens are converted to var(--c-x); effect/size tokens stay bare. AI scores are
// advisory; humans move every candidate forward.
import { useMemo, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listCandidates } from "@/lib/api";
import type { Candidate, ApplicationStage, ScreeningResult } from "@/lib/types";

/* ----------------------------- view-model ----------------------------- */
// The prototypes operate on a flat shape (id, name, ini, role, reqId, stage, score,
// st, match, source, days, loc). We fold the real Candidate onto exactly that shape
// so cand-table + cand-board markup ports byte-for-byte. `st` is pass/review/fail/
// pending; `stage` is the 5 prototype board columns; `match` is "n/4" or ", ".
type St = "pass" | "review" | "fail" | "pending";
type BoardStage = "applied" | "screening" | "interview" | "offer" | "hired";
type Row = {
  id: string; name: string; ini: string; role: string; reqId: string;
  stage: BoardStage; score: number; st: St; match: string;
  source: string; days: number; loc: string;
};

const CAND_STAGES: { id: BoardStage; label: string; color: string; ai?: boolean }[] = [
  { id: "applied",   label: "Applied",   color: "var(--c-ink-3)" },
  { id: "screening", label: "Screening", color: "var(--c-info)", ai: true },
  { id: "interview", label: "Interview", color: "var(--c-ai)" },
  { id: "offer",     label: "Offer",     color: "var(--c-brand)" },
  { id: "hired",     label: "Hired",     color: "var(--c-ok)" },
];

// Fold the verbatim 10-value ApplicationStage enum into the 5 prototype columns.
const STAGE_FOLD: Record<ApplicationStage, BoardStage> = {
  APPLIED: "applied", SCREENED: "screening", PHONE_SCREEN: "screening", ASSESSMENT: "interview",
  INTERVIEW: "interview", FINAL_REVIEW: "interview", OFFER: "offer", HIRED: "hired",
  REJECTED: "applied", WITHDRAWN: "applied",
};
const RESULT_ST: Record<ScreeningResult, St> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

function initials(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  return ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] || "" : "")).toUpperCase();
}
// "n/4" requirement-match derived honestly from model confidence (0..1), like the
// table port; ", " when the candidate has not been screened (no score / pending).
function matchFromConfidence(score: number, st: St, confidence?: number): string {
  if (st === "pending" || score === 0) return ", ";
  const d = 4;
  const c = confidence != null ? confidence : score / 100;
  const n = Math.max(0, Math.min(d, Math.round(c * d)));
  return `${n}/${d}`;
}

function toRow(c: Candidate): Row {
  const score = c.aiScore ?? 0;
  const st: St = c.result ? RESULT_ST[c.result] : score > 0 ? "review" : "pending";
  return {
    id: c.id,
    name: c.name,
    ini: initials(c.name),
    role: "",                                   // real Candidate has no role title; filled from reqId context downstream
    reqId: c.requisitionId || "",
    stage: STAGE_FOLD[c.stage] ?? "applied",
    score,
    st,
    match: matchFromConfidence(score, st, c.confidence),
    source: c.source || "",
    days: c.timeInStageDays ?? 0,
    loc: c.location || "",
  };
}

/* saved views: predicates over the folded rows (verbatim chips from cand-data.jsx,
   minus the "you"/assignment notion the real Candidate does not carry). */
const VIEW_FILTERS: Record<string, (c: Row) => boolean> = {
  v1: () => true,
  v2: (c) => c.st === "review" || c.st === "pending",
  v3: (c) => c.stage === "applied" || (c.stage === "screening" && c.st === "review"),
  v4: (c) => c.stage === "interview",
  v5: (c) => c.score >= 85,
  v6: (c) => c.st === "review",
};
const SAVED_VIEWS = [
  { id: "v1", label: "All active",        icon: "users" },
  { id: "v2", label: "My candidates",     icon: "userCog" },
  { id: "v3", label: "Needs screening",   icon: "scan", ai: true },
  { id: "v4", label: "Awaiting interview", icon: "calendar" },
  { id: "v5", label: "Top scores (85+)",  icon: "chart" },
  { id: "v6", label: "Flagged for review", icon: "flag", ai: true },
];

/* ----------------------- table-view helpers (cand-table.jsx) ----------------------- */
const ctStIcon = (s: St) => (s === "pass" ? "check" : s === "review" ? "eye" : s === "fail" ? "x" : "clock");
const ctStCol = (s: St) => (s === "pass" ? "var(--c-ok)" : s === "review" ? "var(--c-warn)" : s === "fail" ? "var(--c-danger)" : "var(--c-ink-3)");

function MatchBar({ match }: { match: string }) {
  if (match === ", ") return <span style={{ color: "var(--c-ink-3)", fontSize: 11 }} className="mono">, </span>;
  const [n, d] = match.split("/").map(Number);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: d }).map((_, i) => <span key={i} style={{ width: 12, height: 5, borderRadius: 2, background: i < n ? (n >= d ? "var(--c-ok)" : n >= d / 2 ? "var(--c-warn)" : "var(--c-danger)") : "var(--c-surface-3)" }} />)}
      </div>
      <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>{match}</span>
    </div>
  );
}

function StageBadge({ stage }: { stage: BoardStage }) {
  const s = CAND_STAGES.find((x) => x.id === stage) ?? CAND_STAGES[0];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" }}>
    <span style={{ width: 7, height: 7, borderRadius: 99, background: s.color }} />{s.label}</span>;
}

function CandTable({ cands, sel, setSel, onOpen, blind, dense }: {
  cands: Row[]; sel: Set<string>; setSel: (s: Set<string>) => void; onOpen: (id: string) => void; blind: boolean; dense: boolean;
}) {
  const allSel = cands.length > 0 && cands.every((c) => sel.has(c.id));
  const toggleAll = () => setSel(allSel ? new Set() : new Set(cands.map((c) => c.id)));
  const toggle = (id: string) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); setSel(n); };
  const pad = dense ? "7px 14px" : "11px 14px";
  const cols = "30px 1.7fr 1fr 110px 1fr 130px 0.9fr 70px";

  const Check = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid", borderColor: on ? "var(--c-brand)" : "var(--c-line-strong)", background: on ? "var(--c-brand)" : "transparent", display: "grid", placeItems: "center", cursor: "pointer", padding: 0 }}>
      {on && <Icon name="check" size={12} stroke={3} style={{ color: "var(--c-on-brand)" }} />}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "10px 14px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", position: "sticky", top: 0, zIndex: 2, fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", alignItems: "center" }}>
          <Check on={allSel} onClick={toggleAll} />
          <span>Candidate</span><span>Requisition</span><span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icon name="sparkles" size={11} style={{ color: "var(--c-ai)" }} />AI score</span><span>Stage</span><span>Requirement match</span><span>Source</span><span style={{ textAlign: "right" }}>Age</span>
        </div>
        {cands.map((c, i) => {
          const on = sel.has(c.id);
          return (
            <div key={c.id} onClick={() => onOpen(c.id)} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: pad, alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", background: on ? "var(--c-brand-tint)" : "transparent", transition: "background var(--t-fast)" }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--c-surface-2)"; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
              <Check on={on} onClick={() => toggle(c.id)} />
              <div style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
                <span className="mono" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11,
                  background: blind ? "var(--c-surface-3)" : "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: blind ? "var(--c-ink-3)" : "white" }}>{blind ? "•" : c.ini}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", gap: 6, alignItems: "center" }}>
                    {blind ? "Candidate " + c.id.toUpperCase() : c.name}
                  </div>
                  {!dense && <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{c.role}{blind || !c.loc ? "" : " · " + c.loc}</div>}
                </div>
              </div>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-2)" }}>{c.reqId || "-"}</span>
              <div>
                {c.st !== "pending"
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span className="mono tnum" style={{ fontSize: 15, fontWeight: 700, color: "var(--c-ai-ink)" }}>{c.score}</span>
                      <Icon name={ctStIcon(c.st)} size={13} stroke={2.3} style={{ color: ctStCol(c.st) }} />
                    </span>
                  : <Pill icon="clock" tone="var(--c-ink-3)" bg="var(--c-surface-2)">queued</Pill>}
              </div>
              <StageBadge stage={c.stage} />
              <MatchBar match={c.match} />
              <span style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{c.source || "-"}</span>
              <span className="mono" style={{ fontSize: 11.5, textAlign: "right", color: c.days >= 6 ? "var(--c-danger)" : "var(--c-ink-3)", fontWeight: c.days >= 6 ? 600 : 400 }}>{c.days === 0 ? "new" : c.days + "d"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- board-view helpers (cand-board.jsx) ----------------------- */
const stIcon = (s: St) => (s === "pass" ? "check" : s === "review" ? "eye" : s === "fail" ? "x" : "clock");
const stCol = (s: St) => (s === "pass" ? "var(--c-ok)" : s === "review" ? "var(--c-warn)" : s === "fail" ? "var(--c-danger)" : "var(--c-ink-3)");
function aging(days: number) {
  if (days >= 6) return { tone: "var(--c-danger)", bg: "var(--c-danger-tint)", label: days + "d", warn: true };
  if (days >= 3) return { tone: "var(--c-warn)", bg: "var(--c-warn-tint)", label: days + "d", warn: false };
  return { tone: "var(--c-ink-3)", bg: "transparent", label: days === 0 ? "new" : days + "d", warn: false };
}

function CandCard({ c, onOpen, blind, onDragStart, dragging }: {
  c: Row; onOpen: (id: string) => void; blind: boolean; onDragStart: (e: React.DragEvent, id: string) => void; dragging: boolean;
}) {
  const age = aging(c.days);
  return (
    <div draggable onDragStart={(e) => onDragStart(e, c.id)} onClick={() => onOpen(c.id)}
      style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 13, boxShadow: "var(--e1)", cursor: "grab",
        opacity: dragging ? 0.4 : 1, transition: "box-shadow var(--t), transform var(--t-fast)", position: "relative" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--e2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--e1)"; e.currentTarget.style.transform = "none"; }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span className="mono" style={{ width: 34, height: 34, borderRadius: "var(--r-sm)", flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12,
          background: blind ? "var(--c-surface-3)" : "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: blind ? "var(--c-ink-3)" : "white" }}>{blind ? "•" : c.ini}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{blind ? "Candidate " + c.id.toUpperCase() : c.name}</div>
          <div style={{ fontSize: 11, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.role || c.reqId}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
        {c.st !== "pending" ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", borderRadius: "var(--r-pill)", fontSize: 11, fontWeight: 700,
            color: "var(--c-ai-ink)", background: "var(--c-ai-tint)" }}>
            <Icon name="sparkles" size={11} /><span className="mono">{c.score}</span>
            <Icon name={stIcon(c.st)} size={11} style={{ color: stCol(c.st) }} />
          </span>
        ) : <Pill icon="clock" tone="var(--c-ink-3)" bg="var(--c-surface-2)">awaiting AI</Pill>}
        {c.match !== ", " && <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>{c.match} req</span>}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 600, color: age.tone, background: age.bg, padding: "2px 7px", borderRadius: 99 }}>
          {age.warn && <Icon name="clock" size={10} />}{age.label}
        </span>
      </div>
    </div>
  );
}

function Board({ cands, onMove, onOpen, blind }: {
  cands: Row[]; onMove: (id: string, stage: BoardStage) => void; onOpen: (id: string) => void; blind: boolean;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<BoardStage | null>(null);
  const onDragStart = (e: React.DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDrop = (stage: BoardStage) => { if (dragId) onMove(dragId, stage); setDragId(null); setOverCol(null); };

  return (
    <div style={{ display: "flex", gap: 14, height: "100%", minHeight: 0, overflowX: "auto", padding: "2px 2px 8px" }}>
      {CAND_STAGES.map((stage) => {
        const list = cands.filter((c) => c.stage === stage.id);
        const over = overCol === stage.id;
        return (
          <div key={stage.id} onDragOver={(e) => { e.preventDefault(); setOverCol(stage.id); }} onDragLeave={() => setOverCol((o) => o === stage.id ? null : o)} onDrop={() => onDrop(stage.id)}
            style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0, borderRadius: "var(--r-xl)",
              background: over ? "var(--c-brand-tint)" : "var(--c-surface-2)", border: "1px solid", borderColor: over ? "var(--c-brand)" : "var(--c-line)", transition: "background var(--t), border-color var(--t)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", position: "sticky", top: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: stage.color }} />
              <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{stage.label}</span>
              {stage.ai && <Icon name="sparkles" size={12} style={{ color: "var(--c-ai)" }} />}
              <span className="mono tnum" style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--c-ink-3)", background: "var(--c-surface)", padding: "1px 8px", borderRadius: 99 }}>{list.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "2px 10px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
              {list.map((c) => <CandCard key={c.id} c={c} onOpen={onOpen} blind={blind} onDragStart={onDragStart} dragging={dragId === c.id} />)}
              {list.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "var(--c-ink-3)", border: "1.5px dashed var(--c-line-2)", borderRadius: "var(--r-lg)" }}>Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------- bulk-action bar ---------------------------- */
function BulkBar({ n, onClear }: { n: number; onClear: () => void }) {
  return (
    <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40, animation: "rise .25s var(--ease-out)" }}>
      <div className="glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px 9px 16px", borderRadius: "var(--r-pill)", boxShadow: "var(--e3)" }}>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{n} selected</span>
        <div style={{ width: 1, height: 22, background: "var(--c-line)" }} />
        {([["check", "Advance"], ["calendar", "Schedule"], ["sparkles", "Re-screen"], ["arrowUpRight", "Export"]] as const).map(([ic, l]) => (
          <button key={l} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "none", background: "transparent", color: l === "Re-screen" ? "var(--c-ai-ink)" : "var(--c-ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--c-surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <Icon name={ic} size={14} />{l}</button>
        ))}
        <button style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "none", background: "var(--c-danger-tint)", color: "var(--c-danger)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}><Icon name="x" size={14} />Reject</button>
        <button onClick={onClear} style={{ width: 28, height: 28, borderRadius: 99, border: "none", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={15} /></button>
      </div>
    </div>
  );
}

/* ------------------------------ controller ------------------------------ */
export default function CandidatesScreen() {
  const { data, loading, error, reload } = useData<Candidate[]>(() => listCandidates());
  const [moves, setMoves] = useState<Record<string, BoardStage>>({}); // local optimistic stage overrides
  const [view, setView] = useState<"board" | "table">("board");
  const [savedView, setSavedView] = useState("v1");
  const [q, setQ] = useState("");
  const [source, setSource] = useState("All sources");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [blind, setBlind] = useState(false);
  const [dense, setDense] = useState(true);

  const cands: Row[] = useMemo(() => {
    const base = (data ?? []).map(toRow);
    return base.map((r) => (moves[r.id] ? { ...r, stage: moves[r.id], days: 0 } : r));
  }, [data, moves]);

  const sources = useMemo(() => {
    const s = new Set<string>();
    cands.forEach((c) => { if (c.source) s.add(c.source); });
    return ["All sources", ...Array.from(s).sort()];
  }, [cands]);

  // counts for the saved-view chips, computed against the full (unfiltered) set
  const viewCount = (id: string) => cands.filter(VIEW_FILTERS[id]).length;

  const filtered = useMemo(() => cands.filter((c) =>
    VIEW_FILTERS[savedView](c) &&
    (!q || (c.name + c.role + c.reqId).toLowerCase().includes(q.toLowerCase())) &&
    (source === "All sources" || c.source === source)), [cands, savedView, q, source]);

  const flaggedCount = cands.filter((c) => c.st === "review").length;

  const move = (id: string, stage: BoardStage) => setMoves((m) => ({ ...m, [id]: stage }));
  const openProfile = (id: string) => { if (typeof window !== "undefined") window.location.href = `/candidates/${id}`; };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
        {/* header */}
        <div style={{ padding: "20px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Candidates</h1>
              <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{filtered.length} candidates · {flaggedCount} flagged for human review</p>
            </div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <a href="/candidates/import" style={{ textDecoration: "none" }}><Btn variant="soft" icon="users">Import</Btn></a>
              <a href="/sourcing" style={{ textDecoration: "none" }}><Btn variant="ai" icon="radar">Source with AI</Btn></a>
              {/* view switch */}
              <div style={{ display: "flex", background: "var(--c-surface-2)", borderRadius: "var(--r)", padding: 2, border: "1px solid var(--c-line)", marginLeft: 4 }}>
                {([["board", "Board", "grid"], ["table", "Table", "listChecks"]] as const).map(([v, l, ic]) => (
                  <button key={v} onClick={() => setView(v)} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "7px 13px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                    background: view === v ? "var(--c-surface)" : "transparent", color: view === v ? "var(--c-ink)" : "var(--c-ink-3)", boxShadow: view === v ? "var(--e1)" : "none", transition: "all var(--t-fast)" }}>
                    <Icon name={ic} size={14} />{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* saved views + filters */}
          <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "16px 0 14px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, minWidth: 0 }}>
              {SAVED_VIEWS.map((v) => (
                <button key={v.id} onClick={() => setSavedView(v.id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                  border: "1px solid", borderColor: savedView === v.id ? "transparent" : "var(--c-line-2)", background: savedView === v.id ? "var(--c-brand-tint)" : "var(--c-surface)", color: savedView === v.id ? "var(--c-brand-ink)" : "var(--c-ink-2)", fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name={v.icon} size={14} style={{ color: v.ai && savedView !== v.id ? "var(--c-ai)" : undefined }} />{v.label}
                  <span className="mono" style={{ fontSize: 10.5, opacity: .7 }}>{viewCount(v.id)}</span>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 11px", height: 34, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", width: 200 }}>
              <Icon name="search" size={15} style={{ color: "var(--c-ink-3)" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }} />
            </div>
            <select value={source} onChange={(e) => setSource(e.target.value)} style={{ height: 34, padding: "0 9px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
              {sources.map((s) => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setBlind((b) => !b)} title="Blind review" style={{ display: "inline-flex", gap: 6, alignItems: "center", height: 34, padding: "0 11px", borderRadius: "var(--r)", border: "1px solid", borderColor: blind ? "transparent" : "var(--c-line-2)", background: blind ? "var(--c-ai-tint)" : "var(--c-surface)", color: blind ? "var(--c-ai-ink)" : "var(--c-ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="eye" size={14} />Blind
            </button>
            {view === "table" && <button onClick={() => setDense((d) => !d)} title="Density" style={{ width: 34, height: 34, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: dense ? "var(--c-surface-2)" : "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="listChecks" size={15} /></button>}
          </div>
        </div>

        {/* content */}
        <div key={view} style={{ flex: 1, minHeight: 0, padding: view === "board" ? "0 0 16px" : "0 0 20px", animation: "fadein .25s var(--ease-out)" }}>
          {loading && (
            view === "board"
              ? <div style={{ display: "flex", gap: 14, padding: "2px 2px 8px" }}>
                  {CAND_STAGES.map((s) => (
                    <div key={s.id} style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", gap: 9, borderRadius: "var(--r-xl)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)", padding: "12px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 4px 4px" }}><span style={{ width: 8, height: 8, borderRadius: 99, background: s.color }} /><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{s.label}</span></div>
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[78px] rounded-[14px]" />)}
                    </div>
                  ))}
                </div>
              : <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: 14, display: "grid", gap: 8 }} aria-busy="true">
                  {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}
                </div>
          )}

          {error && <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: "48px 18px", display: "flex" }}>
            <ErrorState title="Could not load candidates" body="The candidate service did not respond." code="GET /api/candidates" onRetry={reload} />
          </div>}

          {data && data.length === 0 && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: "56px 18px", display: "flex" }}>
              <EmptyState title="No candidates yet" body="Import a list or open AI sourcing to start your pipeline." actions={<><a href="/candidates/import"><Btn variant="soft" icon="users">Import</Btn></a><a href="/sourcing"><Btn variant="ai" icon="radar">Source with AI</Btn></a></>} />
            </div>
          )}

          {data && data.length > 0 && filtered.length === 0 && (
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: "56px 18px", display: "flex" }}>
              <EmptyState title="No matches" body="No candidates match this view, search, and source filter. Try clearing them." />
            </div>
          )}

          {data && filtered.length > 0 && (
            view === "board"
              ? <Board cands={filtered} onMove={move} onOpen={openProfile} blind={blind} />
              : <CandTable cands={filtered} sel={sel} setSel={setSel} onOpen={openProfile} blind={blind} dense={dense} />
          )}
        </div>

        {view === "table" && sel.size > 0 && <BulkBar n={sel.size} onClear={() => setSel(new Set())} />}
      </div>
    </div>
  );
}
