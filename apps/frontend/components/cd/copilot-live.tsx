"use client";
// components/cd/copilot-live.tsx
// Mounts the byte-exact CD CopilotScreen with the design's example grounded Q&A.
// There is no copilot backend yet, so the thread + answer are the design's seed
// (the streaming reasoning + cited cards are the CopilotScreen's own animation).
// onAsk is a local no-op until a real copilot endpoint exists.
import { CopilotScreen } from "./CopilotScreen";
import type { CopilotData } from "./types";

const COPILOT_DATA: CopilotData = {
  thread: { text: "Which candidates in the pipeline are the strongest fit for our Senior Backend Engineer role, and why?" },
  answer: {
    reasoning: [
      "Retrieving open requisitions and their required skills",
      "Pulling candidates currently in screening and interview",
      "Reading each candidate's AI screening verdict",
      "Ranking by match score, weighted toward must-have requirements",
    ],
    confidence: 0.86,
    text: "Three candidates stand out for **Senior Backend Engineer**. Each clears the must-have requirements and has moved past the screening stage. The ranking weights distributed-systems depth and payments-domain experience most heavily.",
    items: [
      { n: "Lena Whitfield", meta: "Match 87 · 5 of 5 requirements met", src: "verdict" },
      { n: "Marcus Bell", meta: "Match 81 · 4 of 5 requirements met", src: "verdict" },
      { n: "Priya Raman", meta: "Match 78 · flagged for human review", src: "verdict" },
    ],
    sources: ["requisition", "screening-verdicts", "pipeline-stages"],
    actions: ["Schedule interviews for the top two", "Open the highest-match profile"],
    followups: ["Who is most at risk of dropping off?", "Compare the top two side by side"],
  },
  suggestions: [
    "Which reqs are falling behind on time-to-hire?",
    "Summarize this week's screening verdicts",
    "Which candidates are awaiting a human decision?",
    "Show the diversity of the current interview slate",
  ],
};

export function CopilotLive() {
  return <CopilotScreen data={COPILOT_DATA} />;
}
