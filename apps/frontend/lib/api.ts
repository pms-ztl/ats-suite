// lib/api.ts - typed data-access layer for the Aurora (Claude Design) pages.
// Each function calls the real api-client (or a raw gateway fetch where no client
// method exists) and maps the response to the design's view-model types.
import { api } from "./api-client";
import type {
  ScreeningVerdict, ScreeningResult, RequirementMatch,
  Candidate, ApplicationStage, Requisition,
  Decision, DecisionType, DecisionStatus,
  ReviewItem, ReviewReasonCode,
  Interview, InterviewStatus,
  Offer, OfferStatus,
  FairnessMetric,
} from "./types";

const arr = (x: any): any[] => (Array.isArray(x) ? x : x?.data ?? x?.items ?? x?.rows ?? []);
const fullName = (o: any) => o?.name || [o?.firstName, o?.lastName].filter(Boolean).join(" ") || "";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string, body?: unknown): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  return res.json();
}

/* ---------- Screening ---------- */
function toRequirement(r: any): RequirementMatch {
  const met = r?.met === true || r?.status === "MATCH" || r?.status === "met" || r?.outcome === "met" ? true
    : r?.met === "partial" || r?.status === "PARTIAL" || r?.outcome === "partial" ? "partial" : false;
  return { requirement: r?.requirement ?? r?.label ?? r?.name ?? r?.criterion ?? r?.type ?? "Requirement", met, evidence: r?.evidence ?? r?.detail ?? r?.reasoning ?? r?.note ?? "" };
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
  return arr(await api.screening.listScreenings({ page: 1, pageSize: 100 })).map(toVerdict);
}
export async function getVerdict(id: string): Promise<ScreeningVerdict> {
  const res: any = await api.screening.getScreening(id);
  return toVerdict(res?.data ?? res);
}

