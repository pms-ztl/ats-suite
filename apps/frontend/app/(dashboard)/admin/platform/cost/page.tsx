"use client";
// app/(admin)/admin/platform/cost/page.tsx, cross-tenant cost & agent usage.
import { Card } from "@/components/aurora";
const ROWS = [["Northwind Talent", 342, "$48.20"], ["Helios Robotics", 210, "$29.60"], ["Atlas Health", 540, "$76.10"]] as const;
export default function PlatformCostPage() {
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Cost &amp; usage</h1><p className="mt-1 text-ink-2">Agent runs and inference cost by tenant, last 30 days.</p></header>
      <Card material="flat" className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3"><tr><th className="p-3">Tenant</th><th className="p-3">Agent runs</th><th className="p-3 text-right">Cost</th></tr></thead>
          <tbody>
            {ROWS.map(([t, runs, cost]) => (
              <tr key={t} className="border-b border-line last:border-0"><td className="p-3 font-semibold">{t}</td><td className="p-3 font-mono tabular-nums">{runs}</td><td className="p-3 text-right font-mono tabular-nums">{cost}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
