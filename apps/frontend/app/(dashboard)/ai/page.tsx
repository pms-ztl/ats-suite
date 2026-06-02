"use client";
// app/(dashboard)/ai/page.tsx, AI operations: agent fleet health & usage.
import { AIChip, Card } from "@/components/aurora";
const AGENTS = [
  ["candidate-screener", "Scores candidates with evidence", "Operational", 342],
  ["jd-author", "Drafts inclusive job descriptions", "Operational", 28],
  ["bias-auditor", "Monitors adverse impact", "Operational", 90],
  ["copilot", "In-product assistant", "Operational", 511],
  ["offer-agent", "Drafts offer letters", "Operational", 14],
] as const;
export default function AiOpsPage() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">AI operations</h1><p className="mt-1 text-ink-2">Your agent fleet, what each one does, and how often it runs. All output is advisory.</p></header>
      <div className="grid gap-3 sm:grid-cols-2">
        {AGENTS.map(([name, desc, status, runs]) => (
          <Card key={name} material="flat" className="rounded-xl border border-line p-4">
            <div className="flex items-center justify-between"><AIChip>{name}</AIChip><span className="rounded-pill bg-ok-tint px-2 py-0.5 text-xs font-bold text-ok">{status}</span></div>
            <p className="mt-2 text-sm text-ink-2">{desc}</p>
            <div className="mt-2 font-mono text-xs tabular-nums text-ink-3">{runs} runs · last 30 days</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
