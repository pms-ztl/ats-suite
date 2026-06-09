"use client";
// components/cd/ai-ops-live.tsx
// AI operations fleet view. There is NO agent-fleet telemetry endpoint today
// (no per-agent accuracy / drift / latency series is exposed by any service),
// so rather than render the design's fabricated fleet numbers we show an honest
// empty-state. Real cross-tenant AI *spend* lives on the Cost analytics screen
// (PlatformCostLive), which is wired to the billing AgentRunCost rollup.
import { EmptyChart } from "@/components/shared/charts";
import { Pill } from "./aurora-kit";

export function AiOpsLive() {
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>AI operations</h1>
              <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">fleet telemetry</Pill>
            </div>
            <p style={{ margin: "5px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-md)" }}>Per-agent health, accuracy, drift, and latency across the fleet.</p>
          </div>
        </div>
        <div style={{ height: 320 }}>
          <EmptyChart label="Agent-fleet telemetry (accuracy / drift / latency) is not yet collected. See Cost analytics for live AI spend." />
        </div>
      </div>
    </div>
  );
}
