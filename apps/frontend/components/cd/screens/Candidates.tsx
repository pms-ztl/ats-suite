"use client";
// components/screens/Candidates.tsx
// Candidates controller, ported pixel-exact from cand-screen.jsx: the board <-> table
// view switch, saved views, search/source filters, blind + density toggles, and the
// bulk-action bar. Composes CandBoard + CandTable. Routing to profile/import/sourcing
// is delegated to the parent via callbacks (Next routes), not internal screens.
import * as React from "react";
import { useState } from "react";
import { Icon, type IconName } from "../icon";
import { Btn } from "../aurora-ui";
import { CandBoard } from "./CandBoard";
import { CandTable } from "./CandTable";
import type { Candidate, CandStage, SavedView } from "../types";

function BulkBar({ n, onClear }: { n: number; onClear: () => void }) {
  return (
    <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 40, animation: "rise .25s var(--ease-out)" }}>
      <div className="glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px 9px 16px", borderRadius: "var(--r-pill)", boxShadow: "var(--e3)" }}>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{n} selected</span>
        <div style={{ width: 1, height: 22, background: "var(--line)" }} />
        {([["check", "Advance"], ["calendar", "Schedule"], ["sparkles", "Re-screen"], ["arrowUpRight", "Export"]] as [IconName, string][]).map(([ic, l]) => (
          <button key={l} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "none", background: "transparent", color: l === "Re-screen" ? "var(--ai-ink)" : "var(--ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            <Icon name={ic} size={14} />{l}</button>
        ))}
        <button style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", border: "none", background: "var(--danger-tint)", color: "var(--danger)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}><Icon name="x" size={14} />Reject</button>
        <button onClick={onClear} style={{ width: 28, height: 28, borderRadius: 99, border: "none", background: "var(--surface-2)", color: "var(--ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={15} /></button>
      </div>
    </div>
  );
}

export interface CandidatesData {
  candidates: Candidate[];
  stages: CandStage[];
  savedViews: SavedView[];
  sources: string[];                 // source filter options; first is the "All sources" default
}

export function Candidates({ data, onMove, onOpenProfile, onImport, onSource, ribbonSlot }: {
  data: CandidatesData;
  onMove?: (id: string, stage: string) => void;   // persist a stage move (kanban drag)
  onOpenProfile?: (id: string) => void;            // navigate to /candidates/[id]
  onImport?: () => void;                           // navigate to /candidates/import
  onSource?: () => void;                           // navigate to /sourcing
  ribbonSlot?: React.ReactNode;                    // optional hero viz rendered above the board/table
}) {
  const { candidates = [], stages = [], savedViews = [], sources = ["All sources"] } = data;
  const [cands, setCands] = useState<Candidate[]>(candidates);
  const [view, setView] = useState<"board" | "table">("board");
  const [savedView, setSavedView] = useState(savedViews[0]?.id ?? "all");
  const [q, setQ] = useState("");
  const [source, setSource] = useState(sources[0] ?? "All sources");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [blind, setBlind] = useState(false);
  const [dense, setDense] = useState(true);

  const viewFn = savedViews.find((v) => v.id === savedView)?.predicate;
  const filtered = cands.filter((c) =>
    (!viewFn || viewFn(c)) &&
    (!q || (c.name + c.role + c.reqId).toLowerCase().includes(q.toLowerCase())) &&
    (source === sources[0] || c.source === source));

  const move = (id: string, stage: string) => { setCands((cs) => cs.map((c) => (c.id === id ? { ...c, stage, days: 0 } : c))); onMove?.(id, stage); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, position: "relative" }}>
      <div style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Candidates</h1>
            <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>{filtered.length} candidates · {cands.filter((c) => c.st === "review").length} flagged for human review</p>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <Btn variant="soft" icon="users" onClick={onImport}>Import</Btn>
            <Btn variant="ai" icon="radar" onClick={onSource}>Source with AI</Btn>
            <div style={{ display: "flex", background: "var(--surface-2)", borderRadius: "var(--r)", padding: 2, border: "1px solid var(--line)", marginLeft: 4 }}>
              {([["board", "Board", "grid"], ["table", "Table", "listChecks"]] as [string, string, IconName][]).map(([v, l, ic]) => (
                <button key={v} onClick={() => setView(v as any)} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "7px 13px", borderRadius: "var(--r-sm)", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, background: view === v ? "var(--surface)" : "transparent", color: view === v ? "var(--ink)" : "var(--ink-3)", boxShadow: view === v ? "var(--e1)" : "none", transition: "all var(--t-fast)" }}>
                  <Icon name={ic} size={14} />{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", margin: "16px 0 14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", flex: 1, minWidth: 0 }}>
            {savedViews.map((v) => (
              <button key={v.id} onClick={() => setSavedView(v.id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, border: "1px solid", borderColor: savedView === v.id ? "transparent" : "var(--line-2)", background: savedView === v.id ? "var(--brand-tint)" : "var(--surface)", color: savedView === v.id ? "var(--brand-ink)" : "var(--ink-2)", fontSize: 12.5, fontWeight: 600 }}>
                <Icon name={v.icon} size={14} style={{ color: v.ai && savedView !== v.id ? "var(--ai)" : undefined }} />{v.label}
                <span className="mono" style={{ fontSize: 10.5, opacity: 0.7 }}>{v.count}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 11px", height: 34, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", width: 200 }}>
            <Icon name="search" size={15} style={{ color: "var(--ink-3)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
          </div>
          <select value={source} onChange={(e) => setSource(e.target.value)} style={{ height: 34, padding: "0 9px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" }}>
            {sources.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setBlind((b) => !b)} title="Blind review" style={{ display: "inline-flex", gap: 6, alignItems: "center", height: 34, padding: "0 11px", borderRadius: "var(--r)", border: "1px solid", borderColor: blind ? "transparent" : "var(--line-2)", background: blind ? "var(--ai-tint)" : "var(--surface)", color: blind ? "var(--ai-ink)" : "var(--ink-2)", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
            <Icon name="eye" size={14} />Blind
          </button>
          {view === "table" && <button onClick={() => setDense((d) => !d)} title="Density" style={{ width: 34, height: 34, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: dense ? "var(--surface-2)" : "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="listChecks" size={15} /></button>}
        </div>
      </div>

      {ribbonSlot && <div style={{ padding: "0 28px 14px" }}>{ribbonSlot}</div>}

      <div key={view} style={{ flex: 1, minHeight: 0, padding: view === "board" ? "0 28px 16px" : "0 28px 20px", animation: "fadein .25s var(--ease-out)" }}>
        {view === "board"
          ? <CandBoard cands={filtered} stages={stages} onMove={move} onOpen={(id) => onOpenProfile?.(id)} blind={blind} />
          : <CandTable cands={filtered} stages={stages} sel={sel} setSel={setSel} onOpen={(id) => onOpenProfile?.(id)} blind={blind} dense={dense} />}
      </div>

      {view === "table" && sel.size > 0 && <BulkBar n={sel.size} onClear={() => setSel(new Set())} />}
    </div>
  );
}
