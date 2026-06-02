"use client";
// app/(dashboard)/copilot/page.tsx - EXACT Claude Design "Aurora" Copilot surface.
// Two-column AI chat: a grounded conversation thread (header + scrolling
// messages + composer) beside a "Try asking" suggestions rail. Ported verbatim
// from claude-design/screen-copilot.jsx. The seeded thread (one user question +
// one grounded, cited assistant answer with sources, suggested actions and
// follow-ups) renders as static starter chrome; the composer is a controlled
// input that appends the user's message to the thread on submit and attempts a
// real POST to /copilot, falling back to a friendly inline notice on failure.
import { useState, useRef, useEffect } from "react";
import { Btn, Pill, ScoreRing } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

// Inline fetch helper (per the port guide) - DO NOT edit lib/api.ts.
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

// fStyles.label, ported (palette ref gets the --c- prefix).
const LABEL: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--c-ink-3)" };

type UserMsg = { kind: "user"; text: string };
type Notice = { kind: "notice"; text: string };
type Msg = UserMsg | Notice;

// Seeded thread + answer, ported from window.COPILOT_THREAD (curly quotes and
// the ellipsis swapped for straight ASCII per the no-fancy-punctuation rule).
const SEED_USER = "Which candidates for the Payments backend role are strongest but stalled in the pipeline?";
const ANSWER = {
  confidence: 0.84,
  reasoning: [
    "Searched candidates scoped to REQ-4821 (Senior Backend Engineer)",
    "Filtered to stage age > 5 days with no scheduled next step",
    "Ranked by screening score and recency of activity",
  ],
  text: "Three strong candidates for **Senior Backend Engineer (REQ-4821)** have stalled with no next step scheduled:",
  items: [
    { n: "Priya Raman", meta: "Score 78 · in Screening 6 days · awaiting human review", src: "CAND-3192" },
    { n: "Dana Osei", meta: "Score 84 · Interview stage 8 days · panel not booked", src: "CAND-2885" },
    { n: "Lena Whitfield", meta: "Score 81 · Screening 5 days · no recruiter touch", src: "CAND-3044" },
  ],
  sources: ["CAND-3192", "CAND-2885", "CAND-3044", "REQ-4821"],
  actions: ["Book panel for Dana Osei", "Open Priya's review", "Message all three"],
  followups: ["Why is Priya awaiting review?", "Compare these three side by side", "Draft an outreach note"],
};
const SUGGESTIONS = [
  "Summarize this week's offer activity",
  "Where are we losing candidates in the funnel?",
  "Draft rejection feedback for Marcus Bell",
  "Which reqs are at risk of missing target start?",
];

