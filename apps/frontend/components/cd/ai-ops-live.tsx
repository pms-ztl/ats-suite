"use client";
// components/cd/ai-ops-live.tsx
// Mounts the byte-exact CD AiOpsScreen. The gateway exposes no agent-fleet telemetry
// endpoint, so the KPI tiles + fleet table are the design's example content (mirrors
// the prototype's AIOPS data) using our real agent names.
import { AiOpsScreen } from "./SecAiScreens";
import type { AiOpsData } from "./types";

const AI_OPS_DATA: AiOpsData = {
  agentCount: 12,
  kpis: [
    { id: "runs", label: "Agent runs (24h)", value: 8420, delta: 12, good: true, ai: true, spark: [6800, 7000, 7300, 7600, 7900, 8100, 8300, 8420], icon: "cpu" },
    { id: "cost", label: "Inference cost (mo)", value: 2840, prefix: "$", delta: -120, good: true, spark: [3200, 3100, 3050, 2990, 2940, 2900, 2870, 2840], icon: "card" },
    { id: "lat", label: "Median latency", value: 3.4, suffix: "s", delta: -0.3, good: true, spark: [4.2, 4.0, 3.9, 3.7, 3.6, 3.5, 3.4, 3.4], icon: "clock" },
    { id: "health", label: "Agents healthy", value: 11, suffix: "/12", delta: 0, good: true, spark: [11, 11, 12, 11, 11, 11, 11, 11], icon: "check" },
  ],
  agents: [
    { n: "candidate-screener", status: "healthy", acc: 0.93, drift: "stable", cost: 980, lat: 3.8 },
    { n: "resume-parser", status: "healthy", acc: 0.91, drift: "stable", cost: 620, lat: 1.2 },
    { n: "jd-author", status: "healthy", acc: 0.96, drift: "stable", cost: 410, lat: 5.1 },
    { n: "bias-auditor", status: "watch", acc: 0.91, drift: "watch", cost: 180, lat: 6.4 },
    { n: "copilot", status: "healthy", acc: 0.89, drift: "stable", cost: 520, lat: 2.9 },
    { n: "analytics", status: "watch", acc: 0.87, drift: "watch", cost: 130, lat: 4.0 },
    { n: "offer", status: "healthy", acc: 0.94, drift: "stable", cost: 90, lat: 3.3 },
    { n: "scheduling", status: "healthy", acc: 0.92, drift: "stable", cost: 110, lat: 2.4 },
  ],
};

export function AiOpsLive() {
  return <AiOpsScreen data={AI_OPS_DATA} />;
}
