"use client";
// app/(dashboard)/requisitions/[id]/rounds/page.tsx
// EXACT Claude Design "Aurora" port of the interview RoundsConfig
// (claude-design/req-builder.jsx -> RoundsConfig): an ordered list of interview
// rounds / pipeline stages that candidates advance through, each with a type,
// panel, duration, instructions, an auto-advance toggle, and the interview-kit
// AI accent. Fully interactive via local useState (add / remove / reorder up &
// down / edit fields / toggle auto-advance / pick type). Best-effort loads any
// saved config from the gateway and attempts to persist on save, with graceful
// inline feedback. Inline palette colors use the --c-* full-color tokens;
// effect / size / type tokens stay bare. No fabricated saved data.
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

type CSS = React.CSSProperties;

type RoundType = "PHONE_SCREEN" | "TECHNICAL" | "BEHAVIORAL" | "PANEL" | "FINAL";
type Round = { id: string; name: string; type: RoundType; dur: number; panel: string; auto: boolean; instr: string };

// Round-type metadata (mirrors the prototype's ROUND_TYPES). Tones use the
// --c-* full-color tokens so they resolve to real colors.
const ROUND_TYPES: Record<RoundType, { label: string; tone: string }> = {
  PHONE_SCREEN: { label: "Phone screen", tone: "var(--c-info)" },
  TECHNICAL: { label: "Technical", tone: "var(--c-ai)" },
  BEHAVIORAL: { label: "Behavioral", tone: "var(--c-brand)" },
  PANEL: { label: "Panel", tone: "var(--c-warn)" },
  FINAL: { label: "Final", tone: "var(--c-ok)" },
};
const TYPE_ORDER: RoundType[] = ["PHONE_SCREEN", "TECHNICAL", "BEHAVIORAL", "PANEL", "FINAL"];

// Sensible default round set, used when nothing loads (mirrors the prototype's
// ROUNDS). Honest defaults only, never persisted unless the user saves.
const DEFAULT_ROUNDS: Round[] = [
  { id: "rd1", name: "Recruiter phone screen", type: "PHONE_SCREEN", dur: 30, panel: "Recruiter", auto: true, instr: "Motivation, comp expectations, role fit." },
  { id: "rd2", name: "Technical screen", type: "TECHNICAL", dur: 60, panel: "Senior Engineer", auto: true, instr: "Coding + systems fundamentals." },
  { id: "rd3", name: "System design", type: "TECHNICAL", dur: 60, panel: "Staff Engineer", auto: false, instr: "Design a payments ledger service." },
  { id: "rd4", name: "Behavioral & values", type: "BEHAVIORAL", dur: 45, panel: "Hiring Manager", auto: false, instr: "Ownership, collaboration, conflict." },
  { id: "rd5", name: "Final panel", type: "PANEL", dur: 90, panel: "Cross-functional", auto: false, instr: "Bar-raiser + 2 panelists." },
];

const LABEL_STYLE: CSS = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

// Local raw gateway fetch, scoped to this page (mirrors lib/api raw()).
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  return res.json();
}

// Map the gateway response (GET /api/rounds?requisitionId=) into our Round[]
// view-model. The interview-service returns InterviewRound rows whose
// interviewType matches our RoundType exactly, already ordered (order asc).
function extractRows(res: any): any[] {
  const rows = Array.isArray(res) ? res : res?.data ?? res?.rounds ?? [];
  return Array.isArray(rows) ? rows : [];
}
function fromServer(res: any): Round[] {
  return extractRows(res).map((r: any): Round => {
    const rawType = String(r?.interviewType ?? "TECHNICAL").toUpperCase();
    const type = (TYPE_ORDER.includes(rawType as RoundType) ? rawType : "TECHNICAL") as RoundType;
    const dur = Number(r?.durationMinutes);
    return {
      id: String(r?.id ?? `rd${Date.now()}`),
      name: String(r?.name ?? "Untitled round"),
      type,
      dur: Number.isFinite(dur) && dur > 0 ? Math.round(dur) : 45,
      panel: String(r?.defaultPanelistRole ?? "Panel"),
      auto: Boolean(r?.autoAdvanceOnPass),
      instr: String(r?.instructions ?? ""),
    };
  });
}
// server rounds carry UUID ids; locally-added rounds use "rd<n>" — used to tell
// the reconcile endpoint which rows to update vs create.
const isServerId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
function toServerRound(r: Round) {
  return {
    ...(isServerId(r.id) ? { id: r.id } : {}),
    name: r.name.trim() || "Untitled round",
    interviewType: r.type,
    durationMinutes: Math.max(15, Math.min(480, Math.round(r.dur) || 60)),
    autoAdvanceOnPass: r.auto,
    ...(r.panel.trim() ? { defaultPanelistRole: r.panel.trim() } : {}),
    ...(r.instr.trim() ? { instructions: r.instr.trim() } : {}),
  };
}

