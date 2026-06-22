// lib/aurora-types.ts - Entity & enum contract for the CDC ATS UI layer.
// Enum string values are VERBATIM from the backend (brief Appendix C). Do not rename.
// NOTE: a few enums are a subset of the full Prisma enums; extend as pages are wired.

/* ---------- Enums (exact values) ---------- */
export type ScreeningResult = "PASS" | "REVIEW" | "FAIL";

export type ApplicationStage =
  | "APPLIED" | "SCREENED" | "PHONE_SCREEN" | "ASSESSMENT" | "INTERVIEW"
  | "FINAL_REVIEW" | "OFFER" | "HIRED" | "REJECTED" | "WITHDRAWN";

export type InterviewStatus =
  | "SCHEDULED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "RESCHEDULED";

export type RequisitionStatus = "DRAFT" | "OPEN" | "ON_HOLD" | "FILLED" | "CLOSED" | "CANCELLED";

export type DecisionType = "HIRE" | "REJECT" | "HOLD";
export type DecisionStatus = "PENDING_APPROVAL" | "APPROVED" | "SENT" | "ACCEPTED" | "DECLINED";

export type OfferStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED";

export type ReviewReasonCode =
  | "LOW_CONFIDENCE" | "ADVERSE_IMPACT_FLAG" | "POLICY_OVERRIDE" | "MISSING_EVIDENCE" | "CANDIDATE_APPEAL";

export type UserRole =
  | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER" | "ADMIN" | "COMPLIANCE_OFFICER" | "SUPER_ADMIN";

export type Plan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";

/* ---------- Entities (Appendix C) ---------- */
export interface CustomField { label: string; value: string; importance?: "nice" | "important" | "must" }

export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  status: RequisitionStatus;
  employmentType?: string;
  description?: string;
  requirements?: string[];          // backend stores as JSON
  requiredSkills?: string[];        // design alias for requirements (job board, etc.)
  customFields?: CustomField[];     // admin-defined label + value + importance
  niceToHave?: string[];
  inclusivityScore?: number;        // 0..100
  biasFlags?: { phrase: string; suggestion: string; severity?: string }[];
  salaryMin?: number;
  salaryMax?: number;
  openings?: number;
  candidateCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  location?: string;
  source?: string;
  requisitionId?: string;
  applicationId?: string;    // current application (for hire/reject actions)
  stage: ApplicationStage;
  aiScore?: number;          // 0..100, advisory
  confidence?: number;       // 0..1, vs 0.70 threshold
  result?: ScreeningResult;  // advisory verdict
  timeInStageDays?: number;
  resumeUrl?: string;
  appliedAt: string;
}

export interface RequirementMatch {
  requirement: string;
  met: boolean | "partial";
  evidence: string; // AI-cited, from the resume
}

export interface ScreeningVerdict {
  id?: string;
  candidateId: string;
  requisitionId: string;
  result: ScreeningResult;
  score: number;        // 0..100
  confidence: number;   // 0..1
  agent: string;        // e.g. "candidate-screener"
  summary: string;
  requirements: RequirementMatch[];
  reasoningTrace?: { step: string; detail: string }[];
  createdAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  requisitionId: string;
  round: string;
  status: InterviewStatus;
  startsAt: string;
  durationMins: number;
  panel: string[];
  mode: "VIDEO" | "ONSITE" | "PHONE";
}

export interface Decision {
  id: string;
  candidateId: string;
  requisitionId: string;
  type: DecisionType;
  status: DecisionStatus;
  aiRecommendation?: { type: DecisionType; confidence: number }; // advisory only
  decidedBy?: string; // a human; null until decided
  reasonCode?: ReviewReasonCode;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  candidateId: string;
  requisitionId: string;
  reasonCode: ReviewReasonCode;
  slaDueAt: string;
  verdict: ScreeningVerdict;
  assignedTo?: string;
}

export interface Offer {
  id: string;
  candidateId: string;
  requisitionId: string;
  status: OfferStatus;
  baseSalary: number;
  signingBonus?: number;
  equity?: string;
  startDate: string;
  approvalChain: { name: string; role: UserRole; state: "done" | "current" | "wait" }[];
  aiDrafted: boolean;
}

export interface FairnessMetric {
  group: string;
  selectionRate: number;
  impactRatio: number; // vs 0.80 four-fifths threshold
  flagged: boolean;
}
