"use client";
// components/cd/mobility-live.tsx
// Mounts the byte-exact CD MobilityScreen with the design's example internal-mobility
// matches (the gateway exposes no internal-mobility resource yet).
import { MobilityScreen } from "./AiSurfaceScreens";
import type { MobilityData } from "./types";

const MOBILITY_DATA: MobilityData = {
  matches: [
    { ini: "RK", name: "Ruth Kana", cur: "Backend Engineer II", tenure: "2y 4m", skills: ["Go", "Kafka", "PostgreSQL"], match: 88, to: "Senior Backend Engineer", reqId: "REQ-4201", ai: true },
    { ini: "MD", name: "Mateo Diaz", cur: "Data Analyst", tenure: "1y 8m", skills: ["SQL", "Python", "dbt"], match: 81, to: "Analytics Engineer", reqId: "REQ-4188", ai: true },
    { ini: "AN", name: "Amara Nwosu", cur: "Support Lead", tenure: "3y 1m", skills: ["Zendesk", "Operations", "SQL"], match: 74, to: "Implementation Manager", reqId: "REQ-4170", ai: true },
  ],
};

export function MobilityLive() {
  return (
    <div>
      <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 14, padding: "10px 14px", borderRadius: "var(--r, 11px)", background: "var(--warn-tint)", color: "var(--warn)", border: "1px solid color-mix(in oklab, var(--warn) 32%, transparent)", fontSize: 12.5, fontWeight: 600 }}>
        <span aria-hidden>⚠</span>
        <span><b>Sample preview</b>: the internal-mobility engine is not enabled for this workspace yet; these matches are illustrative.</span>
      </div>
      <MobilityScreen data={MOBILITY_DATA} />
    </div>
  );
}
