"use client";
// components/cd/candidates-live.tsx
// Wires the verbatim CD Candidates (board + table) to the gateway: listCandidates()
// + listRequisitions() (for role titles) -> CandidatesData. Saved views, sources and
// stage columns are derived client-side; routing to the profile/import/sourcing is
// delegated to the Next router.
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Candidates } from "./screens/Candidates";
import { useData } from "@/lib/use-data";
import { listCandidates, listRequisitions, listScreening } from "@/lib/api";
import type { Candidate as GwCandidate, Requisition, ScreeningResult, ScreeningVerdict, ApplicationStage } from "@/lib/types";
import type { Candidate, CandStage, SavedView } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

// Live 3D candidate-match scatter (x=AI score, y=requirement match, z=stage, colour=verdict).
// ssr:false keeps the three.js stack out of the server render.
const CandidateMatch = dynamic(() => import("@/components/shared/hero3d").then((m) => m.CandidateMatch), {
  ssr: false,
  loading: () => <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card/60" />,
});

const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

// Project the 8 real ApplicationStage values onto the hero's 0..5 pipeline axis
// (Applied / Screen / Interview / Final / Offer / Hired). Terminal states sit at 0.
const STAGE_INDEX: Record<ApplicationStage, number> = {
  APPLIED: 0,
  SCREENED: 1, PHONE_SCREEN: 1,
  ASSESSMENT: 2, INTERVIEW: 2,
  FINAL_REVIEW: 3,
  OFFER: 4,
  HIRED: 5,
  REJECTED: 0, WITHDRAWN: 0,
};

// Real requirement-match % from the screener's per-requirement evidence:
// met -> 1, partial -> 0.5, unmet -> 0, averaged. Returns undefined when the
// candidate has no screening verdict (the scene tolerates a missing match).
function requirementMatchPct(sv: ScreeningVerdict | undefined): number | undefined {
  const reqs = sv?.requirements;
  if (!reqs || reqs.length === 0) return undefined;
  const sum = reqs.reduce((acc, r) => acc + (r.met === true ? 1 : r.met === "partial" ? 0.5 : 0), 0);
  return Math.round((sum / reqs.length) * 100);
}

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

  // Feed the 3D hero from the SAME joined data: AI score, real requirement-match %
  // (from the screener's per-requirement evidence), pipeline stage and verdict.
  const matchPoints = (cands.data ?? []).map((c) => {
    const sv = verdictByCand.get(c.id);
    const verdict = sv ? KIND[sv.result] : c.result ? KIND[c.result] : undefined;
    return {
      name: c.name,
      score: sv ? sv.score : c.aiScore ?? 0,
      // Real per-requirement match % when the screener produced a breakdown;
      // 0 (floor) when the candidate has not been screened yet — no verified match.
      match: requirementMatchPct(sv) ?? 0,
      stageIndex: STAGE_INDEX[c.stage] ?? 0,
      verdict,
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <section style={{ padding: "20px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 800, letterSpacing: "-0.02em" }}>Candidate match space</h2>
          <span style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>drag to rotate · x AI score · y requirement match · z stage · colour verdict</span>
        </div>
        <CandidateMatch candidates={matchPoints} />
      </section>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Candidates
          data={{ candidates, stages: STAGES, savedViews, sources }}
          onOpenProfile={(id) => router.push(`/candidates/${id}`)}
          onImport={() => router.push("/candidates/import")}
          onSource={() => router.push("/sourcing")}
        />
      </div>
    </div>
  );
}
