// lib/api.ts - typed data-access layer for the Aurora (Claude Design) pages.
// Each function calls the real api-client and maps the response to the design's
// view-model types. Functions are added here as each exact page is ported.
import { api } from "./api-client";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch } from "./types";

/* ---------- mappers (real API shape -> design view-model) ---------- */
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
    candidateId: s?.candidate?.name || [s?.candidate?.firstName, s?.candidate?.lastName].filter(Boolean).join(" ") || s?.candidateId || "Candidate",
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

/* ---------- Screening (AI advisory) ---------- */
// GET /api/screening
export async function listScreening(): Promise<ScreeningVerdict[]> {
  const res: any = await api.screening.listScreenings({ page: 1, pageSize: 100 });
  const rows = res?.data ?? res?.items ?? res ?? [];
  return (Array.isArray(rows) ? rows : []).map(toVerdict);
}

// GET /api/screening/:id
export async function getVerdict(id: string): Promise<ScreeningVerdict> {
  const res: any = await api.screening.getScreening(id);
  return toVerdict(res?.data ?? res);
}
