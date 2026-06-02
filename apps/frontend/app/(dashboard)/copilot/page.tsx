"use client";
// app/(dashboard)/copilot/page.tsx - EXACT Claude Design "Aurora" recruiter Copilot
// (claude-design/screen-copilot.jsx): an AI assistant chat surface that cites every
// claim. The conversation thread (user bubble + a streaming "thinking" reasoning
// block that reveals one retrieval step at a time, then a grounded answer card with
// confidence pill, ScoreRing candidate items, cited-source chips, suggested actions,
// and follow-up prompts), a "Try asking" suggestions rail, and a controlled composer.
// Violet --c-ai accent throughout (this is the AI surface).
//
// There is no real LLM endpoint, so the prototype's example exchange (from
// ai-data.jsx COPILOT_THREAD) is the visible thread, replayed verbatim. The composer
// is functional client-side: send appends the user's message and replays the sample
// assistant turn (thinking -> reasoning steps -> answer). The advisory disclaimer
// ("Copilot can be wrong...") is kept, every answer shows its sources and confidence.
import { useState, useEffect, useRef } from "react";
import { Btn, Pill, ScoreRing } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

/* ---- Copilot seed (verbatim from claude-design/ai-data.jsx) ---- */
type CopilotItem = { n: string; meta: string; src: string };
type UserTurn = { role: "user"; text: string };
type AssistantTurn = {
  role: "assistant";
  confidence: number;
  reasoning: string[];
  text: string;
  items: CopilotItem[];
  sources: string[];
  actions: string[];
  followups: string[];
};
type Turn = UserTurn | AssistantTurn;

const COPILOT_THREAD: [UserTurn, AssistantTurn] = [
  { role: "user", text: "Which candidates for the Payments backend role are strongest but stalled in the pipeline?" },
  {
    role: "assistant", confidence: 0.84,
    reasoning: ["Searched candidates scoped to REQ-4821 (Senior Backend Engineer)", "Filtered to stage age > 5 days with no scheduled next step", "Ranked by screening score and recency of activity"],
    text: "Three strong candidates for **Senior Backend Engineer (REQ-4821)** have stalled with no next step scheduled:",
    items: [
      { n: "Priya Raman", meta: "Score 78 · in Screening 6 days · awaiting human review", src: "CAND-3192" },
      { n: "Dana Osei", meta: "Score 84 · Interview stage 8 days · panel not booked", src: "CAND-2885" },
      { n: "Lena Whitfield", meta: "Score 81 · Screening 5 days · no recruiter touch", src: "CAND-3044" },
    ],
    sources: ["CAND-3192", "CAND-2885", "CAND-3044", "REQ-4821"],
    actions: ["Book panel for Dana Osei", "Open Priya's review", "Message all three"],
    followups: ["Why is Priya awaiting review?", "Compare these three side by side", "Draft an outreach note"],
  },
];
const COPILOT_SUGGESTIONS = [
  "Summarize this week's offer activity",
  "Where are we losing candidates in the funnel?",
  "Draft rejection feedback for Marcus Bell",
  "Which reqs are at risk of missing target start?",
];

