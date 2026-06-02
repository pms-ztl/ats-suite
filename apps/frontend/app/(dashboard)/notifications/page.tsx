"use client";
// app/(dashboard)/notifications/page.tsx, notification center + preferences.
import { AIChip, Card, Button } from "@/components/aurora";
const ITEMS = [
  ["ai", "bias-auditor flagged a requisition", "Adverse-impact ratio 0.69 on Design reqs", "3m"],
  ["warn", "SLA approaching", "2 review-queue items due in under 2 hours", "22m"],
  ["ok", "Offer accepted", "Dana Osei accepted the Platform Engineer offer", "1h"],
  ["info", "New referral", "Marcus Bell referred a Senior Backend candidate", "3h"],
] as const;
export default function NotificationsPage() {
  return (
    <div className="mx-auto w-full max-w-[820px]">
      <header className="mb-5 flex items-center justify-between"><h1 className="text-2xl font-extrabold tracking-tight">Notifications</h1><Button variant="ghost" size="sm">Mark all read</Button></header>
      <div className="flex flex-col gap-2">
        {ITEMS.map(([kind, title, body, t], i) => (
          <Card key={i} material="flat" className="flex items-start gap-3 rounded-xl border border-line p-4">
            <span className={"mt-1 size-2.5 shrink-0 rounded-full " + (kind === "ai" ? "bg-ai" : kind === "warn" ? "bg-warn" : kind === "ok" ? "bg-ok" : "bg-info")} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold">{title}{kind === "ai" && <AIChip>agent</AIChip>}</div>
              <div className="text-sm text-ink-2">{body}</div>
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-ink-3">{t}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
