"use client";
// components/cd/copilot-live.tsx
// Wires the CD CopilotScreen to the REAL /api/copilot agent. Each question is
// sent to the backend (askCopilot); the grounded answer + cited sources are
// mapped into the screen's CopilotData shape. While the request is in flight the
// screen holds in its "thinking" state (loading prop). On failure it shows an
// honest error message instead of a fabricated answer.
import { useState } from "react";
import { CopilotScreen } from "./CopilotScreen";
import type { CopilotData, CopilotAnswer } from "./types";
import { askCopilot, type CopilotResponse } from "@/lib/api";

const SUGGESTIONS = [
  "Which reqs are falling behind on time-to-hire?",
  "Summarize this week's screening verdicts",
  "Which candidates are awaiting a human decision?",
  "Show the diversity of the current interview slate",
];

// Cosmetic "thinking" steps shown during the live request (the backend single
// call doesn't stream a trace; these are UI chrome, not claimed facts).
const THINKING = [
  "Reading your pipeline data",
  "Retrieving candidates and requisitions",
  "Reading the AI screening verdicts",
  "Synthesizing a grounded answer",
];

const humanType = (t: string): string =>
  ({ candidate: "Candidate", requisition: "Requisition", interview: "Interview", metric: "Metric", policy: "Policy" } as Record<string, string>)[t] ?? t;

function mapAnswer(out: CopilotResponse): CopilotAnswer {
  const srcs = out.sources ?? [];
  return {
    reasoning: THINKING,
    confidence: typeof out.confidence === "number" ? out.confidence : 0,
    text: out.answer || "No answer was returned.",
    // Cited sources rendered as cards (snippet = real cited content).
    items: srcs.slice(0, 6).map((s) => ({
      n: humanType(s.type) + (s.id ? " · " + String(s.id).slice(0, 8) : ""),
      meta: s.snippet || "",
      src: s.type,
    })),
    sources: Array.from(new Set(srcs.map((s) => s.type))),
    actions: (out.suggestedActions ?? []).map((a) => a.label).filter(Boolean),
    followups: (out.followUpQuestions ?? []).filter(Boolean),
  };
}

function errorAnswer(): CopilotAnswer {
  return {
    reasoning: THINKING,
    confidence: 0,
    text:
      "I couldn't reach the AI just now. The model service may be **rate-limited** (the demo runs on a free tier) or temporarily busy — please try again in a moment. If this keeps happening, the LLM API key needs more budget.",
    items: [],
    sources: [],
    actions: [],
    followups: [],
  };
}

const INTRO: CopilotData = {
  thread: { text: "What can you help me with?" },
  answer: {
    reasoning: THINKING,
    confidence: 0,
    text:
      "I answer questions about your live hiring pipeline — candidates, requisitions, screening verdicts, and metrics — and I cite every source. Pick a prompt on the right, or ask your own below.",
    items: [],
    sources: [],
    actions: [],
    followups: [],
  },
  suggestions: SUGGESTIONS,
};

const loadingData = (q: string): CopilotData => ({
  thread: { text: q },
  answer: { reasoning: THINKING, confidence: 0, text: "", items: [], sources: [], actions: [], followups: [] },
  suggestions: SUGGESTIONS,
});

export function CopilotLive() {
  const [threadId, setThreadId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CopilotData>(INTRO);

  async function ask(q: string) {
    const query = q.trim();
    if (!query || loading) return;
    setThreadId((n) => n + 1); // remount CopilotScreen -> restart its thinking animation
    setLoading(true);
    setData(loadingData(query));
    try {
      const out = await askCopilot(query);
      setData({ thread: { text: query }, answer: mapAnswer(out), suggestions: SUGGESTIONS });
    } catch {
      setData({ thread: { text: query }, answer: errorAnswer(), suggestions: SUGGESTIONS });
    } finally {
      setLoading(false);
    }
  }

  return <CopilotScreen key={threadId} data={data} loading={loading} onAsk={(q) => void ask(q)} />;
}