export default function CopilotScreen() {
  const seed = COPILOT_THREAD;
  const ans = seed[1];
  // extra user turns appended by the composer, rendered above the replayed thinking/answer
  const [thread, setThread] = useState<Turn[]>([seed[0]]);
  const [phase, setPhase] = useState<"idle" | "thinking" | "answer">("idle"); // idle | thinking | answer
  const [steps, setSteps] = useState(0);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const run = (userTurn?: UserTurn) => {
    setThread(userTurn ? [seed[0], userTurn] : [seed[0]]);
    setPhase("thinking");
    setSteps(0);
  };
  useEffect(() => { run(); }, []);
  useEffect(() => {
    if (phase !== "thinking") return;
    if (steps >= ans.reasoning.length) { const t = setTimeout(() => setPhase("answer"), 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setSteps((s) => s + 1), 620); return () => clearTimeout(t);
  }, [phase, steps]);
  // keep the conversation pinned to the latest as it streams
  useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [thread, phase, steps]);

  const ask = (text: string) => {
    const q = text.trim();
    if (!q) return;
    run({ role: "user", text: q });
    setInput("");
  };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", height: "calc(100vh - var(--topbar) - 48px)", minHeight: 520, borderRadius: "var(--r-2xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 28px", borderBottom: "1px solid var(--c-line)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, var(--c-ai-2), var(--c-ai))", display: "grid", placeItems: "center", color: "white", boxShadow: "var(--e1)" }}><Icon name="sparkles" size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Copilot</h1><Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">cites every claim</Pill></div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Ask anything about your pipeline, answers are grounded in your data, never invented.</div>
            </div>
            <Btn variant="soft" size="sm" icon="plus" onClick={() => run()}>New thread</Btn>
          </div>

          {/* conversation */}
          <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* user msg(s) */}
              {thread.map((m, i) => m.role === "user" && (
                <div key={i} style={{ alignSelf: "flex-end", maxWidth: "82%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", background: "var(--c-brand)", color: "var(--c-on-brand)", fontSize: "var(--fs-sm)", fontWeight: 500, boxShadow: "var(--e1)" }}>
                  {m.text}
                </div>
              ))}

              {/* thinking */}
              {phase === "thinking" && (
                <div style={{ alignSelf: "flex-start", maxWidth: "92%", animation: "rise .3s var(--ease-out)" }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--c-ai)", animation: "livedot 1.3s infinite" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-ai-ink)" }}>Thinking, deciding what to retrieve...</span>
                  </div>
                  <div style={{ borderLeft: "2px solid var(--c-ai-tint-2)", paddingLeft: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                    {ans.reasoning.slice(0, steps).map((r, i) => (
                      <div key={i} style={{ fontSize: 12.5, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center", animation: "rise .3s var(--ease-out)" }}>
                        <Icon name="check" size={13} style={{ color: "var(--c-ai)" }} />{r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* answer */}
              {phase === "answer" && (
                <div style={{ alignSelf: "flex-start", maxWidth: "92%", animation: "rise .35s var(--ease-out)" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--c-ai-tint)", color: "var(--c-ai)", display: "grid", placeItems: "center" }}><Icon name="sparkles" size={14} /></span>
                    <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Copilot</span>
                    <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">confidence {ans.confidence.toFixed(2)}</Pill>
                  </div>
                  <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                    <p style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: ans.text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {ans.items.map((it, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)" }}>
                          <ScoreRing value={parseInt(it.meta.match(/\d+/)![0])} size={38} band="var(--c-brand)" label="" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{it.n}</div>
                            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{it.meta}</div>
                          </div>
                          <Pill mono icon="dot" tone="var(--c-brand)" bg="var(--c-brand-tint)">{it.src}</Pill>
                        </div>
                      ))}
                    </div>
                    {/* sources */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 7 }}>Sources</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {ans.sources.map((s) => <Pill key={s} mono icon="fileText" tone="var(--c-ink-2)">{s}</Pill>)}
                      </div>
                    </div>
                  </div>
                  {/* suggested actions */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-ink-3)", marginBottom: 7, letterSpacing: ".04em", textTransform: "uppercase" }}>Suggested actions</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {ans.actions.map((a) => <Btn key={a} variant="outlineAi" size="sm" icon="bolt">{a}</Btn>)}
                    </div>
                  </div>
                  {/* follow-ups */}
                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {ans.followups.map((q) => (
                      <button key={q} onClick={() => ask(q)} style={{ fontSize: 12, fontWeight: 500, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}>
                        {q}<Icon name="arrowUpRight" size={12} /></button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* composer */}
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} style={{ padding: "14px 28px 18px", borderTop: "1px solid var(--c-line)" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 8px 8px 16px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
              <Icon name="sparkles" size={18} style={{ color: "var(--c-ai)" }} />
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about candidates, reqs, metrics..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-md)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }} />
              <Btn variant="ai" icon="enter" type="submit">Ask</Btn>
            </div>
            <div style={{ maxWidth: 720, margin: "9px auto 0", textAlign: "center", fontSize: 11, color: "var(--c-ink-3)" }}>Copilot can be wrong, every answer shows its sources and confidence so you can verify.</div>
          </form>
        </div>

        {/* suggestions rail */}
        <aside style={{ borderLeft: "1px solid var(--c-line)", padding: "20px 16px", overflowY: "auto", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 12 }}>Try asking</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {COPILOT_SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} style={{ textAlign: "left", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12.5, color: "var(--c-ink)", lineHeight: 1.4, fontWeight: 500, transition: "all var(--t-fast)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c-ai)"; e.currentTarget.style.background = "var(--c-ai-tint)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-surface)"; }}>
                {s}
              </button>
            ))}
          </div>
          <div className="clay" style={{ marginTop: 18, borderRadius: "var(--r-lg)", padding: 14 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center", fontWeight: 700, fontSize: 12, color: "var(--c-ai-ink)", marginBottom: 6 }}><Icon name="shield" size={14} /> Grounded &amp; private</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-2)", lineHeight: 1.5 }}>Copilot only reads what you can already see, cites its sources, and never trains on your data.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
