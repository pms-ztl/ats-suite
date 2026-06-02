"use client";
// app/(dashboard)/analytics/source-effectiveness/page.tsx
import { Card } from "@/components/aurora";
export default function SourceEffectivenessPage() {
  const rows = [["Referral", 42, 9], ["LinkedIn", 310, 6], ["Inbound", 128, 4], ["Sourced", 96, 5]] as const;
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Source effectiveness</h1><p className="mt-1 text-ink-2">Candidates and hires by source.</p></header>
      <Card material="flat" className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3"><tr><th className="p-3">Source</th><th className="p-3">Candidates</th><th className="p-3">Hires</th><th className="p-3">Hire rate</th></tr></thead>
          <tbody>
            {rows.map(([s, c, h]) => (
              <tr key={s} className="border-b border-line last:border-0">
                <td className="p-3 font-semibold">{s}</td>
                <td className="p-3 font-mono tabular-nums">{c}</td>
                <td className="p-3 font-mono tabular-nums">{h}</td>
                <td className="p-3 font-mono tabular-nums text-ok">{((h / c) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
