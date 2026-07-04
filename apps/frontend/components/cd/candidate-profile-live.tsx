"use client";
// components/cd/candidate-profile-live.tsx
// Wires the byte-exact CD CandidateProfile (components/cd/screens/CandidateProfile)
// to the gateway: getCandidate(id) drives the identity + snapshot, getVerdict(id)
// drives the AI screening verdict zone (score, confidence, per-requirement findings),
// listCandidates() supplies the prev/next ring, listRequisitions() the applied role.
// Parsed-resume fields are derived from the real candidate record; scorecards /
// activity are honestly empty until those endpoints exist. Blind mode + prev/next
// are local. Full-height screen (rendered full-bleed).
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CandidateProfile } from "./screens/CandidateProfile";
import { CandidateSummaryExport } from "@/components/shared/candidate-summary-export";
import { HireActions } from "@/components/shared/hire-actions";
import { useData } from "@/lib/use-data";
import { getCandidate, getVerdict, listCandidates, listRequisitions, getCandidateInterviewScores } from "@/lib/api";
import type { Candidate as GwCandidate, ScreeningVerdict, ScreeningResult, RequirementMatch, Requisition } from "@/lib/types";
import type { CandidateProfileData, CandStage, Candidate as CdCandidate, ProfileVerdict, ReqBreakdown, ParsedResume, ProfileDimension } from "./types";

type Kind = "pass" | "review" | "fail";
const KIND: Record<ScreeningResult, Kind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<Kind, { band: string; rec: string }> = {
  pass: { band: "Strong match", rec: "advance" },
  review: { band: "Strong potential", rec: "human review" },
  fail: { band: "Below the bar", rec: "decline" },
};
const reqState = (met: RequirementMatch["met"]): Kind => (met === true ? "pass" : met === "partial" ? "review" : "fail");

// --- Mandated alignment dimensions (spec: "technical skills match" +
// "experience relevance"). There is NO dedicated dimension field on the real
// screener verdict, so we DERIVE each dimension honestly from the findings that
// pertain to it: classify each requirement by keyword, then compute a met-ratio
// over ONLY the findings that map to the dimension. If nothing maps, the
// dimension is `scored: false` (honest "Not scored") — we never invent a number.
const TECH_HINTS = /\b(tech|technical|engineer|develop|program|code|coding|softwar|architect|system|api|sql|data|ml|ai|cloud|devops|infrastructure|framework|language|stack|algorithm|design pattern|tool|platform|proficien|skill)\b/i;
const EXP_HINTS = /\b(experien|year|yrs|senior|junior|lead|manage|leadership|track record|background|tenure|history|prior|previous|domain|industry|scale|scaling|mentor|ownership)\b/i;

function classifyReq(text: string): "technical" | "experience" | null {
  const t = (text || "").toLowerCase();
  const isExp = EXP_HINTS.test(t);
  const isTech = TECH_HINTS.test(t);
  // Experience cues are more specific; prefer them when both fire.
  if (isExp && !isTech) return "experience";
  if (isTech && !isExp) return "technical";
  if (isExp && isTech) return "experience";
  return null;
}

// Build a single dimension from the requirement findings mapped to it. Only real
// met/partial/unmet states feed the ratio; partial counts as half.
function deriveDimension(
  key: "technical" | "experience",
  label: string,
  reqs: RequirementMatch[],
): ProfileDimension {
  const mine = reqs.filter((r) => classifyReq(r.requirement) === key);
  if (mine.length === 0) return { key, label, scored: false };
  const weight = (m: RequirementMatch["met"]) => (m === true ? 1 : m === "partial" ? 0.5 : 0);
  const sum = mine.reduce((acc, r) => acc + weight(r.met), 0);
  const pct = Math.round((sum / mine.length) * 100);
  const metCount = mine.filter((r) => r.met === true || r.met === "partial").length;
  const state: Kind = pct >= 70 ? "pass" : pct >= 40 ? "review" : "fail";
  return { key, label, scored: true, pct, met: metCount, total: mine.length, state };
}

