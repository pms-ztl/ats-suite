"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  User, Briefcase, Star, AlertTriangle, Calendar, DollarSign,
  ThumbsUp, ThumbsDown, Clock,
} from "lucide-react";
import { AgentReasoningTrace, type AgentStep } from "./agent-reasoning-trace";

interface HITLPayloadRendererProps {
  type: string;
  payload: Record<string, unknown>;
}

function renderByType(type: string, payload: Record<string, unknown>) {
  switch (type) {
    case "rejection_review":
      return <ScreeningReviewPayload payload={payload} />;
    case "scheduling_review":
      return <SchedulingReviewPayload payload={payload} />;
    case "offer_approval":
      return <OfferApprovalPayload payload={payload} />;
    case "interview_scorecard":
    case "review":
      if (payload.scorecard) return <InterviewScorecardPayload payload={payload} />;
      return <GenericPayload payload={payload} />;
    default:
      return <GenericPayload payload={payload} />;
  }
}

export function HITLPayloadRenderer({ type, payload }: HITLPayloadRendererProps) {
  // When the underlying agent ran the ReAct loop, its step trace rides along on
  // the payload — surface it so reviewers can see the AI's reasoning.
  const trace = Array.isArray(payload.agentTrace) ? (payload.agentTrace as AgentStep[]) : null;
  const toolsUsed = Array.isArray(payload.toolsUsed) ? (payload.toolsUsed as string[]) : undefined;
  return (
    <div className="space-y-4">
      {renderByType(type, payload)}
      {trace && <AgentReasoningTrace steps={trace} toolsUsed={toolsUsed} />}
    </div>
  );
}

