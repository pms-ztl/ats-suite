import type { PaginationParams, PaginatedResponse, ProxyDetectRequest, ProxyDetectResponse, AdverseImpactRequest, AdverseImpactResult, HumanReviewSubmission, EvidencePackRequest, BiasAuditRequest, ExplainabilityRequest, ScreeningRequest, SchedulingRequest, OfferRequest, Screening, ListScreeningsParams } from "@/types/api";

const USE_MOCKS = false;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Primary store: AuthProvider in lib/auth-context.tsx writes to sessionStorage
  // under "ats-access-token". Fallback to legacy cookie "ats-token" for backward
  // compatibility (older sessions / SSR-set cookie).
  try {
    const fromSession = window.sessionStorage?.getItem('ats-access-token');
    if (fromSession) return fromSession;
  } catch { /* sessionStorage may be blocked */ }
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

async function request<T>(method: string, path: string, body?: unknown, params?: PaginationParams): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

function get<T>(path: string, params?: PaginationParams): Promise<T> {
  return request<T>("GET", path, undefined, params);
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PUT", path, body);
}

function del<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

// Platform Core Engine
// Wired client — ONLY the namespaces the app actually calls (through lib/api.ts):
// platform, candidates, interviews, screening, decisions. Every other namespace
// that used to live here was unreachable scaffolding (no UI importer) and, for the
// compliance/bias/security/ai paths, had no backend route at all — it has moved to
// ./api-client.unimplemented.ts. See that file's header. Recover via git if needed.
export const api = {
  platform: {
    health: () => get<any>("/platform/health"),
    // requisition one-liners kept for mock routing; prefer api.requisitions for real calls
    getRequisitions: (params?: PaginationParams) => get<any>("/requisitions", params),
    createRequisition: (data: any) => post<any>("/requisitions", data),
    // Phase 2, AI job-description autogen (title -> description + requirements + bias audit)
    generateJd: (data: any) => post<any>("/jd-author", data),
    getRequisition: (id: string) => get<any>(`/requisitions/${id}`),
    updateRequisition: (id: string, data: any) => put<any>(`/requisitions/${id}`, data),
    archiveRequisition: (id: string) => del<any>(`/requisitions/${id}`),
    getSnapshots: (id: string) => get<any>(`/requisitions/${id}/snapshots`),
    orchestrate: (id: string) => post<any>(`/requisitions/${id}/orchestrate`),
    getOrchestrationStatus: (id: string) => get<any>(`/requisitions/${id}/status`),
    detectDuplicates: () => get<any>("/requisitions/duplicates"),
    consolidateDuplicates: (id: string) => post<any>(`/requisitions/${id}/consolidate`),
    getTenants: () => get<any>("/tenants"),
    createTenant: (data: any) => post<any>("/tenants", data),
    getTenant: (id: string) => get<any>(`/tenants/${id}`),
    updateTenantIsolation: (id: string, data: any) => put<any>(`/tenants/${id}/isolation`, data),
    getSkillsOntology: () => get<any>("/skills/ontology"),
    updateSkillsOntology: (data: any) => post<any>("/skills/ontology", data),
    searchSkills: (q: string) => get<any>(`/skills/ontology/search?q=${q}`),
    automatedIntake: (id: string, data: any) => post<any>(`/requisitions/${id}/intake`, data),
    getLocalization: () => get<any>("/platform/localization"),
    translate: (data: any) => post<any>("/platform/localization/translate", data),
  },
  candidates: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listCandidates(params?: { page?: number; pageSize?: number; search?: string; source?: string }) {
      const token = getToken();
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.search) qs.set("search", params.search);
      if (params?.source) qs.set("source", params.source);
      const res = await fetch(`${API_BASE}/candidates?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list candidates");
      return res.json();
    },
    async getCandidate(id: string) {
      const res = await fetch(`${API_BASE}/candidates/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get candidate");
      return res.json();
    },
    async getCandidateApplications(id: string) {
      const res = await fetch(`${API_BASE}/candidates/${id}/applications`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get candidate applications");
      return res.json();
    },
    async createCandidate(data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      location?: string;
      source?: string;
      resumeUrl?: string;
      linkedinUrl?: string;
      tags?: string[];
      requisitionId?: string;
    }) {
      const res = await fetch(`${API_BASE}/candidates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create candidate");
      return res.json();
    },
    async updateCandidate(id: string, data: Record<string, unknown>) {
      const res = await fetch(`${API_BASE}/candidates/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update candidate");
      return res.json();
    },
    async deleteCandidate(id: string) {
      const res = await fetch(`${API_BASE}/candidates/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to delete candidate");
      // 204 No Content, return nothing
      return;
    },
    async advanceCandidateStage(id: string, stage: string, applicationId?: string) {
      const res = await fetch(`${API_BASE}/candidates/${id}/stage`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify({ stage, ...(applicationId ? { applicationId } : {}) }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to advance candidate stage");
      return res.json();
    },
    // ── Legacy aliases (kept for backward compatibility) ────────────────────
    list: (params?: PaginationParams) => get<any>("/candidates", params),
    create: (data: any) => post<any>("/candidates", data),
    get: (id: string) => get<any>(`/candidates/${id}`),
    update: (id: string, data: any) => put<any>(`/candidates/${id}`, data),
    chat: (data: any) => post<any>("/candidates/concierge/chat", data),
    getChatHistory: (candidateId: string) => get<any>(`/candidates/concierge/history/${candidateId}`),
    multilingualChat: (data: any) => post<any>("/candidates/concierge/multilingual", data),
    getStatus: (id: string) => get<any>(`/candidates/${id}/status`),
    getTimeline: (id: string) => get<any>(`/candidates/${id}/timeline`),
    apply: (id: string, data: any) => post<any>(`/candidates/${id}/apply`, data),
    conversationalApply: (id: string, data: any) => post<any>(`/candidates/${id}/apply/conversational`, data),
    getAIPassport: (id: string) => get<any>(`/candidates/${id}/ai-passport`),
    getAITransparency: (id: string) => get<any>(`/candidates/${id}/ai-transparency`),
    submitAppeal: (id: string, data: any) => post<any>(`/candidates/${id}/appeal`, data),
    getAppeal: (id: string, appealId: string) => get<any>(`/candidates/${id}/appeal/${appealId}`),
    requestHumanReview: (id: string) => post<any>(`/candidates/${id}/appeal/human-review`),
    getExplanation: (id: string) => get<any>(`/candidates/${id}/explanation`),
    getRejectionReport: (id: string) => get<any>(`/candidates/${id}/rejection-report`),
    getRightsPortal: (id: string) => get<any>(`/candidates/${id}/rights-portal`),
    getDataAccess: (id: string) => get<any>(`/candidates/${id}/data-access`),
    submitDataCorrection: (id: string, data: any) => post<any>(`/candidates/${id}/data-correction`, data),
    exportData: (id: string) => get<any>(`/candidates/${id}/data-export`),
    submitFeedback: (id: string, data: any) => post<any>(`/candidates/${id}/feedback`, data),
    getInterviewTransparency: (id: string) => get<any>(`/candidates/${id}/transparency/interview`),
    sendCommunication: (id: string, data: any) => post<any>(`/candidates/${id}/communication/send`, data),
    getCommunicationHistory: (id: string) => get<any>(`/candidates/${id}/communication/history`),
    multiChannelCommunication: (id: string, data: any) => post<any>(`/candidates/${id}/communication/multi-channel`, data),
    notifyRequisitionClosed: (data: any) => post<any>("/candidates/notifications/requisition-closed", data),
    submitRightToReply: (id: string, data: any) => post<any>(`/candidates/${id}/right-to-reply`, data),
    getSchedulingPreferences: (id: string) => get<any>(`/candidates/${id}/scheduling/preferences`),
    updateSchedulingPreferences: (id: string, data: any) => put<any>(`/candidates/${id}/scheduling/preferences`, data),
    requestDataExport: (id: string) => post<any>(`/candidates/${id}/data-export`, {}),
    requestDataCorrection: (id: string, data: unknown) => post<any>(`/candidates/${id}/data-correction`, data),
  },
  interviews: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listInterviews(params?: { page?: number; pageSize?: number; applicationId?: string; status?: string; type?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.applicationId) qs.set("applicationId", params.applicationId);
      if (params?.status) qs.set("status", params.status);
      if (params?.type) qs.set("type", params.type);
      const res = await fetch(`${API_BASE}/interviews?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list interviews");
      return res.json();
    },
    async getInterview(id: string) {
      const res = await fetch(`${API_BASE}/interviews/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get interview");
      return res.json();
    },
    async createInterview(data: {
      applicationId: string;
      scheduledAt: string;
      durationMinutes?: number;
      type: string;
      interviewerIds?: string[];
      meetingLink?: string;
      notes?: string;
    }) {
      const res = await fetch(`${API_BASE}/interviews`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create interview");
      return res.json();
    },
    async updateInterview(id: string, data: {
      scheduledAt?: string;
      durationMinutes?: number;
      type?: string;
      status?: string;
      interviewerIds?: string[];
      meetingLink?: string;
      notes?: string;
    }) {
      const res = await fetch(`${API_BASE}/interviews/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update interview");
      return res.json();
    },
    async deleteInterview(id: string) {
      const res = await fetch(`${API_BASE}/interviews/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to delete interview");
      return res.json();
    },
    async submitFeedback(id: string, data: {
      interviewerId: string;
      rating: number;
      strengths: string[];
      concerns: string[];
      recommendation: string;
      notes?: string;
    }) {
      const res = await fetch(`${API_BASE}/interviews/${id}/feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to submit feedback");
      return res.json();
    },
    async cancelInterview(id: string) {
      const res = await fetch(`${API_BASE}/interviews/${id}/cancel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to cancel interview");
      return res.json();
    },
    // ── Panel assignment ────────────────────────────────────────────────────
    async getInterviewPanel(id: string) {
      const res = await fetch(`${API_BASE}/interviews/${id}/panel`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to load panel");
      return res.json();
    },
    async addPanelMember(id: string, data: { userId: string; role?: string; isRequired?: boolean }) {
      const res = await fetch(`${API_BASE}/interviews/${id}/panel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to add panel member");
      return res.json();
    },
    async removePanelMember(id: string, userId: string) {
      const res = await fetch(`${API_BASE}/interviews/${id}/panel/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to remove panel member");
      return res.json();
    },
    // Minimal tenant roster for the panel picker (scheduler-accessible).
    async listAssignableUsers() {
      const res = await fetch(`${API_BASE}/users/assignable`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to load assignable users");
      return res.json();
    },
    // ── Legacy mock-only helpers ─────────────────────────────────────────────
    list: (params?: PaginationParams) => get<any>("/interviews", params),
    create: (data: any) => post<any>("/interviews", data),
    get: (id: string) => get<any>(`/interviews/${id}`),
    update: (id: string, data: any) => put<any>(`/interviews/${id}`, data),
    generateStructured: (data: any) => post<any>("/interviews/structured/generate", data),
    getGuide: (id: string) => get<any>(`/interviews/${id}/guide`),
    submitDebrief: (id: string, data: any) => post<any>(`/interviews/${id}/debrief`, data),
    getDebriefSummary: (id: string) => get<any>(`/interviews/${id}/debrief/summary`),
    captureSignals: (id: string, data: any) => post<any>(`/interviews/${id}/signals/capture`, data),
    getSignalsSummary: (id: string) => get<any>(`/interviews/${id}/signals/summary`),
    captureBehavioral: (id: string, data: any) => post<any>(`/interviews/${id}/signals/behavioral`, data),
    getScorecard: (id: string) => get<any>(`/interviews/${id}/scorecard`),
    submitScorecard: (id: string, data: any) => post<any>(`/interviews/${id}/scorecard`, data),
    autoCoordinatePanel: (data: any) => post<any>("/interviews/panel/auto-coordinate", data),
    getPanel: (reqId: string) => get<any>(`/interviews/panel/${reqId}`),
    assemblePanel: (data: any) => post<any>("/interviews/panel/assemble", data),
    generatePack: (data: any) => post<any>("/interviews/pack/generate", data),
    extractTranscript: (data: any) => post<any>("/interviews/transcript/extract", data),
    transcribeRecording: (data: any) => post<any>("/interviews/recording/transcribe", data),
    getTranscript: (id: string) => get<any>(`/interviews/${id}/transcript`),
    getDebrief: (id: string) => get<any>(`/interviews/${id}/debrief/summary`),
  },
  screening: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listScreenings(params?: { page?: number; pageSize?: number; applicationId?: string; status?: string; result?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.applicationId) qs.set("applicationId", params.applicationId);
      if (params?.status) qs.set("status", params.status);
      if (params?.result) qs.set("result", params.result);
      const res = await fetch(`${API_BASE}/screening?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list screenings");
      return res.json();
    },
    async getScreening(id: string) {
      const res = await fetch(`${API_BASE}/screening/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get screening");
      return res.json();
    },
    async getScreeningResult(id: string) {
      const res = await fetch(`${API_BASE}/screening/${id}/result`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get screening result");
      return res.json();
    },
    async createScreening(data: { applicationId: string; type: string; passThreshold?: number; questions?: any[] }) {
      const res = await fetch(`${API_BASE}/screening`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create screening");
      return res.json();
    },
    async startScreening(id: string) {
      const res = await fetch(`${API_BASE}/screening/${id}/start`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to start screening");
      return res.json();
    },
    async completeScreening(id: string, data: { score: number; answers?: any[]; result?: string }) {
      const res = await fetch(`${API_BASE}/screening/${id}/complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to complete screening");
      return res.json();
    },
    async addAssessmentResult(id: string, data: { assessmentType: string; score: number; maxScore: number; percentile?: number }) {
      const res = await fetch(`${API_BASE}/screening/${id}/assessment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to add assessment result");
      return res.json();
    },
    // ── Legacy mock-only helpers ─────────────────────────────────────────────
    intake: (data: ScreeningRequest) => post<any>("/screening/intake", data),
    evaluateTechnical: (data: any) => post<any>("/screening/evaluate/technical", data),
    skillsFirstMatch: (data: any) => post<any>("/screening/match/skills-first", data),
    blindApply: (data: any) => post<any>("/screening/blind/apply", data),
    anonymize: (data: any) => post<any>("/screening/anonymize", data),
    rankBySkills: (data: any) => post<any>("/screening/rank/skills-only", data),
    enforceRubric: (data: any) => post<any>("/screening/rubric/enforce", data),
    redactDemographicProxy: (data: any) => post<any>("/screening/redact/demographic-proxy", data),
    generateScorecard: (data: any) => post<any>("/screening/scorecard/generate", data),
    automateBlindScreening: (data: any) => post<any>("/screening/blind/automate", data),
    structuredBlindReview: (data: any) => post<any>("/screening/blind/structured-review", data),
    semanticMatch: (data: any) => post<any>("/screening/match/semantic", data),
    autonomousScreen: (data: any) => post<any>("/screening/autonomous-screen", data),
    orchestrateBackgroundCheck: (data: any) => post<any>("/screening/background-check/orchestrate", data),
    getBackgroundCheck: (id: string) => get<any>(`/screening/background-check/${id}`),
  },
  decisions: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listDecisions(params?: { page?: number; pageSize?: number; status?: string; requisitionId?: string; candidateId?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.status) qs.set("status", params.status);
      if (params?.requisitionId) qs.set("requisitionId", params.requisitionId);
      if (params?.candidateId) qs.set("candidateId", params.candidateId);
      const res = await fetch(`${API_BASE}/decisions?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list decisions");
      return res.json();
    },
    async getHiringDecision(id: string) {
      const res = await fetch(`${API_BASE}/decisions/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get decision");
      return res.json();
    },
    async createDecision(data: { requisitionId: string; candidateId: string; decisionType: string; recommendation: string; confidence?: number; rationale?: Record<string, unknown>; panelConsensus?: Record<string, unknown> }) {
      const res = await fetch(`${API_BASE}/decisions`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create decision");
      return res.json();
    },
    async updateDecision(id: string, data: Record<string, unknown>) {
      const res = await fetch(`${API_BASE}/decisions/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update decision");
      return res.json();
    },
    async getDecisionsByRequisition(reqId: string) {
      const res = await fetch(`${API_BASE}/decisions/requisition/${reqId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get decisions for requisition");
      return res.json();
    },
    // ── Legacy helpers ───────────────────────────────────────────────────────
    finalReview: (data: any) => post<any>("/decisions/final-review", data),
    synthesize: (data: any) => post<any>("/decisions/synthesize", data),
    getDecision: (id: string) => get<any>(`/decisions/${id}`),
    getConsensus: (reqId: string) => get<any>(`/decisions/${reqId}/consensus`),
    buildConsensus: (reqId: string, data: any) => post<any>(`/decisions/${reqId}/consensus/build`, data),
    getComparison: (reqId: string) => get<any>(`/decisions/${reqId}/comparison`),
    getCopilotInsights: (data: any) => post<any>("/decisions/copilot/insights", data),
    orchestrateReferenceCheck: (data: any) => post<any>("/decisions/reference-check/orchestrate", data),
    getReferenceCheck: (id: string) => get<any>(`/decisions/reference-check/${id}`),
    offerPreboardingOrchestration: () => request<any>('GET', '/decisions/offer-and-preboarding-orchestration-agent'),
    decisionCard: () => request<any>('GET', '/decisions/decision-card-with-uncertainty-and-evidence-gaps'),
    consensusDetector: () => request<any>('GET', '/decisions/consensus-and-disagreement-detector'),
    offerAcceptanceRiskForecast: () => request<any>('GET', '/decisions/offer-acceptance-and-drop-off-risk-forecaster'),
    decisionSupportAgent: () => request<any>('GET', '/decisions/decision-support-agent-core-feature'),
    offerOptimizationAgent: () => request<any>('GET', '/decisions/offer-optimization-agent-premium-differentiator'),
    decisionRoomAgent: () => request<any>('GET', '/decisions/decision-room-agent'),
    compensationRationale: () => request<any>('GET', '/decisions/usp-automated-compensation-rationale'),
    referenceCheckSynthesizer: () => request<any>('GET', '/decisions/usp-reference-check-synthesizer'),
    offerApprovalChaser: () => request<any>('GET', '/decisions/usp-automated-offer-approval-chaser'),
    transparentCompensationMatcher: () => request<any>('GET', '/decisions/transparent-compensation-matcher'),
    offerNegotiationStrategist: () => request<any>('GET', '/decisions/intelligent-offer-negotiation-strategist'),
    negotiationPreferenceAgent: () => request<any>('GET', '/decisions/negotiation-preference-agent'),
    dynamicSalaryRange: () => request<any>('GET', '/decisions/dynamic-salary-range-recommendations-based-on-market-data'),
    offerNegotiationWinProbability: () => request<any>('GET', '/decisions/intelligent-offer-negotiation-support-with-win-probability'),
    offerDeclineRisk: () => request<any>('GET', '/decisions/predictive-offer-decline-risk-with-intervention-triggers'),
    managerConsistencyChecker: () => request<any>('GET', '/decisions/manager-decision-consistency-checker'),
    calibrationCopilot: () => request<any>('GET', '/decisions/hiring-manager-calibration-co-pilot'),
    offerExpectationAssistant: () => request<any>('GET', '/decisions/offer-expectation-negotiation-assistant'),
    decisionBriefingGenerator: () => request<any>('GET', '/decisions/hiring-decision-briefing-generator'),
    offerApprovalPrediction: () => request<any>('GET', '/decisions/offer-approval-workflow-prediction'),
    offerDeclinationModeling: () => request<any>('GET', '/decisions/predictive-offer-declination-modeling'),
    compensationMarketAgent: () => request<any>('GET', '/decisions/compensation-market-agent'),
    marketViabilityCalibrator: () => request<any>('GET', '/decisions/dynamic-market-viability-compensation-calibrator'),
    offerAcceptanceModeler: () => request<any>('GET', '/decisions/predictive-offer-acceptance-modeler'),
    equityTotalRewardsSimulator: () => request<any>('GET', '/decisions/equity-total-rewards-customization-simulator'),
    offerClauseAdaptation: () => request<any>('GET', '/decisions/offer-clause-adaptation-engine'),
    offerCounterSimulator: () => request<any>('GET', '/decisions/real-time-offer-counter-scenario-simulator'),
    offerPackagePersonalization: () => request<any>('GET', '/decisions/offer-package-personalization-engine'),
    offerToStartRetention: () => request<any>('GET', '/decisions/offer-to-start-retention-agent'),
    offerOutcomeSimulation: () => request<any>('GET', '/decisions/offer-outcome-simulation-engine'),
    adaptiveNegotiationAgents: () => request<any>('GET', '/decisions/adaptive-offer-management-negotiation-agents'),
    autonomousOfferManagement: () => request<any>('GET', '/decisions/autonomous-offer-management-negotiation'),
    legalClauseNegotiation: () => request<any>('GET', '/decisions/legal-clause-negotiation-agent'),
    offerRevocationRisk: () => request<any>('GET', '/decisions/autonomous-offer-revocation-risk-engine'),
    autonomousNegotiatorCloser: () => request<any>('GET', '/decisions/autonomous-offer-negotiator-closer'),
    a2aSalaryNegotiator: () => request<any>('GET', '/decisions/agent-to-agent-a2a-salary-negotiator'),
    get: (id: string) => get<any>(`/decisions/${id}`),
  },
};
