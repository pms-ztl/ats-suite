export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface ProxyDetectRequest {
  features: string[];
  model_id?: string;
  threshold?: number;
}

export interface ProxyDetectResponse {
  proxies: Array<{
    feature: string;
    protectedTrait: string;
    correlation: number;
    recommendation: string;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  overallRisk: string;
  timestamp: string;
}

export interface AdverseImpactRequest {
  requisitionId?: string;
  stage?: string;
  dateRange?: { from: string; to: string };
  protectedGroups?: string[];
}

export interface AdverseImpactResult {
  results: Array<{
    protectedGroup: string;
    referenceGroup: string;
    protectedRate: number;
    referenceRate: number;
    impactRatio: number;
    fourFifthsPass: boolean;
    sampleSize: number;
    statisticalSignificance: number;
  }>;
  overallCompliant: boolean;
  recommendations: string[];
  timestamp: string;
}

export interface HumanReviewSubmission {
  itemId: string;
  decision: "approve" | "reject" | "escalate";
  reason: string;
  notes?: string;
}

export interface EvidencePackRequest {
  decisionId: string;
  includeAuditTrail: boolean;
  includeModelCard: boolean;
  includeExplanation: boolean;
  format: "pdf" | "json";
}

export interface BiasAuditRequest {
  scope: string;
  auditType: string;
  includeIntersectional: boolean;
}

export interface ExplainabilityRequest {
  decisionId: string;
  format: "technical" | "plain_language" | "legal";
  role?: string;
}

export interface ScreeningRequest {
  candidateId: string;
  requisitionId: string;
  type: string;
  blindMode?: boolean;
}

export interface SchedulingRequest {
  candidateId: string;
  requisitionId: string;
  interviewers: string[];
  duration: number;
  timezone: string;
  preferences?: Record<string, unknown>;
}

export interface Screening {
  id: string;
  candidateId: string;
  candidateName?: string;
  requisitionId?: string;
  requisitionTitle?: string;
  stage: string;
  status: string;
  score?: number;
  recommendation?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ListScreeningsParams extends PaginationParams {
  applicationId?: string;
  stage?: string;
  status?: string;
}

export interface OfferRequest {
  candidateId: string;
  requisitionId: string;
  salary: number;
  currency: string;
  startDate: string;
  benefits?: Record<string, unknown>;
}
