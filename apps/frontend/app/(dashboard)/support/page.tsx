"use client";
// app/(dashboard)/support/page.tsx, in-app help & ticketing.
import { useState } from "react";
import { AIChip, Card, Button } from "@/components/aurora";
export default function SupportPage() {
  const [topic, setTopic] = useState("Technical issue");
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Help &amp; support</h1><p className="mt-1 text-ink-2">Search the docs, ask Copilot, or open a ticket.</p></header>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[["Submit a ticket", "Most replies within 4 hours"], ["Browse the docs", "Guides and API reference"], ["Ask Copilot", "Instant cited answers"]].map(([t, d], i) => (
          <Card key={t} material={i === 2 ? "clay" : "flat"} className="rounded-xl border border-line p-4">
            <div className="flex items-center gap-2 font-semibold">{t}{i === 2 && <AIChip>AI</AIChip>}</div>
            <p className="mt-1 text-xs text-ink-3">{d}</p>
          </Card>
        ))}
      </div>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <h2 className="mb-3 text-sm font-bold tracking-tight">Submit a ticket</h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {["Technical issue", "Billing", "Feature request", "Other"].map((t) => (
            <button key={t} onClick={() => setTopic(t)} className={"rounded-pill px-3 py-1.5 text-xs font-semibold " + (topic === t ? "bg-brand-tint text-brand-ink" : "border border-line-2 text-ink-2")}>{t}</button>
          ))}
        </div>
        <textarea rows={4} placeholder="What is happening?" className="mb-3 w-full rounded border border-line-2 bg-surface p-3 outline-none focus-visible:shadow-ring" />
        {/* POST /api/support/ticket */}
        <Button variant="primary">Submit ticket</Button>
      </Card>
    </div>
  );
}
