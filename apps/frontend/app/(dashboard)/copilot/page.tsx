"use client";
// app/(dashboard)/copilot/page.tsx, full-page Copilot assistant.
import { useState } from "react";
import { AIChip, Card, Button } from "@/components/aurora";
export default function CopilotPage() {
  const [q, setQ] = useState("");
  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] w-full max-w-[820px] flex-col">
      <header className="mb-4 flex items-center gap-2"><h1 className="text-2xl font-extrabold tracking-tight">Copilot</h1><AIChip>advisory</AIChip></header>
      <Card material="flat" className="flex-1 overflow-y-auto rounded-2xl border border-line p-5">
        <p className="text-sm text-ink-3">Ask about your pipeline, candidates, or metrics. Copilot answers with sources, and a human decides what to do next.</p>
      </Card>
      <div className="mt-3 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask Copilot." className="h-12 flex-1 rounded-xl border border-line-2 bg-surface px-4 outline-none focus-visible:shadow-ring" />
        {/* POST /api/copilot */}
        <Button variant="ai">Send</Button>
      </div>
      <p className="mt-2 text-center text-xs text-ink-3">Copilot can be wrong. It cites sources and never takes action on its own.</p>
    </div>
  );
}