// --- Screening / Rejection Review ---
function ScreeningReviewPayload({ payload }: { payload: Record<string, unknown> }) {
  const candidate = payload.candidateName as string | undefined;
  const requisition = payload.requisitionTitle as string | undefined;
  const score = payload.overallScore as number | undefined;
  const recommendation = payload.recommendation as string | undefined;
  const summary = payload.summary as string | undefined;
  const concerns = payload.concerns as string[] | undefined;
  const dimensions = payload.dimensions as Array<{ name: string; score: number; notes?: string }> | undefined;

  return (
    <div className="space-y-4">
      {/* Candidate overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" /> Candidate Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Candidate</p>
              <p className="font-medium">{candidate ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Requisition</p>
              <p className="font-medium">{requisition ?? "Unknown"}</p>
            </div>
          </div>
          {score !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Overall Score</span>
                <span className={cn(
                  "text-sm font-bold",
                  score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-rose-600"
                )}>
                  {score}/100
                </span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
          )}
          {recommendation && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Recommendation:</span>
              <Badge variant={recommendation === "reject" ? "destructive" : recommendation === "approve" ? "default" : "secondary"}>
                {recommendation === "reject" ? <ThumbsDown className="h-3 w-3 mr-1" /> : <ThumbsUp className="h-3 w-3 mr-1" />}
                {recommendation}
              </Badge>
            </div>
          )}
          {summary && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Summary</p>
              <p className="text-sm bg-muted/50 rounded-md p-3">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Concerns */}
      {concerns && concerns.length > 0 && (
        <Card className="border-amber-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {concerns.map((concern, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {concern}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Dimension scores */}
      {dimensions && dimensions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" /> Scoring Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dimensions.map((dim, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{dim.name}</span>
                  <span className={cn(
                    "text-xs font-bold",
                    dim.score >= 80 ? "text-emerald-600" : dim.score >= 60 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {dim.score}/100
                  </span>
                </div>
                <Progress value={dim.score} className="h-1.5" />
                {dim.notes && <p className="text-xs text-muted-foreground mt-0.5">{dim.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Scheduling Review ---
function SchedulingReviewPayload({ payload }: { payload: Record<string, unknown> }) {
  const slots = payload.proposedSlots as Array<{ time: string; score?: number; reason?: string }> | undefined;
  const candidate = payload.candidateName as string | undefined;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Proposed Interview Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidate && (
            <p className="text-sm mb-3">
              <span className="text-muted-foreground">Candidate:</span>{" "}
              <span className="font-medium">{candidate}</span>
            </p>
          )}
          {slots && slots.length > 0 ? (
            <div className="space-y-2">
              {slots.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{slot.time}</p>
                    {slot.reason && <p className="text-xs text-muted-foreground">{slot.reason}</p>}
                  </div>
                  {slot.score !== undefined && (
                    <Badge variant={slot.score >= 80 ? "default" : "secondary"}>
                      {slot.score}% match
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No slots proposed.</p>
          )}
        </CardContent>
      </Card>
      {/* Render remaining payload fields generically */}
      <GenericPayload payload={omitKeys(payload, ["proposedSlots", "candidateName"])} />
    </div>
  );
}

// --- Offer Approval ---
function OfferApprovalPayload({ payload }: { payload: Record<string, unknown> }) {
  const requisitionTitle = payload.requisitionTitle as string | undefined;
  const department = payload.department as string | undefined;
  const baseSalary = payload.baseSalary as number | undefined;
  const equity = payload.equity as string | undefined;
  const signingBonus = payload.signingBonus as number | undefined;
  const annualBonus = payload.annualBonus as number | undefined;
  const totalCompensation = payload.totalCompensation as number | undefined;
  const currency = (payload.currency as string) ?? "USD";
  const justification = payload.justification as string | undefined;
  const compBandPosition = payload.compBandPosition as string | undefined;
  const marketComparison = payload.marketComparison as string | undefined;
  const benefits = payload.benefits as string[] | undefined;
  const startDate = payload.startDate as string | undefined;
  const expiresInDays = payload.expiresInDays as number | undefined;
  const approvalChain = payload.approvalChain as Array<{ role: string; reason: string }> | undefined;
  const candidateExpectation = payload.candidateExpectation as number | undefined;

  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);

  const bandPositionColor = (pos: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
    if (!pos) return "secondary";
    if (pos.includes("above_max")) return "destructive";
    if (pos.includes("above_mid") || pos.includes("at_max")) return "default";
    if (pos.includes("at_mid") || pos.includes("below_mid")) return "secondary";
    return "outline";
  };

  const bandPositionLabel = (pos: string | undefined) =>
    pos ? pos.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Unknown";

  const handledKeys = [
    "candidateId", "requisitionId", "applicationId", "requisitionTitle", "department",
    "baseSalary", "equity", "signingBonus", "annualBonus", "totalCompensation",
    "currency", "justification", "compBandPosition", "marketComparison",
    "benefits", "startDate", "expiresInDays", "approvalChain", "candidateExpectation",
    "hiringManagerNotes",
  ];

  return (
    <div className="space-y-4">
      {/* Salary and Total Comp */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Offer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Role</p>
              <p className="font-medium">{requisitionTitle ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Department</p>
              <p className="font-medium">{department ?? "Unknown"}</p>
            </div>
          </div>

          {baseSalary !== undefined && (
            <div>
              <p className="text-muted-foreground text-xs mb-1">Base Salary</p>
              <p className="text-2xl font-bold">{fmt(baseSalary)}</p>
            </div>
          )}

          {/* Comp breakdown */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            {signingBonus !== undefined && signingBonus > 0 && (
              <div className="rounded-lg border p-2 text-center">
                <p className="text-muted-foreground text-xs">Signing Bonus</p>
                <p className="font-semibold">{fmt(signingBonus)}</p>
              </div>
            )}
            {annualBonus !== undefined && annualBonus > 0 && (
              <div className="rounded-lg border p-2 text-center">
                <p className="text-muted-foreground text-xs">Annual Bonus</p>
                <p className="font-semibold">{fmt(annualBonus)}</p>
              </div>
            )}
            {equity && (
              <div className="rounded-lg border p-2 text-center">
                <p className="text-muted-foreground text-xs">Equity</p>
                <p className="font-semibold text-xs">{equity}</p>
              </div>
            )}
          </div>

          {totalCompensation !== undefined && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Compensation</span>
                <span className="text-lg font-bold">{fmt(totalCompensation)}</span>
              </div>
            </div>
          )}

          {/* Comp Band Position */}
          {compBandPosition && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Comp Band Position:</span>
              <Badge variant={bandPositionColor(compBandPosition)}>
                {bandPositionLabel(compBandPosition)}
              </Badge>
            </div>
          )}

          {candidateExpectation !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground text-xs">Candidate Expectation:</span>
              <span className="font-medium">{fmt(candidateExpectation)}</span>
              {baseSalary !== undefined && (
                <Badge variant={baseSalary >= candidateExpectation ? "default" : "destructive"}>
                  {baseSalary >= candidateExpectation ? "Met" : "Below"}
                </Badge>
              )}
            </div>
          )}

          {startDate && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs">Start Date: </span>
              <span className="font-medium">{startDate}</span>
            </div>
          )}
          {expiresInDays !== undefined && (
            <div className="text-sm">
              <span className="text-muted-foreground text-xs">Offer Expires In: </span>
              <span className="font-medium">{expiresInDays} days</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Justification */}
      {justification && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Justification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-muted/50 rounded-md p-3">{justification}</p>
          </CardContent>
        </Card>
      )}

      {/* Market Comparison */}
      {marketComparison && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" /> Market Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm bg-muted/50 rounded-md p-3">{marketComparison}</p>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      {benefits && benefits.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" /> Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {benefits.map((benefit, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Approval Chain */}
      {approvalChain && approvalChain.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
              <User className="h-4 w-4" /> Approval Chain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {approvalChain.map((approver, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{approver.role}</p>
                    <p className="text-xs text-muted-foreground">{approver.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <GenericPayload payload={omitKeys(payload, handledKeys)} />
    </div>
  );
}

// --- Interview Scorecard ---
function InterviewScorecardPayload({ payload }: { payload: Record<string, unknown> }) {
  const candidateName = payload.candidateName as string | undefined;
  const requisitionTitle = payload.requisitionTitle as string | undefined;
  const interviewType = payload.interviewType as string | undefined;
  const summary = payload.summary as string | undefined;
  const durationMinutes = payload.durationMinutes as number | undefined;
  const scorecard = payload.scorecard as {
    dimensions: Array<{ name: string; score: number; evidence: string }>;
    overallRecommendation: string;
    summary: string;
  } | undefined;
  const signals = payload.signals as Array<{
    skill: string;
    evidence: string;
    rating: string;
  }> | undefined;
  const keyMoments = payload.keyMoments as Array<{
    timestamp?: string;
    description: string;
    significance: string;
  }> | undefined;

  const recommendationColor = (rec: string) => {
    if (rec === "STRONG_YES" || rec === "YES") return "text-emerald-600";
    if (rec === "NEUTRAL") return "text-amber-600";
    return "text-rose-600";
  };

  const recommendationVariant = (rec: string): "default" | "destructive" | "secondary" => {
    if (rec === "STRONG_YES" || rec === "YES") return "default";
    if (rec === "NEUTRAL") return "secondary";
    return "destructive";
  };

  const ratingColor = (rating: string) => {
    if (rating === "strong") return "text-emerald-600 bg-emerald-50";
    if (rating === "adequate") return "text-amber-600 bg-amber-50";
    if (rating === "weak") return "text-rose-600 bg-rose-50";
    return "text-gray-500 bg-gray-50";
  };

  const scoreColor = (score: number) => {
    if (score >= 4) return "text-emerald-600";
    if (score >= 3) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="space-y-4">
      {/* Interview overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" /> Interview Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Candidate</p>
              <p className="font-medium">{candidateName ?? "Unknown"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Position</p>
              <p className="font-medium">{requisitionTitle ?? "Unknown"}</p>
            </div>
            {interviewType && (
              <div>
                <p className="text-muted-foreground text-xs">Interview Type</p>
                <p className="font-medium capitalize">{interviewType}</p>
              </div>
            )}
            {durationMinutes !== undefined && (
              <div>
                <p className="text-muted-foreground text-xs">Duration</p>
                <p className="font-medium">{durationMinutes} minutes</p>
              </div>
            )}
          </div>
          {scorecard && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Recommendation:</span>
              <Badge variant={recommendationVariant(scorecard.overallRecommendation)}>
                {scorecard.overallRecommendation === "STRONG_YES" || scorecard.overallRecommendation === "YES" ? (
                  <ThumbsUp className="h-3 w-3 mr-1" />
                ) : scorecard.overallRecommendation === "NEUTRAL" ? (
                  <Clock className="h-3 w-3 mr-1" />
                ) : (
                  <ThumbsDown className="h-3 w-3 mr-1" />
                )}
                {scorecard.overallRecommendation.replace(/_/g, " ")}
              </Badge>
            </div>
          )}
          {summary && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Summary</p>
              <p className="text-sm bg-muted/50 rounded-md p-3">{summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scorecard dimensions */}
      {scorecard && scorecard.dimensions && scorecard.dimensions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" /> Scorecard Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scorecard.dimensions.map((dim, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dim.name}</span>
                  <span className={cn("text-sm font-bold", scoreColor(dim.score))}>
                    {dim.score}/5
                  </span>
                </div>
                <Progress value={(dim.score / 5) * 100} className="h-1.5" />
                <p className="text-xs text-muted-foreground">{dim.evidence}</p>
              </div>
            ))}
            {scorecard.summary && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Scorecard Summary</p>
                <p className="text-sm">{scorecard.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Signals */}
      {signals && signals.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Skill Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {signals.map((signal, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className={cn("shrink-0 text-xs", ratingColor(signal.rating))}>
                    {signal.rating}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{signal.skill}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{signal.evidence}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Moments */}
      {keyMoments && keyMoments.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Key Moments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {keyMoments.map((moment, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className={cn(
                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                    moment.significance === "positive" ? "bg-emerald-500" :
                    moment.significance === "negative" ? "bg-rose-500" : "bg-gray-400"
                  )} />
                  <div className="flex-1">
                    <p>{moment.description}</p>
                    {moment.timestamp && (
                      <p className="text-xs text-muted-foreground">{moment.timestamp}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --- Generic fallback ---
function GenericPayload({ payload }: { payload: Record<string, unknown> }) {
  const entries = Object.entries(payload).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> Payload Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 text-sm">
              <span className="text-muted-foreground text-xs font-mono min-w-[120px] pt-0.5">
                {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
              </span>
              <span className="flex-1">
                {typeof value === "object" ? (
                  <pre className="text-xs bg-muted/50 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  <span className="font-medium">{String(value)}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper to omit specific keys from a payload
function omitKeys(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!keys.includes(k)) result[k] = v;
  }
  return result;
}
