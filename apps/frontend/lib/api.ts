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
export async function listCandidates(q?: { stage?: ApplicationStage; requisitionId?: string }): Promise<Candidate[]> {
  const params: any = { page: 1, pageSize: 100 };
  if (q?.stage) params.stage = q.stage;
  if (q?.requisitionId) params.requisitionId = q.requisitionId;
  return arr(await api.candidates.listCandidates(params)).map(toCandidate);
}
export async function advanceStage(id: string, stage: ApplicationStage): Promise<Candidate> {
  const res: any = await raw("PATCH", `/candidates/${id}/stage`, { stage });
  return toCandidate(res?.data ?? res);
}
export async function importCandidates(file: FormData): Promise<{ imported: number; flagged: number }> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/candidates/import`, {
    method: "POST", credentials: "include",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: file,
  });
  if (!r.ok) throw new Error(`POST /candidates/import -> ${r.status}`);
  const res: any = await r.json();
  return { imported: Number(res?.imported ?? res?.data?.imported ?? 0), flagged: Number(res?.flagged ?? res?.data?.flagged ?? 0) };
}
// Bulk resume-file upload -> POST /api/resume/bulk (multipart, field "resumes").
// The backend extracts text (PDF/DOCX/DOC/TXT, plus images via OCR), creates a
// candidate per file, and the AI resume-parser backfills name/email/skills.
export async function bulkUploadResumes(
  form: FormData,
): Promise<{ bulkUploadId?: string; totalFiles: number; enqueued: number; failed: number }> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/resume/bulk`, {
    method: "POST", credentials: "include",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: form,
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /resume/bulk -> ${r.status}`);
  const d = res?.data ?? res;
  return {
    bulkUploadId: d?.bulkUploadId,
    totalFiles: Number(d?.totalFiles ?? 0),
    enqueued: Number(d?.enqueued ?? 0),
    failed: Number(d?.failed ?? 0),
  };
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
    requiredSkills: Array.isArray(r?.requiredSkills) ? r.requiredSkills : (Array.isArray(r?.requirements) ? r.requirements : []),
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

/* ---------- Job postings (public link) ---------- */
export interface JobPostingLite { id: string; slug: string; title: string; isPublished: boolean; requisitionId: string; }
export function slugify(s: string): string {
  return (s || "job").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 100) || "job";
}
function toPosting(p: any): JobPostingLite {
  return { id: p?.id ?? "", slug: p?.slug ?? "", title: p?.title ?? "", isPublished: Boolean(p?.isPublished), requisitionId: p?.requisitionId ?? "" };
}
// Returns the existing published posting for a requisition, if any.
export async function findPostingForRequisition(requisitionId: string): Promise<JobPostingLite | null> {
  try {
    const list = arr(await raw("GET", `/job-postings?requisitionId=${encodeURIComponent(requisitionId)}`)).map(toPosting);
    return list.find((p) => p.requisitionId === requisitionId) ?? list[0] ?? null;
  } catch { return null; }
}
// Creates (publishes) a posting. Retries once with a longer slug on a 409 slug clash.
export async function createJobPosting(b: { requisitionId: string; title: string; description?: string; requirements?: string[]; slug?: string; }): Promise<JobPostingLite> {
  const base = b.slug || slugify(b.title);
  const body = { requisitionId: b.requisitionId, title: b.title, description: b.description ?? "", requirements: b.requirements ?? [], isPublished: true };
  try {
    return toPosting((await raw("POST", "/job-postings", { ...body, slug: base }))?.data ?? {});
  } catch {
    const alt = `${base}-${Math.random().toString(36).slice(2, 7)}`.slice(0, 120);
    return toPosting((await raw("POST", "/job-postings", { ...body, slug: alt }))?.data ?? {});
  }
}

/* ---------- Application form schema (native form builder) ---------- */
export interface FormFieldDef {
  id: string; type: string; label: string; required?: boolean; order?: number;
  placeholder?: string; helpText?: string; options?: string[]; fileTypes?: string[]; maxSizeMb?: number;
}
export async function getApplicationForm(requisitionId: string): Promise<{ name: string; fields: FormFieldDef[]; isDefault: boolean }> {
  try {
    const res: any = await raw("GET", `/requisitions/${encodeURIComponent(requisitionId)}/form`);
    const d = res?.data ?? res ?? {};
    return { name: d.name ?? "Default", fields: Array.isArray(d.fields) ? d.fields : [], isDefault: Boolean(d.isDefault) };
  } catch { return { name: "Default", fields: [], isDefault: true }; }
}
export async function saveApplicationForm(requisitionId: string, name: string, fields: FormFieldDef[]): Promise<void> {
  await raw("PUT", `/requisitions/${encodeURIComponent(requisitionId)}/form`, { name, fields });
}

/* ---------- Super-admin (platform operator) ---------- */
export interface PlatformTenant {
  id: string; name: string; slug?: string; plan: string; status?: string; createdAt?: string;
  userCount?: number; candidateCount?: number; requisitionCount?: number; agentRunCount?: number; costUsd30d?: number;
}
export async function getPlatformStats(): Promise<any> {
  try { return (await raw("GET", "/super-admin/stats"))?.data ?? {}; } catch { return {}; }
}
export async function listPlatformTenants(): Promise<PlatformTenant[]> {
  try { const r: any = await raw("GET", "/super-admin/tenants?pageSize=100"); return (r?.data?.data ?? r?.data ?? []) as PlatformTenant[]; } catch { return []; }
}
export async function getTenantDetail(id: string): Promise<any> {
  try { return (await raw("GET", `/super-admin/tenants/${encodeURIComponent(id)}/detail`))?.data ?? null; } catch { return null; }
}
// Cross-tenant AI cost rollup (billing-service AgentRunCost, last `days`).
// Returns real per-tenant / per-agent / per-day spend; empty if no AI usage yet.
export interface PlatformCostRollup {
  periodDays: number;
  totals: { runs: number; costUsd: number; tokensIn: number; tokensOut: number };
  byTenant: { tenantId: string; plan: string; runs: number; costUsd: number; tokensIn: number; tokensOut: number }[];
  byAgent: { agentType: string; runs: number; costUsd: number }[];
  byDay: { day: string; costUsd: number; runs: number }[];
}
export async function getPlatformCost(days = 30): Promise<PlatformCostRollup> {
  const empty: PlatformCostRollup = { periodDays: days, totals: { runs: 0, costUsd: 0, tokensIn: 0, tokensOut: 0 }, byTenant: [], byAgent: [], byDay: [] };
  try {
    const r: any = (await raw("GET", `/super-admin/platform/cost?days=${days}`))?.data ?? {};
    return {
      periodDays: r.periodDays ?? days,
      totals: r.totals ?? empty.totals,
      byTenant: Array.isArray(r.byTenant) ? r.byTenant : [],
      byAgent: Array.isArray(r.byAgent) ? r.byAgent : [],
      byDay: Array.isArray(r.byDay) ? r.byDay : [],
    };
  } catch { return empty; }
}
export async function listPlanRequests(): Promise<any[]> {
  try { return arr(await raw("GET", "/super-admin/plan-change-requests")); } catch { return []; }
}
export async function decidePlanRequest(id: string, action: "APPROVE" | "REJECT"): Promise<void> {
  await raw("PATCH", `/super-admin/plan-change-requests/${encodeURIComponent(id)}`, { action });
}

/* ---------- In-app messaging (tenant-isolated, real-time) ---------- */
export interface Conversation {
  id: string; title: string | null; isGroup: boolean; participantIds: string[];
  lastMessage: { body: string; senderId: string; createdAt: string } | null; unread: number; updatedAt: string;
}
export interface ChatMessage { id: string; conversationId: string; senderId: string; body: string; createdAt: string }
export interface AssignableUser { id: string; firstName: string; lastName: string; role: string }

export async function listConversations(): Promise<Conversation[]> {
  try { return arr(await raw("GET", "/messages/conversations")) as Conversation[]; } catch { return []; }
}
export async function createConversation(participantUserIds: string[], title?: string): Promise<{ id: string }> {
  const r: any = await raw("POST", "/messages/conversations", { participantUserIds, ...(title ? { title } : {}) });
  return r?.data ?? r;
}
export async function getConversationMessages(id: string): Promise<ChatMessage[]> {
  try { return arr(await raw("GET", `/messages/conversations/${encodeURIComponent(id)}/messages`)) as ChatMessage[]; } catch { return []; }
}
export async function sendMessage(id: string, body: string): Promise<ChatMessage> {
  const r: any = await raw("POST", `/messages/conversations/${encodeURIComponent(id)}/messages`, { body });
  return (r?.data ?? r) as ChatMessage;
}
export async function markConversationRead(id: string): Promise<void> {
  try { await raw("POST", `/messages/conversations/${encodeURIComponent(id)}/read`, {}); } catch { /* ignore */ }
}
export async function listAssignableUsers(): Promise<AssignableUser[]> {
  try { return arr(await raw("GET", "/users/assignable")) as AssignableUser[]; } catch { return []; }
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
export async function recordDecision(b: Partial<Decision>): Promise<Decision> {
  const res: any = await raw("POST", "/decisions", { ...(b.id ? { decisionId: b.id } : {}), ...b });
  return toDecision(res?.data ?? res ?? b);
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
export async function getReviewItem(id: string): Promise<ReviewItem> {
  const res: any = await raw("GET", `/agents/hitl/${id}`);
  return toReviewItem(res?.data ?? res);
}
export async function resolveReview(id: string, b: { result: string; note: string }): Promise<ReviewItem> {
  const res: any = await raw("POST", `/agents/hitl/${id}/resolve`, b);
  return toReviewItem(res?.data ?? res ?? {});
}
export async function runScreening(requisitionId: string): Promise<{ queued: number }> {
  const res: any = await raw("POST", "/screening", { requisitionId });
  return { queued: Number(res?.queued ?? res?.data?.queued ?? 0) };
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
/* Interview rounds configured for a requisition (drives the schedule picker). */
export interface RoundLite { id: string; name: string; interviewType: string; durationMinutes: number; order: number; autoAdvanceOnPass: boolean; }
export async function listRounds(requisitionId: string): Promise<RoundLite[]> {
  try { return arr(await raw("GET", `/rounds?requisitionId=${encodeURIComponent(requisitionId)}`)) as RoundLite[]; } catch { return []; }
}
/* Schedule a new interview (scheduler-gated: ADMIN/RECRUITER/HIRING_MANAGER). */
export async function createInterview(body: {
  requisitionId: string; candidateId: string; stage: string;
  roundId?: string; type?: string; scheduledAt?: string; duration?: number;
}): Promise<Interview> {
  const res: any = await raw("POST", "/interviews", body);
  return toInterview(res?.data ?? res);
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
  // The pipeline funnel ships inside the platform unified-overview aggregate as
  // `pipelineData`; the standalone /analytics/funnel route is not exposed by the
  // gateway (404). Read it from the working aggregate the KPIs already use.
  const res: any = await raw("GET", "/platform/unified-overview").catch(() => ({}));
  const d = res?.data ?? res ?? {};
  const rows: any[] = Array.isArray(d.pipelineData) ? d.pipelineData : [];
  return rows
    .map((r: any) => ({ stage: (r.name ?? r.stage ?? r.key) as ApplicationStage, count: Number(r.value ?? r.count ?? 0) }))
    .filter((r) => !!r.stage);
}

export async function getAdverseImpact(): Promise<FairnessMetric[]> {
  // Diversity / four-fifths ships inside the platform unified-overview aggregate
  // as `diversityData`; the standalone /bias/* routes are not exposed by the
  // gateway (404). When there is no demographic data the aggregate returns null,
  // so this resolves to [] and the panel shows its empty state (not an error).
  const res: any = await raw("GET", "/platform/unified-overview").catch(() => ({}));
  const d = res?.data ?? res ?? {};
  const dd = d.diversityData;
  const rows: any[] = Array.isArray(dd) ? dd : (Array.isArray(dd?.groups) ? dd.groups : (Array.isArray(dd?.metrics) ? dd.metrics : []));
  return rows.map((m: any) => {
    const impactRatio = Number(m.impactRatio ?? m.adverseImpactRatio ?? m.ratio ?? 1);
    return {
      group: m.group ?? m.attribute ?? m.name ?? "Group",
      selectionRate: Number(m.selectionRate ?? m.scoringRate ?? m.rate ?? 0),
      impactRatio,
      flagged: typeof m.flagged === "boolean" ? m.flagged : (m.fourFifthsPass === false || impactRatio < 0.8),
    };
  });
}

/* ---------- Dashboard (home) ---------- */
// Matches the aurora-kit `Kpi` shape so KpiRow/KPICard render directly.
export type DashKpi = {
  id: string; label: string; value: number; icon: string; spark: number[];
  delta: number; good?: boolean; ai?: boolean; prefix?: string; suffix?: string;
};
export async function getDashboardKpis(): Promise<DashKpi[]> {
  const res: any = await raw("GET", "/platform/unified-overview").catch(() => ({}));
  const d = res?.data ?? res ?? {};
  const flat = (v: number) => [v, v, v, v, v, v];
  const mk = (
    id: string, label: string, icon: string, value: any, change: any, spark: any,
    opts: Partial<DashKpi> = {},
  ): DashKpi => {
    const v = Number(value) || 0;
    return {
      id, label, icon, value: v, delta: Math.round(Number(change) || 0),
      spark: Array.isArray(spark) && spark.length ? spark.map(Number) : flat(v),
      ...opts,
    };
  };
  return [
    mk("reqs", "Open reqs", "briefcase", d.openRequisitions, d.openRequisitionsChange, d.openRequisitionsSparkline, { good: true }),
    mk("cands", "Active candidates", "users", d.activeCandidates, d.activeCandidatesChange, d.activeCandidatesSparkline, { good: true }),
    mk("tth", "Time-to-hire", "clock", d.avgTimeToHire, d.avgTimeToHireChange, d.avgTimeToHireSparkline, { suffix: "d", good: false }),
    mk("offer", "Offer accept", "fileText", d.offerAcceptRate, d.offerAcceptRateChange, d.offerAcceptRateSparkline, { suffix: "%", good: true }),
    mk("ai", "AI decisions today", "sparkles", d.aiDecisionsToday, d.aiDecisionsTodayChange, d.aiDecisionsTodaySparkline, { ai: true, good: true }),
    mk("comp", "Compliance score", "shield", d.complianceScore, d.complianceScoreChange, d.complianceScoreSparkline, { suffix: "%", good: true }),
    mk("div", "Diversity index", "grid", d.diversityScore, d.diversityScoreChange, d.diversityScoreSparkline, { good: true }),
    mk("cost", "Cost per hire", "card", d.costPerHire, d.costPerHireChange, d.costPerHireSparkline, { prefix: "$", good: false }),
  ];
}