function deriveDimensions(reqs: RequirementMatch[]): ProfileDimension[] {
  return [
    deriveDimension("technical", "Technical skills match", reqs),
    deriveDimension("experience", "Experience relevance", reqs),
  ];
}

const STAGE_META: Record<string, { label: string; color: string }> = {
  APPLIED: { label: "Applied", color: "var(--ink-3)" },
  SCREENED: { label: "Screening", color: "var(--info)" },
  PHONE_SCREEN: { label: "Phone screen", color: "var(--info)" },
  ASSESSMENT: { label: "Assessment", color: "var(--ai)" },
  INTERVIEW: { label: "Interview", color: "var(--ai)" },
  TECHNICAL_ROUND: { label: "Technical round", color: "var(--ai)" },
  HR_ROUND: { label: "HR round", color: "var(--brand-2)" },
  FINAL_REVIEW: { label: "Final review", color: "var(--brand)" },
  OFFER: { label: "Offer", color: "var(--brand)" },
  HIRED: { label: "Hired", color: "var(--ok)" },
  REJECTED: { label: "Rejected", color: "var(--danger)" },
  WITHDRAWN: { label: "Withdrawn", color: "var(--ink-3)" },
};
const STAGES: CandStage[] = Object.entries(STAGE_META).map(([id, m]) => ({ id, label: m.label, color: m.color }));