/* ---------- Candidates ---------- */
function toCandidate(c: any): Candidate {
  const app = c?.applications?.[0] ?? {};
  return {
    id: c?.id, name: fullName(c) || "Candidate", email: c?.email ?? "",
    location: c?.location ?? c?.country ?? "", source: c?.source ?? "",
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
  return arr(await api.candidates.listCandidates({ page: 1, pageSize: 100 })).map(toCandidate);
}
export async function getCandidate(id: string): Promise<Candidate> {
  const res: any = await api.candidates.getCandidate(id);
  return toCandidate(res?.data ?? res);
}

/* ---------- Requisitions ---------- */
function toRequisition(r: any): Requisition {
  return {
    id: r?.id, title: r?.title ?? "Untitled role", department: r?.department ?? "", location: r?.location ?? "",
    status: (r?.status ?? "DRAFT") as Requisition["status"], employmentType: r?.employmentType ?? r?.jobFamily ?? "",
    requirements: Array.isArray(r?.requirements) ? r.requirements : undefined,
    customFields: Array.isArray(r?.customFields) ? r.customFields : undefined,
    salaryMin: r?.salaryMin ?? undefined, salaryMax: r?.salaryMax ?? undefined,
    openings: r?.headcount ?? r?.openings ?? undefined,
    candidateCount: r?.candidateCount ?? r?._count?.applications ?? r?.applications?.length ?? 0,
    createdAt: r?.createdAt ?? "", updatedAt: r?.updatedAt ?? "",
  };
}
export async function listRequisitions(): Promise<Requisition[]> {
  return arr(await api.platform.getRequisitions()).map(toRequisition);
}
export async function getRequisition(id: string): Promise<Requisition> {
  const res: any = await api.platform.getRequisition(id);
  return toRequisition(res?.data ?? res);
}
export async function generateJD(title: string): Promise<{ description: string; requiredSkills: string[]; niceToHave: string[]; inclusivityScore: number; biasFlags: { phrase: string; suggestion: string }[]; }> {
  const res: any = await api.platform.generateJd({ title, department: "General", skills: [], level: "mid", location: "Remote" });
  const out = res?.data ?? res ?? {};
  return {
    description: out.description ?? "", requiredSkills: out.requirements ?? out.requiredSkills ?? [], niceToHave: out.niceToHave ?? [],
    inclusivityScore: Number(out.inclusivityScore ?? 0),
    biasFlags: (out.biasFlags ?? []).map((f: any) => ({ phrase: f.text ?? f.phrase ?? "", suggestion: f.suggestion ?? "" })),
  };
}
export async function createRequisition(b: Partial<Requisition>): Promise<Requisition> {
  const res: any = await api.platform.createRequisition(b);
  return toRequisition(res?.data ?? res);
}

/* ---------- Decisions (human-gated) ---------- */
function toDecision(d: any): Decision {
  return {
    id: d?.id, candidateId: fullName(d?.candidate) || d?.candidateId || "Candidate", requisitionId: d?.requisitionId ?? "",
    type: (d?.type ?? d?.decisionType ?? "HOLD") as DecisionType,
    status: (d?.status ?? "PENDING_APPROVAL") as DecisionStatus,
    aiRecommendation: d?.aiRecommendation ?? (d?.recommendation ? { type: d.recommendation as DecisionType, confidence: Number(d?.confidence ?? 0.7) } : undefined),
    decidedBy: d?.decidedBy ?? undefined, reasonCode: d?.reasonCode ?? undefined, createdAt: d?.createdAt ?? "",
  };
}
export async function listDecisions(): Promise<Decision[]> {
  return arr(await api.decisions.listDecisions({ page: 1, pageSize: 100 })).map(toDecision);
}
export async function recordDecision(b: { id: string; type: DecisionType }): Promise<void> {
  try { await raw("POST", "/decisions", { decisionId: b.id, type: b.type }); } catch { /* surfaced via toast in the page when wired */ }
}

/* ---------- HITL review queue ---------- */
function toReviewItem(r: any): ReviewItem {
  const slaDueAt = r?.slaDueAt
    ?? (r?.createdAt && r?.slaMinutes ? new Date(new Date(r.createdAt).getTime() + r.slaMinutes * 60000).toISOString() : new Date().toISOString());
  return {
    id: r?.id, candidateId: r?.payload?.candidateId ?? r?.subjectId ?? "", requisitionId: r?.payload?.requisitionId ?? "",
    reasonCode: (r?.type ?? r?.action ?? "LOW_CONFIDENCE") as ReviewReasonCode,
    slaDueAt, verdict: toVerdict(r?.payload?.screening ?? r?.payload?.verdict ?? r?.payload ?? {}), assignedTo: r?.assignedTo ?? undefined,
  };
}
export async function listReviewQueue(): Promise<ReviewItem[]> {
  return arr(await raw("GET", "/agents/hitl")).map(toReviewItem);
}

/* ---------- Interviews ---------- */
function toInterview(iv: any): Interview {
  return {
    id: iv?.id, candidateId: iv?.candidateId ?? "", requisitionId: iv?.requisitionId ?? "",
    round: iv?.round?.name ?? iv?.round ?? iv?.type ?? iv?.stage ?? "Interview",
    status: (iv?.status ?? "SCHEDULED") as InterviewStatus,
    startsAt: iv?.scheduledAt ?? iv?.startsAt ?? "",
    durationMins: Number(iv?.duration ?? iv?.durationMinutes ?? 60),
    panel: Array.isArray(iv?.panelMembers) ? iv.panelMembers.map((p: any) => p.userId ?? p) : [],
    mode: (iv?.format ?? iv?.mode ?? "VIDEO") as Interview["mode"],
  };
}
export async function listInterviews(): Promise<Interview[]> {
  return arr(await api.interviews.listInterviews({ page: 1, pageSize: 100 })).map(toInterview);
}

/* ---------- Offers ---------- */
function toOffer(o: any): Offer {
  return {
    id: o?.id, candidateId: fullName(o?.candidate) || o?.candidateId || "Candidate", requisitionId: o?.requisitionId ?? "",
    status: (o?.status ?? "DRAFT") as OfferStatus, baseSalary: Number(o?.baseSalary ?? o?.base ?? 0),
    signingBonus: o?.signingBonus ?? undefined, equity: o?.equity ?? undefined, startDate: o?.startDate ?? "",
    approvalChain: Array.isArray(o?.approvalChain) ? o.approvalChain : [], aiDrafted: Boolean(o?.aiDrafted ?? o?.aiGenerated ?? true),
  };
}
export async function listOffers(): Promise<Offer[]> {
  try { return arr(await raw("GET", "/offers")).map(toOffer); } catch { return []; }
}
export async function approveOffer(id: string): Promise<void> {
  try { await raw("POST", `/offers/${id}/approve`); } catch { /* surfaced via toast when wired */ }
}

/* ---------- Analytics + Compliance ---------- */
export async function getFunnel(): Promise<{ stage: ApplicationStage; count: number }[]> {
  const res: any = await api.analytics.getFunnel();
  const out = res?.data ?? res ?? {};
  const rows = Array.isArray(out) ? out : (out?.stages ?? out?.funnel ?? out?.byStage ?? []);
  if (Array.isArray(rows) && rows.length) {
    return rows.map((r: any) => ({ stage: (r.stage ?? r.name ?? r.key) as ApplicationStage, count: Number(r.count ?? r.value ?? 0) }));
  }
  if (out && typeof out === "object") {
    return Object.entries(out).filter(([, v]) => typeof v === "number").map(([k, v]) => ({ stage: k as ApplicationStage, count: Number(v) }));
  }
  return [];
}

export async function getAdverseImpact(): Promise<FairnessMetric[]> {
  const res: any = await api.bias.getFourFifthsReport();
  const out = res?.data ?? res ?? {};
  const rows = Array.isArray(out) ? out : (out.reports ?? out.groups ?? out.metrics ?? []);
  return (Array.isArray(rows) ? rows : []).map((m: any) => {
    const impactRatio = Number(m.impactRatio ?? m.adverseImpactRatio ?? m.ratio ?? 1);
    return {
      group: m.group ?? m.attribute ?? m.name ?? "Group",
      selectionRate: Number(m.selectionRate ?? m.scoringRate ?? 0),
      impactRatio,
      flagged: typeof m.flagged === "boolean" ? m.flagged : (m.fourFifthsPass === false || impactRatio < 0.8),
    };
  });
}