export default function CopilotPage() {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Messages the user adds on top of the seeded starter exchange.
  const [extra, setExtra] = useState<Msg[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" }); }, [extra]);

  async function send(q: string) {
    const query = q.trim();
    if (!query || busy) return;
    setInput("");
    setBusy(true);
    setExtra((m) => [...m, { kind: "user", text: query }]);
    try {
      // Attempt a real grounded answer; on any failure show a friendly notice.
      await raw("/copilot", { method: "POST", body: JSON.stringify({ query }) });
      setExtra((m) => [...m, { kind: "notice", text: "Sent. Copilot is retrieving an answer grounded in your data." }]);
    } catch {
      setExtra((m) => [...m, { kind: "notice", text: "Copilot is offline right now, your question was added to the thread but not answered. Try again shortly." }]);
    } finally {
      setBusy(false);
    }
  }

  function fill(q: string) { setInput(q); }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", height: "calc(100vh - 132px)", minHeight: 560, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
        {/* chat column */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 28px", borderBottom: "1px solid var(--c-line)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "linear-gradient(135deg, var(--c-ai-2), var(--c-ai))", display: "grid", placeItems: "center", color: "white", boxShadow: "var(--e1)" }}><Icon name="sparkles" size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700, letterSpacing: "-0.02em" }}>Copilot</h1>
                <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">cites every claim</Pill>
              </div>
              <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>Ask anything about your pipeline, answers are grounded in your data, never invented.</div>
            </div>
            <Btn variant="soft" size="sm" icon="plus" onClick={() => setExtra([])}>New thread</Btn>
          </div>

          {/* conversation */}
          <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {/* seeded user msg */}
              <div style={{ alignSelf: "flex-end", maxWidth: "82%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", background: "var(--c-brand)", color: "var(--c-on-brand)", fontSize: "var(--fs-sm)", fontWeight: 500, boxShadow: "var(--e1)" }}>
                {SEED_USER}
              </div>

              {/* seeded grounded answer */}
              <div style={{ alignSelf: "flex-start", maxWidth: "92%" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--c-ai-tint)", color: "var(--c-ai)", display: "grid", placeItems: "center" }}><Icon name="sparkles" size={14} /></span>
                  <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Copilot</span>
                  <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">confidence {ANSWER.confidence.toFixed(2)}</Pill>
                </div>
                <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: ANSWER.text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>") }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ANSWER.items.map((it, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)" }}>
                        <ScoreRing value={parseInt(it.meta.match(/\d+/)?.[0] ?? "0")} size={38} band="var(--c-brand)" label="" />
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
                      {ANSWER.sources.map((s) => <Pill key={s} mono icon="fileText" tone="var(--c-ink-2)">{s}</Pill>)}
                    </div>
                  </div>
                </div>
                {/* suggested actions */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-ink-3)", marginBottom: 7, letterSpacing: ".04em", textTransform: "uppercase" }}>Suggested actions</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {ANSWER.actions.map((a) => <Btn key={a} variant="outlineAi" size="sm" icon="bolt">{a}</Btn>)}
                  </div>
                </div>
                {/* follow-ups */}
                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {ANSWER.followups.map((q) => (
                    <button key={q} onClick={() => fill(q)} style={{ fontSize: 12, fontWeight: 500, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}>
                      {q}<Icon name="arrowUpRight" size={12} /></button>
                  ))}
                </div>
              </div>

              {/* live thread: messages the user appends via the composer */}
              {extra.map((m, i) =>
                m.kind === "user" ? (
                  <div key={i} style={{ alignSelf: "flex-end", maxWidth: "82%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", background: "var(--c-brand)", color: "var(--c-on-brand)", fontSize: "var(--fs-sm)", fontWeight: 500, boxShadow: "var(--e1)" }}>
                    {m.text}
                  </div>
                ) : (
                  <div key={i} style={{ alignSelf: "flex-start", maxWidth: "92%", display: "flex", gap: 8, alignItems: "flex-start", padding: "11px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>
                    <Icon name="sparkles" size={14} stroke={2} />
                    <span>{m.text}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* composer */}
          <div style={{ padding: "14px 28px 18px", borderTop: "1px solid var(--c-line)" }}>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 8px 8px 16px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
              <Icon name="sparkles" size={18} stroke={2} />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about candidates, reqs, metrics..."
                aria-label="Ask the copilot"
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-md)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}
              />
              <Btn variant="ai" icon="enter">Ask</Btn>
            </form>
            <div style={{ maxWidth: 720, margin: "9px auto 0", textAlign: "center", fontSize: 11, color: "var(--c-ink-3)" }}>Copilot can be wrong, every answer shows its sources and confidence so you can verify.</div>
          </div>
        </div>

        {/* suggestions rail */}
        <aside style={{ borderLeft: "1px solid var(--c-line)", padding: "20px 16px", overflowY: "auto", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ ...LABEL, marginBottom: 12 }}>Try asking</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{ textAlign: "left", padding: "11px 13px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", cursor: "pointer", fontSize: 12.5, color: "var(--c-ink)", lineHeight: 1.4, fontWeight: 500, transition: "all var(--t-fast)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--c-ai)"; e.currentTarget.style.background = "var(--c-ai-tint)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--c-line)"; e.currentTarget.style.background = "var(--c-surface)"; }}
              >
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
