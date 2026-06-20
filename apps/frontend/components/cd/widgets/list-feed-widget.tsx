"use client";
// components/cd/widgets/list-feed-widget.tsx
// WF5 wrapper for the `list_feed` widget. Binds the real `review_queue` source
// (listReviewQueue -> HITL items with reason code + SLA + verdict) and renders the
// existing PendingList verbatim. An empty queue shows the honest "nothing pending"
// note, never a fabricated feed.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { ReviewItem } from "@/lib/types";
import { PendingList } from "@/components/cd/aurora-kit";
import type { PendingItem } from "@/components/cd/types";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

// Map the HITL verdict to the PendingList tone (advisory severity, not a decision).
function toneFor(item: ReviewItem): PendingItem["tone"] {
  switch (item.verdict?.result) {
    case "FAIL":
      return "danger";
    case "REVIEW":
      return "warn";
    default:
      return "ok";
  }
}

function reasonLabel(code: string): string {
  return code.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function ListFeedWidget({ title, config }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<ReviewItem[]>("review_queue");
  const limit = typeof config?.limit === "number" ? config.limit : 10;

  const items: PendingItem[] = (data ?? []).slice(0, limit).map((it) => ({
    ic: "flag",
    title: reasonLabel(it.reasonCode),
    meta: `Score ${it.verdict?.score ?? "—"} · ${it.verdict?.result ?? "pending"} · due ${new Date(it.slaDueAt).toLocaleDateString()}`,
    tone: toneFor(it),
    ai: true,
  }));

  return (
    <WidgetShell title={title ?? "Review queue"} icon="inbox">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading the review queue...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load the review queue.</WidgetNote>
      ) : items.length === 0 ? (
        <WidgetNote>Nothing is waiting on a human.</WidgetNote>
      ) : (
        <PendingList items={items} />
      )}
    </WidgetShell>
  );
}
