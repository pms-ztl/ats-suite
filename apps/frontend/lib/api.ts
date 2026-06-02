// lib/api.ts - typed data-access layer for the Aurora (Claude Design) pages.
// Each function calls the real api-client and maps the response to the design's
// view-model types. Functions are added here as each exact page is ported.
import { api } from "./api-client";
import type {
  ScreeningVerdict, ScreeningResult, RequirementMatch,
  Candidate, ApplicationStage, Requisition,
} from "./types";

const arr = (x: any): any[] => (Array.isArray(x) ? x : x?.data ?? x?.items ?? x?.rows ?? []);
const fullName = (o: any) =>
  o?.name || [o?.firstName, o?.lastName].filter(Boolean).join(" ") || "";

/* ---------- Screening ---------- */
function toRequirement(r: any): RequirementMatch {
  const met =
    r?.met === true || r?.status === "MATCH" || r?.status === "met" || r?.outcome === "met"
      ? true
      : r?.met === "partial" || r?.status === "PARTIAL" || r?.outcome === "partial"
        ? "partial"
        : false;
  return {
    requirement: r?.requirement ?? r?.label ?? r?.name ?? r?.criterion ?? r?.type ?? "Requirement",
    met,
    evidence: r?.evidence ?? r?.detail ?? r?.reasoning ?? r?.note ?? "",
  };
}

function toVerdict(s: any): ScreeningVerdict {
  const result = String(s?.result ?? "REVIEW").toUpperCase() as ScreeningResult;
  const findings = s?.requirementFindings ?? s?.signals ?? s?.findings ?? [];
  return {
    id: s?.id,
    candidateId: fullName(s?.candidate) || s?.candidateId || "Candidate",
    requisitionId: s?.requisitionId ?? "",
    result: (["PASS", "REVIEW", "FAIL"] as const).includes(result as any) ? result : "REVIEW",
    score: Math.round(Number(s?.score ?? s?.matchPercentage ?? 0)),
    confidence: Number(s?.confidence ?? (s?.matchPercentage != null ? s.matchPercentage / 100 : 0.7)),
    agent: s?.agentType ?? s?.screeningType ?? "candidate-screener",
    summary: s?.reasoning ?? s?.summary ?? "No summary provided.",
    requirements: Array.isArray(findings) ? findings.map(toRequirement) : [],
    reasoningTrace: s?.agentTrace?.steps ?? s?.agentTrace ?? undefined,
    createdAt: s?.createdAt ?? s?.startedAt ?? "",
  };
}

export async function listScreening(): Promise<ScreeningVerdict[]> {
  const res: any = await api.screening.listScreenings({ page: 1, pageSize: 100 });
  return arr(res).map(toVerdict);
}
export async function getVerdict(id: string): Promise<ScreeningVerdict> {
  const res: any = await api.screening.getScreening(id);
  return toVerdict(res?.data ?? res);
}

/* ---------- Candidates ---------- */
function toCandidate(c: any): Candidate {
  const app = c?.applications?.[0] ?? {};
  return {
    id: c?.id,
    name: fullName(c) || "Candidate",
    email: c?.email ?? "",
    location: c?.location ?? c?.country ?? "",
    source: c?.source ?? "",
    requisitionId: c?.requisitionId ?? app?.requisitionId ?? "",
    stage: (c?.stage ?? app?.stage ?? "APPLIED") as ApplicationStage,
    aiScore: c?.aiScore ?? app?.screening?.score ?? c?.screening?.score ?? undefined,
    confidence: c?.confidence ?? undefined,
    result: c?.result ?? app?.screening?.result ?? undefined,
    timeInStageDays: c?.timeInStageDays ?? undefined,
    resumeUrl: c?.resumeUrl ?? undefined,
    appliedAt: c?.appliedAt ?? app?.appliedAt ?? c?.createdAt ?? "",
  };
}

export async function listCandidates(): Promise<Candidate[]> {
  const res: any = await api.candidates.listCandidates({ page: 1, pageSize: 100 });
  return arr(res).map(toCandidate);
}
export async function getCandidate(id: string): Promise<Candidate> {
  const res: any = await api.candidates.getCandidate(id);
  return toCandidate(res?.data ?? res);
}

/* ---------- Requisitions ---------- */
function toRequisition(r: any): Requisition {
  return {
    id: r?.id,
    title: r?.title ?? "Untitled role",
    department: r?.department ?? "",
    location: r?.location ?? "",
    status: (r?.status ?? "DRAFT") as Requisition["status"],
    employmentType: r?.employmentType ?? r?.jobFamily ?? "",
    requirements: Array.isArray(r?.requirements) ? r.requirements : undefined,
    customFields: Array.isArray(r?.customFields) ? r.customFields : undefined,
    salaryMin: r?.salaryMin ?? undefined,
    salaryMax: r?.salaryMax ?? undefined,
    openings: r?.headcount ?? r?.openings ?? undefined,
    candidateCount: r?.candidateCount ?? r?._count?.applications ?? r?.applications?.length ?? 0,
    createdAt: r?.createdAt ?? "",
    updatedAt: r?.updatedAt ?? "",
  };
}

export async function listRequisitions(): Promise<Requisition[]> {
  const res: any = await api.platform.getRequisitions();
  return arr(res).map(toRequisition);
}
export async function getRequisition(id: string): Promise<Requisition> {
  const res: any = await api.platform.getRequisition(id);
  return toRequisition(res?.data ?? res);
}

export async function generateJD(title: string): Promise<{
  description: string; requiredSkills: string[]; niceToHave: string[];
  inclusivityScore: number; biasFlags: { phrase: string; suggestion: string }[];
}> {
  const res: any = await api.platform.generateJd({ title, department: "General", skills: [], level: "mid", location: "Remote" });
  const out = res?.data ?? res ?? {};
  return {
    description: out.description ?? "",
    requiredSkills: out.requirements ?? out.requiredSkills ?? [],
    niceToHave: out.niceToHave ?? [],
    inclusivityScore: Number(out.inclusivityScore ?? 0),
    biasFlags: (out.biasFlags ?? []).map((f: any) => ({ phrase: f.text ?? f.phrase ?? "", suggestion: f.suggestion ?? "" })),
  };
}

export async function createRequisition(b: Partial<Requisition>): Promise<Requisition> {
  const res: any = await api.platform.createRequisition(b);
  return toRequisition(res?.data ?? res);
}
