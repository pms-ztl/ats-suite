"use client";
// app/(embed)/embed/pipeline/[token]/page.tsx
//
// WF9 / SLICE I1 — chrome-less PIPELINE embed. Renders the existing house-viz
// FlowRibbon (the same hiring-funnel ribbon the dashboard "Pipeline flow" card
// uses) over the REAL, server-locked funnel — candidate count per stage, scoped
// to the embed token's tenant. No CdShell, no nav: just the cd-token-themed,
// white-labelled widget content. EmbedShell validates the token, applies the
// tenant brand, and fails closed to the invalid/expired state.
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FlowRibbon } from "@/components/shared/ribbon";
import type { ApplicationStage } from "@/lib/types";
import { EmbedShell, fetchEmbedData } from "../../embed-shell";

type FunnelRow = { stage: ApplicationStage; count: number };

const STAGE_LABEL: Partial<Record<ApplicationStage, string>> = {
  APPLIED: "Applied", SCREENED: "Screened", PHONE_SCREEN: "Phone screen",
  ASSESSMENT: "Assessment", INTERVIEW: "Interview", FINAL_REVIEW: "Final review",
  OFFER: "Offer", HIRED: "Hired", REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

function PipelineBody({ token }: { token: string }) {
  const [funnel, setFunnel] = useState<FunnelRow[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchEmbedData<{ funnel?: FunnelRow[] }>(token);
      if (cancelled) return;
      setFunnel(Array.isArray(data?.funnel) ? data!.funnel! : []);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [token]);

  const points = (funnel ?? []).map((s) => ({ label: STAGE_LABEL[s.stage] ?? s.stage, n: s.count }));

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--ink)" }}>
          Hiring funnel
        </h1>
        <p style={{ margin: "3px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
          Candidates at each stage of the pipeline.
        </p>
      </div>
      {!loaded ? (
        <div style={{ height: 160, display: "grid", placeItems: "center", borderRadius: 12, border: "1px dashed var(--line)", color: "var(--ink-3)", fontSize: 12.5 }}>
          Loading funnel...
        </div>
      ) : (
        <FlowRibbon
          points={points}
          height={260}
          emptyLabel="The flow appears once candidates enter the pipeline."
        />
      )}
    </div>
  );
}

export default function EmbedPipelinePage() {
  const { token } = useParams<{ token: string }>();
  return (
    <EmbedShell token={token ?? ""} expectedModule="pipeline">
      {({ token: t }) => <PipelineBody token={t} />}
    </EmbedShell>
  );
}
