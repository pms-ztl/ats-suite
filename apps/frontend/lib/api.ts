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
    applicationId: app?.id ?? c?.applicationId ?? undefined,
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

/* ---------- Bulk archive (.zip) ingest ----------
 * Scale path for 1k-10k mixed resume files in ONE upload. The server unzips +
 * extracts text ASYNC in a worker (so the request isn't held open), creating
 * STAGING rows the recruiter reviews/edits/approves before any candidate is
 * created. Flow: upload archive -> poll status (extracting) -> review staging
 * items -> commit approved -> poll status (parse/screen progress). Real data
 * only; every helper throws on failure so the UI shows an honest error. */
export interface BulkUploadStatus {
  id: string;
  phase: "extracting" | "review" | "committing" | "done" | "failed";
  totalFiles: number;
  extractedCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  committedCount: number;
  parsedFiles: number;
  failedFiles: number;
}
export interface BulkImportItem {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  detectedName: string | null;
  detectedEmail: string | null;
  textSnippet: string | null;
  extractStatus: "extracted" | "ocr_empty" | "failed" | "unsupported";
  reviewStatus: "pending" | "approved" | "rejected";
  candidateId: string | null;
  // Module C — ATS score (0-100) vs the bound requisition; null until scored.
  score: number | null;
  scoreStatus: "pending" | "scored" | "failed" | null;
}
function toBulkStatus(d: any): BulkUploadStatus {
  return {
    id: String(d?.id ?? ""),
    phase: (["extracting", "review", "committing", "done", "failed"] as const).includes(d?.phase) ? d.phase : "extracting",
    totalFiles: Number(d?.totalFiles ?? 0),
    extractedCount: Number(d?.extractedCount ?? 0),
    pendingCount: Number(d?.pendingCount ?? 0),
    approvedCount: Number(d?.approvedCount ?? 0),
    rejectedCount: Number(d?.rejectedCount ?? 0),
    committedCount: Number(d?.committedCount ?? 0),
    parsedFiles: Number(d?.parsedFiles ?? 0),
    failedFiles: Number(d?.failedFiles ?? 0),
  };
}
function toBulkItem(d: any): BulkImportItem {
  return {
    id: String(d?.id ?? ""),
    fileName: String(d?.fileName ?? ""),
    mimeType: String(d?.mimeType ?? ""),
    sizeBytes: Number(d?.sizeBytes ?? 0),
    detectedName: d?.detectedName ?? null,
    detectedEmail: d?.detectedEmail ?? null,
    textSnippet: d?.textSnippet ?? null,
    extractStatus: (["extracted", "ocr_empty", "failed", "unsupported"] as const).includes(d?.extractStatus) ? d.extractStatus : "failed",
    reviewStatus: (["pending", "approved", "rejected"] as const).includes(d?.reviewStatus) ? d.reviewStatus : "pending",
    candidateId: d?.candidateId ?? null,
    score: typeof d?.score === "number" ? d.score : null,
    scoreStatus: (["pending", "scored", "failed"] as const).includes(d?.scoreStatus) ? d.scoreStatus : null,
  };
}
// POST /api/resume/bulk-archive (multipart, single field "archive"). Returns the
// bulkUploadId once the zip is accepted; extraction continues in a worker.
export async function uploadResumeArchive(
  file: File,
  requisitionId?: string,
): Promise<{ bulkUploadId: string; statusUrl?: string }> {
  const t = authToken();
  const form = new FormData();
  form.append("archive", file, file.name);
  // Module C — binding the batch to a requisition makes the worker score + rank
  // every parsed resume against it (descending by ATS score).
  if (requisitionId) form.append("requisitionId", requisitionId);
  const r = await fetch(`${API_BASE}/resume/bulk-archive`, {
    method: "POST", credentials: "include",
    headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: form,
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /resume/bulk-archive -> ${r.status}`);
  const d = res?.data ?? res;
  return { bulkUploadId: String(d?.bulkUploadId ?? ""), statusUrl: d?.statusUrl };
}
// GET /api/resume/bulk/:id - current phase + counters.
export async function getBulkUpload(id: string): Promise<BulkUploadStatus> {
  const res: any = await raw("GET", `/resume/bulk/${id}`);
  return toBulkStatus(res?.data ?? res);
}
// GET /api/resume/bulk/:id/items?cursor=&limit= - paginated staging rows.
export async function getBulkItems(
  id: string, cursor?: string, limit = 50, sort?: "score",
): Promise<{ items: BulkImportItem[]; nextCursor: string | null }> {
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  if (cursor) qs.set("cursor", cursor);
  if (sort) qs.set("sort", sort); // Module C — server-side rank by ATS score desc
  const res: any = await raw("GET", `/resume/bulk/${id}/items?${qs.toString()}`);
  const d = res?.data ?? res;
  return {
    items: (Array.isArray(d?.items) ? d.items : []).map(toBulkItem),
    nextCursor: d?.nextCursor ?? null,
  };
}
// PATCH /api/resume/bulk/:id/items/:itemId - approve/reject + edit detected fields.
export async function patchBulkItem(
  id: string, itemId: string,
  patch: { reviewStatus?: "approved" | "rejected"; detectedName?: string; detectedEmail?: string },
): Promise<BulkImportItem> {
  const res: any = await raw("PATCH", `/resume/bulk/${id}/items/${itemId}`, patch);
  return toBulkItem(res?.data ?? res);
}
// POST /api/resume/bulk/:id/review-all - bulk approve/reject across all items.
export async function reviewAllBulk(
  id: string, action: "approve-nonempty" | "reject-empty" | "approve-all",
): Promise<BulkUploadStatus> {
  const res: any = await raw("POST", `/resume/bulk/${id}/review-all`, { action });
  return toBulkStatus(res?.data ?? res);
}
// POST /api/resume/bulk/:id/commit - create candidates + Resume rows for every
// approved item and enqueue parsing (which auto-screens). 402 PLAN_LIMIT if the
// approved count exceeds the monthly resume quota; the server's message is
// surfaced so the recruiter sees the real quota reason, not a bare status code.
export async function commitBulkImport(
  id: string,
): Promise<{ committed: number; skipped: number }> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/resume/bulk/${id}/commit`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /resume/bulk/${id}/commit -> ${r.status}`);
  const d = res?.data ?? res;
  return { committed: Number(d?.committed ?? 0), skipped: Number(d?.skipped ?? 0) };
}
// Copilot — POST /api/copilot. Returns a grounded answer + cited sources from
// the real agent (backed by the configured LLM). Throws on failure so the UI can
// show an honest error instead of a fabricated answer.
export interface CopilotResponse {
  answer: string;
  confidence: number;
  sources: Array<{ type: string; id: string; snippet: string }>;
  suggestedActions?: Array<{ label: string; type?: string }>;
  followUpQuestions?: string[];
  modelName?: string;
}
export async function askCopilot(query: string): Promise<CopilotResponse> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/copilot`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify({ query }),
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /copilot -> ${r.status}`);
  const d = res?.data ?? res;
  return {
    answer: String(d?.answer ?? ""),
    confidence: Number(d?.confidence ?? 0),
    sources: Array.isArray(d?.sources) ? d.sources : [],
    suggestedActions: Array.isArray(d?.suggestedActions) ? d.suggestedActions : [],
    followUpQuestions: Array.isArray(d?.followUpQuestions) ? d.followUpQuestions : [],
    modelName: d?.modelName,
  };
}
// AI sourcing — POST /api/sourcing/search. Free-text "who I need" -> the
// sourcing agent (real LLM) ranks the tenant's OWN candidate pool and returns
// matches with grounded evidence. Falls back server-side to a real keyword/skill
// score over the same rows if the LLM is unavailable (usedLLM=false); never
// invents people. Honest empty when the pool is empty (matches=[]). Throws on a
// transport/HTTP failure so the UI shows an error instead of fabricated results.
export interface SourcingMatch {
  candidateId: string;
  name: string;
  role: string;
  score: number; // 0-100 fit
  evidence: string;
}
export interface SourcingResult {
  query: string;
  scanned: number;
  usedLLM: boolean;
  matches: SourcingMatch[];
  summary?: string;
  modelName?: string;
}
export async function sourceCandidates(query: string, limit = 10): Promise<SourcingResult> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/sourcing/search`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify({ query, limit }),
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /sourcing/search -> ${r.status}`);
  const d = res?.data ?? res;
  return {
    query: String(d?.query ?? query),
    scanned: Number(d?.scanned ?? 0),
    usedLLM: Boolean(d?.usedLLM),
    matches: (Array.isArray(d?.matches) ? d.matches : []).map((m: any) => ({
      candidateId: String(m?.candidateId ?? ""),
      name: String(m?.name ?? "Candidate"),
      role: String(m?.role ?? ""),
      score: Math.round(Number(m?.score ?? 0)),
      evidence: String(m?.evidence ?? ""),
    })),
    summary: d?.summary ? String(d.summary) : undefined,
    modelName: d?.modelName ? String(d.modelName) : undefined,
  };
}

// Real two-step CSV import (candidate-service /import/preview + /commit).
export interface ImportPreviewRow {
  row: number;
  status: string; // valid_new | valid_update | invalid_email | missing_required | duplicate_in_file
  candidate: { firstName?: string; lastName?: string; email?: string; location?: string; source?: string; [k: string]: unknown };
  reason?: string;
}
export interface ImportPreview {
  headers: string[];
  preview: ImportPreviewRow[];
  summary: { total: number; newCount: number; updateCount: number; invalidEmailCount: number; missingRequiredCount: number; duplicateInFileCount: number };
}
export async function previewCandidateImport(csv: string): Promise<ImportPreview> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/candidates/import/preview`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify({ csv }),
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /candidates/import/preview -> ${r.status}`);
  const d = res?.data ?? res;
  return {
    headers: Array.isArray(d?.headers) ? d.headers : [],
    preview: Array.isArray(d?.preview) ? d.preview : [],
    summary: d?.summary ?? { total: 0, newCount: 0, updateCount: 0, invalidEmailCount: 0, missingRequiredCount: 0, duplicateInFileCount: 0 },
  };
}
export async function commitCandidateImport(csv: string): Promise<{ created: number; updated: number; skipped: number; totalRows: number }> {
  const t = authToken();
  const r = await fetch(`${API_BASE}/candidates/import/commit`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    body: JSON.stringify({ csv, skipDuplicates: true, source: "CSV_IMPORT" }),
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(res?.error?.message || `POST /candidates/import/commit -> ${r.status}`);
  const s = (res?.data ?? res)?.summary ?? {};
  return { created: Number(s?.created ?? 0), updated: Number(s?.updated ?? 0), skipped: Number(s?.skipped ?? 0), totalRows: Number(s?.totalRows ?? 0) };
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
// Returns the existing published posting for THIS requisition, if any. Must match
// requisitionId exactly — never fall back to the first row in the list, or the
// "Post job" link would resolve to some other requisition's slug (seed leakage).
export async function findPostingForRequisition(requisitionId: string): Promise<JobPostingLite | null> {
  try {
    const list = arr(await raw("GET", `/job-postings?requisitionId=${encodeURIComponent(requisitionId)}`)).map(toPosting);
    return list.find((p) => p.requisitionId === requisitionId) ?? null;
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
// notification HitlCheckpoint.type (lowercase enum) -> frontend ReviewReasonCode,
// so the queue shows a real label ("Low-confidence verdict") instead of the generic
// fallback. Unmapped values (a human "manual" flag, or an already-uppercase code)
// pass through uppercased; the UI label map falls back to "Review needed" for those.
const HITL_REASON: Record<string, ReviewReasonCode> = {
  low_confidence: "LOW_CONFIDENCE",
  bias_flag: "ADVERSE_IMPACT_FLAG",
  policy_review: "POLICY_OVERRIDE",
  sensitive_decision: "POLICY_OVERRIDE",
};
function toReviewItem(r: any): ReviewItem {
  const slaDueAt = r?.slaDueAt
    ?? (r?.createdAt && r?.slaMinutes ? new Date(new Date(r.createdAt).getTime() + r.slaMinutes * 60000).toISOString() : new Date().toISOString());
  const rawReason = String(r?.type ?? r?.action ?? "LOW_CONFIDENCE");
  return {
    id: r?.id, candidateId: r?.payload?.candidateId ?? r?.subjectId ?? "", requisitionId: r?.payload?.requisitionId ?? "",
    reasonCode: (HITL_REASON[rawReason.toLowerCase()] ?? rawReason.toUpperCase()) as ReviewReasonCode,
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
/* Create a real offer (ADMIN/RECRUITER/HIRING_MANAGER). POST /api/offers ->
   candidate-service /internal/offers; status defaults to DRAFT server-side. */
export async function createOffer(body: {
  candidateId: string; requisitionId: string; baseSalary: number;
  currency?: string; bonusPercent?: number; equity?: string; startDate?: string; expiresAt?: string; notes?: string;
}): Promise<Offer> {
  const res: any = await raw("POST", "/offers", body);
  return toOffer(res?.data ?? res);
}

/* ---------- Plan changes (tenant admin requests; super-admin approves) ---------- */
export async function requestPlanChange(toPlan: string, reason?: string): Promise<void> {
  await raw("POST", "/tenants/plan-change-request", { toPlan, ...(reason ? { reason } : {}) });
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

/* ---------- Dashboard visualizations (all real, tenant-scoped series) ---------- */
// Channel mix: GET /analytics/source-of-hire -> per-source applied/hired counts
// computed from Candidate.source. Honest zeros for hired until hires land.
export type SourceStat = { source: string; applied: number; hired: number; conversionRate: number };
// System enum sources (PUBLIC_APPLY, BULK_UPLOAD) read as raw constants; humanize
// for display while leaving free-text sources ("LinkedIn", "Job board") untouched.
export function prettySource(s: string): string {
  if (!/^[A-Z0-9_]+$/.test(s)) return s;
  const t = s.replace(/_/g, " ").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
export async function getSourceOfHire(): Promise<SourceStat[]> {
  const res: any = await raw("GET", "/analytics/source-of-hire").catch(() => ({}));
  const d = res?.data ?? res ?? {};
  const rows: any[] = Array.isArray(d.sources) ? d.sources : [];
  return rows
    .map((s: any) => ({
      source: prettySource(String(s.source ?? "Unknown")),
      applied: Number(s.applied ?? 0),
      hired: Number(s.hired ?? 0),
      conversionRate: Number(s.conversionRate ?? 0),
    }))
    .filter((s) => s.applied > 0 || s.hired > 0);
}

// AI workload + spend: GET /billing/usage?days=N -> metered per-agent runs, tokens
// and cost from AgentRunCost. Every number is a real metered value.
export type AgentUsage = { agentType: string; runs: number; tokensIn: number; tokensOut: number; costUsd: number };
export type BillingUsage = { totalRuns: number; totalTokensIn: number; totalTokensOut: number; totalCostUsd: number; byAgent: AgentUsage[] };
export async function getBillingUsage(days = 30): Promise<BillingUsage> {
  const res: any = await raw("GET", `/billing/usage?days=${days}`).catch(() => ({}));
  const d = res?.data ?? res ?? {};
  const byAgent: any[] = Array.isArray(d.byAgent) ? d.byAgent : [];
  return {
    totalRuns: Number(d.totalRuns ?? 0),
    totalTokensIn: Number(d.totalTokensIn ?? 0),
    totalTokensOut: Number(d.totalTokensOut ?? 0),
    totalCostUsd: Number(d.totalCostUsd ?? 0),
    byAgent: byAgent.map((a: any) => ({
      agentType: String(a.agentType ?? "agent"),
      runs: Number(a.runs ?? 0),
      tokensIn: Number(a.tokensIn ?? 0),
      tokensOut: Number(a.tokensOut ?? 0),
      costUsd: Number(a.costUsd ?? 0),
    })),
  };
}

// Monthly AI spend by provider: GET /billing/spend-trend (AgentRunCost grouped by
// month + provider inferred from modelName).
export type SpendMonth = { month: string; label: string; total: number; byProvider: Record<string, number> };
export async function getSpendTrend(): Promise<{ trend: SpendMonth[]; totalSpend: number }> {
  const res: any = await raw("GET", "/billing/spend-trend").catch(() => ({}));
  const d = res?.data ?? res ?? {};
  const trend: any[] = Array.isArray(d.trend) ? d.trend : [];
  return {
    trend: trend.map((m: any) => ({
      month: String(m.month ?? ""), label: String(m.label ?? m.month ?? ""),
      total: Number(m.total ?? 0), byProvider: (m.byProvider && typeof m.byProvider === "object") ? m.byProvider : {},
    })),
    totalSpend: Number(d.totalSpend ?? 0),
  };
}

// Bucket real ISO timestamps into trailing calendar weeks (oldest -> newest).
// Used for inflow/activity trends; every count is a real row, zero weeks stay zero.
export function weeklyCounts(isoDates: (string | undefined | null)[], weeks = 8): { label: string; n: number }[] {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // back to Sunday
  const out: { label: string; n: number; from: number; to: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(weekStart); from.setDate(from.getDate() - i * 7);
    const to = new Date(from); to.setDate(to.getDate() + 7);
    out.push({
      label: from.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      n: 0, from: from.getTime(), to: to.getTime(),
    });
  }
  for (const iso of isoDates) {
    if (!iso) continue;
    const t = new Date(iso).getTime();
    if (!isFinite(t)) continue;
    const b = out.find((w) => t >= w.from && t < w.to);
    if (b) b.n++;
  }
  return out.map(({ label, n }) => ({ label, n }));
}

// Human oversight: GET /agents/hitl -> checkpoint status mix. The raw rows carry
// status PENDING/APPROVED/REJECTED (toReviewItem drops it, so count here).
export type OversightStats = { pending: number; approved: number; rejected: number; total: number };
export async function getOversight(): Promise<OversightStats> {
  const rows = arr(await raw("GET", "/agents/hitl").catch(() => []));
  const norm = (s: any) => String(s ?? "").toUpperCase();
  const pending = rows.filter((r: any) => norm(r.status) === "PENDING").length;
  const approved = rows.filter((r: any) => norm(r.status) === "APPROVED").length;
  const rejected = rows.filter((r: any) => norm(r.status) === "REJECTED").length;
  return { pending, approved, rejected, total: rows.length };
}

/* ---------- Dashboard (home) ---------- */
// Matches the aurora-kit `Kpi` shape so KpiRow/KPICard render directly.
// HONEST EMPTY STATES: `value`/`delta` are `null` when the backend genuinely has
// no datum (never coerced to 0). `spark` is an EMPTY array when there is no real
// series (never a fabricated flat line). `hasValue`/`hasPrior` let the card tell a
// real measured 0 apart from an absent metric, and suppress the delta pill when
// there is no prior period to compare against. A literal numeric 0 with
// hasValue=true is a real measured value and must render as "0", not as empty.
export type DashKpi = {
  id: string; label: string; value: number | null; icon: string; spark: number[];
  delta: number | null; hasValue: boolean; hasPrior: boolean;
  good?: boolean; ai?: boolean; prefix?: string; suffix?: string;
};
export async function getDashboardKpis(): Promise<DashKpi[]> {
  const d = await getPlatformOverview();
  // A present, finite number = a real value (including a real measured 0).
  // null/undefined/NaN = absent -> render an honest em-dash empty, not 0.
  const num = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const mk = (
    id: string, label: string, icon: string, value: unknown, change: unknown, spark: unknown,
    opts: Partial<DashKpi> = {},
  ): DashKpi => {
    const v = num(value);
    const delta = num(change);
    // Only a real, non-empty series becomes a sparkline; otherwise stay empty so
    // the card draws no fabricated flat zero-line.
    const series = Array.isArray(spark)
      ? (spark.map(num).filter((n): n is number => n !== null))
      : [];
    return {
      id, label, icon,
      value: v,
      hasValue: v !== null,
      delta,
      hasPrior: delta !== null,        // backend omits *Change entirely when no prior period
      spark: series,
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
    mk("cost", "Cost per hire", "card", d.costPerHire, d.costPerHireChange, d.costPerHireSparkline, { prefix: "₹", good: false }),
  ];
}

/* ---------- Platform unified-overview (typed accessor for the home) ---------- */
// One typed read of GET /platform/unified-overview. Every field passes through
// EXACTLY what the backend returned: real counts stay numbers (including a real
// measured 0), not-yet-available metrics stay `null`, period deltas are
// `undefined` when the backend omitted them (no prior period), and sparkline
// series are `[]` when there is genuinely no history. NO fabricated fallbacks.
//
// Backend (api-gateway/src/routes/platform.ts) contract this mirrors:
//   counts (always real): openRequisitions, totalRequisitions, activeCandidates,
//     totalCandidates, hiredApplications, aiDecisionsToday, totalAgentRuns
//   derived (number | null): avgTimeToHire, offerAcceptRate, offersAccepted,
//     offersExtended, costPerHire
//   honest-null (not yet computed): complianceScore, diversityScore
//   sparklines: activeCandidatesSparkline (number[]), weeklyInflow ({label,n}[]),
//     spendSparkline ({label,cost}[]), aiSpendSparkline (number[])
//   deltas (present ONLY with a real prior period): activeCandidatesChange,
//     aiSpendChange
// NOTE: the backend currently emits NO *Change/*Sparkline for reqs / time-to-hire
//   / offer-accept / ai-decisions / compliance / diversity / cost-per-hire, so
//   those read back as undefined here and the card stays on an honest empty pill.
export type WeeklyInflowPoint = { label: string; n: number };
export type SpendDayPoint = { label: string; cost: number };
export type PlatformOverview = {
  // Real counts (a 0 here is a genuine measured 0)
  openRequisitions: number | null;
  totalRequisitions: number | null;
  activeCandidates: number | null;
  totalCandidates: number | null;
  hiredApplications: number | null;
  aiDecisionsToday: number | null;
  totalAgentRuns: number | null;
  // Real derived metrics (null = no data yet)
  avgTimeToHire: number | null;
  offerAcceptRate: number | null;
  offersAccepted: number | null;
  offersExtended: number | null;
  costPerHire: number | null;
  // Honest-null until a real source exists
  complianceScore: number | null;
  diversityScore: number | null;
  // Real series ([] = no history; never fabricated)
  activeCandidatesSparkline: number[];
  weeklyInflow: WeeklyInflowPoint[];
  spendSparkline: SpendDayPoint[];
  aiSpendSparkline: number[];
  // Real period deltas (undefined = backend had no prior period -> suppress pill).
  // These mirror the KPI ids consumed by getDashboardKpis.
  openRequisitionsChange?: number;
  activeCandidatesChange?: number;
  avgTimeToHireChange?: number;
  offerAcceptRateChange?: number;
  aiDecisionsTodayChange?: number;
  complianceScoreChange?: number;
  diversityScoreChange?: number;
  costPerHireChange?: number;
  aiSpendChange?: number;
  // Per-KPI sparkline aliases the card row reads (only activeCandidates is real today)
  openRequisitionsSparkline?: number[];
  avgTimeToHireSparkline?: number[];
  offerAcceptRateSparkline?: number[];
  aiDecisionsTodaySparkline?: number[];
  complianceScoreSparkline?: number[];
  diversityScoreSparkline?: number[];
  costPerHireSparkline?: number[];
  // Funnel + reserved-for-future (kept for backward compatibility)
  pipelineData: Array<{ name: string; value: number }> | null;
  timeSeriesData: unknown | null;
  diversityData: unknown | null;
  _partialErrors?: { job: boolean; candidate: boolean; billing: boolean };
};
export async function getPlatformOverview(): Promise<PlatformOverview> {
  const res: any = await raw("GET", "/platform/unified-overview").catch(() => ({}));
  const d = res?.data ?? res ?? {};
  // Pass through a finite number as-is (preserving a real 0); anything absent or
  // non-numeric becomes null. NEVER substitute 0 for an absent value.
  const num = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  // A real delta only if the backend actually sent a finite number for it.
  const delta = (v: unknown): number | undefined => {
    if (v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const series = (v: unknown): number[] =>
    Array.isArray(v) ? v.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
  const weeklyInflow: WeeklyInflowPoint[] = Array.isArray(d.weeklyInflow)
    ? d.weeklyInflow.map((w: any) => ({ label: String(w?.label ?? ""), n: Number(w?.n ?? 0) }))
    : [];
  const spendSparkline: SpendDayPoint[] = Array.isArray(d.spendSparkline)
    ? d.spendSparkline.map((s: any) => ({ label: String(s?.label ?? ""), cost: Number(s?.cost ?? 0) }))
    : [];
  // The active-candidates momentum spark is the real weekly-inflow series; expose
  // it both as the bare array the backend already sends and via the KPI alias.
  const activeCandidatesSparkline = series(d.activeCandidatesSparkline).length
    ? series(d.activeCandidatesSparkline)
    : weeklyInflow.map((w) => w.n);
  return {
    openRequisitions: num(d.openRequisitions),
    totalRequisitions: num(d.totalRequisitions),
    activeCandidates: num(d.activeCandidates),
    totalCandidates: num(d.totalCandidates),
    hiredApplications: num(d.hiredApplications),
    aiDecisionsToday: num(d.aiDecisionsToday),
    totalAgentRuns: num(d.totalAgentRuns),
    avgTimeToHire: num(d.avgTimeToHire),
    offerAcceptRate: num(d.offerAcceptRate),
    offersAccepted: num(d.offersAccepted),
    offersExtended: num(d.offersExtended),
    costPerHire: num(d.costPerHire),
    complianceScore: num(d.complianceScore),
    diversityScore: num(d.diversityScore),
    activeCandidatesSparkline,
    weeklyInflow,
    spendSparkline,
    aiSpendSparkline: series(d.aiSpendSparkline),
    // Deltas: only present when the backend actually emitted them.
    openRequisitionsChange: delta(d.openRequisitionsChange),
    activeCandidatesChange: delta(d.activeCandidatesChange),
    avgTimeToHireChange: delta(d.avgTimeToHireChange),
    offerAcceptRateChange: delta(d.offerAcceptRateChange),
    aiDecisionsTodayChange: delta(d.aiDecisionsTodayChange),
    complianceScoreChange: delta(d.complianceScoreChange),
    diversityScoreChange: delta(d.diversityScoreChange),
    costPerHireChange: delta(d.costPerHireChange),
    aiSpendChange: delta(d.aiSpendChange),
    // Per-KPI sparkline aliases: only feed the card a series when one is real.
    openRequisitionsSparkline: series(d.openRequisitionsSparkline),
    avgTimeToHireSparkline: series(d.avgTimeToHireSparkline),
    offerAcceptRateSparkline: series(d.offerAcceptRateSparkline),
    aiDecisionsTodaySparkline: series(d.aiDecisionsTodaySparkline),
    complianceScoreSparkline: series(d.complianceScoreSparkline),
    diversityScoreSparkline: series(d.diversityScoreSparkline),
    costPerHireSparkline: series(d.costPerHireSparkline),
    pipelineData: Array.isArray(d.pipelineData)
      ? d.pipelineData.map((p: any) => ({ name: String(p?.name ?? ""), value: Number(p?.value ?? 0) }))
      : null,
    timeSeriesData: d.timeSeriesData ?? null,
    diversityData: d.diversityData ?? null,
    _partialErrors: d._partialErrors,
  } as PlatformOverview;
}
