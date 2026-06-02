"use client";
// app/(dashboard)/sourcing/page.tsx, AI sourcing.
import { useState } from "react";
import { Button, AIChip, Card, EmptyState } from "@/components/aurora";

export default function SourcingPage() {
  const [q, setQ] = useState("");
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">AI sourcing</h1><p className="mt-1 text-ink-2">Describe who you need. The sourcing agent surfaces matches with evidence, you decide who to reach.</p></header>
      <Card material="glass" className="mb-4 flex flex-wrap gap-2 rounded-2xl p-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Senior backend engineer, Go, payments, remote"
          className="h-11 flex-1 rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring" />
        {/* POST /api/sourcing */}
        <Button variant="ai">Find candidates</Button>
      </Card>
      <EmptyState title="Describe your ideal candidate" body="The sourcing agent ranks people by fit and shows the evidence behind every match. Results appear here." />
    </div>
  );
}
