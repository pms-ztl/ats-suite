"use client";
// app/(dashboard)/compliance/page.tsx - EXACT Claude Design "Aurora" layout.
// Adverse-impact / fairness dashboard: impact ratio vs the 0.80 four-fifths
// threshold, per group. Wired to api.bias.getFourFifthsReport.
import { StatusBadge, Card, Skeleton, EmptyState, ErrorState, Button } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";

export default function CompliancePage() {
  const { data, loading, error, reload } = useData<FairnessMetric[]>(getAdverseImpact);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Adverse impact</h1>
          <p className="mt-1 text-ink-2">Selection rates by group against the 0.80 threshold. Monitoring is advisory and supports your compliance review.</p>
        </div>
        <Button variant="soft" size="sm">Export EEOC report</Button>
      </header>

      {loading && <Skeleton className="h-48 rounded-xl" />}
      {error && <ErrorState title="Could not load fairness data" body="The compliance service did not respond." code="GET /api/compliance/adverse-impact" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="Not enough data yet" body="Once enough decisions are recorded, impact ratios appear here, date-stamped." />}

      {data && data.length > 0 && (
        <Card material="flat" className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3">
              <tr><th className="p-3">Group</th><th className="p-3">Selection rate</th><th className="p-3">Impact ratio</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr key={m.group} className="border-b border-line last:border-0">
                  <td className="p-3 font-semibold">{m.group}</td>
                  <td className="p-3 font-mono tabular-nums">{(m.selectionRate * 100).toFixed(1)}%</td>
                  <td className={"p-3 font-mono tabular-nums " + (m.impactRatio < 0.8 ? "text-danger" : "text-ok")}>{m.impactRatio.toFixed(2)}</td>
                  <td className="p-3">{m.flagged ? <StatusBadge status="fail" icon={null} /> : <StatusBadge status="pass" icon={null} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="mt-3 text-xs text-ink-3">A ratio below 0.80 flags potential adverse impact for review. Intersectional breakdowns and date stamps included in the export.</p>
    </div>
  );
}
