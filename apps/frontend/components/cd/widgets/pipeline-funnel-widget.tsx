"use client";
// components/cd/widgets/pipeline-funnel-widget.tsx
// WF5 wrapper for the `pipeline_funnel` widget. Binds the real `pipeline_funnel`
// source (getFunnel -> live candidate count per stage) and renders the existing
// FlowRibbon (default) or StepCascade verbatim. Both viz components self-empty on
// an empty / all-zero funnel, so an empty pipeline shows the honest empty note.
import * as React from "react";
import type { WidgetRenderProps } from "@/lib/widgets/registry";
import type { ApplicationStage } from "@/lib/types";
import { FlowRibbon, StepCascade } from "@/components/shared/ribbon";
import { WidgetShell, WidgetNote, useWidgetSource } from "./widget-shell";

type FunnelRow = { stage: ApplicationStage; count: number };

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};
const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "FINAL_REVIEW", "OFFER", "HIRED",
];

export default function PipelineFunnelWidget({ title, viz }: WidgetRenderProps) {
  const { data, loading, error, blocked, blockedReason } = useWidgetSource<FunnelRow[]>("pipeline_funnel");

  const points = (data ?? [])
    .slice()
    .sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .map((s) => ({ label: STAGE_LABEL[s.stage] ?? s.stage, n: s.count }));

  return (
    <WidgetShell title={title ?? "Hiring funnel"} icon="motion">
      {blocked ? (
        <WidgetNote>{blockedReason}</WidgetNote>
      ) : loading && !data ? (
        <WidgetNote>Loading funnel...</WidgetNote>
      ) : error && !data ? (
        <WidgetNote>Could not load the funnel.</WidgetNote>
      ) : viz === "StepCascade" ? (
        <StepCascade
          stages={points}
          valueLabel={(n) => n.toLocaleString()}
          height={240}
          emptyLabel="The flow appears once candidates enter the pipeline."
        />
      ) : (
        <FlowRibbon
          points={points}
          height={240}
          emptyLabel="The flow appears once candidates enter the pipeline."
        />
      )}
    </WidgetShell>
  );
}
