"use client";
// components/cd/candidates-live.tsx
// Wires the verbatim CD Candidates (board + table) to the gateway: listCandidates()
// + listRequisitions() (for role titles) -> CandidatesData. Saved views, sources and
// stage columns are derived client-side; routing to the profile/import/sourcing is
// delegated to the Next router.
import { useRouter } from "next/navigation";
import { Candidates } from "./screens/Candidates";
import { Pill, SectionCard } from "./aurora-kit";
import { FlowRibbon, HiveCells, PetalBloom } from "@/components/shared/ribbon";
import { useData } from "@/lib/use-data";
import { useUiConfig } from "@/lib/config/ui-config-provider";
import { listCandidates, listRequisitions, listScreening, prettySource } from "@/lib/api";
import type { Candidate as GwCandidate, Requisition, ScreeningResult, ScreeningVerdict } from "@/lib/types";
import type { Candidate, CandStage, SavedView } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

const KIND: Record<ScreeningResult, "pass" | "review" | "fail"> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

// Module H — canonical pipeline columns (ids must match ApplicationStage values).
// A tenant's authored workflow (UiConfig.workflow.stages) overrides labels/colors
// at render; an unauthored tenant uses these defaults (byte-identical to today).
const DEFAULT_STAGES: CandStage[] = [
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
  const { config: uiConfig } = useUiConfig();
  // Module H — resolve the tenant's custom stages (label/color), keyed by the
  // canonical id so the board's stage-by-id grouping is unchanged. Falls back to
  // the canonical defaults when the tenant authored none.
  const wf = uiConfig?.workflow?.stages ?? [];
  const STAGES: CandStage[] = wf.length > 0
    ? wf.map((s) => {
        const def = DEFAULT_STAGES.find((d) => d.id === s.canonical);
        return { id: s.canonical, label: s.label, color: s.color ?? def?.color ?? "var(--ink-3)", ai: def?.ai } as CandStage;
      })
    : DEFAULT_STAGES;
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

  // "Pipeline at a glance" ribbon: real candidates per stage, across the FULL
  // pipeline so the funnel reads at a glance even when everyone is concentrated in
  // one stage (the ribbon simply thins where a stage is empty). Showing all stages
  // matches the Pipeline hive below and avoids a single-point collapse.
  const stageCounts = STAGES.map((s) => ({ label: s.label, n: candidates.filter((c) => c.stage === s.id).length }));
  const ribbonPoints = stageCounts;

  const sources = ["All sources", ...Array.from(new Set(candidates.map((c) => c.source).filter(Boolean)))];

  // "Source bloom": real candidates per source, humanized the way the app
  // displays sources elsewhere (prettySource; enum constants -> sentence case).
  const sourceCounts = new Map<string, number>();
  for (const c of candidates) {
    if (!c.source) continue;
    const label = prettySource(c.source);
    sourceCounts.set(label, (sourceCounts.get(label) ?? 0) + 1);
  }
  const bloomItems = Array.from(sourceCounts, ([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);

  // "Pipeline hive": one hex per real candidate, grouped by stage in pipeline
  // order, colored with the same stage colors the board columns use.
  const hiveGroups = STAGES.map((s, i) => ({ label: s.label, n: stageCounts[i].n, color: s.color }));
  const savedViews: SavedView[] = [
    { id: "all", label: "All candidates", icon: "users", count: candidates.length },
    { id: "review", label: "Needs review", icon: "eye", ai: true, count: candidates.filter((c) => c.st === "review").length, predicate: (c) => c.st === "review" },
    { id: "top", label: "Top matches", icon: "sparkles", ai: true, count: candidates.filter((c) => c.score >= 80).length, predicate: (c) => c.score >= 80 },
    { id: "aging", label: "Aging 6d+", icon: "clock", count: candidates.filter((c) => c.days >= 6).length, predicate: (c) => c.days >= 6 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Candidates
          data={{ candidates, stages: STAGES, savedViews, sources }}
          onOpenProfile={(id) => router.push(`/candidates/${id}`)}
          onImport={() => router.push("/candidates/import")}
          onSource={() => router.push("/sourcing")}
          ribbonSlot={
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="viz-2up">
                <SectionCard title="Pipeline at a glance" icon="radar"
                  headRight={<Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)" style={{ textTransform: "none" }}>ribbon thickness = live candidates per stage</Pill>}>
                  <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                    <FlowRibbon points={ribbonPoints} height={360}
                      emptyLabel="The pipeline ribbon appears once candidates start applying." />
                  </div>
                </SectionCard>
                <SectionCard title="Source bloom" icon="shapes"
                  headRight={<Pill icon="layers" style={{ textTransform: "none" }}>petal length = candidates from that source</Pill>}>
                  <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
                    <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
                      <PetalBloom items={bloomItems} centerSub="candidates" height={200}
                        emptyLabel="The bloom opens once candidates arrive with a source." />
                    </div>
                  </div>
                </SectionCard>
              </div>
              <SectionCard title="Pipeline hive" icon="grid"
                headRight={<Pill icon="users" style={{ textTransform: "none" }}>every hex = one real candidate</Pill>}>
                <HiveCells groups={hiveGroups} maxCells={96}
                  emptyLabel="The hive fills as candidates arrive." />
              </SectionCard>
            </div>
          }
        />
      </div>
    </div>
  );
}
