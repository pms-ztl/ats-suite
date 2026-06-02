"use client";
// app/(admin)/admin/platform/agents/page.tsx, platform agent fleet + kill-switches.
import { AIChip, Card, Button } from "@/components/aurora";
const AGENTS = [
  ["candidate-screener", "Healthy", true],
  ["jd-author", "Healthy", true],
  ["bias-auditor", "Healthy", true],
  ["copilot", "Degraded", true],
  ["offer-agent", "Healthy", true],
] as const;
export default function PlatformAgentsPage() {
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Platform agents</h1><p className="mt-1 text-ink-2">Cross-tenant agent health. Each has a kill-switch.</p></header>
      <div className="flex flex-col gap-2">
        {AGENTS.map(([name, health, on]) => (
          <Card key={name} material="flat" className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
            <AIChip>{name}</AIChip>
            <span className={"rounded-pill px-2 py-0.5 text-xs font-bold " + (health === "Healthy" ? "bg-ok-tint text-ok" : "bg-warn-tint text-warn")}>{health}</span>
            <label className="ml-auto flex items-center gap-2 text-sm"><span className="text-ink-3">Enabled</span><input type="checkbox" defaultChecked={on} className="size-5 accent-brand" /></label>
            <Button variant="danger" size="sm">Kill</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
