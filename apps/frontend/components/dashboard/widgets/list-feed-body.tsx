"use client";
// components/dashboard/widgets/list-feed-body.tsx
// WF5 BODY for the `list_feed` widget. The frame binds the real `review_queue`
// source (listReviewQueue -> HITL items with reason code + SLA + verdict) and hands
// us its state; we render the existing aurora-kit <PendingList> VERBATIM (the same
// review-queue list the Org overview "Pending actions" card uses). An empty queue
// shows the honest "nothing pending" note, never a fabricated feed; an item with no
// advisory score shows a dash, not a 0.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { ReviewItem } from "@/lib/types";
import { PendingList } from "@/components/cd/aurora-kit";
import type { PendingItem } from "@/components/cd/types";
import { BodyNote } from "./widget-body";

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

export default function ListFeedBody({ state, config }: WidgetBodyProps<ReviewItem[]>) {
  const { data, loading, error } = state;
  const limit = typeof config?.limit === "number" ? config.limit : 10;

  if (loading && !data) return <BodyNote>Loading the review queue...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load the review queue.</BodyNote>;

  const items: PendingItem[] = (data ?? []).slice(0, limit).map((it) => ({
    ic: "flag",
    title: reasonLabel(it.reasonCode),
    meta: `Score ${it.verdict?.score ?? "—"} · ${it.verdict?.result ?? "pending"} · due ${new Date(it.slaDueAt).toLocaleDateString()}`,
    tone: toneFor(it),
    ai: true,
  }));

  if (items.length === 0) return <BodyNote>Nothing is waiting on a human.</BodyNote>;

  return <PendingList items={items} />;
}
