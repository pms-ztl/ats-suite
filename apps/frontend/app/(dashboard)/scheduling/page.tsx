"use client";
// app/(dashboard)/scheduling/page.tsx, scheduling calendar with AI-proposed slots (advisory).
import { Button, AIChip, Card } from "@/components/aurora";

const SLOTS = [
  ["Tue, Jun 3", "2:00 PM", "All panelists free", true],
  ["Wed, Jun 4", "10:30 AM", "All panelists free", false],
  ["Wed, Jun 4", "3:00 PM", "1 tentative", false],
] as const;

export default function SchedulingPage() {
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Scheduling</h1><p className="mt-1 text-ink-2">AI proposes times that balance panelist load and candidate timezone. You confirm.</p></header>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <div className="mb-3 flex items-center gap-2"><AIChip>scheduler</AIChip><span className="text-sm text-ink-2">Proposed slots for the technical loop</span></div>
        <div className="flex flex-col gap-2">
          {SLOTS.map(([day, time, note, best], i) => (
            <label key={i} className={"flex items-center gap-3 rounded-lg border p-3 " + (best ? "border-ai bg-ai-tint" : "border-line bg-surface")}>
              <input type="radio" name="slot" defaultChecked={best} className="size-4 accent-ai" />
              <div className="flex-1"><div className="text-sm font-semibold">{day} · {time}</div><div className="text-xs text-ink-3">{note}</div></div>
              {best && <span className="rounded-pill bg-ai-tint px-2 py-0.5 text-xs font-bold text-ai-ink">Best fit</span>}
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end"><Button variant="primary">Confirm &amp; send invites</Button></div>
      </Card>
    </div>
  );
}
