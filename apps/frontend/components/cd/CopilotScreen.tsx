"use client";
// CopilotScreen.tsx, AI assistant: streaming reasoning, cited sources, confidence, actions.
// Ported byte-faithful from screen-copilot.jsx. Data via props only.
import React, { useState, useEffect, useRef } from "react";
import { Pill, ScoreRing, fStyles } from "./aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import type { CopilotData } from "./types";

export function CopilotScreen({ data, onAsk }: { data: CopilotData; onAsk?: (q: string) => void }) {
  const seed = data.thread;
  const ans = data.answer;
  const [phase, setPhase] = useState<"idle" | "thinking" | "answer">("idle");
  const [steps, setSteps] = useState(0);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const run = () => { setPhase("thinking"); setSteps(0); };
  useEffect(() => { run(); }, []);
  useEffect(() => {
    if (phase !== "thinking") return;
    if (steps >= ans.reasoning.length) { const t = setTimeout(() => setPhase("answer"), 400); return () => clearTimeout(t); }
    const t = setTimeout(() => setSteps(s => s + 1), 620); return () => clearTimeout(t);
  }, [phase, steps]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", height: "100%", minHeight: 0 }} className="copilot-grid">
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 28px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, var(--ai-2), var(--ai))", display: "grid", placeItems: "center", color: "white", boxShadow: "var(--e1)" }}><Icon name="sparkles" size={20} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}><h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Copilot</h1><Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">cites every claim</Pill></div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Ask anything about your pipeline, answers are grounded in your data, never invented.</div>
          </div>
          <Btn variant="soft" size="sm" icon="plus" onClick={run}>New thread</Btn>
        </div>

        {/* conversation */}
        <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ alignSelf: "flex-end", maxWidth: "82%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", background: "var(--brand)", color: "var(--on-brand)", fontSize: "var(--fs-sm)", fontWeight: 500, boxShadow: "var(--e1)" }}>
              {seed.text}
            </div>

            {phase === "thinking" && (
              <div style={{ alignSelf: "flex-start", maxWidth: "92%", animation: "rise .3s var(--ease-out)" }}>
                <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ai)", animation: "pulsering 1.3s infinite" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ai-ink)" }}>Thinking, deciding what to retrieve&hellip;</span>
                </div>
                <div style={{ borderLeft: "2px solid var(--ai-tint-2)", paddingLeft: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                  {ans.reasoning.slice(0, steps).map((r, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: "var(--ink-2)", display: "flex", gap: 8, alignItems: "center", animation: "rise .3s var(--ease-out)" }}>
                      <Icon name="check" size={13} style={{ color: "var(--ai)" }} />{r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phase === "answer" && (
              <div style={{ alignSelf: "flex-start", maxWidth: "92%", animation: "rise .35s var(--ease-out)" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--ai-tint)", color: "var(--ai)", display: "grid", placeItems: "center" }}><Icon name="sparkles" size={14} /></span>
                  <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Copilot</span>
                  <Pill mono tone="var(--ai-ink)" bg="var(--ai-tint)">confidence {ans.confidence.toFixed(2)}</Pill>
                </div>
                <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: ans.text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ans.items.map((it, i) => {
                      const m = it.meta.match(/\d+/);
                      return (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 13px", borderRadius: "var(--r)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
                          <ScoreRing value={m ? parseInt(m[0]) : 0} size={38} band="var(--brand)" label="" />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{it.n}</div>
                            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{it.meta}</div>
                          </div>
                          <Pill mono icon="dot" tone="var(--brand)" bg="var(--brand-tint)">{it.src}</Pill>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>Sources</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {ans.sources.map(s => <Pill key={s} mono icon="fileText" tone="var(--ink-2)">{s}</Pill>)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginBottom: 7, letterSpacing: ".04em", textTransform: "uppercase" }}>Suggested actions</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ans.actions.map(a => <Btn key={a} variant="outlineAi" size="sm" icon="bolt">{a}</Btn>)}
                  </div>
                </div>
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {ans.followups.map(q => (
                    <button key={q} onClick={() => onAsk?.(q)} style={{ fontSize: 12, fontWeight: 500, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}>
                      {q}<Icon name="arrowUpRight" size={12} /></button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* composer */}
        <div style={{ padding: "14px 28px 18px", borderTop: "1px solid var(--line)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 8px 8px 16px", borderRadius: "var(--r-xl)", border: "1px solid var(--line-2)", background: "var(--surface)", boxShadow: "var(--e1)" }}>
            <Icon name="sparkles" size={18} style={{ color: "var(--ai)" }} />
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onAsk?.(input.trim()); setInput(""); } }} placeholder="Ask about candidates, reqs, metrics&hellip;" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-md)", color: "var(--ink)", fontFamily: "var(--font-sans)" }} />
            <Btn variant="ai" icon="enter" onClick={() => { if (input.trim()) { onAsk?.(input.trim()); setInput(""); } }}>Ask</Btn>
          </div>
          <div style={{ maxWidth: 720, margin: "9px auto 0", textAlign: "center", fontSize: 11, color: "var(--ink-3)" }}>Copilot can be wrong, every answer shows its sources and confidence so you can verify.</div>
        </div>
      </div>

      {/* suggestions rail */}
      <aside style={{ borderLeft: "1px solid var(--line)", padding: "20px 16px", overflowY: "auto", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }} className="copilot-rail">
        <div style={{ ...fStyles.label, marginBottom: 12 }}>Try asking</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.suggestions.map(s => (
            <button key={s} onClick={() => onAsk?.(s)} style={{ textAlign: "left", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", fontSize: 12.5, color: "var(--ink)", lineHeight: 1.4, fontWeight: 500, transition: "all var(--t-fast)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--ai)"; e.currentTarget.style.background = "var(--ai-tint)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.background = "var(--surface)"; }}>
              {s}
            </button>
          ))}
        </div>
        <div className="clay" style={{ marginTop: 18, borderRadius: "var(--r-lg)", padding: 14 }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", fontWeight: 700, fontSize: 12, color: "var(--ai-ink)", marginBottom: 6 }}><Icon name="shield" size={14} /> Grounded &amp; private</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5 }}>Copilot only reads what you can already see, cites its sources, and never trains on your data.</div>
        </div>
      </aside>
    </div>
  );
}
