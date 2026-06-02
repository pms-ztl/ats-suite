"use client";
// app/(dashboard)/requisitions/[id]/rounds/page.tsx
// EXACT Claude Design "Aurora" RoundsConfig (interview rounds / pipeline stage
// configurator). Ported from claude-design/req-builder.jsx -> RoundsConfig and
// wired to the real gateway. The ordered list of rounds is interactive (add,
// remove, reorder, edit each field via local useState). Existing config is
// best-effort loaded from the requisition; nothing is fabricated as "saved".
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Greeting, Btn } from "@/components/aurora-kit";
import { Skeleton } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

type RoundType = "PHONE_SCREEN" | "TECHNICAL" | "BEHAVIORAL" | "PANEL" | "FINAL";

interface Round {
  id: string;
  name: string;
  type: RoundType;
  dur: number;
  panel: string;
  auto: boolean;
  instr: string;
}

// Faithful to claude-design/req-data.jsx ROUND_TYPES (tone tokens -> --c-).
const ROUND_TYPES: Record<RoundType, { label: string; tone: string }> = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--c-info)" },
  TECHNICAL:    { label: "Technical",    tone: "var(--c-ai)" },
  BEHAVIORAL:   { label: "Behavioral",   tone: "var(--c-brand)" },
  PANEL:        { label: "Panel",        tone: "var(--c-warn)" },
  FINAL:        { label: "Final",        tone: "var(--c-ok)" },
};
const TYPE_ORDER: RoundType[] = ["PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "PANEL", "FINAL"];

// Sensible default pipeline (claude-design ROUNDS), used only when nothing loads.
const DEFAULT_ROUNDS: Round[] = [
  { id: "rd1", name: "Recruiter phone screen", type: "PHONE_SCREEN", dur: 30, panel: "Recruiter", auto: true, instr: "Motivation, comp expectations, role fit." },
  { id: "rd2", name: "Technical screen", type: "TECHNICAL", dur: 60, panel: "Senior Engineer", auto: true, instr: "Coding + systems fundamentals." },
  { id: "rd3", name: "System design", type: "TECHNICAL", dur: 60, panel: "Staff Engineer", auto: false, instr: "Design a payments ledger service." },
  { id: "rd4", name: "Behavioral & values", type: "BEHAVIORAL", dur: 45, panel: "Hiring Manager", auto: false, instr: "Ownership, collaboration, conflict." },
  { id: "rd5", name: "Final panel", type: "PANEL", dur: 90, panel: "Cross-functional", auto: false, instr: "Bar-raiser + 2 panelists." },
];

// Coerce a raw API round (snake/camel variants) into our shape, defensively.
function coerce(r: any, i: number): Round {
  const rawType = String(r?.type ?? r?.interviewType ?? "TECHNICAL").toUpperCase();
  const type: RoundType = (TYPE_ORDER as string[]).includes(rawType) ? (rawType as RoundType) : "TECHNICAL";
  return {
    id: String(r?.id ?? r?.roundId ?? `rd${i + 1}`),
    name: String(r?.name ?? r?.title ?? "Untitled round"),
    type,
    dur: Number(r?.dur ?? r?.durationMinutes ?? r?.duration ?? 45) || 45,
    panel: String(r?.panel ?? r?.defaultPanelistRole ?? r?.panelist ?? "Interviewer"),
    auto: Boolean(r?.auto ?? r?.autoAdvanceOnPass ?? false),
    instr: String(r?.instr ?? r?.instructions ?? r?.notes ?? "").trim(),
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "none", outline: "none", background: "transparent",
  fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink)", fontFamily: "var(--font-sans)",
};

export default function RoundsConfigPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [rounds, setRounds] = useState<Round[]>(DEFAULT_ROUNDS.map((r) => ({ ...r })));
  const [loading, setLoading] = useState(true);
  const [loadNote, setLoadNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);

  // Best-effort load: try /requisitions/{id}/rounds first, then /requisitions/{id}.
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadNote(null);
    let loaded: Round[] | null = null;
    try {
      const res = await raw(`/requisitions/${id}/rounds`);
      const arr = res?.data ?? res?.rounds ?? res;
      if (Array.isArray(arr) && arr.length > 0) loaded = arr.map(coerce);
    } catch {}
    if (!loaded) {
      try {
        const res = await raw(`/requisitions/${id}`);
        const req = res?.data ?? res;
        const arr = req?.rounds ?? req?.interviewRounds;
        if (Array.isArray(arr) && arr.length > 0) loaded = arr.map(coerce);
      } catch {}
    }
    if (loaded && loaded.length > 0) {
      setRounds(loaded);
    } else {
      // No saved config available, fall back to a sensible default set.
      setRounds(DEFAULT_ROUNDS.map((r) => ({ ...r })));
      setLoadNote("No saved pipeline found, starting from a recommended default set.");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // ---- interactive ops (local state) ----
  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= rounds.length) return;
    const next = [...rounds];
    [next[i], next[j]] = [next[j], next[i]];
    setRounds(next);
    setSaveNote(null);
  };
  const toggleAuto = (rid: string) => { setRounds(rounds.map((r) => (r.id === rid ? { ...r, auto: !r.auto } : r))); setSaveNote(null); };
  const patch = (rid: string, p: Partial<Round>) => { setRounds(rounds.map((r) => (r.id === rid ? { ...r, ...p } : r))); setSaveNote(null); };
  const remove = (rid: string) => { setRounds(rounds.filter((r) => r.id !== rid)); setSaveNote(null); };
  const add = () => {
    setRounds([...rounds, { id: "rd" + Date.now(), name: "New round", type: "TECHNICAL", dur: 45, panel: "Engineer", auto: false, instr: "" }]);
    setSaveNote(null);
  };

  // Save: attempt PUT, fall back to POST, with graceful inline fallback.
  const save = async () => {
    if (!id) return;
    setSaving(true);
    setSaveNote(null);
    const body = JSON.stringify({
      rounds: rounds.map((r, i) => ({
        id: r.id, name: r.name, order: i + 1, type: r.type,
        interviewType: r.type, durationMinutes: r.dur, dur: r.dur,
        panel: r.panel, defaultPanelistRole: r.panel,
        autoAdvanceOnPass: r.auto, auto: r.auto, instructions: r.instr, instr: r.instr,
      })),
    });
    try {
      await raw(`/requisitions/${id}/rounds`, { method: "PUT", body });
      setSaveNote({ kind: "ok", text: "Pipeline saved." });
    } catch {
      try {
        await raw(`/requisitions/${id}/rounds`, { method: "POST", body });
        setSaveNote({ kind: "ok", text: "Pipeline saved." });
      } catch {
        setSaveNote({ kind: "warn", text: "Could not reach the server. Your changes are kept locally only." });
      }
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <Greeting title="Interview rounds" sub={`${rounds.length} rounds · candidates advance through these in order.`}>
        <Btn variant="soft" icon="enter" onClick={() => { if (id) window.location.assign(`/requisitions/${id}`); }}>Back to requisition</Btn>
        <Btn variant="primary" icon="plus" onClick={add}>Add round</Btn>
        <Btn variant="ai" icon="check" onClick={save} style={saving ? { opacity: 0.7, pointerEvents: "none" } : undefined}>
          {saving ? "Saving..." : "Save pipeline"}
        </Btn>
      </Greeting>

      <div style={{ maxWidth: 820 }}>
        {/* inline load / save status */}
        {loadNote && (
          <div style={{ marginBottom: 12, padding: "9px 13px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)", fontSize: 12.5, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
            <Icon name="dot" size={14} style={{ color: "var(--c-ink-3)" }} />{loadNote}
          </div>
        )}
        {saveNote && (
          <div style={{ marginBottom: 12, padding: "9px 13px", borderRadius: "var(--r)", display: "flex", gap: 8, alignItems: "center", fontSize: 12.5,
            background: saveNote.kind === "ok" ? "var(--c-ok-tint)" : "var(--c-warn-tint)",
            border: "1px solid " + (saveNote.kind === "ok" ? "var(--c-ok)" : "var(--c-warn)"),
            color: saveNote.kind === "ok" ? "var(--c-ok)" : "var(--c-warn)" }}>
            <Icon name={saveNote.kind === "ok" ? "check" : "flag"} size={14} />{saveNote.text}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-[14px]" />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rounds.map((r, i) => {
              const t = ROUND_TYPES[r.type];
              return (
                <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
                  {/* reorder controls + index */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move round up" style={{ border: "none", background: "none", cursor: i === 0 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === 0 ? 0.3 : 1, padding: 0, lineHeight: 0 }}>
                      <Icon name="chevD" size={15} style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--c-ink-3)" }}>{i + 1}</span>
                    <button onClick={() => move(i, 1)} disabled={i === rounds.length - 1} aria-label="Move round down" style={{ border: "none", background: "none", cursor: i === rounds.length - 1 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === rounds.length - 1 ? 0.3 : 1, padding: 0, lineHeight: 0 }}>
                      <Icon name="chevD" size={15} />
                    </button>
                  </div>

                  {/* type icon swatch */}
                  <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, color: t.tone, background: `color-mix(in oklab, ${t.tone} 13%, transparent)` }}>
                    <Icon name="calendar" size={18} />
                  </span>

                  {/* editable body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <input
                        value={r.name}
                        onChange={(e) => patch(r.id, { name: e.target.value })}
                        aria-label="Round name"
                        style={{ ...inputStyle, width: "auto", minWidth: 120, flex: "0 1 auto" }}
                      />
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: t.tone, background: `color-mix(in oklab, ${t.tone} 13%, transparent)` }}>
                        <select
                          value={r.type}
                          onChange={(e) => patch(r.id, { type: e.target.value as RoundType })}
                          aria-label="Round type"
                          style={{ border: "none", outline: "none", background: "transparent", color: t.tone, fontWeight: 600, fontSize: "var(--fs-xs)", fontFamily: "var(--font-sans)", cursor: "pointer", appearance: "none", textTransform: "capitalize" }}
                        >
                          {TYPE_ORDER.map((k) => (
                            <option key={k} value={k}>{ROUND_TYPES[k].label}</option>
                          ))}
                        </select>
                      </span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                        <input
                          type="number"
                          min={5}
                          max={480}
                          value={r.dur}
                          onChange={(e) => patch(r.id, { dur: Number(e.target.value) || 0 })}
                          aria-label="Duration in minutes"
                          style={{ width: 42, border: "1px solid var(--c-line-2)", borderRadius: "var(--r-sm)", outline: "none", background: "var(--c-surface-2)", color: "var(--c-ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, padding: "1px 4px", textAlign: "right" }}
                        />m
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 4, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span>Panel:</span>
                      <input
                        value={r.panel}
                        onChange={(e) => patch(r.id, { panel: e.target.value })}
                        aria-label="Panel"
                        style={{ ...inputStyle, width: "auto", minWidth: 90, flex: "0 1 auto", fontWeight: 600, fontSize: 11.5, color: "var(--c-ink-2)" }}
                      />
                      <span style={{ color: "var(--c-line-strong)" }}>·</span>
                      <input
                        value={r.instr}
                        onChange={(e) => patch(r.id, { instr: e.target.value })}
                        placeholder="Scorecard / instructions for interviewers"
                        aria-label="Instructions"
                        style={{ ...inputStyle, flex: 1, minWidth: 140, fontWeight: 400, fontSize: 11.5, color: "var(--c-ink-3)" }}
                      />
                    </div>
                  </div>

                  {/* auto-advance toggle */}
                  <button
                    onClick={() => toggleAuto(r.id)}
                    title="Auto-advance on pass"
                    aria-pressed={r.auto}
                    style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 10px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: r.auto ? "transparent" : "var(--c-line-2)", background: r.auto ? "var(--c-brand-tint)" : "var(--c-surface)", color: r.auto ? "var(--c-brand-ink)" : "var(--c-ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}
                  >
                    <span style={{ width: 26, height: 15, borderRadius: 99, background: r.auto ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", transition: "background var(--t)" }}>
                      <span style={{ position: "absolute", top: 2, left: r.auto ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
                    </span>
                    auto-advance
                  </button>

                  {/* remove */}
                  <button onClick={() => remove(r.id)} aria-label="Remove round" style={{ width: 30, height: 30, borderRadius: "var(--r-sm)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              );
            })}

            {rounds.length === 0 && (
              <div style={{ padding: "26px 16px", borderRadius: "var(--r-lg)", border: "1px dashed var(--c-line-strong)", background: "var(--c-surface)", textAlign: "center", color: "var(--c-ink-3)", fontSize: 13 }}>
                No rounds yet. Add the first stage of this interview pipeline.
              </div>
            )}
          </div>
        )}

        {/* AI interview-kit banner (verbatim copy from the prototype) */}
        <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
          <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
          <span>The <b style={{ color: "var(--c-ai-ink)" }}>interview-kit</b> agent can draft questions + a scoring rubric for each round.</span>
          <Btn variant="outlineAi" size="sm" icon="sparkles" style={{ marginLeft: "auto" }}>Generate kits</Btn>
        </div>
      </div>
    </div>
  );
}
