"use client";
// components/cd/hitl-live.tsx
// Wires the verbatim CD HITL review queue to the gateway: listReviewQueue() +
// listRequisitions() -> HitlData. Priority, SLA tone and the risk headline are derived
// from the review item's reason code + SLA; the evidence "why" is the verdict summary.
// The structured reason-code chips are the configured review vocabulary.
import { HITL } from "./screens/HITL";
import { useData } from "@/lib/use-data";
import { listReviewQueue, listRequisitions } from "@/lib/api";
import type { ReviewItem, Requisition, ReviewReasonCode } from "@/lib/types";
import type { HitlItem, HitlData } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

const KIND_LABEL: Record<ReviewReasonCode, string> = {
  LOW_CONFIDENCE: "Low-confidence verdict",
  ADVERSE_IMPACT_FLAG: "Adverse-impact flag",
  POLICY_OVERRIDE: "Policy override",
  MISSING_EVIDENCE: "Missing evidence",
  CANDIDATE_APPEAL: "Candidate appeal",
};
const RISK: Record<ReviewReasonCode, string> = {
  LOW_CONFIDENCE: "Model confidence is below the auto-advance threshold.",
  ADVERSE_IMPACT_FLAG: "Possible adverse impact; a human fairness check is required.",
  POLICY_OVERRIDE: "An agent action would override a configured policy.",
  MISSING_EVIDENCE: "The verdict lacks sufficient cited evidence.",
  CANDIDATE_APPEAL: "The candidate has appealed an automated decision.",
};
const REASON_CODES = ["Confirmed by evidence", "Insufficient evidence", "Bias concern", "Policy exception", "Needs second opinion"];

function sla(iso: string): { label: string; tone: "ok" | "warn" | "danger" } {
  const ms = new Date(iso).getTime() - Date.now();
  if (!isFinite(ms)) return { label: "no SLA", tone: "ok" };
  const h = ms / 3600000;
  if (h < 0) return { label: "overdue", tone: "danger" };
  if (h < 2) return { label: `${Math.round(h * 60)}m left`, tone: "danger" };
  if (h < 24) return { label: `${Math.round(h)}h left`, tone: "warn" };
  return { label: `${Math.round(h / 24)}d left`, tone: "ok" };
}

export function HitlLive() {
  const q = useData<ReviewItem[]>(listReviewQueue);
  const reqs = useData<Requisition[]>(listRequisitions);
  const titles = reqTitleMap(reqs.data);

  // HITL seeds its selected-item state from the first item on mount, so render only
  // once both fetches settle (else `sel` stays null and the detail pane is empty).
  if (q.loading || reqs.loading) return null;

  const items: HitlItem[] = (q.data ?? []).map((it) => {
    const s = sla(it.slaDueAt);
    const high = it.reasonCode === "ADVERSE_IMPACT_FLAG" || it.reasonCode === "POLICY_OVERRIDE";
    return {
      id: it.id,
      priority: high ? "High" : "Normal",
      sla: s.label,
      slaTone: s.tone,
      kind: KIND_LABEL[it.reasonCode] ?? "Review needed",
      who: it.verdict?.candidateId ?? it.candidateId,
      role: titles[it.requisitionId] ?? "",
      agent: it.verdict?.agent ?? "candidate-screener",
      conf: it.verdict?.confidence ?? 0,
      risk: RISK[it.reasonCode] ?? "A human review is required.",
      why: it.verdict?.summary ?? "",
    };
  });

  const data: HitlData = { items, reasonCodes: REASON_CODES, trace: [] };
  return <HITL data={data} />;
}
