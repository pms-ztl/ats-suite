export interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  status: "draft" | "open" | "in_progress" | "filled" | "closed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  hiringManager: string;
  recruiter: string;
  createdAt: string;
  updatedAt: string;
  targetHireDate: string;
  candidateCount: number;
  pipelineStage: string;
  jobType: "full_time" | "part_time" | "contract" | "intern";
  salary: { min: number; max: number; currency: string };
  skills: string[];
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  currentTitle: string;
  currentCompany: string;
  location: string;
  status: "new" | "screening" | "interview" | "offer" | "hired" | "rejected" | "withdrawn";
  appliedDate: string;
  source: string;
  resumeUrl?: string;
  skills: string[];
  experience: number;
  matchScore?: number;
  aiConfidence?: number;
  requisitionId: string;
  stage: string;
  notes: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  outcome: "success" | "failure" | "warning";
}

export interface BiasMetric {
  id: string;
  category: string;
  protectedGroup: string;
  referenceGroup: string;
  selectionRate: number;
  referenceRate: number;
  adverseImpactRatio: number;
  fourFifthsPass: boolean;
  timestamp: string;
  stage: string;
  requisitionId?: string;
  sampleSize: number;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  description: string;
  type: string;
  jurisdiction: string;
  status: "active" | "draft" | "archived";
  lastUpdated: string;
  createdBy: string;
  rules: PolicyRule[];
  enforcementLevel: "block" | "warn" | "log";
}

export interface PolicyRule {
  id: string;
  condition: string;
  action: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: string;
  status: "active" | "shadow" | "deprecated" | "frozen";
  accuracy: number;
  fairnessScore: number;
  lastEvaluated: string;
  deployedAt: string;
  owner: string;
  description: string;
  driftScore: number;
}

export interface AIDecision {
  id: string;
  modelId: string;
  modelName: string;
  candidateId: string;
  requisitionId: string;
  decision: string;
  confidence: number;
  reasoning: string[];
  reasonCodes: string[];
  humanOverride?: { overriddenBy: string; reason: string; timestamp: string };
  timestamp: string;
  explanationType: string;
}

export interface HumanReviewItem {
  id: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected" | "escalated";
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  requisitionTitle: string;
  aiDecision: string;
  aiConfidence: number;
  reasoning: string[];
  assignedTo?: string;
  slaDeadline: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  type: "phone_screen" | "technical" | "behavioral" | "panel" | "final";
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  scheduledAt: string;
  duration: number;
  interviewers: string[];
  location: string;
  feedbackSubmitted: boolean;
  overallScore?: number;
}

export interface Offer {
  id: string;
  candidateId: string;
  candidateName: string;
  requisitionId: string;
  requisitionTitle: string;
  status: "draft" | "pending_approval" | "approved" | "sent" | "accepted" | "declined" | "retracted";
  salary: number;
  currency: string;
  startDate: string;
  expiresAt: string;
  createdAt: string;
  approvers: { name: string; status: string; timestamp?: string }[];
}

export interface DashboardKPI {
  label: string;
  value: number | string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  sparklineData?: number[];
}

export interface SecurityEvent {
  id: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  description: string;
  timestamp: string;
  source: string;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export interface ConsentRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  type: string;
  status: "granted" | "denied" | "withdrawn" | "expired";
  grantedAt: string;
  expiresAt?: string;
  version: string;
  purposes: string[];
}

export interface DataResidencyRule {
  id: string;
  jurisdiction: string;
  dataType: string;
  region: string;
  status: "active" | "pending" | "violated";
  lastVerified: string;
  compliance: boolean;
}

export interface PipelineStage {
  name: string;
  count: number;
  conversionRate: number;
  avgDays: number;
}

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: "active" | "suspended" | "trial";
  userCount: number;
  dataRegion: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department: string;
  lastActive: string;
}