const initials = (name: string) => {
  const p = (name || "").trim().split(/\s+/).filter(Boolean);
  return p.length ? ((p[0][0] || "") + (p.length > 1 ? p[p.length - 1][0] || "" : "")).toUpperCase() : "?";
};
const fmtDate = (iso?: string) => {
  if (!iso) return "Not set";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "Not set" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

export function CandidateProfileLive() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const cand = useData<GwCandidate>(() => getCandidate(id), [id]);
  const verdict = useData<ScreeningVerdict>(() => getVerdict(id), [id]);
  const roster = useData<GwCandidate[]>(listCandidates, []);
  const reqs = useData<Requisition[]>(listRequisitions, []);
  // Real interview scores for the intelligent candidate-summary export (honest-empty).
  const ivScores = useData<string[]>(() => getCandidateInterviewScores(id), [id]);
  const [blind, setBlind] = useState(false);

  const list = roster.data ?? [];
  const idx = useMemo(() => list.findIndex((x) => x.id === id), [list, id]);

  // The byte-exact screen has no loading/error state; gate here.
  if (cand.loading) return null;
  if (cand.error || !cand.data) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center", padding: 40 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <div style={{ fontSize: "var(--fs-lg)", fontWeight: 700, marginBottom: 6 }}>Candidate not found</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)", marginBottom: 16 }}>We could not load this candidate.</div>
          <button onClick={cand.reload} style={{ padding: "8px 16px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>Try again</button>
        </div>
      </div>
    );
  }

  const c = cand.data;
  const reqTitle = (reqs.data ?? []).find((r) => r.id === c.requisitionId)?.title ?? "Applicant";
  const v = verdict.data;
  const kind: Kind = v ? KIND[v.result] ?? "review" : "review";

  const profileVerdict: ProfileVerdict = v
    ? {
        score: v.score ?? 0,
        band: BAND[kind].band,
        summary: v.summary || `Recommends ${BAND[kind].rec}. AI is advisory; a human decides.`,
        confidence: v.confidence ?? 0,
        requirements: (v.requirements ?? []).map((r, i): ReqBreakdown => ({
          id: String(i), label: r.requirement, custom: false, state: reqState(r.met), note: r.evidence || "",
        })),
        strengths: v.strengths ?? [],
        missing: v.missing ?? [],
        // Mandated alignment dimensions, derived from the REAL requirement findings.
        dimensions: deriveDimensions(v.requirements ?? []),
      }
    : { score: 0, band: "Not screened yet", summary: "This candidate has not been screened yet. Open screening to produce an AI verdict.", confidence: 0, requirements: [], strengths: [], missing: [], dimensions: deriveDimensions([]) };

  const parsed: ParsedResume = {
    fields: [
      { k: "Full name", v: c.name, c: 1 },
      { k: "Email", v: c.email || "Not provided", c: c.email ? 0.98 : 0.4 },
      { k: "Phone", v: c.phone || "Not provided", c: c.phone ? 0.95 : 0.4 },
      { k: "Location", v: c.location || "Not provided", c: c.location ? 0.9 : 0.4 },
      { k: "Source", v: c.source || "Direct", c: 0.95 },
      { k: "Applied", v: fmtDate(c.appliedAt), c: 1 },
    ],
    // Real parsed-resume skills (from parsedSummary.skills); honest-empty otherwise.
    skills: (c.skills ?? []).map((n) => ({ n, c: 0.9 })),
  };

  const cdCandidate: CdCandidate = {
    id: c.id, ini: initials(c.name), name: c.name, role: reqTitle,
    loc: c.location ?? "Location not set", reqId: c.requisitionId ?? "",
    stage: c.stage, st: v ? kind : "pending", score: c.aiScore ?? v?.score ?? 0,
    match: "", source: c.source ?? "Direct", days: c.timeInStageDays ?? 0,
  };

  const data: CandidateProfileData = {
    candidate: cdCandidate,
    applied: fmtDate(c.appliedAt),
    email: c.email || "Not provided",
    phone: "Not provided",
    verdict: profileVerdict,
    scorecards: [],
    parsed,
    activity: [],
    notes: [],
    nextSteps: [
      { icon: "scan", title: "Open the AI screening verdict", detail: "Review the requirement-by-requirement match" },
      { icon: "calendar", title: "Schedule an interview", detail: "Move this candidate to the next round" },
    ],
  };

  const onNav = (dir: number) => {
    if (idx < 0 || list.length === 0) return;
    const next = list[(idx + dir + list.length) % list.length];
    if (next) router.push(`/candidates/${next.id}`);
  };

  // Module E + G — a thin action bar over the full-bleed profile: the one-click
  // Hire/Reject workflow and the professional candidate-summary export (PDF/Word).
  // The summary is the INTELLIGENT one the spec wants: contact (incl. phone), stage,
  // the AI alignment (score + band + summary + the two derived dimensions), real
  // parsed skills / experience / education, resume tags, interview scores, and the
  // requirement-backed strengths/gaps. All real data or honest-empty — no fabrication.
  const dimLines = (profileVerdict.dimensions ?? [])
    .filter((d) => d.scored)
    .map((d) => `${d.label}: ${d.pct}% (${d.met}/${d.total} requirements met)`);
  const summary = {
    name: c.name,
    email: c.email,
    phone: c.phone,
    location: c.location,
    role: reqTitle,
    stage: c.stage,
    score: profileVerdict.score || null,
    band: profileVerdict.band,
    scoreSummary: [profileVerdict.summary, ...dimLines, c.parsedSummaryText]
      .filter(Boolean)
      .join("\n"),
    skills: (parsed?.skills ?? []).map((s: any) => (typeof s === "string" ? s : s?.n ?? s?.name ?? "")).filter(Boolean),
    tags: c.tags ?? [],
    experience: c.experience ?? [],
    education: c.education ?? [],
    interviewScores: ivScores.data ?? [],
    strengths: (profileVerdict.requirements ?? []).filter((r: any) => r.state === "pass").map((r: any) => r.label),
    missing: (profileVerdict.requirements ?? []).filter((r: any) => r.state === "fail").map((r: any) => r.label),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "8px 16px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
        <CandidateSummaryExport candidate={summary} />
        <HireActions applicationId={(c as any).applicationId} stage={c.stage} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <CandidateProfile
          data={data}
          stages={STAGES}
          idx={idx >= 0 ? idx : 0}
          total={list.length || 1}
          blind={blind}
          onBack={() => router.push("/candidates")}
          onNav={onNav}
          onToggleBlind={() => setBlind((b) => !b)}
          onVerdict={() => router.push("/screening")}
          onSchedule={() => router.push("/scheduling")}
        />
      </div>
    </div>
  );
}
