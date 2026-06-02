"use client";
// app/(dashboard)/copilot/page.tsx - EXACT Claude Design "Aurora" recruiter Copilot
// (claude-design/screen-copilot.jsx): a chat surface that cites every claim. A
// grounded conversation thread (answer cards with confidence + reasoning + cited
// sources + ScoreRing candidate items), a suggested-prompt rail, and a controlled
// composer. Violet --c-ai accent throughout (this is the AI surface).
//
// Seeded starter content is acceptable for a copilot (the example exchange). The
// composer is real: on send it appends the user message locally and best-effort
// POSTs to /copilot; on failure it shows a friendly inline notice (the user
// message is still echoed). We never fabricate an AI answer as if from the backend.
import { useState, useRef, useEffect } from "react";
import { Btn, Pill, ScoreRing } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type AnswerItem = { n: string; meta: string; src: string };
type AssistantMsg = {
  role: "assistant";
  confidence?: number;
  reasoning?: string[];
  text: string;
  items?: AnswerItem[];
  sources?: string[];
  actions?: string[];
  followups?: string[];
};
type NoticeMsg = { role: "notice"; text: string };
type UserMsg = { role: "user"; text: string };
type Msg = UserMsg | AssistantMsg | NoticeMsg;

// Seeded example exchange (verbatim from screen-copilot.jsx / ai-data.jsx),
// shown as starter content so the surface is never empty.
const SEED_USER: UserMsg = {
  role: "user",
  text: "Which candidates for the Payments backend role are strongest but stalled in the pipeline?",
};
const SEED_ANSWER: AssistantMsg = {
  role: "assistant",
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

const SEED_THREAD: Msg[] = [SEED_USER, SEED_ANSWER];

function bold(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
}
function matchNum(meta: string): number {
  const m = meta.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

/* --------------------------- message renderers --------------------------- */

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ alignSelf: "flex-end", maxWidth: "82%", padding: "11px 15px", borderRadius: "16px 16px 4px 16px", background: "var(--c-brand)", color: "var(--c-on-brand)", fontSize: "var(--fs-sm)", fontWeight: 500, boxShadow: "var(--e1)" }}>
      {text}
    </div>
  );
}

function NoticeBubble({ text }: { text: string }) {
  return (
    <div style={{ alignSelf: "flex-start", maxWidth: "92%", display: "flex", gap: 9, alignItems: "flex-start", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>
      <Icon name="flag" size={15} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
      <span style={{ lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function AnswerCard({ msg, onFollowup }: { msg: AssistantMsg; onFollowup: (q: string) => void }) {
  return (
    <div style={{ alignSelf: "flex-start", maxWidth: "92%", animation: "rise .35s var(--ease-out)" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
        <span style={{ width: 26, height: 26, borderRadius: 8, background: "var(--c-ai-tint)", color: "var(--c-ai)", display: "grid", placeItems: "center" }}><Icon name="sparkles" size={14} /></span>
        <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Copilot</span>
        {typeof msg.confidence === "number" && (
          <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">confidence {msg.confidence.toFixed(2)}</Pill>
        )}
      </div>

      <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
        {msg.reasoning && msg.reasoning.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ai-ink)", marginBottom: 7, display: "inline-flex", gap: 6, alignItems: "center" }}>
              <Icon name="sparkles" size={12} /> How I got here
            </div>
            <div style={{ borderLeft: "2px solid var(--c-ai-tint-2)", paddingLeft: 14, display: "flex", flexDirection: "column", gap: 7 }}>
              {msg.reasoning.map((r, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "var(--c-ink-2)", display: "flex", gap: 8, alignItems: "center" }}>
                  <Icon name="check" size={13} style={{ color: "var(--c-ai)" }} />{r}
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ margin: "0 0 12px", fontSize: "var(--fs-md)", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: bold(msg.text) }} />

        {msg.items && msg.items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {msg.items.map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-surface-2)", border: "1px solid var(--c-line)" }}>
                <ScoreRing value={matchNum(it.meta)} size={38} band="var(--c-brand)" label="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{it.n}</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{it.meta}</div>
                </div>
                <Pill mono icon="dot" tone="var(--c-brand)" bg="var(--c-brand-tint)">{it.src}</Pill>
              </div>
            ))}
          </div>
        )}

        {msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 7 }}>Sources</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {msg.sources.map((s) => <Pill key={s} mono icon="fileText" tone="var(--c-ink-2)">{s}</Pill>)}
            </div>
          </div>
        )}
      </div>

      {msg.actions && msg.actions.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--c-ink-3)", marginBottom: 7, letterSpacing: ".04em", textTransform: "uppercase" }}>Suggested actions</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {msg.actions.map((a) => <Btn key={a} variant="outlineAi" size="sm" icon="bolt">{a}</Btn>)}
          </div>
        </div>
      )}

      {msg.followups && msg.followups.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 7 }}>
          {msg.followups.map((q) => (
            <button key={q} onClick={() => onFollowup(q)} style={{ fontSize: 12, fontWeight: 500, padding: "7px 12px", borderRadius: "var(--r-pill)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" }}>
              {q}<Icon name="arrowUpRight" size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThinkingRow() {
  return (
    <div style={{ alignSelf: "flex-start", maxWidth: "92%", animation: "rise .3s var(--ease-out)" }}>
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--c-ai)", animation: "livedot 1.3s infinite" }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--c-ai-ink)" }}>Thinking, deciding what to retrieve...</span>
      </div>
    </div>
  );
}

