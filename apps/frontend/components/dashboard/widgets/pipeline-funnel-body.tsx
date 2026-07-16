"use client";
// components/dashboard/widgets/pipeline-funnel-body.tsx
// WF5 BODY for the `pipeline_funnel` widget. The frame binds the real
// `pipeline_funnel` source (getFunnel -> live candidate count per stage) and hands
// us its state; we render the existing house viz VERBATIM: FlowRibbon (default -
// the same ribbon the Org overview "Pipeline flow" card uses) or StepCascade (the
// same waterfall the "Hiring funnel" card uses). Both self-empty on an empty /
// all-zero funnel, so an empty pipeline shows the viz's honest empty note.
import * as React from "react";
import type { WidgetBodyProps } from "../WidgetFrame";
import type { ApplicationStage } from "@/lib/types";
import { FlowRibbon, StepCascade } from "@/components/shared/ribbon";
import { BodyNote, BodyFill } from "./widget-body";

type FunnelRow = { stage: ApplicationStage; count: number };

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", TECHNICAL_ROUND: "Technical round", HR_ROUND: "HR round", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};
const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED", "SCREENED", "PHONE_SCREEN", "ASSESSMENT", "INTERVIEW", "TECHNICAL_ROUND", "HR_ROUND", "FINAL_REVIEW", "OFFER", "HIRED",
];

const EMPTY = "The flow appears once candidates enter the pipeline.";

export default function PipelineFunnelBody({ state, viz }: WidgetBodyProps<FunnelRow[]>) {
  const { data, loading, error } = state;

  if (loading && !data) return <BodyNote>Loading funnel...</BodyNote>;
  if (error && !data) return <BodyNote>Could not load the funnel.</BodyNote>;

  const points = (data ?? [])
    .slice()
    .sort((a, b) => {
      const ia = STAGE_ORDER.indexOf(a.stage), ib = STAGE_ORDER.indexOf(b.stage);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .map((s) => ({ label: STAGE_LABEL[s.stage] ?? s.stage.replace(/_/g, " "), n: s.count }));

  return (
    <BodyFill height={240}>
      {viz === "StepCascade" ? (
        <StepCascade stages={points} valueLabel={(n) => n.toLocaleString()} height={240} emptyLabel={EMPTY} />
      ) : (
        <FlowRibbon points={points} height={240} emptyLabel={EMPTY} />
      )}
    </BodyFill>
  );
}
