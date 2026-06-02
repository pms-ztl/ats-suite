"use client";
// app/(dashboard)/settings/billing/page.tsx, Billing: plan card, usage meter, invoices.
import { Panel, Button } from "../_parts";
import { Card } from "@/components/aurora";
import type { Plan } from "@/lib/types";

// GET /api/billing → { plan, seatsUsed, seatLimit, screeningsUsed, screeningLimit }
const PLAN: Plan = "PROFESSIONAL";

export default function BillingPage() {
  const seats = { used: 12, limit: 15 };
  const screenings = { used: 342, limit: 1000 };
  return (
    <>
      <Card material="clay" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-ink-3">Current plan</div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight">{PLAN}</div>
          <div className="text-sm text-ink-3">$399 / month · renews Jul 1, 2026</div>
        </div>
        <div className="flex gap-2">
          <Button variant="soft">Change plan</Button>
          <Button variant="primary">Upgrade to Enterprise</Button>
        </div>
      </Card>

      <Panel title="Usage this period">
        {[["Seats", seats], ["AI screenings", screenings]].map(([label, m]) => {
          const v = m as { used: number; limit: number };
          return (
            <div key={label as string} className="mb-4">
              <div className="mb-1 flex justify-between text-sm"><span>{label as string}</span><span className="font-mono tabular-nums text-ink-2">{v.used} / {v.limit}</span></div>
              <div className="h-2.5 overflow-hidden rounded-pill bg-surface-3"><div className="h-full rounded-pill bg-brand" style={{ width: `${(v.used / v.limit) * 100}%` }} /></div>
            </div>
          );
        })}
      </Panel>

      <Panel title="Invoices">
        <ul className="divide-y divide-line text-sm">
          {["Jun 1, 2026", "May 1, 2026", "Apr 1, 2026"].map((d) => (
            <li key={d} className="flex items-center justify-between py-3">
              <span>{d}</span><span className="font-mono tabular-nums text-ink-2">$399.00</span>
              <Button variant="ghost" size="sm">Download</Button>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
