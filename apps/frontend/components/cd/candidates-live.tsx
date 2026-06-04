"use client";
// components/cd/candidates-live.tsx
// Wires the verbatim CD Candidates (board + table) to the gateway: listCandidates()
// + listRequisitions() (for role titles) -> CandidatesData. Saved views, sources and
// stage columns are derived client-side; routing to the profile/import/sourcing is
// delegated to the Next router.
import { useRouter } from "next/navigation";
import { Candidates } from "./screens/Candidates";
import { useData } from "@/lib/use-data";
import { listCandidates, listRequisitions, listScreening } from "@/lib/api";
import type { Candidate as GwCandidate, Requisition, ScreeningResult, ScreeningVerdict } from "@/lib/types";
import type { Candidate, CandStage, SavedView } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

// Pipeline columns (ids must match the gateway ApplicationStage values).
const STAGES: CandStage[] = [
  { id: "APPLIED", label: "Applied", color: "var(--ink-3)" },
  { id: "SCREENED", label: "Screened", color: "var(--info)", ai: true },
  { id: "PHONE_SCREEN", label: "Phone screen", color: "var(--info)" },
  { id: "ASSESSMENT", label: "Assessment", color: "var(--ai)" },
  { id: "INTERVIEW", label: "Interview", color: "var(--ai)" },
  { id: "FINAL_REVIEW", label: "Final review", color: "var(--brand-2)" },
  { id: "OFFER", label: "Offer", color: "var(--brand)" },
  { id: "HIRED", label: "Hired", color: "var(--ok)" },
];

export function CandidatesLive() {
  const router = useRouter();
  const cands = useData<GwCandidate[]>(listCandidates);
  const reqs = useData<Requisition[]>(listRequisitions);
  const screen = useData<ScreeningVerdict[]>(listScreening);
  const titles = reqTitleMap(reqs.data);

  // The CD Candidates board snapshots `candidates` into useState on mount, so it
  // would freeze on the empty loading array. Render only once all fetches settle
  // (then it mounts with the full data).
  if (cands.loading || reqs.loading || screen.loading) return null;

  // The AI screening verdict + score live in screening-service, not on the
  // candidate row — join them so the board shows the role-match at a glance.
  const verdictByCand = new Map((screen.data ?? []).map((v) => [v.candidateId, v]));

  const candidates: Candidate[] = (cands.data ?? []).map((c) => {
    const sv = verdictByCand.get(c.id);
    return {
    id: c.id,
    ini: initials(c.name),
    name: c.name,
    role: titles[c.requisitionId ?? ""] ?? "",
    loc: c.location,
    reqId: c.requisitionId ?? "",
    stage: c.stage,
    st: sv ? KIND[sv.result] : c.result ? KIND[c.result] : "pending",
    score: sv ? sv.score : c.aiScore ?? 0,
    match: ", ",
    source: c.source ?? "Direct",
    days: c.timeInStageDays ?? 0,
    };
  });

  const sources = ["All sources", ...Array.from(new Set(candidates.map((c) => c.source).filter(Boolean)))];
  const savedViews: SavedView[] = [
    { id: "all", label: "All candidates", icon: "users", count: candidates.length },
    { id: "review", label: "Needs review", icon: "eye", ai: true, count: candidates.filter((c) => c.st === "review").length, predicate: (c) => c.st === "review" },
    { id: "top", label: "Top matches", icon: "sparkles", ai: true, count: candidates.filter((c) => c.score >= 80).length, predicate: (c) => c.score >= 80 },
    { id: "aging", label: "Aging 6d+", icon: "clock", count: candidates.filter((c) => c.days >= 6).length, predicate: (c) => c.days >= 6 },
  ];

  return (
    <Candidates
      data={{ candidates, stages: STAGES, savedViews, sources }}
      onOpenProfile={(id) => router.push(`/candidates/${id}`)}
      onImport={() => router.push("/candidates/import")}
      onSource={() => router.push("/sourcing")}
    />
  );
}