/* -------------------------------- screen -------------------------------- */

export default function CopilotPage() {
  const [thread, setThread] = useState<Msg[]>(SEED_THREAD);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread, busy]);

  const newThread = () => {
    setThread(SEED_THREAD);
    setInput("");
    setBusy(false);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setThread((t) => [...t, { role: "user", text }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Partial<AssistantMsg> = await res.json();
      const answer: AssistantMsg = {
        role: "assistant",
        confidence: data.confidence,
        reasoning: data.reasoning,
        text: typeof data.text === "string" ? data.text : "",
        items: data.items,
        sources: data.sources,
        actions: data.actions,
        followups: data.followups,
      };
      if (answer.text) {
        setThread((t) => [...t, answer]);
      } else {
        setThread((t) => [...t, { role: "notice", text: "Copilot received your question, but the response was empty. Try rephrasing it." }]);
      }
    } catch {
      setThread((t) => [...t, { role: "notice", text: "Copilot is not reachable right now, so I could not answer this yet. Your question is saved above; try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  };

  const useSuggestion = (q: string) => {
    setInput(q);
    inputRef.current?.focus();
  };

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", height: "calc(100vh - 7rem)", minHeight: 520, borderRadius: "var(--r-2xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden" }}>
        {/* conversation column */}
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
            <Btn variant="soft" size="sm" icon="plus" onClick={newThread}>New thread</Btn>
          </div>

          {/* conversation */}
          <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
              {thread.map((m, i) => {
                if (m.role === "user") return <UserBubble key={i} text={m.text} />;
                if (m.role === "notice") return <NoticeBubble key={i} text={m.text} />;
                return <AnswerCard key={i} msg={m} onFollowup={(q) => send(q)} />;
              })}
              {busy && <ThinkingRow />}
            </div>
          </div>

          {/* composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            style={{ padding: "14px 28px 18px", borderTop: "1px solid var(--c-line)" }}
          >
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", gap: 10, alignItems: "center", padding: "8px 8px 8px 16px", borderRadius: "var(--r-xl)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
              <Icon name="sparkles" size={18} style={{ color: "var(--c-ai)" }} />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about candidates, reqs, metrics..."
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-md)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}
              />
              <Btn variant="ai" icon="enter" style={busy ? { opacity: 0.6, pointerEvents: "none" } : undefined}>{busy ? "Asking" : "Ask"}</Btn>
            </div>
            <div style={{ maxWidth: 720, margin: "9px auto 0", textAlign: "center", fontSize: 11, color: "var(--c-ink-3)" }}>Copilot can be wrong, every answer shows its sources and confidence so you can verify.</div>
          </form>
        </div>

        {/* suggestions rail */}
        <aside style={{ borderLeft: "1px solid var(--c-line)", padding: "20px 16px", overflowY: "auto", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 12 }}>Try asking</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => useSuggestion(s)}
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
