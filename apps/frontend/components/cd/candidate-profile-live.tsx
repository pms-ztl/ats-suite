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
import { useData } from "@/lib/use-data";
import { getCandidate, getVerdict, listCandidates, listRequisitions } from "@/lib/api";
import type { Candidate as GwCandidate, ScreeningVerdict, ScreeningResult, RequirementMatch, Requisition } from "@/lib/types";
import type { CandidateProfileData, CandStage, Candidate as CdCandidate, ProfileVerdict, ReqBreakdown, ParsedResume } from "./types";

type Kind = "pass" | "review" | "fail";
const KIND: Record<ScreeningResult, Kind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };
const BAND: Record<Kind, { band: string; rec: string }> = {
  pass: { band: "Strong match", rec: "advance" },
  review: { band: "Strong potential", rec: "human review" },
  fail: { band: "Below the bar", rec: "decline" },
};
const reqState = (met: RequirementMatch["met"]): Kind => (met === true ? "pass" : met === "partial" ? "review" : "fail");

const STAGE_META: Record<string, { label: string; color: string }> = {
  APPLIED: { label: "Applied", color: "var(--ink-3)" },
  SCREENED: { label: "Screening", color: "var(--info)" },
  PHONE_SCREEN: { label: "Phone screen", color: "var(--info)" },
  ASSESSMENT: { label: "Assessment", color: "var(--ai)" },
  INTERVIEW: { label: "Interview", color: "var(--ai)" },
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
        requirements: (v.requirements ?? []).map((r, i, arr): ReqBreakdown => {
          const st = reqState(r.met);
          return { id: String(i), label: r.requirement, custom: false, weight: Math.round(100 / Math.max(arr.length, 1)), sub: st === "pass" ? "met" : st === "review" ? "partial" : "not met", state: st, note: "" };
        }),
      }
    : { score: 0, band: "Not screened yet", summary: "This candidate has not been screened yet. Open screening to produce an AI verdict.", confidence: 0, requirements: [] };

  const parsed: ParsedResume = {
    fields: [
      { k: "Full name", v: c.name, c: 1 },
      { k: "Email", v: c.email || "Not provided", c: c.email ? 0.98 : 0.4 },
      { k: "Location", v: c.location || "Not provided", c: c.location ? 0.9 : 0.4 },
      { k: "Source", v: c.source || "Direct", c: 0.95 },
      { k: "Applied", v: fmtDate(c.appliedAt), c: 1 },
    ],
    skills: [],
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

  return (
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
  );
}
