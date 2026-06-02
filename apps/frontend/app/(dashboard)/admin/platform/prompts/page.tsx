"use client";
// app/(admin)/admin/platform/prompts/page.tsx, agent prompt editor with versioning.
import { useState } from "react";
import { AIChip, Card, Button } from "@/components/aurora";
const AGENTS = ["candidate-screener", "jd-author", "bias-auditor", "offer-agent"];
export default function PromptsPage() {
  const [agent, setAgent] = useState(AGENTS[0]);
  return (
    <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      <aside>
        <h1 className="mb-3 text-lg font-extrabold tracking-tight">Prompts</h1>
        <ul className="rounded-lg border border-line bg-surface-2 p-1 text-sm">
          {AGENTS.map((a) => <li key={a}><button onClick={() => setAgent(a)} className={"w-full rounded px-3 py-2 text-left font-mono text-xs " + (a === agent ? "bg-surface font-semibold" : "text-ink-2")}>{a}</button></li>)}
        </ul>
      </aside>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><AIChip>{agent}</AIChip><span className="font-mono text-xs text-ink-3">v12 · published</span></div>
          <div className="flex gap-2"><Button variant="soft" size="sm">Version history</Button><Button variant="primary" size="sm">Publish new version</Button></div>
        </div>
        {/* GET /api/admin/platform/prompts/:agent */}
        <textarea rows={14} className="w-full rounded border border-line-2 bg-surface p-3 font-mono text-sm outline-none focus-visible:shadow-ring"
          defaultValue={"You are the " + agent + " agent. Score candidates strictly against the requisition's requirements. Cite evidence from the résumé for every point. Never make a final decision; route low confidence to human review."} />
      </Card>
    </div>
  );
}
