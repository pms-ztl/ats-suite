"use client";
// components/cd/fairness-live.tsx
// Wires the verbatim CD Fairness / adverse-impact dashboard (./FairnessScreen) to the
// gateway: getAdverseImpact -> FairnessData. The gateway returns per-group selection
// rates + impact ratios for one demographic dimension (no per-group raw counts and no
// intersectional grid), so those render as 0 / empty. Empty for tenants with no
// demographic data yet.
import { FairnessScreen } from "./FairnessScreen";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";
import type { FairnessData, FairnessAttr, FairnessGroup } from "./types";

export function FairnessLive() {
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  if (fairness.loading) return null;
  const metrics = fairness.data ?? [];

  const groups: FairnessGroup[] = metrics.map((m) => ({ g: m.group, rate: m.selectionRate ?? 0, sel: 0, app: 0 }));
  if (groups.length) {
    let max = -1, mi = 0;
    groups.forEach((g, i) => { if (g.rate > max) { max = g.rate; mi = i; } });
    groups[mi].ref = true;
  }
  const minRatio = metrics.reduce((m, x) => Math.min(m, x.impactRatio ?? 1), 1);
  const attributes: FairnessAttr[] = metrics.length
    ? [{
        name: "Demographic group",
        ratio: minRatio,
        pass: minRatio >= 0.8,
        groups,
        finding: minRatio >= 0.8
          ? "No adverse impact detected; the four-fifths rule is satisfied across groups."
          : "Possible adverse impact: a group's selection rate falls below the 0.80 four-fifths threshold.",
      }]
    : [];

  const data: FairnessData = {
    stage: "Screening",
    range: "Last 30 days",
    totals: [["Groups analyzed", String(metrics.length)], ["Flagged", String(metrics.filter((m) => m.flagged).length)]],
    attributes,
    // No real intersectional grid is exposed by the gateway; the screen renders an
    // honest EmptyChart for it, so these stay empty (never fabricated cells).
    heatmap: { subtitle: "", cols: [], rows: [], okThreshold: 0.18 },
  };
  return <FairnessScreen data={data} metrics={metrics} />;
}
