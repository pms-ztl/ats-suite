"use client";
// app/(dashboard)/requisitions/[id]/rounds/page.tsx, interview-rounds config.
import { useParams } from "next/navigation";
import { Button, Card } from "@/components/aurora";

const ROUNDS = [
  { name: "Recruiter screen", mins: 30, panel: "Recruiter" },
  { name: "Technical phone", mins: 45, panel: "Engineer" },
  { name: "Onsite loop", mins: 240, panel: "4 panelists" },
  { name: "Hiring manager", mins: 45, panel: "Hiring Manager" },
];

export default function RoundsPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto w-full max-w-[860px]">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Interview rounds</h1>
          <p className="mt-1 text-ink-2">Configure the loop for requisition {id}.</p>
        </div>
        <Button variant="primary" size="sm">Add round</Button>
      </header>
      <div className="flex flex-col gap-2">
        {ROUNDS.map((r, i) => (
          <Card key={i} material="flat" className="flex items-center gap-3 rounded-xl border border-line p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-tint font-mono text-sm font-bold text-brand-ink">{i + 1}</span>
            <div className="flex-1"><div className="font-semibold">{r.name}</div><div className="text-xs text-ink-3">{r.mins} min · {r.panel}</div></div>
            <Button variant="ghost" size="sm">Edit</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
