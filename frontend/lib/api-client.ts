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
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? err.message ?? 'Login failed');
      }
      const data = await response.json();
      return data.data; // unwrap { data: { token, refreshToken, expiresAt, user } }
    },
    logout: async () => {
      document.cookie = 'ats-token=; Max-Age=0; path=/';
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      }).catch(() => { /* best-effort — clear cookie regardless */ });
    },
    getMe: async () => {
      const token = getToken();
      const response = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? err.message ?? 'Failed to fetch current user');
      }
      const data = await response.json();
      return data.data;
    },
    refreshToken: async (token: string) => {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: token }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message ?? err.message ?? 'Token refresh failed');
      }
      const data = await response.json();
      return data.data;
    },
  },
  platform: {
    health: () => get<any>("/platform/health"),
    // requisition one-liners kept for mock routing; prefer api.requisitions for real calls
    getRequisitions: (params?: PaginationParams) => get<any>("/requisitions", params),
    createRequisition: (data: any) => post<any>("/requisitions", data),
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

  // ── Requisitions ─────────────────────────────────────────────────────────────
  // These methods are the canonical interface for requisition CRUD. When
  // USE_MOCKS is true they delegate to the existing mock infrastructure; when
  // false they hit the real backend directly with proper query strings,
  // Authorization header, and response-envelope unwrapping.
  requisitions: {
    async listRequisitions(params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      department?: string;
    }) {
      const token = getToken();
      const qs = new URLSearchParams();
      if (params?.page !== undefined) qs.set("page", String(params.page));
      if (params?.pageSize !== undefined) qs.set("pageSize", String(params.pageSize));
      if (params?.search) qs.set("search", params.search);
      if (params?.status) qs.set("status", params.status);
      if (params?.department) qs.set("department", params.department);
      const res = await fetch(`${API_BASE}/requisitions?${qs}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to fetch requisitions");
      // { data: Requisition[], meta: { total, page, pageSize, totalPages } }
      return res.json();
    },

    async getRequisition(id: string) {
      const token = getToken();
      const res = await fetch(`${API_BASE}/requisitions/${id}`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to fetch requisition");
      const json = await res.json();
      return json.data; // unwrap { data: Requisition }
    },

    async createRequisition(data: Record<string, unknown>) {
      const token = getToken();
      const res = await fetch(`${API_BASE}/requisitions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create requisition");
      const json = await res.json();
      return json.data; // unwrap { data: Requisition }
    },

    async updateRequisition(id: string, data: Record<string, unknown>) {
      const token = getToken();
      const res = await fetch(`${API_BASE}/requisitions/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update requisition");
      const json = await res.json();
      return json.data; // unwrap { data: Requisition }
    },

    async deleteRequisition(id: string) {
      const token = getToken();
      const res = await fetch(`${API_BASE}/requisitions/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (res.status === 204) return; // soft delete — no content
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to delete requisition");
    },

    async closeRequisition(id: string) {
      const token = getToken();
      const res = await fetch(`${API_BASE}/requisitions/${id}/close`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to close requisition");
      const json = await res.json();
      return json.data; // unwrap { data: Requisition }
    },

    async approveRequisition(id: string) {
      const token = getToken();
      const res = await fetch(`${API_BASE}/requisitions/${id}/approve`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to approve requisition");
      const json = await res.json();
      return json.data; // unwrap { data: Requisition }
    },
  },
  security: {
    validateToolRoute: (data: any) => post<any>("/security/tool-router/validate", data),
    // Backend route is /security/secure-tool-router/audit (not /tool-router/audit)
    getToolAudit: (params?: PaginationParams) => get<any>("/security/secure-tool-router/audit", params),
    recordConsent: (data: any) => post<any>("/security/consent", data),
    getConsent: (candidateId: string) => get<any>(`/security/consent/${candidateId}`),
    updateConsent: (candidateId: string, data: any) => put<any>(`/security/consent/${candidateId}`, data),
    revokeConsent: (candidateId: string) => del<any>(`/security/consent/${candidateId}`),
    getConsentHistory: (candidateId: string) => get<any>(`/security/consent/${candidateId}/history`),
    getDataResidencyConfig: () => get<any>("/security/data-residency/config"),
    updateDataResidency: (data: any) => put<any>("/security/data-residency/config", data),
    routeData: (data: any) => post<any>("/security/data-residency/route", data),
    getDataResidencyAudit: () => get<any>("/security/data-residency/audit"),
    listVault: () => get<any>("/security/vault"),
    storeInVault: (data: any) => post<any>("/security/vault", data),
    getFromVault: (id: string) => get<any>(`/security/vault/${id}`),
    purgeVault: (id: string) => del<any>(`/security/vault/${id}`),
    evaluateRetention: (data: any) => post<any>("/security/retention/evaluate", data),
    executePurge: (data: any) => post<any>("/security/retention/purge", data),
    getRetentionSchedule: () => get<any>("/security/retention/schedule"),
    updateRetentionSchedule: (data: any) => put<any>("/security/retention/schedule", data),
    getAccessConfig: () => get<any>("/security/access/config"),
    requestJitReview: (data: any) => post<any>("/security/access/jit-review", data),
    getAccessAudit: () => get<any>("/security/access/audit"),
    updateRoles: (data: any) => put<any>("/security/access/roles", data),
    scanPromptInjection: (data: any) => post<any>("/security/prompt-firewall/scan", data),
    getPromptFirewallLog: () => get<any>("/security/prompt-firewall/log"),
    updateFirewallRules: (data: any) => put<any>("/security/prompt-firewall/rules", data),
    // /security/zero-trust/* not implemented on backend yet — fall back to
    // the access/config endpoint which returns a similar shape (enforcement
    // mode, policy version) so the page doesn't show empty cards.
    getZeroTrustStatus: () => get<any>("/security/access/config"),
    verifyZeroTrust: (data: any) => post<any>("/security/access/jit-review", data),
    requestErasure: (data: any) => post<any>("/security/erasure/request", data),
    getErasureStatus: (id: string) => get<any>(`/security/erasure/${id}`),
    executeErasure: (id: string) => post<any>(`/security/erasure/${id}/execute`),
    maskPII: (data: any) => post<any>("/security/pii/mask", data),
    redactPII: (data: any) => post<any>("/security/pii/redact", data),
    getDataMinimizationConfig: () => get<any>("/security/data-minimization/config"),
    evaluateDataMinimization: (data: any) => post<any>("/security/data-minimization/evaluate", data),
    submitDSAR: (data: any) => post<any>("/security/dsar", data),
    getDSARStatus: (id: string) => get<any>(`/security/dsar/${id}`),
    fulfillDSAR: (id: string) => post<any>(`/security/dsar/${id}/fulfill`),
    detectFraud: (data: any) => post<any>("/security/fraud/detect", data),
    detectDeepfake: (data: any) => post<any>("/security/fraud/deepfake", data),
    getFraudLog: () => get<any>("/security/fraud/log"),
    getCredentials: (candidateId: string) => get<any>(`/security/credentials/${candidateId}`),
    uploadCredentials: (candidateId: string, data: any) => post<any>(`/security/credentials/${candidateId}`, data),
    submitDataCorrection: (data: any) => post<any>("/security/data-correction", data),
    exportCandidateData: (candidateId: string) => get<any>(`/security/data-portability/${candidateId}`),
  },
  bias: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listBiasReports(params?: { page?: number; pageSize?: number; overallRisk?: string; requisitionId?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.overallRisk) qs.set("overallRisk", params.overallRisk);
      if (params?.requisitionId) qs.set("requisitionId", params.requisitionId);
      const res = await fetch(`${API_BASE}/bias?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list bias reports");
      return res.json();
    },
    async getBiasReport(id: string) {
      const res = await fetch(`${API_BASE}/bias/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get bias report");
      return res.json();
    },
    async generateBiasReport(data: { requisitionId?: string; scope: string; dimensions: string[]; findings: Record<string, unknown>; overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; recommendations: string[] }) {
      const res = await fetch(`${API_BASE}/bias/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to generate bias report");
      return res.json();
    },
    async deleteBiasReport(id: string) {
      const res = await fetch(`${API_BASE}/bias/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok && res.status !== 204) throw new Error((await res.json()).error?.message ?? "Failed to delete bias report");
    },
    async getBiasReportsByRequisition(reqId: string) {
      const res = await fetch(`${API_BASE}/bias/requisition/${reqId}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get bias reports for requisition");
      return res.json();
    },
    // ── Legacy helpers ───────────────────────────────────────────────────────
    proxyDetect: (data: ProxyDetectRequest) => post<ProxyDetectResponse>("/bias/proxy-detect", data),
    getProxyLog: (params?: PaginationParams) => get<any>("/bias/proxy-detect/log", params),
    analyzeAdverseImpact: (data: AdverseImpactRequest) => post<AdverseImpactResult>("/bias/adverse-impact/analyze", data),
    getAdverseImpactByStage: () => get<any>("/bias/adverse-impact/by-stage"),
    getRealtimeAdverseImpact: () => get<any>("/bias/adverse-impact/realtime"),
    getFourFifthsReport: () => get<any>("/bias/adverse-impact/four-fifths"),
    checkDrift: (data: any) => post<any>("/bias/drift/check", data),
    getDriftHistory: () => get<any>("/bias/drift/history"),
    getDriftAlerts: () => get<any>("/bias/drift/alerts"),
    getFairnessMetrics: () => get<any>("/bias/fairness/metrics"),
    getFairnessByRole: () => get<any>("/bias/fairness/by-role"),
    simulateFairness: (data: any) => post<any>("/bias/fairness/simulate", data),
    getFairnessBenchmarks: () => get<any>("/bias/fairness/benchmarks"),
    setFairnessObjectives: (data: any) => put<any>("/bias/fairness/objectives", data),
    getMonitorDashboard: () => get<any>("/bias/monitor/dashboard"),
    getDiversityAnalytics: () => get<any>("/bias/monitor/diversity"),
    getIntersectionalAnalysis: () => get<any>("/bias/monitor/intersectional"),
    runAudit: (data: BiasAuditRequest) => post<any>("/bias/audit/run", data),
    getAuditResults: () => get<any>("/bias/audit/results"),
    getAuditSchedule: () => get<any>("/bias/audit/schedule"),
    scheduleAudit: (data: any) => post<any>("/bias/audit/schedule", data),
    preDeploymentTest: (data: any) => post<any>("/bias/pre-deployment/test", data),
    getPreDeploymentGate: () => get<any>("/bias/pre-deployment/gate"),
    triggerRemediation: (data: any) => post<any>("/bias/remediation/trigger", data),
    getRemediationWorkflows: () => get<any>("/bias/remediation/workflows"),
    simulateKnockoutFilter: (data: any) => post<any>("/bias/knockout-filter/simulate", data),
    scanJD: (data: any) => post<any>("/bias/jd-screener/scan", data),
    getInterviewerCalibration: (userId: string) => get<any>(`/bias/interviewer-calibration/${userId}`),
    getInterviewerDrift: () => get<any>("/bias/interviewer-calibration/drift"),
    getManagerCalibration: (userId: string) => get<any>(`/bias/manager-calibration/${userId}`),
    segregateDemographic: (data: any) => post<any>("/bias/demographic/segregate", data),
    getDiversityTracker: () => get<any>("/bias/diversity/tracker"),
    getDiversitySlate: (reqId: string) => get<any>(`/bias/diversity/slate/${reqId}`),
    generateDiverseSlate: (data: any) => post<any>("/bias/diversity/generate-slate", data),
  },
  compliance: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listDSARs(params?: { page?: number; pageSize?: number; status?: string; requestType?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.status) qs.set("status", params.status);
      if (params?.requestType) qs.set("requestType", params.requestType);
      const res = await fetch(`${API_BASE}/compliance/dsar?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list DSARs");
      return res.json();
    },
    async createDSAR(data: { candidateId: string; requestType: string; status?: string }) {
      const res = await fetch(`${API_BASE}/compliance/dsar`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create DSAR");
      return res.json();
    },
    async getDSAR(id: string) {
      const res = await fetch(`${API_BASE}/compliance/dsar/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get DSAR");
      return res.json();
    },
    async updateDSAR(id: string, data: { status?: string; responseData?: Record<string, unknown> }) {
      const res = await fetch(`${API_BASE}/compliance/dsar/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update DSAR");
      return res.json();
    },
    async listConsent(params?: { page?: number; pageSize?: number; candidateId?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.candidateId) qs.set("candidateId", params.candidateId);
      const res = await fetch(`${API_BASE}/compliance/consent?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list consent records");
      return res.json();
    },
    async recordConsent(data: { candidateId: string; consentType: string; purpose: string; granted: boolean; jurisdiction?: string; expiresAt?: string; ipAddress?: string }) {
      const res = await fetch(`${API_BASE}/compliance/consent`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to record consent");
      return res.json();
    },
    async listRetentionPolicies(includeInactive?: boolean) {
      const qs = includeInactive ? "?includeInactive=true" : "";
      const res = await fetch(`${API_BASE}/compliance/retention${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list retention policies");
      return res.json();
    },
    async upsertRetentionPolicy(data: { dataType: string; retentionDays: number; jurisdiction?: string; autoDelete?: boolean }) {
      const res = await fetch(`${API_BASE}/compliance/retention`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to upsert retention policy");
      return res.json();
    },
    async updateRetentionPolicy(id: string, data: { retentionDays?: number; autoDelete?: boolean; isActive?: boolean }) {
      const res = await fetch(`${API_BASE}/compliance/retention/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update retention policy");
      return res.json();
    },
    async queryAuditLog(params?: { page?: number; pageSize?: number; resourceType?: string; resourceId?: string; actorId?: string; action?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.resourceType) qs.set("resourceType", params.resourceType);
      if (params?.resourceId) qs.set("resourceId", params.resourceId);
      if (params?.actorId) qs.set("actorId", params.actorId);
      if (params?.action) qs.set("action", params.action);
      const res = await fetch(`${API_BASE}/compliance/audit-log?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to query audit log");
      return res.json();
    },
    // ── Legacy mock helpers ──────────────────────────────────────────────────
    getAuditTrail: (params?: PaginationParams) => get<any>("/compliance/audit-trail", params),
    getDecisionAudit: (decisionId: string) => get<any>(`/compliance/audit-trail/${decisionId}`),
    replayDecision: (decisionId: string) => get<any>(`/compliance/audit-trail/replay/${decisionId}`),
    getDecisionTimeline: (candidateId: string) => get<any>(`/compliance/audit-trail/timeline/${candidateId}`),
    getChainOfCustody: (id: string) => get<any>(`/compliance/audit-trail/chain-of-custody/${id}`),
    generateEvidence: (data: EvidencePackRequest) => post<any>("/compliance/evidence/generate", data),
    getEvidencePack: (packId: string) => get<any>(`/compliance/evidence/${packId}`),
    exportEvidence: (data: any) => post<any>("/compliance/evidence/export", data),
    getEvidenceVault: () => get<any>("/compliance/evidence/vault"),
    applyLegalHold: (data: any) => post<any>("/compliance/legal-hold", data),
    getActiveLegalHolds: () => get<any>("/compliance/legal-hold/active"),
    releaseLegalHold: (id: string) => del<any>(`/compliance/legal-hold/${id}`),
    getPolicies: (params?: PaginationParams) => get<any>("/compliance/policies", params),
    createPolicy: (data: any) => post<any>("/compliance/policies", data),
    updatePolicy: (id: string, data: any) => put<any>(`/compliance/policies/${id}`, data),
    evaluatePolicy: (data: any) => post<any>("/compliance/policies/evaluate", data),
    getImpactDiff: () => get<any>("/compliance/policies/impact-diff"),
    getJurisdictionRules: () => get<any>("/compliance/jurisdiction/rules"),
    updateJurisdictionRules: (data: any) => put<any>("/compliance/jurisdiction/rules", data),
    getJurisdictionByCountry: (country: string) => get<any>(`/compliance/jurisdiction/${country}`),
    adaptWorkflow: (data: any) => post<any>("/compliance/jurisdiction/adapt", data),
    getRegulationTemplates: () => get<any>("/compliance/regulations/templates"),
    checkRegulationChanges: (data: any) => post<any>("/compliance/regulations/change-alert", data),
    simulateRegulationChange: (data: any) => post<any>("/compliance/regulations/simulate", data),
    getHumanReviewQueue: (params?: PaginationParams) => get<any>("/compliance/human-review/queue", params),
    submitHumanReview: (data: HumanReviewSubmission) => post<any>("/compliance/human-review/submit", data),
    getReviewGates: () => get<any>("/compliance/human-review/gates"),
    configureReviewGates: (data: any) => put<any>("/compliance/human-review/gates", data),
    escalateReview: (data: any) => post<any>("/compliance/human-review/escalate", data),
    getOverrides: () => get<any>("/compliance/overrides"),
    recordOverride: (data: any) => post<any>("/compliance/overrides", data),
    getOverridePatterns: () => get<any>("/compliance/overrides/patterns"),
    generateEEOCReport: (data: any) => post<any>("/compliance/reports/eeoc", data),
    generateOFCCPReport: (data: any) => post<any>("/compliance/reports/ofccp", data),
    generateEEO1Report: (data: any) => post<any>("/compliance/reports/eeo1", data),
    generateEUAIActReport: (data: any) => post<any>("/compliance/reports/eu-ai-act", data),
    getAuditReadiness: () => get<any>("/compliance/reports/audit-readiness"),
    getRegulatoryReadiness: () => get<any>("/compliance/reports/regulatory-readiness"),
    customExport: (data: any) => post<any>("/compliance/reports/custom-export", data),
    generateDPIA: (data: any) => post<any>("/compliance/dpia/generate", data),
    getDPIA: (id: string) => get<any>(`/compliance/dpia/${id}`),
    exportDPIA: (data: any) => post<any>("/compliance/dpia/export", data),
    getEUAIRiskTier: () => get<any>("/compliance/eu-ai-act/risk-tier"),
    runConformityAssessment: (data: any) => post<any>("/compliance/eu-ai-act/conformity", data),
    getAnnexIII: () => get<any>("/compliance/eu-ai-act/annex-iii"),
    getNYCLL144Status: () => get<any>("/compliance/nyc-ll144/status"),
    runNYCLL144Audit: (data: any) => post<any>("/compliance/nyc-ll144/audit", data),
    getGDPRArt22: (candidateId: string) => get<any>(`/compliance/gdpr/article22/${candidateId}`),
    flagSignificantDecision: (data: any) => post<any>("/compliance/gdpr/significant-decision", data),
    generateWorksCouncilPackage: (data: any) => post<any>("/compliance/works-council/package", data),
    getWorksCouncilStatus: () => get<any>("/compliance/works-council/status"),
    getAINotices: (candidateId: string) => get<any>(`/compliance/ai-notices/${candidateId}`),
    generateAINotice: (data: any) => post<any>("/compliance/ai-notices/generate", data),
    getPayTransparency: (reqId: string) => get<any>(`/compliance/pay-transparency/${reqId}`),
    validatePayTransparency: (data: any) => post<any>("/compliance/pay-transparency/validate", data),
    requestAccommodation: (data: any) => post<any>("/compliance/accommodation/request", data),
    getAccommodation: (id: string) => get<any>(`/compliance/accommodation/${id}`),
    getAIFeatureConsent: (candidateId: string) => get<any>(`/compliance/consent/ai-features/${candidateId}`),
    updateAIFeatureConsent: (candidateId: string, data: any) => put<any>(`/compliance/consent/ai-features/${candidateId}`, data),
    optOutOfAI: (candidateId: string) => post<any>(`/compliance/opt-out/${candidateId}`),
    getOptOutStatus: (candidateId: string) => get<any>(`/compliance/opt-out/${candidateId}`),
    getCriteriaLibrary: () => get<any>("/compliance/criteria-library"),
    validateCriteria: (data: any) => post<any>("/compliance/criteria-library/validate", data),
    getRetentionArchive: () => get<any>("/compliance/retention/archive"),
    getRetentionPolicies: () => get<any>("/compliance/retention/policies"),
    updateRetentionPolicies: (data: any) => put<any>("/compliance/retention/policies", data),
    getOversightWorkbench: () => get<any>("/compliance/oversight/workbench"),
    captureJustification: (data: any) => post<any>("/compliance/justification/capture", data),
    getJustification: (decisionId: string) => get<any>(`/compliance/justification/${decisionId}`),
    checkInappropriateQuestion: (data: any) => post<any>("/compliance/inappropriate-question/check", data),
    getProhibitedQuestionRules: () => get<any>("/compliance/prohibited-questions/rules"),
  },
  ai: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listJobs(params?: { page?: number; pageSize?: number; status?: string; type?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.status) qs.set("status", params.status);
      if (params?.type) qs.set("type", params.type);
      const res = await fetch(`${API_BASE}/ai/jobs?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list AI jobs");
      return res.json();
    },
    async submitJob(data: { type: string; input: Record<string, unknown>; modelId?: string }) {
      const res = await fetch(`${API_BASE}/ai/jobs`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to submit AI job");
      return res.json();
    },
    async getJob(id: string) {
      const res = await fetch(`${API_BASE}/ai/jobs/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get AI job");
      return res.json();
    },
    async cancelJob(id: string) {
      const res = await fetch(`${API_BASE}/ai/jobs/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok && res.status !== 204) throw new Error((await res.json()).error?.message ?? "Failed to cancel AI job");
    },
    async completeJob(id: string, output: Record<string, unknown>) {
      const res = await fetch(`${API_BASE}/ai/jobs/${id}/complete`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify({ output }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to complete AI job");
      return res.json();
    },
    async listAIModels(params?: { page?: number; pageSize?: number; status?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.status) qs.set("status", params.status);
      const res = await fetch(`${API_BASE}/ai/models?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list AI models");
      return res.json();
    },
    async registerAIModel(data: { name: string; provider: string; version: string; riskTier?: string; modelCard?: Record<string, unknown>; config?: Record<string, unknown> }) {
      const res = await fetch(`${API_BASE}/ai/models`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to register AI model");
      return res.json();
    },
    async getAIModel(id: string) {
      const res = await fetch(`${API_BASE}/ai/models/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get AI model");
      return res.json();
    },
    async updateAIModelStatus(id: string, status: string, approvedBy?: string) {
      const res = await fetch(`${API_BASE}/ai/models/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify({ status, approvedBy }),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update AI model status");
      return res.json();
    },
    // ── Legacy helpers ───────────────────────────────────────────────────────
    getModels: (params?: PaginationParams) => get<any>("/ai/models", params),
    createModel: (data: any) => post<any>("/ai/models", data),
    getModel: (id: string) => get<any>(`/ai/models/${id}`),
    updateModelStatus: (id: string, data: any) => put<any>(`/ai/models/${id}/status`, data),
    getModelCard: (id: string) => get<any>(`/ai/models/${id}/card`),
    generateModelCard: (id: string) => post<any>(`/ai/models/${id}/card/generate`),
    getModelVersions: (id: string) => get<any>(`/ai/models/${id}/versions`),
    rollbackModel: (id: string) => post<any>(`/ai/models/${id}/rollback`),
    freezeModel: (id: string) => post<any>(`/ai/models/${id}/freeze`),
    shadowEval: (id: string, data: any) => post<any>(`/ai/models/${id}/shadow-eval`, data),
    getModelDrift: (id: string) => get<any>(`/ai/models/${id}/drift`),
    getDeployment: (id: string) => get<any>(`/ai/models/${id}/deployment`),
    approveDeployment: (id: string) => post<any>(`/ai/models/${id}/deployment/approve`),
    getGovernanceConsole: () => get<any>("/ai/governance/console"),
    getApprovedModels: () => get<any>("/ai/governance/approved-models"),
    updateControlPlane: (data: any) => put<any>("/ai/governance/control-plane", data),
    getChangeLog: () => get<any>("/ai/governance/change-log"),
    submitChangeRequest: (data: any) => post<any>("/ai/governance/change-request", data),
    getPrompts: () => get<any>("/ai/prompts"),
    createPrompt: (data: any) => post<any>("/ai/prompts", data),
    getPromptVersions: (id: string) => get<any>(`/ai/prompts/${id}/versions`),
    getExplanation: (decisionId: string) => get<any>(`/ai/explain/${decisionId}`),
    generateExplanation: (data: ExplainabilityRequest) => post<any>("/ai/explain/generate", data),
    getHumanReadable: (decisionId: string) => get<any>(`/ai/explain/${decisionId}/human-readable`),
    getRoleExplanation: (decisionId: string, role: string) => get<any>(`/ai/explain/${decisionId}/role/${role}`),
    getDecisionTrace: (decisionId: string) => get<any>(`/ai/explain/${decisionId}/trace`),
    getReasonCodes: (decisionId: string) => get<any>(`/ai/explain/${decisionId}/reason-codes`),
    getPromptAction: (decisionId: string) => get<any>(`/ai/explain/${decisionId}/prompt-action`),
    getChainOfThought: (decisionId: string) => get<any>(`/ai/explain/${decisionId}/chain-of-thought`),
    getDecisions: (params?: PaginationParams) => get<any>("/ai/decisions", params),
    getDecision: (id: string) => get<any>(`/ai/decisions/${id}`),
    getDecisionLedger: (id: string) => get<any>(`/ai/decisions/${id}/ledger`),
    getModelSnapshot: (id: string) => get<any>(`/ai/decisions/${id}/model-snapshot`),
    getConfidence: (decisionId: string) => get<any>(`/ai/confidence/${decisionId}`),
    getConfidenceThresholds: () => get<any>("/ai/confidence/thresholds"),
    updateConfidenceThresholds: (data: any) => put<any>("/ai/confidence/thresholds", data),
    submitOverride: (data: any) => post<any>("/ai/override", data),
    getOverrides: () => get<any>("/ai/overrides"),
    getOverride: (id: string) => get<any>(`/ai/overrides/${id}`),
    getEscalations: () => get<any>("/ai/escalations"),
    resolveEscalation: (id: string, data: any) => post<any>(`/ai/escalations/${id}/resolve`, data),
    getTransparencyDashboard: () => get<any>("/ai/transparency/dashboard"),
    getTransparencyFlow: (workflowId: string) => get<any>(`/ai/transparency/flow/${workflowId}`),
    getActionLog: () => get<any>("/ai/transparency/action-log"),
    getDisclosure: () => get<any>("/ai/transparency/disclosure"),
    getQualityMetrics: () => get<any>("/ai/quality/metrics"),
    getDataProvenance: () => get<any>("/ai/data-provenance"),
    getModelProvenance: (modelId: string) => get<any>(`/ai/data-provenance/${modelId}`),
    getTrainingConsent: () => get<any>("/ai/consent/training"),
    getCounterfactual: (candidateId: string) => post<any>(`/ai/counterfactual/${candidateId}`),
    getCopilotAssist: (data: any) => post<any>("/ai/copilot/assist", data),
    getCopilotSuggestions: (reqId: string) => get<any>(`/ai/copilot/suggestions/${reqId}`),
    processAttributeRedaction: (data: any) => post<any>("/ai/attribute-redaction/process", data),
    getHumanCheckpoints: () => get<any>("/ai/human-checkpoints"),
    updateHumanCheckpoints: (data: any) => put<any>("/ai/human-checkpoints", data),
    getHumanApprovalQueue: () => get<any>("/ai/human-approval/queue"),
    approveHumanApproval: (id: string) => post<any>(`/ai/human-approval/${id}/approve`),
    rejectHumanApproval: (id: string, data: any) => post<any>(`/ai/human-approval/${id}/reject`, data),
  },
  analytics: {
    // ── Core KPI aggregates (real-backend aware) ─────────────────────────────
    async getDashboard() {
      const res = await fetch(`${API_BASE}/analytics/dashboard`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get dashboard");
      return res.json();
    },
    async getFunnel() {
      const res = await fetch(`${API_BASE}/analytics/funnel`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get funnel");
      return res.json();
    },
    async getTimeToHire() {
      const res = await fetch(`${API_BASE}/analytics/time-to-hire`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get time-to-hire");
      return res.json();
    },
    async getSourceOfHire() {
      const res = await fetch(`${API_BASE}/analytics/source-of-hire`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get source-of-hire");
      return res.json();
    },
    async getDiversity() {
      const res = await fetch(`${API_BASE}/analytics/diversity`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get diversity metrics");
      return res.json();
    },
    async getRecruiterProductivity() {
      const res = await fetch(`${API_BASE}/analytics/recruiter-productivity`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get recruiter productivity");
      return res.json();
    },
    async exportAnalytics() {
      const res = await fetch(`${API_BASE}/analytics/export`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to export analytics");
      return res.json();
    },
    // ── Legacy helpers ───────────────────────────────────────────────────────
    getEventLedger: (params?: PaginationParams) => get<any>("/analytics/event-ledger", params),
    getEvent: (eventId: string) => get<any>(`/analytics/event-ledger/${eventId}`),
    getOrgHealthDashboard: () => get<any>("/analytics/dashboard/org-health"),
    getPipelineDashboard: () => get<any>("/analytics/dashboard/pipeline"),
    getProcessTelemetry: () => get<any>("/analytics/dashboard/process-telemetry"),
    getCrossFunctionalDashboard: () => get<any>("/analytics/dashboard/cross-functional"),
    getFairnessBenchmarks: () => get<any>("/analytics/fairness/benchmarks"),
    getCrossSystemFairness: () => get<any>("/analytics/fairness/cross-system"),
    getAdverseImpactByStage: () => get<any>("/analytics/fairness/adverse-impact-by-stage"),
    getBottlenecks: () => get<any>("/analytics/bottlenecks"),
    getVelocity: () => get<any>("/analytics/bottlenecks/velocity"),
    getRecovery: () => get<any>("/analytics/bottlenecks/recovery"),
    getRequisitionHealth: (reqId: string) => get<any>(`/analytics/requisition-health/${reqId}`),
    getPlaybooks: () => get<any>("/analytics/requisition-health/playbooks"),
    getImmutableAuditLogs: () => get<any>("/analytics/audit-logs/immutable"),
    getBiasAuditSchedule: () => get<any>("/analytics/bias-audit/schedule"),
    getOverrides: () => get<any>("/analytics/overrides"),
    sourceToOutcomeAttribution: () => request<any>('GET', '/analytics/source-to-outcome-attribution-engine'),
    sourceToOutcomeAttributionRun: (data: any) => request<any>('POST', '/analytics/source-to-outcome-attribution-engine/run', data),
    qualityOfHireOutcomeLearning: () => request<any>('GET', '/analytics/quality-of-hire-outcome-learning-loop'),
    continuousWorkflowExperimentation: () => request<any>('GET', '/analytics/continuous-workflow-experimentation-system'),
    predictiveSuccessModeling: () => request<any>('GET', '/analytics/usp-predictive-success-modeling'),
    reportingAgentNlp: (data: any) => request<any>('POST', '/analytics/usp-reporting-agent-nlp-to-dashboard/run', data),
    recruitmentMarketingRoi: () => request<any>('GET', '/analytics/usp-recruitment-marketing-roi-agent'),
    scenarioPlanning: () => request<any>('GET', '/analytics/usp-scenario-planning-simulator'),
    talentPoolAttrition: () => request<any>('GET', '/analytics/talent-pool-attrition-predictor'),
    candidateFlightRisk: () => request<any>('GET', '/analytics/candidate-flight-risk-predictor'),
    closedLoopQoh: () => request<any>('GET', '/analytics/closed-loop-quality-of-hire-qoh-synthesizer'),
    performanceRecalibrator: () => request<any>('GET', '/analytics/12-month-performance-recalibrator'),
    attritionRootCause: () => request<any>('GET', '/analytics/attrition-root-cause-analyzer'),
    talentRiskForecaster: () => request<any>('GET', '/analytics/predictive-talent-risk-forecaster'),
    postDecisionLearning: () => request<any>('GET', '/analytics/post-decision-learning-agent'),
    intelligenceFlywheel: () => request<any>('GET', '/analytics/enterprise-hiring-intelligence-flywheel'),
    exceptionReviewMode: () => request<any>('GET', '/analytics/exception-only-review-mode'),
    candidateJourneyVisualizer: () => request<any>('GET', '/analytics/candidate-journey-visualizer-with-prescriptive-fixes'),
    recruiterBurnoutWarning: () => request<any>('GET', '/analytics/recruiter-burnout-early-warning-system'),
    costOfDelayAnalytics: () => request<any>('GET', '/analytics/cost-of-delay-talent-loss-analytics'),
    rolePortfolioRiskRadar: () => request<any>('GET', '/analytics/role-portfolio-risk-radar'),
    candidateTrustAnalytics: () => request<any>('GET', '/analytics/candidate-trust-analytics-and-redress-slas'),
    telemetryExporter: () => request<any>('GET', '/analytics/actionable-telemetry-data-exporter'),
    predictiveHiringAnalytics: () => request<any>('GET', '/analytics/predictive-hiring-analytics-agent'),
    timeToFillEstimation: () => request<any>('GET', '/analytics/predictive-time-to-fill-estimation-with-confidence-intervals'),
    interviewPerformanceAnalytics: () => request<any>('GET', '/analytics/interview-performance-analytics-with-pattern-recognition'),
    candidateJourneyDropOff: () => request<any>('GET', '/analytics/candidate-journey-analytics-with-drop-off-point-identificati'),
    qualityOfHireModeling: () => request<any>('GET', '/analytics/predictive-quality-of-hire-modeling-with-success-indicators'),
    sourcingChannelRoi: () => request<any>('GET', '/analytics/predictive-sourcing-channel-roi-with-budget-optimization'),
    hiringManagerSatisfaction: () => request<any>('GET', '/analytics/hiring-manager-satisfaction-prediction-with-quality-indicato'),
    recruiterPerformance: () => request<any>('GET', '/analytics/automated-recruiter-performance-analytics-with-coaching-reco'),
    sourceAttribution: () => request<any>('GET', '/analytics/intelligent-source-attribution-with-multi-touch-credit-assig'),
    recruiterActionAttribution: () => request<any>('GET', '/analytics/recruiter-action-attribution-engine'),
    fairnessDriftDetection: () => request<any>('GET', '/analytics/fairness-drift-detection'),
    approvalSlaTracking: () => request<any>('GET', '/analytics/approval-sla-tracking-and-alerts'),
    humanOverrideAnalytics: () => request<any>('GET', '/analytics/human-override-analytics'),
    biasImpactAttribution: () => request<any>('GET', '/analytics/bias-impact-attribution-per-feature'),
    workflowReplay: () => request<any>('GET', '/analytics/end-to-end-workflow-replay'),
    demographicParityMonitor: () => request<any>('GET', '/analytics/real-time-demographic-parity-monitor-alert'),
    featureStabilityMonitoring: () => request<any>('GET', '/analytics/feature-importance-stability-monitoring'),
    continuousLearning: () => request<any>('GET', '/analytics/continuous-learning-from-hiring-outcomes-closed-loop-intelli'),
    laborMarketIntelligence: () => request<any>('GET', '/analytics/real-time-labor-market-intelligence-integrated-into-sourcing'),
    qohClosedLoop: () => request<any>('GET', '/analytics/quality-of-hire-closed-loop-measurement-connecting-hiring-da'),
    pipelineForecasting: () => request<any>('GET', '/analytics/predictive-pipeline-forecasting-with-confidence-intervals'),
    recruiterCapacity: () => request<any>('GET', '/analytics/recruiter-capacity-optimization-and-workload-intelligence'),
    pipelineBottleneckResolver: () => request<any>('GET', '/analytics/pipeline-bottleneck-resolver'),
    hiringForecastPlanner: () => request<any>('GET', '/analytics/hiring-forecast-capacity-planner'),
    qohFeedbackLoopIntegrator: () => request<any>('GET', '/analytics/quality-of-hire-feedback-loop-integrator'),
    candidateNps: () => request<any>('GET', '/analytics/agentic-candidate-net-promoter-score-cnps'),
    candidateDropOffPredictor: () => request<any>('GET', '/analytics/agentic-candidate-drop-off-predictor'),
    talentIntelligenceDashboard: () => request<any>('GET', '/analytics/agentic-talent-intelligence-dashboard'),
    slaBreachPredictor: () => request<any>('GET', '/analytics/agentic-sla-breach-predictor'),
    candidateExperienceBenchmarking: () => request<any>('GET', '/analytics/agentic-candidate-experience-benchmarking'),
    interviewerPerformanceAnalytics: () => request<any>('GET', '/analytics/agentic-interviewer-performance-analytics'),
    rcaAgent: () => request<any>('GET', '/analytics/root-cause-analysis-rca-agent'),
    qohPrediction: () => request<any>('GET', '/analytics/quality-of-hire-prediction'),
    contractToHireMonitoring: () => request<any>('GET', '/analytics/contract-to-hire-conversion-monitoring'),
    bottleneckPrediction: () => request<any>('GET', '/analytics/bottleneck-prediction-escalation-agent'),
    sourcingRoiAllocation: () => request<any>('GET', '/analytics/sourcing-channel-roi-allocation-agent'),
    reqToHireRoi: () => request<any>('GET', '/analytics/requisition-to-hire-roi-forecaster'),
    pipelineHealthHealer: () => request<any>('GET', '/analytics/real-time-pipeline-health-self-healer'),
    postHireCorrelation: () => request<any>('GET', '/analytics/post-hire-performance-correlation-agent'),
    talentPoolDecay: () => request<any>('GET', '/analytics/talent-pool-health-decay-analyzer'),
    hiringVelocityBenchmark: () => request<any>('GET', '/analytics/hiring-velocity-benchmark-vs-market-agent'),
    offerAcceptanceForecast: () => request<any>('GET', '/analytics/offer-acceptance-probability-forecaster'),
    budgetImpactSimulator: () => request<any>('GET', '/analytics/requisition-budget-impact-simulator'),
    costPerHireOptimizer: () => request<any>('GET', '/analytics/real-time-cost-per-hire-optimizer'),
    funnelLeakageDiagnoser: () => request<any>('GET', '/analytics/hiring-funnel-leakage-auto-diagnoser'),
    jobFamilyMarketScanner: () => request<any>('GET', '/analytics/automated-job-family-market-trend-scanner'),
    hiringRoiCalculator: () => request<any>('GET', '/analytics/real-time-hiring-roi-calculator'),
    hiringExperimentation: () => request<any>('GET', '/analytics/hiring-experimentation-framework'),
    multiObjectiveOptimizer: () => request<any>('GET', '/analytics/multi-objective-hiring-optimizer-speed-quality-dei-cost'),
    recruiterBurnoutMonitor: () => request<any>('GET', '/analytics/burnout-risk-monitor-for-recruiters'),
    roleOutcomeSimulation: () => request<any>('GET', '/analytics/role-outcome-simulation-engine'),
    experimentAsService: () => request<any>('GET', '/analytics/experiment-as-a-service-for-recruiting-flows'),
    cultureAddSimulator: () => request<any>('GET', '/analytics/culture-add-trajectory-simulator'),
    headcountRevenueModeler: () => request<any>('GET', '/analytics/predictive-headcount-vs-revenue-modeler'),
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
      // 204 No Content — return nothing
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
  sourcing: {
    // ── Core CRUD (real-backend aware) ──────────────────────────────────────
    async listPools(params?: { page?: number; pageSize?: number; includeInactive?: boolean }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.includeInactive) qs.set("includeInactive", "true");
      const res = await fetch(`${API_BASE}/sourcing?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list talent pools");
      return res.json();
    },
    async createPool(data: { name: string; description?: string; criteria?: Record<string, unknown> }) {
      const res = await fetch(`${API_BASE}/sourcing/pools`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to create talent pool");
      return res.json();
    },
    async getPool(id: string) {
      const res = await fetch(`${API_BASE}/sourcing/pools/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to get talent pool");
      return res.json();
    },
    async updatePool(id: string, data: Record<string, unknown>) {
      const res = await fetch(`${API_BASE}/sourcing/pools/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to update talent pool");
      return res.json();
    },
    async deletePool(id: string) {
      const res = await fetch(`${API_BASE}/sourcing/pools/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok && res.status !== 204) throw new Error((await res.json()).error?.message ?? "Failed to delete pool");
    },
    async searchCandidates(data: { query: string; booleanString?: string; filters?: { location?: string; source?: string; tags?: string[] } }) {
      const res = await fetch(`${API_BASE}/sourcing/search`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to search candidates");
      return res.json();
    },
    async saveCandidateToPool(data: { poolId: string; candidateId: string; source?: string }) {
      const res = await fetch(`${API_BASE}/sourcing/saved`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to save candidate to pool");
      return res.json();
    },
    async listSaved(params?: { page?: number; pageSize?: number; poolId?: string }) {
      const qs = new URLSearchParams();
      if (params?.page != null) qs.set("page", String(params.page));
      if (params?.pageSize != null) qs.set("pageSize", String(params.pageSize));
      if (params?.poolId) qs.set("poolId", params.poolId);
      const res = await fetch(`${API_BASE}/sourcing/saved?${qs}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok) throw new Error((await res.json()).error?.message ?? "Failed to list saved candidates");
      return res.json();
    },
    async removeSaved(id: string) {
      const res = await fetch(`${API_BASE}/sourcing/saved/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken() ?? ""}` },
      });
      if (!res.ok && res.status !== 204) throw new Error((await res.json()).error?.message ?? "Failed to remove saved candidate");
    },
    // ── Legacy helpers ───────────────────────────────────────────────────────
    generateBoolean: (data: any) => post<any>("/sourcing/boolean/generate", data),
    shortlist: (data: any) => post<any>("/sourcing/shortlist", data),
    // Backend mounts pools list at GET /sourcing (root) and create at POST /sourcing/pools.
    getTalentPools: () => get<any>("/sourcing"),
    createTalentPool: (data: any) => post<any>("/sourcing/pools", data),
    search: (data: any) => post<any>("/sourcing/search", data),
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
  integrations: {
    getStatus: () => get<any>("/integrations/status"),
    registerAPI: (data: any) => post<any>("/integrations/api/register", data),
    getAPICatalog: () => get<any>("/integrations/api/catalog"),
    syncHRIS: (data: any) => post<any>("/integrations/hris/sync", data),
    getHRISConflicts: () => get<any>("/integrations/hris/conflicts"),
    orchestrateVerification: (data: any) => post<any>("/integrations/verification/orchestrate", data),
    getVerification: (id: string) => get<any>(`/integrations/verification/${id}`),
    getPrioritization: () => get<any>("/integrations/workflows/prioritization"),
    highVolumeCopilot: (data: any) => post<any>("/integrations/copilot/high-volume", data),
    getThirdPartyAttestations: () => get<any>("/integrations/third-party/attestations"),
    setupAuditHooks: (data: any) => post<any>("/integrations/third-party/audit-hooks", data),
    publishEvent: (data: any) => post<any>("/integrations/events/publish", data),
    getEventLog: () => get<any>("/integrations/events/log"),
    designApproval: (data: any) => post<any>("/integrations/approval/design", data),
    getApprovalWorkflows: () => get<any>("/integrations/approval/workflows"),
    submitApproval: (id: string, data: any) => post<any>(`/integrations/approval/${id}/submit`, data),
    getExplainabilityAPI: () => get<any>("/integrations/explainability-api"),
    getFairnessAPI: () => get<any>("/integrations/fairness-api"),
    getEscalationRules: () => get<any>("/integrations/escalation/rules"),
    triggerEscalation: (data: any) => post<any>("/integrations/escalation/trigger", data),
    buildHITLWorkflow: (data: any) => post<any>("/integrations/hitl/workflow/build", data),
    getPipeline: (reqId: string) => get<any>(`/integrations/pipeline/${reqId}`),
    syncRequisition: (data: any) => post<any>("/integrations/requisition/sync", data),
    multiVendorBackgroundCheck: (data: any) => post<any>("/integrations/background-check/multi-vendor", data),
    provisionNewHire: (data: any) => post<any>("/integrations/provisioning/new-hire", data),
    getWorkloadBalance: () => get<any>("/integrations/workload/balance"),
    rebalanceWorkload: (data: any) => post<any>("/integrations/workload/rebalance", data),
  },
  scheduling: {
    autoSchedule: (data: SchedulingRequest) => post<any>("/scheduling/auto-schedule", data),
    reschedule: (data: any) => post<any>("/scheduling/reschedule", data),
    getAvailability: () => get<any>("/scheduling/availability"),
    configureAccessibility: (data: any) => post<any>("/scheduling/accessibility", data),
    multiTimezone: (data: any) => post<any>("/scheduling/multi-timezone", data),
    multiParty: (data: any) => post<any>("/scheduling/multi-party", data),
    getNoShowPrevention: () => get<any>("/scheduling/no-show/prevention"),
    sendReminder: (data: any) => post<any>("/scheduling/no-show/remind", data),
    smsScheduler: () => request<any>('GET', '/scheduling/conversational-sms-frontline-scheduler'),
    capacityForecastingEngine: () => request<any>('GET', '/scheduling/interview-capacity-forecasting-engine'),
    proactiveSchedulingIntelligence: () => request<any>('GET', '/scheduling/proactive-scheduling-intelligence-that-prevents-bottlenecks'),
    interviewerAvailabilityPredictor: () => request<any>('GET', '/scheduling/agentic-interviewer-availability-predictor'),
    dynamicSlotNegotiation: () => request<any>('GET', '/scheduling/dynamic-interview-slot-negotiation'),
    noShowRecovery: () => request<any>('GET', '/scheduling/no-show-autonomous-recovery'),
    multiPanelNegotiator: () => request<any>('GET', '/scheduling/autonomous-multi-panel-scheduling-negotiator'),
    burnoutBalancer: () => request<any>('GET', '/scheduling/predictive-interviewer-burnout-balancer'),
    reschedulingFallback: () => request<any>('GET', '/scheduling/real-time-rescheduling-fallback-orchestrator'),
    panelistLoadBalancer: () => request<any>('GET', '/scheduling/panelist-availability-load-balancer'),
    swarmScheduler: () => request<any>('GET', '/scheduling/swarm-based-interview-scheduling-orchestrator'),
  },
  mobility: {
    // Backend mounts the list at GET /mobility (root) — there is no /opportunities subpath.
    getOpportunities: () => get<any>("/mobility"),
    match: (data: any) => post<any>("/mobility/match", data),
    getProfile: (employeeId: string) => get<any>(`/mobility/profiles/${employeeId}`),
  },
  onboarding: {
    handoff: (data: any) => post<any>("/onboarding/handoff", data),
    getHandoff: (candidateId: string) => get<any>(`/onboarding/handoff/${candidateId}`),
    getContext: (candidateId: string) => get<any>(`/onboarding/handoff/${candidateId}/context`),
    postHireFeedbackLoop: () => request<any>('GET', '/onboarding/post-hire-feedback-loop-agent-category-defining-bet'),
    visaRelocationAssistant: () => request<any>('GET', '/onboarding/usp-visa-relocation-assistant'),
    automatedHandoffContextPreservation: () => request<any>('GET', '/onboarding/automated-onboarding-handoff-with-context-preservation'),
    handoffOrchestrator: () => request<any>('GET', '/onboarding/onboarding-handoff-orchestrator'),
    handoffOrchestration: () => request<any>('GET', '/onboarding/onboarding-handoff-orchestration'),
    skillsGapTrainingHandoff: () => request<any>('GET', '/onboarding/skills-gap-auto-training-handoff-agent'),
    milestonePredictorNudger: () => request<any>('GET', '/onboarding/onboarding-milestone-predictor-nudger'),
    preboardingPersonalizer: () => request<any>('GET', '/onboarding/post-offer-preboarding-personalizer'),
    culturalImmersionAgent: () => request<any>('GET', '/onboarding/autonomous-pre-boarding-cultural-immersion-agent'),
  },

  // ── Extended Candidates (P2/P3) ──────────────────────────────────────────
  candidatesP2: {
    // Q&A Agent
    listQA: (candidateId?: string) => request('GET', `/candidates/qa/questions${candidateId ? `?candidateId=${candidateId}` : ''}`),
    askQuestion: (body: { candidateId?: string; question: string; context?: string }) => request('POST', '/candidates/qa/ask', body),
    guardrailCheck: (message: string) => request('POST', '/candidates/qa/guardrail-check', { message }),

    // Concierge
    listConciergeSessions: (candidateId?: string) => request('GET', `/candidates/concierge/sessions${candidateId ? `?candidateId=${candidateId}` : ''}`),
    sendConciergeMessage: (body: { candidateId: string; message: string; channel?: string }) => request('POST', '/candidates/concierge/message', body),
    getConciergePreferences: (candidateId: string) => request('GET', `/candidates/concierge/preferences/${candidateId}`),
    updateConciergePreferences: (candidateId: string, prefs: Record<string, unknown>) => request('PUT', `/candidates/concierge/preferences/${candidateId}`, prefs),

    // Localization
    getSupportedLanguages: () => request('GET', '/candidates/localization/supported-languages'),
    translate: (body: { content: string; targetLanguage: string; contentType?: string }) => request('POST', '/candidates/localization/translate', body),
    getLegalTerms: (language: string) => request('GET', `/candidates/localization/legal-terms/${language}`),

    // Process Map
    getProcessMap: (candidateId: string) => request('GET', `/candidates/process-map/${candidateId}`),
    getProcessTimeline: (candidateId: string) => request('GET', `/candidates/process-map/${candidateId}/timeline`),

    // Rejection Feedback
    getRejectionFeedback: (applicationId: string) => request('GET', `/candidates/rejection-feedback/${applicationId}`),
    generateRejectionFeedback: (body: { applicationId: string; rejectionReason?: string }) => request('POST', '/candidates/rejection-feedback/generate', body),
    getFeedbackTemplates: () => request('GET', '/candidates/rejection-feedback/templates'),

    // Journey Orchestration
    listJourneys: (candidateId?: string) => request('GET', `/candidates/journey/orchestration${candidateId ? `?candidateId=${candidateId}` : ''}`),
    triggerJourney: (body: { candidateId: string; triggerEvent: string; journeyType?: string }) => request('POST', '/candidates/journey/orchestration/trigger', body),
    getTouchpoints: (candidateId?: string) => request('GET', `/candidates/journey/orchestration/touchpoints${candidateId ? `?candidateId=${candidateId}` : ''}`),

    // NPS & Experience
    submitNPS: (body: { candidateId: string; score: number; feedback?: string; stage?: string }) => request('POST', '/candidates/experience/nps-survey', body),
    getNPSAnalytics: () => request('GET', '/candidates/experience/nps-analytics'),
    getSentiment: () => request('GET', '/candidates/experience/sentiment'),

    // Talent Rediscovery
    rediscoverCandidates: (requisitionId?: string) => request('GET', `/candidates/rediscovery/candidates${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    searchRediscovery: (body: { skills?: string[]; minExperience?: number; location?: string; excludeIds?: string[] }) => request('POST', '/candidates/rediscovery/search', body),

    // Silver Medalists & Alumni
    listAlumni: () => request('GET', '/candidates/alumni'),
    listSilverMedalists: (requisitionId?: string) => request('GET', `/candidates/silver-medalists${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    tagSilverMedalist: (body: { candidateId: string; requisitionId?: string; notes?: string }) => request('POST', '/candidates/silver-medalists/tag', body),

    // Engagement
    getEngagementScores: (candidateId?: string) => request('GET', `/candidates/engagement/scores${candidateId ? `?candidateId=${candidateId}` : ''}`),
    recalculateEngagement: (candidateId: string) => request('POST', '/candidates/engagement/recalculate', { candidateId }),

    // Duplicates
    checkDuplicates: (params: { email?: string; phone?: string; name?: string }) => request('GET', `/candidates/duplicates/check?${new URLSearchParams(params as Record<string,string>).toString()}`),
    mergeDuplicates: (body: { primaryId: string; duplicateIds: string[]; mergeStrategy?: string }) => request('POST', '/candidates/duplicates/merge', body),

    // Scoring
    getScoringModels: () => request('GET', '/candidates/scoring/models'),
    calculateScore: (body: { candidateId: string; requisitionId?: string; modelId?: string }) => request('POST', '/candidates/scoring/calculate', body),

    // CRM
    getCRMSyncStatus: () => request('GET', '/candidates/crm/sync-status'),
    syncCRM: (body: { crmSystem: string; candidateIds?: string[]; direction?: string }) => request('POST', '/candidates/crm/sync', body),

    // Pipeline
    getPipelineAnalytics: () => request('GET', '/candidates/pipeline/analytics'),
    getPipelineFunnel: () => request('GET', '/candidates/pipeline/funnel'),

    // Tags
    listTags: () => request('GET', '/candidates/tags'),
    bulkApplyTags: (body: { candidateIds: string[]; tags: string[] }) => request('POST', '/candidates/tags/bulk-apply', body),

    // Referrals
    listReferrals: (referrerId?: string) => request('GET', `/candidates/referrals${referrerId ? `?referrerId=${referrerId}` : ''}`),
    submitReferral: (body: { referrerId: string; candidateEmail: string; candidateName?: string; requisitionId?: string }) => request('POST', '/candidates/referrals/submit', body),

    // Data Export
    requestDataExport: (body: { candidateId: string; format?: string }) => request('POST', '/candidates/data-export/request', body),
    getExportStatus: (exportId: string) => request('GET', `/candidates/data-export/status/${exportId}`),
  },

  // ── Extended Screening (P2/P3) ───────────────────────────────────────────
  screeningP2: {
    // Async Batch Screening
    submitBatch: (body: { requisitionId: string; candidateIds: string[]; screeningType?: string }) => request('POST', '/screening/async/batch-submit', body),
    getBatchStatus: (batchId: string) => request('GET', `/screening/async/batch/${batchId}`),
    listWorkSamples: (requisitionId?: string) => request('GET', `/screening/async/work-samples${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    createWorkSample: (body: { requisitionId: string; title: string; type?: string; timeLimit?: number; description?: string }) => request('POST', '/screening/async/work-samples/create', body),

    // Talent Pool Segmentation
    listSegments: () => request('GET', '/screening/talent-pool/segments'),
    createSegment: (body: { name: string; criteria: Record<string, unknown>; description?: string }) => request('POST', '/screening/talent-pool/segments/create', body),
    engageSegment: (segmentId: string, body: { campaignType?: string; message?: string }) => request('POST', `/screening/talent-pool/segments/${segmentId}/engage`, body),
    getTalentPoolAnalytics: () => request('GET', '/screening/talent-pool/analytics'),

    // Skills Matching
    getAdjacencyMatch: (body: { candidateId: string; requisitionId?: string; includeAdjacent?: boolean }) => request('POST', '/screening/skills-match/adjacency', body),
    getSkillsTaxonomy: () => request('GET', '/screening/skills-match/taxonomy'),
    getGapAnalysis: (body: { candidateId: string; requiredSkills: string[] }) => request('POST', '/screening/skills-match/gap-analysis', body),

    // AI Interview
    startAIInterview: (body: { candidateId: string; requisitionId: string; difficulty?: string }) => request('POST', '/screening/ai-interview/session/start', body),
    respondToQuestion: (sessionId: string, body: { answer: string; questionId: string }) => request('POST', `/screening/ai-interview/session/${sessionId}/respond`, body),
    completeAIInterview: (sessionId: string) => request('POST', `/screening/ai-interview/session/${sessionId}/complete`, {}),
    getAIInterviewSession: (sessionId: string) => request('GET', `/screening/ai-interview/session/${sessionId}`),

    // Assessments
    getAssessmentCatalog: () => request('GET', '/screening/assessments/catalog'),
    assignAssessment: (body: { candidateId: string; assessmentId: string; requisitionId?: string; dueDate?: string }) => request('POST', '/screening/assessments/assign', body),
    getAssessmentResults: (candidateId: string) => request('GET', `/screening/assessments/results/${candidateId}`),
    recommendAssessments: (body: { candidateId: string; requisitionId: string }) => request('POST', '/screening/assessments/recommend', body),

    // Potential Scoring
    calculatePotential: (body: { candidateId: string; requisitionId?: string }) => request('POST', '/screening/potential-scoring/calculate', body),
    getPotentialModels: () => request('GET', '/screening/potential-scoring/models'),
    getPotentialLeaderboard: (requisitionId?: string) => request('GET', `/screening/potential-scoring/leaderboard${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),

    // Config & Templates
    getConfig: () => request('GET', '/screening/config'),
    updateConfig: (body: Record<string, unknown>) => request('PUT', '/screening/config', body),
    listTemplates: () => request('GET', '/screening/templates'),
    createTemplate: (body: { name: string; type: string; stages?: string[] }) => request('POST', '/screening/templates', body),

    // Audit
    getAuditLog: (params?: { startDate?: string; endDate?: string }) => request('GET', `/screening/audit/log${params ? `?${new URLSearchParams(params as Record<string,string>).toString()}` : ''}`),
    getBiasReport: (params?: { startDate?: string; endDate?: string }) => request('GET', `/screening/audit/bias-report${params ? `?${new URLSearchParams(params as Record<string,string>).toString()}` : ''}`),
  },

  // ── Extended Security (P2/P3) ─────────────────────────────────────────────
  securityP2: {
    // Zero-Trust
    getZeroTrustPolicy: () => request('GET', '/security/zero-trust/policy'),
    updateZeroTrustPolicy: (body: Record<string, unknown>) => request('PUT', '/security/zero-trust/policy', body),
    getZeroTrustViolations: (params?: { severity?: string; startDate?: string }) => request('GET', `/security/zero-trust/violations${params ? `?${new URLSearchParams(params as Record<string,string>).toString()}` : ''}`),

    // AI Safety
    listAIGuardrails: () => request('GET', '/security/ai-safety/guardrails'),
    testGuardrail: (body: { guardrailId: string; testInput: string; testType?: string }) => request('POST', '/security/ai-safety/guardrails/test', body),
    getAlignmentScore: () => request('GET', '/security/ai-safety/alignment-score'),

    // Red Team
    runRedTeamTest: (body: { testType: string; targetSystem: string; intensity?: string }) => request('POST', '/security/red-team/run', body),
    getRedTeamResults: (jobId?: string) => request('GET', `/security/red-team/results${jobId ? `?jobId=${jobId}` : ''}`),

    // Enclaves
    getEnclaveStatus: () => request('GET', '/security/enclaves/status'),
    attestEnclave: () => request('POST', '/security/enclaves/attest', {}),

    // Threat Intelligence
    getThreatFeed: (params?: { severity?: string; type?: string }) => request('GET', `/security/threat-intelligence/feed${params ? `?${new URLSearchParams(params as Record<string,string>).toString()}` : ''}`),
    getIOCs: () => request('GET', '/security/threat-intelligence/ioc'),

    // Posture
    getPostureScore: () => request('GET', '/security/posture/score'),
    getPostureHistory: () => request('GET', '/security/posture/history'),
  },

  // ── Explainability / AI (P2/P3) ─────────────────────────────────────────────
  explainability: {
    multiAgentRanker: (requisitionId: string, candidateIds: string[]) => request('POST', '/ai/concurrent-multi-agent-candidate-ranker/run', { requisitionId, candidateIds }),
    getRankerResults: () => request('GET', '/ai/concurrent-multi-agent-candidate-ranker'),
    interviewPredictabilityAuditor: () => request('GET', '/ai/interview-predictability-auditor'),
    counterfactualSimulator: () => request('GET', '/ai/counterfactual-candidate-simulator'),
    multiAgentExplainer: (body: { decisionId?: string; candidateId?: string }) => request('POST', '/ai/multi-agent-explanation-assistant/run', body),
    getExplainerSessions: () => request('GET', '/ai/multi-agent-explanation-assistant'),
    biasResilienceToolkit: (features: string[]) => request('POST', '/ai/bias-resilient-feature-engineering-toolkit/run', { features }),
    getBiasResilienceStatus: () => request('GET', '/ai/bias-resilient-feature-engineering-toolkit'),
    getRecruiterCoaching: (recruiterId?: string) => request('GET', `/ai/ai-coaching-for-recruiter-decisions-non-binding${recruiterId ? `?recruiterId=${recruiterId}` : ''}`),
    getNLExplanations: (decisionId: string) => request('GET', `/ai/model-integrated-natural-language-explanations?decisionId=${decisionId}`),
    getConfidenceThresholds: () => request('GET', '/ai/confidence-score-thresholding-for-automation'),
    getAgentPermissions: () => request('GET', '/ai/conditional-agent-permissions'),
    checkAgentPermission: (body: { agentId: string; requestedAction: string }) => request('POST', '/ai/conditional-agent-permissions/run', body),
    getCoTLogs: (decisionId?: string) => request('GET', `/ai/chain-of-thought-cot-confidence-scorer${decisionId ? `?decisionId=${decisionId}` : ''}`),
    scoreCoT: (body: { decisionId: string; reasoning?: string }) => request('POST', '/ai/chain-of-thought-cot-confidence-scorer/run', body),
    getSkillAdjacency: (skill: string) => request('GET', `/ai/semantic-skill-adjacency-explainer?skill=${skill}`),
    runHallucinationCheck: (body: { claim: string; sources?: string[] }) => request('POST', '/ai/hallucination-cross-verifier-engine/run', body),
    getRationaleEngine: (decisionId?: string) => request('GET', `/ai/agentic-decision-rationale-engine${decisionId ? `?decisionId=${decisionId}` : ''}`),
    generateRationale: (body: { decisionId: string; candidateId?: string; outcome?: string }) => request('POST', '/ai/agentic-decision-rationale-engine/run', body),
    getHumanFeedback: () => request('GET', '/ai/human-decision-feedback-to-ai'),
    getExplainableRanking: (requisitionId?: string) => request('GET', `/ai/explainable-ai-ranking-with-post-hoc-justifications${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    getReRankQueue: () => request('GET', '/ai/human-in-the-loop-re-ranking'),
    getRecruiterCopilot: (recruiterId?: string) => request('GET', `/ai/recruiter-copilot-with-contextual-reasoning${recruiterId ? `?recruiterId=${recruiterId}` : ''}`),
    getTrustLevels: () => request('GET', '/ai/role-based-ai-trust-levels'),
    getLIMESHAP: (candidateId: string, requisitionId?: string) => request('GET', `/ai/lime-shap-based-candidate-explanations?candidateId=${candidateId}${requisitionId ? `&requisitionId=${requisitionId}` : ''}`),
    getExplainabilityWidget: (candidateId?: string, decisionId?: string) => request('GET', `/ai/explainability-widget-for-recruiters${candidateId ? `?candidateId=${candidateId}` : ''}${decisionId ? `&decisionId=${decisionId}` : ''}`),
    getFairnessConstraints: () => request('GET', '/ai/configurable-fairness-constraints'),
    getBiasSimulations: () => request('GET', '/ai/bias-simulation-and-scenario-testing'),
    getBiasAwareTraining: () => request('GET', '/ai/bias-aware-model-training'),
    getCoTDecisionLog: (decisionId?: string) => request('GET', `/ai/per-decision-agent-chain-of-thought-log${decisionId ? `?decisionId=${decisionId}` : ''}`),
    generateCoTLog: (decisionId: string) => request('POST', '/ai/per-decision-agent-chain-of-thought-log/run', { decisionId }),
    getNLDecisionSummary: (decisionId: string) => request('GET', `/ai/natural-language-ai-decision-summary-for-recruiters?decisionId=${decisionId}`),
    getFairnessSandbox: () => request('GET', '/ai/fairness-fine-tuning-sandbox-with-human-feedback-loop'),
    getFeatureAttribution: (candidateId?: string, modelId?: string) => request('GET', `/ai/explainable-feature-attribution${candidateId ? `?candidateId=${candidateId}` : ''}${modelId ? `&modelId=${modelId}` : ''}`),
    getUncertainty: (decisionId?: string) => request('GET', `/ai/uncertainty-quantification${decisionId ? `?decisionId=${decisionId}` : ''}`),
    getRationaleCards: (requisitionId?: string) => request('GET', `/ai/explainable-candidate-ranking-rationale-cards${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    getOverrideLearning: () => request('GET', '/ai/ai-decision-override-learning-loop'),
    getCandidateExplainPacket: (candidateId: string) => request('GET', `/ai/candidate-level-explanation-packets?candidateId=${candidateId}`),
    getDecisionExplainCard: (decisionId: string) => request('GET', `/ai/decision-level-explainability-cards?decisionId=${decisionId}`),
    getConfidenceThrottle: () => request('GET', '/ai/decision-confidence-throttling'),
    getIntakeScorecards: () => request('GET', '/ai/requisition-intake-agent-that-produces-a-decision-ready-scor'),
    runIntakeAgent: (body: { requisitionId: string; jobDescription?: string }) => request('POST', '/ai/requisition-intake-agent-that-produces-a-decision-ready-scor/run', body),
    getPlaybookAutotuning: () => request('GET', '/ai/playbook-autotuning-from-cross-role-patterns'),
    getRLOptimizer: () => request('GET', '/ai/reinforcement-learning-optimization-agent-category-defining'),
    runRLOptimizer: () => request('POST', '/ai/reinforcement-learning-optimization-agent-category-defining/run', {}),
    getRecruiterDigitalTwin: (recruiterId?: string) => request('GET', `/ai/usp-recruiter-digital-twin${recruiterId ? `?recruiterId=${recruiterId}` : ''}`),
    getFlywheelMetrics: () => request('GET', '/ai/agentic-feedback-loop-the-flywheel-usp-24'),
    runFlywheel: () => request('POST', '/ai/agentic-feedback-loop-the-flywheel-usp-24/run', {}),
    getCandidateAssistantSessions: () => request('GET', '/ai/multi-agent-candidate-assistant-guidance-not-screening'),
    runCandidateAssistant: (body: { candidateId: string; query: string }) => request('POST', '/ai/multi-agent-candidate-assistant-guidance-not-screening/run', body),
    getAgentCRM: () => request('GET', '/ai/agentic-candidate-relationship-management-crm-with-opt-out-r'),
    runAgentCRM: (body: { candidateId: string; action?: string; channel?: string }) => request('POST', '/ai/agentic-candidate-relationship-management-crm-with-opt-out-r/run', body),
    getKnowledgeGraph: () => request('GET', '/ai/knowledge-graph-construction-from-all-hiring-events'),
    getSelfTuning: () => request('GET', '/ai/self-tuning-matching-algorithms-via-feedback-loops'),
    getOutcomeRetraining: () => request('GET', '/ai/outcome-driven-model-retraining-loop'),
    getHiringManagerCoPilot: (managerId?: string) => request('GET', `/ai/hiring-manager-autonomous-co-pilot${managerId ? `?managerId=${managerId}` : ''}`),
    getDebateSystem: () => request('GET', '/ai/multi-agent-candidate-evaluation-debate-system'),
    runDebate: (body: { candidateId: string; requisitionId?: string }) => request('POST', '/ai/multi-agent-candidate-evaluation-debate-system/run', body),
  },

  // ── Compliance-Governance (P2/P3) ────────────────────────────────────────────
  complianceP2: {
    getBiasAndSentiment: (params?: { startDate?: string; endDate?: string }) => request('GET', `/compliance/bias-and-sentiment-extractor${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getPreAuditSimulations: () => request('GET', '/compliance/pre-audit-simulation-mode'),
    runPreAuditSimulation: (body: { auditType: string; scope?: string; regulatoryFramework?: string }) => request('POST', '/compliance/pre-audit-simulation-mode', body),
    getDiscrepancyAlerts: () => request('GET', '/compliance/ai-recommendation-discrepancy-alert'),
    getPolicies: () => request('GET', '/compliance/policy-as-code-for-hiring-workflows'),
    createPolicy: (body: { name: string; rule: string; enforcement?: string }) => request('POST', '/compliance/policy-as-code-for-hiring-workflows', body),
    getSLAEnforcement: () => request('GET', '/compliance/automated-sla-enforcement-for-human-review'),
    getWhatIfSimulations: () => request('GET', '/compliance/what-if-policy-impact-simulator'),
    runWhatIfSimulation: (body: { proposedPolicy: string }) => request('POST', '/compliance/what-if-policy-impact-simulator', body),
    getOverrideAnnotations: () => request('GET', '/compliance/algorithmic-override-annotator'),
    getHistoricalBias: () => request('GET', '/compliance/historical-bias-disconnect-engine'),
    runHistoricalBiasAnalysis: (body: { startDate?: string; endDate?: string }) => request('POST', '/compliance/historical-bias-disconnect-engine/run', body),
    getHardGates: () => request('GET', '/compliance/role-based-hard-gate-interceptor'),
    getSoftGateNotifications: () => request('GET', '/compliance/soft-gate-anomaly-notification-protocol'),
    getEscalations: () => request('GET', '/compliance/escalation-trigger-for-edge-case-profiles'),
    triggerEscalation: (body: { candidateId: string; reason?: string; priority?: string }) => request('POST', '/compliance/escalation-trigger-for-edge-case-profiles/run', body),
    getShadowGovernance: () => request('GET', '/compliance/shadow-ai-governance-module'),
    getAILiteracyCerts: () => request('GET', '/compliance/ai-literacy-certification-tracker'),
    recordCertification: (body: { userId: string; level?: string; score?: number }) => request('POST', '/compliance/ai-literacy-certification-tracker', body),
    getReviewerTraining: () => request('GET', '/compliance/human-review-training-and-certification'),
    getQCSampling: () => request('GET', '/compliance/review-sampling-quality-control'),
    getInterviewerBalance: () => request('GET', '/compliance/interviewer-load-fairness-balancer'),
    getPolicyGuardrails: () => request('GET', '/compliance/agent-policy-guardrail-engine'),
    runPolicyGuardrail: (body: { agentAction: string; context?: Record<string, unknown> }) => request('POST', '/compliance/agent-policy-guardrail-engine/run', body),
    getRegulatorySandbox: () => request('GET', '/compliance/regulator-ready-simulation-sandbox'),
    getBiasMitigatedDecisions: () => request('GET', '/compliance/explainable-bias-mitigating-decision-agent'),
    runBiasMitigation: (body: { candidateId: string }) => request('POST', '/compliance/explainable-bias-mitigating-decision-agent/run', body),
    getDiversityGoals: () => request('GET', '/compliance/diversity-goal-achievement-agent'),
    runDiversityIntervention: (body: { goalId: string; interventionType?: string }) => request('POST', '/compliance/diversity-goal-achievement-agent/run', body),
    getManagerTraining: (managerId?: string) => request('GET', `/compliance/hiring-manager-training-best-practice-coach${managerId ? `?managerId=${managerId}` : ''}`),
    recordTrainingCompletion: (body: { managerId: string; moduleId: string; score: number }) => request('POST', '/compliance/hiring-manager-training-best-practice-coach', body),
    getAuditReports: () => request('GET', '/compliance/autonomous-audit-ready-reporting-agent'),
    generateAuditReport: (body: { reportType: string; period?: string; framework?: string }) => request('POST', '/compliance/autonomous-audit-ready-reporting-agent/run', body),
    getCandidateFairnessExplanation: (params: { applicationId?: string; candidateId?: string }) => request('GET', `/compliance/candidate-side-fairness-explanations?${new URLSearchParams(params as Record<string,string>)}`),
    getDiversityForecast: (horizon?: number) => request('GET', `/compliance/diversity-impact-forecasting${horizon ? `?horizon=${horizon}` : ''}`),
    getComplianceCoPilotSessions: () => request('GET', '/compliance/agentic-compliance-co-pilot-for-audits'),
    runComplianceCoPilot: (body: { auditQuery: string; framework?: string }) => request('POST', '/compliance/agentic-compliance-co-pilot-for-audits/run', body),
    getBiasBountyReports: () => request('GET', '/compliance/bias-bounty-program-integration'),
    getRegionalCompliance: (params?: { region?: string; language?: string }) => request('GET', `/compliance/multilingual-region-aware-compliance-agent${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getShadowInterviews: () => request('GET', '/compliance/shadow-interview-detection'),
  },

  // ── Platform-Core (P2/P3) ────────────────────────────────────────────────────
  platformP2: {
    getKnowledgeGraph: () => request('GET', '/platform/canonical-hiring-knowledge-graph'),
    getSkillsOntology: () => request('GET', '/platform/usp-unified-skills-ontology-engine'),
    runSkillsOntology: (body: { skills?: string[]; action?: string }) => request('POST', '/platform/usp-unified-skills-ontology-engine/run', body),
    getManagerSandboxes: () => request('GET', '/platform/usp-manager-self-service-sandbox'),
    createManagerSandbox: (body: { managerId: string; sandboxType?: string }) => request('POST', '/platform/usp-manager-self-service-sandbox', body),
    getTalentGraph: () => request('GET', '/platform/skills-outcome-centric-talent-graph'),
    getStalledPipelines: () => request('GET', '/platform/workflow-recovery-agent-for-stalled-pipelines'),
    recoverPipeline: (body: { pipelineId: string; recoveryStrategy?: string }) => request('POST', '/platform/workflow-recovery-agent-for-stalled-pipelines/run', body),
    getRoleCalibrations: () => request('GET', '/platform/role-calibration-assistant'),
    getABExperiments: () => request('GET', '/platform/a-b-testing-framework-for-workflow-changes'),
    createABExperiment: (body: { name: string; variantA: string; variantB: string; hypothesis?: string; sampleSize?: number }) => request('POST', '/platform/a-b-testing-framework-for-workflow-changes', body),
    getPersonalizationEngine: () => request('GET', '/platform/adaptive-process-personalization-engine'),
    runPersonalization: (body: { processType: string; context?: Record<string, unknown> }) => request('POST', '/platform/adaptive-process-personalization-engine/run', body),
    getAutonomyConfig: () => request('GET', '/platform/configurable-autonomy-with-human-in-the-loop-decisioning'),
    getHITLControlCenter: () => request('GET', '/platform/human-in-the-loop-control-center'),
    getRequisitionPriority: () => request('GET', '/platform/requisition-prioritization-resource-allocator'),
    getSurgeScaler: () => request('GET', '/platform/seasonal-volume-surge-self-scaler'),
    getAutonomousWorkflows: () => request('GET', '/platform/autonomous-workflow-orchestration-category-defining-bet'),
    initiateAutonomousWorkflow: (body: { requisitionId: string; workflowTemplate?: string }) => request('POST', '/platform/autonomous-workflow-orchestration-category-defining-bet', body),
    getACEMemory: () => request('GET', '/platform/agentic-context-engineering-ace-memory-core'),
    storeMemory: (body: { contextType: string; entityId: string; memory?: unknown }) => request('POST', '/platform/agentic-context-engineering-ace-memory-core/run', body),
    getOntologyAutoEvolver: () => request('GET', '/platform/enterprise-wide-skills-ontology-auto-evolver'),
    getAgentSwarms: () => request('GET', '/platform/zero-touch-requisition-to-pipeline-agent-swarm'),
    runAgentSwarm: (requisitionId: string) => request('POST', '/platform/zero-touch-requisition-to-pipeline-agent-swarm/run', { requisitionId }),
    getMetaPlaybooks: () => request('GET', '/platform/meta-learning-agent-for-process-playbooks'),
    generatePlaybook: (body: { roleType: string; successCriteria?: string }) => request('POST', '/platform/meta-learning-agent-for-process-playbooks/run', body),
    getContextMemory: (params?: { entityId?: string; entityType?: string }) => request('GET', `/platform/persistent-contextual-memory-across-workflows${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    storeContextMemory: (body: { entityId: string; content: unknown; entityType?: string }) => request('POST', '/platform/persistent-contextual-memory-across-workflows', body),
    getCollaborationLayer: () => request('GET', '/platform/multi-agent-collaboration-layer'),
    startCollaboration: (body: { taskId: string; agents: string[] }) => request('POST', '/platform/multi-agent-collaboration-layer/run', body),
    getIntakeDesigns: () => request('GET', '/platform/agent-led-requisition-intake-designer'),
    designIntake: (body: { roleTitle: string; department?: string }) => request('POST', '/platform/agent-led-requisition-intake-designer/run', body),
    getHiringPods: () => request('GET', '/platform/autonomous-high-volume-hiring-pods'),
    getManagerIntakes: () => request('GET', '/platform/autonomous-hiring-manager-intake-orchestrator'),
    runManagerIntake: (body: { managerId: string; roleType?: string; urgency?: string }) => request('POST', '/platform/autonomous-hiring-manager-intake-orchestrator/run', body),
    getSkillsAutoUpdater: () => request('GET', '/platform/skills-ontology-auto-updater'),
    getControlTower: () => request('GET', '/platform/centralized-agentic-supervisor-control-tower'),
    executeControlTowerCommand: (body: { command: string; agentId?: string }) => request('POST', '/platform/centralized-agentic-supervisor-control-tower/run', body),
  },

  sourcingP2: {
    // Silver medalist & alumni rediscovery
    getSilverMedalists: (params?: { status?: string; minMatchScore?: number }) => request('GET', `/sourcing/silver-medalists${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    runRediscoverySweep: (body: { requisitionId?: string; matchThreshold?: number }) => request('POST', '/sourcing/silver-medalist-rediscovery', body),
    getAlumniPipeline: () => request('GET', '/sourcing/alumni-pipeline'),
    // Outreach & campaigns
    getOutreachCampaigns: () => request('GET', '/sourcing/outreach-campaigns'),
    createOutreachCampaign: (body: { roleTitle: string; targetSkills: string[]; channels: string[]; messageTone?: string }) => request('POST', '/sourcing/outreach-campaigns', body),
    getMultiChannelOrchestrator: () => request('GET', '/sourcing/multi-channel-orchestrator'),
    // JD analysis
    analyzeJD: (body: { jobDescriptionText: string }) => request('POST', '/sourcing/jd-analysis', body),
    getJDAnalyses: () => request('GET', '/sourcing/jd-analyses'),
    generateDynamicJD: (body: { roleTitle: string; department?: string; skills?: string[] }) => request('POST', '/sourcing/dynamic-jd-generator', body),
    // Autonomous sourcing
    launchAutonomousAgent: (body: { roleTitle: string; targetSkills: string[]; channels?: string[] }) => request('POST', '/sourcing/autonomous-agent/launch', body),
    getAutonomousAgentStatus: () => request('GET', '/sourcing/autonomous-agent/status'),
    // Employer brand & competitive intelligence
    getEmployerBrandSentiment: () => request('GET', '/sourcing/employer-brand-sentiment'),
    getCompetitiveIntelligence: () => request('GET', '/sourcing/competitive-intelligence'),
    getExternalLaborMarket: () => request('GET', '/sourcing/external-labor-market-intelligence'),
    // Talent pools
    getTalentPools: (params?: { skill?: string; status?: string }) => request('GET', `/sourcing${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    createTalentPool: (body: { name: string; criteria: unknown }) => request('POST', '/sourcing/talent-pools', body),
    refreshTalentPool: (poolId: string) => request('POST', `/sourcing/talent-pools/${poolId}/refresh`, {}),
    // Referrals
    getReferralIntelligence: () => request('GET', '/sourcing/referral-intelligence'),
    getNetworkGraphReferrals: (params?: { employeeId?: string }) => request('GET', `/sourcing/network-graph-referrals${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Pipeline & distribution
    getJobDistributionOptimization: (params?: { requisitionId?: string }) => request('GET', `/sourcing/job-distribution-optimization${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getProactivePipeline: (params?: { requisitionId?: string }) => request('GET', `/sourcing/proactive-pipeline-building${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Boolean search
    generateBooleanString: (body: { roleTitle: string; mustHaveSkills: string[]; niceToHaveSkills?: string[] }) => request('POST', '/sourcing/boolean-string-generator', body),
    // Passive candidate nurture
    getNurtureSequences: () => request('GET', '/sourcing/passive-nurture-sequences'),
    createNurtureSequence: (body: { targetPool: string; touchpoints: unknown[] }) => request('POST', '/sourcing/passive-nurture-sequences', body),
    // Diversity sourcing
    getDiversitySourcingPlan: (params?: { requisitionId?: string }) => request('GET', `/sourcing/diversity-sourcing-plan${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // ROI & optimization
    getSourcingStrategyOptimization: () => request('GET', '/sourcing/strategy-optimization'),
    getThirdPartyAgencyROI: () => request('GET', '/sourcing/agency-roi'),
  },

  interviewsP2: {
    // Question bank
    getQuestionBank: (params?: { competency?: string; difficulty?: string; type?: string }) => request('GET', `/interviews/question-bank${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    generateQuestions: (body: { roleTitle: string; competencies: string[]; count?: number }) => request('POST', '/interviews/question-bank/generate', body),
    // Real-time coaching & bias
    getRealTimeCoaching: (interviewId: string) => request('GET', `/interviews/real-time-coaching?interviewId=${interviewId}`),
    detectBias: (body: { interviewId: string; transcript?: string }) => request('POST', '/interviews/bias-detection', body),
    // Calibration
    getCalibrationSessions: () => request('GET', '/interviews/calibration-sessions'),
    createCalibrationSession: (body: { requisitionId: string; candidateIds: string[]; panelMemberIds: string[]; scheduledAt: string }) => request('POST', '/interviews/calibration-sessions', body),
    // Scorecards
    getScorecard: (interviewId: string) => request('GET', `/interviews/scorecards/${interviewId}`),
    // Analytics
    getQuestionEffectiveness: (params?: { requisitionId?: string; dateFrom?: string; dateTo?: string }) => request('GET', `/interviews/question-effectiveness${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getPanelCoordination: (interviewId: string) => request('GET', `/interviews/panel-coordination?interviewId=${interviewId}`),
    analyzeVideo: (body: { interviewId: string; videoUrl: string }) => request('POST', '/interviews/video-analysis', body),
    transcribeInterview: (body: { interviewId: string; audioUrl: string }) => request('POST', '/interviews/transcription', body),
    getDebrief: (interviewId: string) => request('GET', `/interviews/debrief/${interviewId}`),
    // Blind mode
    getBlindMode: (interviewId: string) => request('GET', `/interviews/blind-mode/${interviewId}`),
    toggleBlindMode: (interviewId: string, enabled: boolean) => request('POST', `/interviews/blind-mode/${interviewId}/toggle`, { enabled }),
    // Candidate tools
    generateCandidatePrep: (body: { candidateId: string; interviewId: string; roleTitle: string }) => request('POST', '/interviews/candidate-prep', body),
    createSimulation: (body: { candidateId: string; roleTitle: string; simulationType?: string }) => request('POST', '/interviews/simulation', body),
    getCandidateAnxietyTools: () => request('GET', '/interviews/candidate-anxiety-tools'),
    // Performance & quality
    getInterviewerPerformance: (params?: { interviewerId?: string; period?: string }) => request('GET', `/interviews/interviewer-performance${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getQualityMetrics: () => request('GET', '/interviews/quality-metrics'),
    checkNoteQuality: (body: { interviewId: string; notes: string; interviewerId?: string }) => request('POST', '/interviews/note-quality-checker', body),
    getTrainingRecommendations: (interviewerId: string) => request('GET', `/interviews/training-recommendations/${interviewerId}`),
    // Diversity & compliance
    getCandidateNPS: (params?: { period?: string }) => request('GET', `/interviews/candidate-nps${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getDiversityAudit: (params?: { period?: string; requisitionId?: string }) => request('GET', `/interviews/diversity-audit${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Intelligence
    getCrossSignalAggregation: (candidateId: string) => request('GET', `/interviews/cross-signal-aggregation/${candidateId}`),
    generatePreInterviewBriefing: (body: { interviewerId: string; candidateId: string; interviewId: string }) => request('POST', '/interviews/pre-interview-briefing', body),
    getPostInterviewActions: (interviewId: string) => request('GET', `/interviews/post-interview-actions/${interviewId}`),
    detectAntiCheat: (body: { interviewId: string; sessionData?: unknown }) => request('POST', '/interviews/anti-cheat-detection', body),
    getVelocityMetrics: (params?: { requisitionId?: string; period?: string }) => request('GET', `/interviews/velocity-metrics${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getJobFitProbability: (candidateId: string, requisitionId?: string) => request('GET', `/interviews/job-fit-probability/${candidateId}${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    getMultiInterviewerSynthesis: (candidateId: string) => request('GET', `/interviews/multi-interviewer-synthesis/${candidateId}`),
    getRecordingAnalytics: (interviewId: string) => request('GET', `/interviews/recording-analytics/${interviewId}`),
    getSentimentTracker: (interviewId: string) => request('GET', `/interviews/sentiment-tracker/${interviewId}`),
    getCompetencyGapAnalysis: (candidateId: string, requisitionId?: string) => request('GET', `/interviews/competency-gap-analysis/${candidateId}${requisitionId ? `?requisitionId=${requisitionId}` : ''}`),
    evaluateStorytelling: (body: { interviewId: string; candidateResponse: string; question: string }) => request('POST', '/interviews/storytelling-evaluator', body),
    generateDebriefSummary: (body: { interviewId: string; panelNotes: unknown[] }) => request('POST', '/interviews/panel-debrief-summary', body),
    getROI: (params?: { period?: string }) => request('GET', `/interviews/roi-calculator${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
  },

  mobilityP2: {
    // Career pathways
    getCareerPathways: (employeeId: string) => request('GET', `/mobility/career-pathways/${employeeId}`),
    getSkillsGap: (employeeId: string, targetRoleId?: string) => request('GET', `/mobility/skills-gap/${employeeId}${targetRoleId ? `?targetRoleId=${targetRoleId}` : ''}`),
    getCareerTrajectorySimulation: (employeeId: string, pathChoice?: string) => request('GET', `/mobility/career-trajectory-simulation/${employeeId}${pathChoice ? `?pathChoice=${pathChoice}` : ''}`),
    getLearningPaths: (employeeId: string, targetRole?: string) => request('GET', `/mobility/learning-paths/${employeeId}${targetRole ? `?targetRole=${encodeURIComponent(targetRole)}` : ''}`),
    getCareerDevelopmentPlan: (employeeId: string) => request('GET', `/mobility/career-development-plans/${employeeId}`),
    getCareerMilestones: (employeeId: string) => request('GET', `/mobility/career-milestones/${employeeId}`),
    // Succession & leadership
    getSuccessionPlanning: (params?: { department?: string; roleLevel?: string }) => request('GET', `/mobility/succession-planning${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getLeadershipPipeline: (params?: { department?: string; level?: string }) => request('GET', `/mobility/leadership-pipeline${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Mobility scoring & marketplace
    getMobilityScore: (employeeId: string) => request('GET', `/mobility/talent-mobility-score/${employeeId}`),
    getCrossFunctionalMarketplace: (params?: { employeeId?: string; timeCommitment?: string }) => request('GET', `/mobility/cross-functional-marketplace${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getInternalMarketplace: (params?: { skill?: string; team?: string; type?: string; employeeId?: string }) => request('GET', `/mobility/internal-marketplace${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getInternalSearch: (params?: { skills?: string; department?: string }) => request('GET', `/mobility/internal-search${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Boomerang & alumni
    getBoomerangTracking: () => request('GET', '/mobility/boomerang-tracking'),
    getAlumniRehirePipeline: () => request('GET', '/mobility/alumni-rehire-pipeline'),
    getExitToReengagement: (params?: { period?: string }) => request('GET', `/mobility/exit-to-reengagement${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Gig & projects
    getGigProjectMatching: (employeeId: string) => request('GET', `/mobility/gig-project-matching/${employeeId}`),
    getSkillsAdjacencyRecommendations: (employeeId: string) => request('GET', `/mobility/skills-adjacency-recommender/${employeeId}`),
    getSideProjectActivation: (params?: { employeeId?: string; skill?: string }) => request('GET', `/mobility/side-project-activator${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Risk & retention
    getFlightRisk: (params?: { department?: string; threshold?: string }) => request('GET', `/mobility/flight-risk${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getTalentHoardingDetector: (params?: { period?: string }) => request('GET', `/mobility/talent-hoarding-detector${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getInternalBiasDetector: (params?: { period?: string }) => request('GET', `/mobility/internal-bias-detector${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Workforce intelligence
    getSupplyDemandForecast: (params?: { horizon?: string; skill?: string }) => request('GET', `/mobility/supply-demand-forecast${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getInvisibleWorkforceMapper: () => request('GET', '/mobility/invisible-workforce-mapper'),
    getSkillsUtilization: (employeeId: string) => request('GET', `/mobility/skills-utilization/${employeeId}`),
    getMobilityROI: (params?: { period?: string }) => request('GET', `/mobility/mobility-roi${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getMobilityNPS: (params?: { period?: string }) => request('GET', `/mobility/mobility-nps${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getPerformanceCorrelation: () => request('GET', '/mobility/performance-correlation'),
    // Employee profile & aspirations
    getEmployeeInterests: (employeeId: string) => request('GET', `/mobility/employee-interests/${employeeId}`),
    updateEmployeeInterests: (employeeId: string, body: unknown) => request('POST', `/mobility/employee-interests/${employeeId}`, body),
    captureAspirations: (body: { employeeId: string; aspirations: string[]; timeline?: string; constraints?: unknown }) => request('POST', '/mobility/aspiration-capture', body),
    getMentorshipMatches: (employeeId: string, goal?: string) => request('GET', `/mobility/mentorship-matching/${employeeId}${goal ? `?goal=${encodeURIComponent(goal)}` : ''}`),
    getPromotionReadiness: (employeeId: string, targetLevel?: string) => request('GET', `/mobility/promotion-readiness/${employeeId}${targetLevel ? `?targetLevel=${encodeURIComponent(targetLevel)}` : ''}`),
    getRoleExpansionSuggestions: (employeeId: string) => request('GET', `/mobility/role-expansion-suggester/${employeeId}`),
    getRedeploymentRecommendations: (params?: { department?: string; triggerEvent?: string }) => request('GET', `/mobility/redeployment-recommendations${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getTeamCompositionOptimization: (params?: { teamId?: string; projectType?: string }) => request('GET', `/mobility/team-composition-optimizer${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getManagerMobilitySupport: (managerId?: string) => request('GET', `/mobility/manager-mobility-support${managerId ? `?managerId=${managerId}` : ''}`),
    getCrossBorderMobility: (params?: { employeeId?: string; targetCountry?: string }) => request('GET', `/mobility/cross-border-mobility${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
  },

  integrationsP2: {
    // Health & monitoring
    getHealthMonitor: () => request('GET', '/integrations/health-monitor'),
    getAPIGateway: () => request('GET', '/integrations/api-gateway'),
    getRealtimeStream: () => request('GET', '/integrations/realtime-stream'),
    // Data transformation
    getDataTransformation: (integrationName?: string) => request('GET', `/integrations/data-transformation${integrationName ? `?integrationName=${encodeURIComponent(integrationName)}` : ''}`),
    createTransformationMapping: (body: { integrationName: string; sourceField: string; targetField: string; transformation: string }) => request('POST', '/integrations/data-transformation/mapping', body),
    // Webhooks
    getWebhooks: () => request('GET', '/integrations/webhook-engine'),
    registerWebhook: (body: { url: string; events: string[]; secret?: string }) => request('POST', '/integrations/webhook-engine', body),
    // AI models
    getAIModelConnectors: () => request('GET', '/integrations/ai-model-connector'),
    testAIModelConnection: (body: { provider: string; model: string }) => request('POST', '/integrations/ai-model-connector/test', body),
    // Decision latency
    getDecisionLatencyViolations: (params?: { requisitionId?: string }) => request('GET', `/integrations/decision-latency-enforcer${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    configureDecisionSLA: (body: { stage: string; slaHours: number; escalationChain: string[]; reprioritizationRule?: string }) => request('POST', '/integrations/decision-latency-enforcer/configure', body),
    // NL command interface
    sendNLCommand: (body: { command: string; userId?: string; platform?: string; context?: unknown }) => request('POST', '/integrations/nl-command-interface', body),
    getNLCommandHistory: (params?: { userId?: string; platform?: string }) => request('GET', `/integrations/nl-command-interface/history${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    // Legacy & migration
    getLegacyAdapters: () => request('GET', '/integrations/legacy-adapter'),
    createMigrationPlan: (body: { sourceSystem: string; targetSystem: string; dataTypes: string[]; scheduledAt?: string }) => request('POST', '/integrations/zero-downtime-migration', body),
    // Partners & testing
    getPartnerMarketplace: (params?: { category?: string }) => request('GET', `/integrations/partner-marketplace${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    getIntegrationTestResults: (integrationName?: string) => request('GET', `/integrations/testing-framework${integrationName ? `?integrationName=${encodeURIComponent(integrationName)}` : ''}`),
    runIntegrationTests: (body: { integrationName: string; testSuite?: string }) => request('POST', '/integrations/testing-framework/run', body),
    // SSO
    getSSOConfig: () => request('GET', '/integrations/sso-config'),
    updateSSOConfig: (body: { provider: string; protocol: string; entityId: string; acsUrl: string; idpMetadataUrl: string; jitProvisioning?: boolean }) => request('POST', '/integrations/sso-config', body),
    // Background checks
    getBackgroundChecks: (params?: { candidateId?: string; status?: string }) => request('GET', `/integrations/background-check-orchestration${params ? `?${new URLSearchParams(params as Record<string,string>)}` : ''}`),
    initiateBackgroundCheck: (body: { candidateId: string; packageType?: string; provider?: string; urgency?: string }) => request('POST', '/integrations/background-check-orchestration', body),
    // Calendar sync
    getCalendarSync: () => request('GET', '/integrations/calendar-sync'),
  },
};

export const offers = {
  list: (params?: PaginationParams) => get<any>('/offers', params),
  create: (data: unknown) => post<any>('/offers', data),
  get: (id: string) => get<any>(`/offers/${id}`),
  update: (id: string, data: unknown) => post<any>(`/offers/${id}`, data),
  patch: (id: string, data: unknown) => request<any>('PATCH', `/offers/${id}`, data),
  approve: (id: string, data?: unknown) => post<any>(`/offers/${id}/approve`, data),
  checkCompliance: (id: string) => post<any>(`/offers/${id}/compliance-check`, {}),
  retract: (id: string) => post<any>(`/offers/${id}/retract`, {}),
  getCompensationBenchmark: () => get<any>('/offers/compensation/benchmark'),
  recommendCompensation: (data: unknown) => post<any>('/offers/compensation/recommend', data),
};

export const offersP2 = {
  negotiate: (id: string, data: unknown) => post<any>(`/offers/${id}/negotiate`, data),
  getAcceptanceProbability: (id: string) => get<any>(`/offers/${id}/acceptance-probability`),
  extendDeadline: (id: string, data: unknown) => post<any>(`/offers/${id}/extend-deadline`, data),
};