type SaveState = { kind: "idle" | "saving" | "ok" | "err"; msg?: string };

export default function RoundsPage() {
  const { id } = useParams<{ id: string }>();
  const [rounds, setRounds] = useState<Round[]>(DEFAULT_ROUNDS);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedSaved, setLoadedSaved] = useState(false);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });

  // Best-effort load: try the dedicated rounds endpoint, then fall back to the
  // requisition itself. Anything that does not parse leaves the defaults in place.
  useEffect(() => {
    let alive = true;
    (async () => {
      let next: Round[] = [];
      try { next = fromServer(await raw("GET", `/rounds?requisitionId=${encodeURIComponent(id)}`)); } catch { /* keep defaults */ }
      if (!alive) return;
      if (next.length) { setRounds(next); setLoadedSaved(true); }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id]);

  const move = (i: number, dir: number) =>
    setRounds((rs) => { const j = i + dir; if (j < 0 || j >= rs.length) return rs; const n = [...rs]; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const toggleAuto = (rid: string) =>
    setRounds((rs) => rs.map((r) => (r.id === rid ? { ...r, auto: !r.auto } : r)));
  const remove = (rid: string) =>
    setRounds((rs) => rs.filter((r) => r.id !== rid));
  const upd = (rid: string, patch: Partial<Round>) =>
    setRounds((rs) => rs.map((r) => (r.id === rid ? { ...r, ...patch } : r)));
  const add = () =>
    setRounds((rs) => [...rs, { id: "rd" + Date.now(), name: "New round", type: "TECHNICAL", dur: 45, panel: "Engineer", auto: false, instr: "" }]);

  // Save attempts PUT then POST; either success surfaces inline confirmation.
  const onSave = useCallback(async () => {
    setSave({ kind: "saving" });
    try {
      const res = await raw("PUT", `/rounds?requisitionId=${encodeURIComponent(id)}`, { rounds: rounds.map(toServerRound) });
      const saved = fromServer(res);
      if (saved.length) setRounds(saved);
      setLoadedSaved(true);
      setSave({ kind: "ok", msg: "Rounds saved." });
    } catch {
      setSave({ kind: "err", msg: "Could not save to the server. Your changes are kept locally." });
    }
  }, [rounds, id]);

  const totalMins = rounds.reduce((sum, r) => sum + (Number.isFinite(r.dur) ? r.dur : 0), 0);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header + save bar */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Interview rounds</h1>
          <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
            {rounds.length} rounds candidates advance through in order for requisition <span className="mono">{id}</span>.
            {loadedSaved ? " Loaded from your saved loop." : " Starting from the default loop."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
          {save.kind === "ok" && (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-ok)" }}>
              <Icon name="check" size={14} stroke={2.2} />{save.msg}
            </span>
          )}
          {save.kind === "err" && (
            <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-warn)", maxWidth: 320 }}>
              <Icon name="flag" size={14} />{save.msg}
            </span>
          )}
          <Btn variant="primary" icon="plus" onClick={add}>Add round</Btn>
          <Btn variant="soft" icon={save.kind === "saving" ? "clock" : "check"} onClick={onSave} disabled={save.kind === "saving"}>
            {save.kind === "saving" ? "Saving..." : "Save loop"}
          </Btn>
        </div>
      </div>

      <div style={{ maxWidth: 860 }}>
        {/* total-time summary strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
          <Icon name="clock" size={15} style={{ color: "var(--c-ink-3)" }} />
          <span>Total candidate time across the loop:</span>
          <span className="mono" style={{ fontWeight: 700, color: "var(--c-ink)" }}>{totalMins}m</span>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[70px] rounded-[14px]" />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rounds.map((r, i) => {
              const t = ROUND_TYPES[r.type];
              const tintBg = `color-mix(in oklab, ${t.tone} 13%, transparent)`;
              const open = editing === r.id;
              return (
                <div key={r.id} style={{ borderRadius: "var(--r-lg)", border: "1px solid", borderColor: open ? "var(--c-brand)" : "var(--c-line)", background: "var(--c-surface)", boxShadow: open ? "var(--ring)" : "var(--e1)", animation: "rise .3s var(--ease-out)" }}>
                  {/* row */}
                  <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 16px" }}>
                    {/* reorder + ordinal */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <button onClick={() => move(i, -1)} disabled={i === 0}
                        style={{ border: "none", background: "none", cursor: i === 0 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === 0 ? 0.3 : 1, padding: 0, lineHeight: 0 }}>
                        <Icon name="chevD" size={15} style={{ transform: "rotate(180deg)" }} />
                      </button>
                      <span className="mono" style={{ width: 22, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--c-ink-3)" }}>{i + 1}</span>
                      <button onClick={() => move(i, 1)} disabled={i === rounds.length - 1}
                        style={{ border: "none", background: "none", cursor: i === rounds.length - 1 ? "default" : "pointer", color: "var(--c-ink-3)", opacity: i === rounds.length - 1 ? 0.3 : 1, padding: 0, lineHeight: 0 }}>
                        <Icon name="chevD" size={15} />
                      </button>
                    </div>
                    {/* type glyph */}
                    <span style={{ width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0, color: t.tone, background: tintBg }}>
                      <Icon name="calendar" size={18} />
                    </span>
                    {/* name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{r.name}</span>
                        <Pill tone={t.tone} bg={tintBg}>{t.label}</Pill>
                        <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{r.dur}m</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>Panel: {r.panel}{r.instr ? ` · ${r.instr}` : ""}</div>
                    </div>
                    {/* auto-advance toggle */}
                    <button onClick={() => toggleAuto(r.id)} title="Auto-advance on pass"
                      style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "6px 10px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: r.auto ? "transparent" : "var(--c-line-2)", background: r.auto ? "var(--c-brand-tint)" : "var(--c-surface)", color: r.auto ? "var(--c-brand-ink)" : "var(--c-ink-3)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                      <span style={{ width: 26, height: 15, borderRadius: 99, background: r.auto ? "var(--c-brand)" : "var(--c-line-strong)", position: "relative", transition: "background var(--t)" }}>
                        <span style={{ position: "absolute", top: 2, left: r.auto ? 13 : 2, width: 11, height: 11, borderRadius: 99, background: "white", transition: "left var(--t)" }} />
                      </span>
                      auto-advance
                    </button>
                    {/* edit toggle */}
                    <button onClick={() => setEditing(open ? null : r.id)} title="Edit round"
                      style={{ width: 30, height: 30, borderRadius: "var(--r-sm)", border: "1px solid", borderColor: open ? "var(--c-brand)" : "var(--c-line)", background: open ? "var(--c-brand-tint)" : "var(--c-surface)", color: open ? "var(--c-brand-ink)" : "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                      <Icon name="settings" size={14} />
                    </button>
                    {/* remove */}
                    <button onClick={() => remove(r.id)} title="Remove round"
                      style={{ width: 30, height: 30, borderRadius: "var(--r-sm)", border: "1px solid var(--c-line)", background: "var(--c-surface)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>

                  {/* inline editor */}
                  {open && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--c-line)", marginTop: -2 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 12, paddingTop: 14 }}>
                        <div>
                          <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Round name</div>
                          <input value={r.name} onChange={(e) => upd(r.id, { name: e.target.value })}
                            style={{ width: "100%", padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)", outline: "none" }} />
                        </div>
                        <div>
                          <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Duration (min)</div>
                          <input type="number" min={5} step={5} value={r.dur}
                            onChange={(e) => upd(r.id, { dur: Math.max(0, Number(e.target.value) || 0) })}
                            style={{ width: "100%", padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-mono)", outline: "none" }} />
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Panel</div>
                        <input value={r.panel} onChange={(e) => upd(r.id, { panel: e.target.value })}
                          style={{ width: "100%", padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)", outline: "none" }} />
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Round type</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {TYPE_ORDER.map((rt) => {
                            const active = r.type === rt;
                            const meta = ROUND_TYPES[rt];
                            return (
                              <button key={rt} onClick={() => upd(r.id, { type: rt })}
                                style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "5px 10px", borderRadius: "var(--r-pill)", border: "1px solid", borderColor: active ? "transparent" : "var(--c-line-2)", background: active ? `color-mix(in oklab, ${meta.tone} 13%, transparent)` : "var(--c-surface)", color: active ? meta.tone : "var(--c-ink-2)", cursor: "pointer", fontSize: 11.5, fontWeight: 600, fontFamily: "var(--font-sans)" }}>
                                <Icon name="calendar" size={13} />{meta.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <div style={{ ...LABEL_STYLE, marginBottom: 6 }}>Interviewer instructions</div>
                        <textarea value={r.instr} onChange={(e) => upd(r.id, { instr: e.target.value })} rows={2}
                          placeholder="What this round should assess..."
                          style={{ width: "100%", padding: "8px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)", outline: "none", resize: "vertical" }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {rounds.length === 0 && (
              <div style={{ padding: "28px 16px", borderRadius: "var(--r-lg)", border: "1px dashed var(--c-line-strong)", background: "var(--c-surface-2)", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
                No rounds yet. Add the first stage of your interview loop.
              </div>
            )}
          </div>
        )}

        {/* interview-kit AI accent */}
        <div style={{ marginTop: 14, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--c-ink-2)" }}>
          <Icon name="sparkles" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
          <span>The <b style={{ color: "var(--c-ai-ink)" }}>interview-kit</b> agent can draft questions + a scoring rubric for each round.</span>
          <Btn variant="outlineAi" size="sm" icon="sparkles" style={{ marginLeft: "auto" }}>Generate kits</Btn>
        </div>
      </div>
    </div>
  );
}
