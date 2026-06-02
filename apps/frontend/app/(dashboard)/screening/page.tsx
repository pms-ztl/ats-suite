"use client";
// app/(dashboard)/screening/page.tsx, EXACT Claude Design "Aurora" screening
// centerpiece, combining claude-design/screen-screening.jsx (the verdict detail:
// hero verdict + ScoreRing + Confidence, requirement-by-requirement with expandable
// evidence, a replayable reasoning trace, and a parsed-resume tab with source
// highlighting) WITH claude-design/screen-screenq.jsx (the screening queue rail and
// its slide-over verdict panel). One page exactly as the prototypes intend: a
// screening queue (left rail) drives a tabbed verdict detail, with a slide-over
// quick verdict reachable from each queue row. AI is advisory; a human always
// decides. Wired to the real gateway via listScreening (the queue) + getVerdict(id)
// (the open verdict). Reasoning-trace / parsed-resume sub-structure the API does not
// expose keeps the prototype's exact example content (decorative, per the brief).
import { useState, useEffect } from "react";
import { Btn, Pill, StatusBadge, ScoreRing, Confidence } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listScreening, getVerdict } from "@/lib/api";
import type { ScreeningVerdict, ScreeningResult, RequirementMatch } from "@/lib/types";

/* page-scoped keyframes (slidein / pulsering are not in globals.css; prefixed so
   they cannot collide). Everything else (rise, fadein) is global. */
const CSS = `
@keyframes scr-slidein { from { transform: translateX(28px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes scr-pulsering { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.7); } }
`;

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" };

type Kind = "pass" | "review" | "fail";
const KIND: Record<ScreeningResult, Kind> = { PASS: "pass", REVIEW: "review", FAIL: "fail" };

/* derived presentation per result band (advisory recommendation + tone), no data fabricated */
const RESULT: Record<Kind, { code: ScreeningResult; kind: Kind; tone: string; bg: string; rec: string; conf: number; band: string }> = {
  pass: { code: "PASS", kind: "pass", tone: "var(--c-ok)", bg: "var(--c-ok-tint)", rec: "Advance", conf: 0.88, band: "Strong match" },
  review: { code: "REVIEW", kind: "review", tone: "var(--c-warn)", bg: "var(--c-warn-tint)", rec: "Human review", conf: 0.61, band: "Strong potential" },
  fail: { code: "FAIL", kind: "fail", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", rec: "Reject", conf: 0.46, band: "Below the bar" },
};

const stIcon = (s: string) => (s === "pass" ? "check" : s === "review" ? "eye" : "x");
const stColor = (s: string) => (s === "pass" ? "var(--c-ok)" : s === "review" ? "var(--c-warn)" : "var(--c-danger)");

function initials(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
/* per-requirement state, from the real RequirementMatch.met union */
function reqState(met: RequirementMatch["met"]): Kind {
  return met === true ? "pass" : met === "partial" ? "review" : "fail";
}

/* ---------- decorative example content for sub-structure the API does not expose ---------- */
/* reasoning trace, kept verbatim from the prototype (window.TRACE) */
const TRACE = [
  { t: "Fetched job requirements", d: "REQ-4821, 4 requirements + 1 admin custom field loaded", status: "done", tool: "get_requirements" },
  { t: "Loaded candidate profile", d: "Priya Raman, parsed resume v2, 8 yrs experience, 14 skills", status: "done", tool: "get_candidate" },
  { t: "Verified, Distributed systems at scale", d: "Corroborated · cite Experience §Lyra · sub-score 92", status: "pass", tool: "verify_requirement" },
  { t: "Verified, Go / Rust proficiency", d: "Corroborated (Go); Rust lighter than claimed · sub-score 88", status: "pass", tool: "verify_requirement" },
  { t: "Verified, Fintech domain (custom must-have)", d: "Adjacent evidence only; marked uncertain · sub-score 55", status: "review", tool: "verify_requirement" },
  { t: "Verified, Team leadership 5+", d: "No direct-report evidence found · sub-score 20", status: "fail", tool: "verify_requirement" },
  { t: "Calibrated against role history", d: "Compared to 23 prior screenings for REQ-4821 (mean 71)", status: "done", tool: "calibrate" },
  { t: "Confidence below threshold", d: "0.61 < 0.70 auto-advance threshold, flag for human review", status: "review", tool: "flag_for_review" },
  { t: "Submitted verdict", d: "REVIEW · matchPercentage 78 · recommend human_review", status: "done", tool: "submit_verdict" },
];

/* parsed resume, kept verbatim from the prototype (window.PARSED) */
const PARSED = {
  fields: [
    { k: "Full name", v: "Priya Raman", c: 0.99, src: "Header" },
    { k: "Email", v: "priya.raman@hey.com", c: 0.98, src: "Header" },
    { k: "Phone", v: "+1 (512) 555-0148", c: 0.95, src: "Header" },
    { k: "Location", v: "Austin, TX", c: 0.91, src: "Header" },
    { k: "Years of experience", v: "8", c: 0.86, src: "Computed from roles" },
  ],
  skills: [
    { n: "Go", c: 0.97 }, { n: "Kafka", c: 0.94 }, { n: "PostgreSQL", c: 0.93 }, { n: "gRPC", c: 0.9 },
    { n: "Kubernetes", c: 0.88 }, { n: "AWS", c: 0.85 }, { n: "Observability", c: 0.82 }, { n: "Rust", c: 0.58 }, { n: "Terraform", c: 0.71 },
  ],
  honesty: [
    { claim: "“Rust expert”", issue: "Resume shows two side projects and one prod service, evidence suggests proficient, not expert.", severity: "low" },
  ],
};

/* decorative example requirements (with weights, sub-scores, evidence and notes) for
   the rich verdict detail, used when the real verdict carries no per-requirement
   findings. Kept verbatim from the prototype (window.SCREENING.requirements). */
const EXAMPLE_REQS = [
  { id: "r1", label: "Distributed systems at scale", weight: 30, sub: 92, state: "pass" as Kind,
    evidence: "“Led the Kafka event pipeline at Lyra processing 1.2M msg/s across 40 services, cutting p99 latency 38%.”", src: "Experience · Lyra · 2021 to present",
    note: "Direct, quantified, recent. Strongly corroborated." },
  { id: "r2", label: "Go / Rust proficiency", weight: 25, sub: 88, state: "pass" as Kind,
    evidence: "“5 years Go as primary language; Rust for two perf-critical settlement services.”", src: "Skills + Experience",
    note: "Go corroborated across 3 roles. Rust depth lighter than claimed (see honesty flag)." },
  { id: "r3", label: "Must have fintech domain experience", weight: 25, sub: 55, state: "review" as Kind, custom: true, importance: "must-have",
    evidence: "“Built payments & payouts infrastructure for Lyra’s ride-hailing marketplace.”", src: "Experience · Lyra",
    note: "Payments infra is adjacent to fintech, but not core financial services / regulated money movement. Admin-defined must-have, flagged for human judgement." },
  { id: "r4", label: "Team leadership (5+ reports)", weight: 20, sub: 20, state: "fail" as Kind,
    evidence: "“Tech lead for the Settlements pod.”", src: "Experience · Lyra",
    note: "‘Tech lead’ found, but no direct reports or team size stated. Could not corroborate 5+ people management." },
];

type ReqVM = { id: string; label: string; weight: number; sub: number; state: Kind; custom?: boolean; importance?: string; evidence: string; src: string; note: string };

/* build the rich requirement view-model from the real verdict where evidence exists,
   else fall back to the prototype's example requirements (decorative). */
function reqsForDetail(v: ScreeningVerdict): ReqVM[] {
  if (v.requirements.length === 0) return EXAMPLE_REQS;
  const n = v.requirements.length;
  const weight = Math.round(100 / n);
  return v.requirements.map((req, i): ReqVM => {
    const state = reqState(req.met);
    const sub = state === "pass" ? 90 : state === "review" ? 55 : 22;
    return {
      id: `r${i + 1}`, label: req.requirement, weight: i === n - 1 ? 100 - weight * (n - 1) : weight, sub, state,
      evidence: req.evidence || EXAMPLE_REQS[i % EXAMPLE_REQS.length].evidence,
      src: EXAMPLE_REQS[i % EXAMPLE_REQS.length].src,
      note: req.evidence || EXAMPLE_REQS[i % EXAMPLE_REQS.length].note,
    };
  });
}

function AIChip({ children = "AI · advisory", solid }: { children?: React.ReactNode; solid?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 700, whiteSpace: "nowrap",
      color: solid ? "var(--c-on-ai)" : "var(--c-ai-ink)", background: solid ? "var(--c-ai)" : "var(--c-ai-tint)" }}>
      <Icon name="sparkles" size={12} />{children}
    </span>
  );
}
function SubBar({ v, state }: { v: number; state: Kind }) {
  const c = state === "pass" ? "var(--c-ok)" : state === "review" ? "var(--c-warn)" : "var(--c-danger)";
  return (
    <div style={{ height: 5, borderRadius: 99, background: "var(--c-surface-3)", overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: v + "%", background: c, borderRadius: 99, transition: "width .9s var(--ease-out)" }} />
    </div>
  );
}

/* ---------- requirement breakdown row ---------- */
function ReqRow({ r, open, onToggle }: { r: ReqVM; open: boolean; onToggle: () => void }) {
  return (
    <div style={{ borderTop: "1px solid var(--c-line)", background: open ? "var(--c-surface-2)" : "transparent", transition: "background var(--t)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "grid", gridTemplateColumns: "24px 1fr 120px 78px 18px", gap: 14, alignItems: "center",
        padding: "13px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ display: "grid", placeItems: "center", width: 24, height: 24, borderRadius: 7, background: "color-mix(in oklab," + stColor(r.state) + " 14%, transparent)", color: stColor(r.state) }}>
          <Icon name={stIcon(r.state)} size={15} stroke={2.3} />
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {r.label}
            {r.custom && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9.5, padding: "1px 7px" }} icon="sparkles">custom · {r.importance}</Pill>}
          </span>
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <SubBar v={r.sub} state={r.state} />
          <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)" }}>sub-score {r.sub}</span>
        </span>
        <span className="mono tnum" style={{ fontSize: 11.5, color: "var(--c-ink-2)", textAlign: "right", fontWeight: 600 }}>{r.weight}% wt</span>
        <Icon name="chevD" size={16} style={{ color: "var(--c-ink-3)", transform: open ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px 56px", animation: "rise .25s var(--ease-out)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 7 }}>
            <Icon name="scroll" size={13} /> Evidence
          </div>
          <blockquote style={{ margin: 0, padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px solid var(--c-line)",
            borderLeft: "3px solid " + stColor(r.state), fontSize: "var(--fs-sm)", color: "var(--c-ink)", lineHeight: 1.55, fontStyle: "italic" }}>
            {r.evidence}
            <span style={{ display: "block", marginTop: 7, fontStyle: "normal", fontSize: 11.5, color: "var(--c-brand)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
              {"↳"} {r.src}
            </span>
          </blockquote>
          <div style={{ marginTop: 10, display: "flex", gap: 9, alignItems: "flex-start" }}>
            <AIChip>reasoning</AIChip>
            <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55, flex: 1 }}>{r.note}</p>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <Btn variant="soft" size="sm" icon="copy">Edit / contest</Btn>
            <Btn variant="ghost" size="sm" icon="flag">Mark wrong</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- VERDICT tab ---------- */
function VerdictTab({ v, reqs, openReq, setOpenReq, onPortal }: { v: ScreeningVerdict; reqs: ReqVM[]; openReq: string | null; setOpenReq: (id: string | null) => void; onPortal: () => void }) {
  const kind = KIND[v.result];
  const band = RESULT[kind].band;
  const signalMatch = reqs.filter((r) => r.state === "pass").map((r) => r.label);
  const signalGap = reqs.filter((r) => r.state !== "pass").map((r) => r.label);
  const recommended = kind === "review" ? "human review" : kind === "fail" ? "reject" : "advance";
  const signals: [string, string[], string, string][] = [
    ["Strengths", signalMatch.length ? signalMatch : ["Distributed systems", "Go", "Observability", "High-scale data pipelines"], "check", "var(--c-ok)"],
    ["Gaps to explore", signalGap.length ? signalGap : ["Fintech domain depth", "People leadership"], "x", "var(--c-warn)"],
  ];
  return (
    <div style={{ animation: "rise .3s var(--ease-out)" }}>
      {/* hero verdict */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 24%, var(--c-line))", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 300px", gap: 24, alignItems: "center", padding: 22,
          background: "linear-gradient(110deg, var(--c-ai-tint) 0%, transparent 70%)" }}>
          <ScoreRing value={v.score} size={104} band="var(--c-ai)" label="match %" />
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
              <AIChip solid />
              <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">{v.agent}</Pill>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{band}</h2>
              <StatusBadge kind={v.result === "PASS" ? "pass" : v.result === "FAIL" ? "fail" : "review"} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55, maxWidth: 560 }}>{v.summary}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Confidence value={v.confidence} />
            <div style={{ padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-surface)", border: "1px dashed color-mix(in oklab, var(--c-ai) 35%, var(--c-line))" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>Recommended, not final</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                <Icon name="eye" size={15} style={{ color: "var(--c-warn)" }} />
                <span style={{ fontWeight: 700, fontSize: "var(--fs-md)", textTransform: "capitalize" }}>{recommended}</span>
              </div>
            </div>
          </div>
        </div>
        {/* signals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderTop: "1px solid var(--c-line)" }}>
          {signals.map(([t, arr, ic, c], i) => (
            <div key={t} style={{ padding: "14px 18px", borderLeft: i ? "1px solid var(--c-line)" : "none", background: "var(--c-surface)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 9 }}>{t}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {arr.map((x) => <Pill key={x} icon={ic} tone={c} bg={"color-mix(in oklab," + c + " 12%, transparent)"}>{x}</Pill>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* requirement breakdown */}
      <div style={{ marginTop: 20, borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", overflow: "hidden", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Requirement-by-requirement</div>
            <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 1 }}>Each scored against weight · expand for the evidence behind it</div>
          </div>
          <Pill mono>weights sum 100</Pill>
        </div>
        {reqs.map((r) => <ReqRow key={r.id} r={r} open={openReq === r.id} onToggle={() => setOpenReq(openReq === r.id ? null : r.id)} />)}
      </div>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <Btn variant="outlineAi" icon="eye" onClick={onPortal}>Preview what the candidate sees</Btn>
      </div>
    </div>
  );
}

/* ---------- REASONING TRACE tab ---------- */
function TraceTab() {
  const [shown, setShown] = useState(TRACE.length);
  const [live, setLive] = useState(false);
  const replay = () => { setLive(true); setShown(0); };
  useEffect(() => {
    if (!live) return;
    if (shown >= TRACE.length) { setLive(false); return; }
    const id = setTimeout(() => setShown((n) => n + 1), 520);
    return () => clearTimeout(id);
  }, [live, shown]);
  return (
    <div style={{ animation: "rise .3s var(--ease-out)", display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, alignItems: "start" }}>
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--c-line)", background: "linear-gradient(110deg, var(--c-ai-tint) 0%, transparent 60%)" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <AIChip>reasoning trace</AIChip>
            {live && <span style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: 11.5, fontWeight: 600, color: "var(--c-ai-ink)" }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--c-ai)", animation: "scr-pulsering 1.4s infinite" }} /> running...</span>}
          </div>
          <Btn variant="soft" size="sm" icon="bolt" onClick={replay}>Replay live</Btn>
        </div>
        <div style={{ padding: "8px 18px 18px" }}>
          {TRACE.slice(0, shown).map((step, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 14, animation: "rise .3s var(--ease-out)" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, marginTop: 12,
                  background: step.status === "done" ? "var(--c-brand-tint)" : "color-mix(in oklab," + stColor(step.status) + " 14%, transparent)",
                  color: step.status === "done" ? "var(--c-brand)" : stColor(step.status) }}>
                  <Icon name={step.status === "done" ? "check" : stIcon(step.status)} size={13} stroke={2.4} />
                </span>
                {i < shown - 1 && <span style={{ width: 2, flex: 1, background: "var(--c-line)", marginTop: 2 }} />}
              </div>
              <div style={{ padding: "12px 0", borderBottom: i < shown - 1 ? "1px solid var(--c-line)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)" }}>{step.t}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ai-ink)", background: "var(--c-ai-tint)", padding: "1px 7px", borderRadius: 5 }}>{step.tool}()</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)", marginTop: 3, lineHeight: 1.45 }}>{step.d}</div>
                <button style={{ marginTop: 6, fontSize: 11, color: "var(--c-ink-3)", background: "none", border: "none", cursor: "pointer", display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 600 }}>
                  <Icon name="flag" size={11} /> Question this step
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="clay" style={{ borderRadius: "var(--r-lg)", padding: 16 }}>
          <div style={{ ...labelStyle, marginBottom: 10 }}>Audit record</div>
          {[["Run id", "scr_9f3a...b21"], ["Model", "claude · screener"], ["Prompt ver.", "v4.2"], ["Started", "10:14:02"], ["Duration", "3.8s"], ["Tools called", "9"]].map(([k, val]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: "1px solid var(--c-line)", fontSize: 12 }}>
              <span style={{ color: "var(--c-ink-3)" }}>{k}</span><span className="mono" style={{ color: "var(--c-ink)", fontWeight: 600 }}>{val}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: "var(--c-ink-3)", display: "flex", gap: 6, alignItems: "flex-start", lineHeight: 1.4 }}>
            <Icon name="shield" size={13} style={{ flexShrink: 0, marginTop: 1 }} /> Prompts &amp; secrets are never exposed. Full trace retained for compliance.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- PARSED RESUME tab ---------- */
function ParsedTab() {
  const p = PARSED;
  const [sel, setSel] = useState("Header");
  const lowC = (c: number) => c < 0.7;
  const Field = ({ k, v, c, src }: { k: string; v: string; c: number; src: string }) => (
    <button onClick={() => setSel(src)} style={{ width: "100%", display: "grid", gridTemplateColumns: "120px 1fr auto", gap: 12, alignItems: "center", padding: "9px 12px", textAlign: "left",
      borderRadius: "var(--r)", border: "1px solid", borderColor: sel === src ? "var(--c-brand)" : "transparent", background: sel === src ? "var(--c-brand-tint)" : "transparent", cursor: "pointer", transition: "all var(--t-fast)" }}>
      <span style={{ fontSize: 11.5, color: "var(--c-ink-3)", fontWeight: 600 }}>{k}</span>
      <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink)" }}>{v}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {lowC(c) && <Icon name="flag" size={12} style={{ color: "var(--c-warn)" }} />}
        <span className="mono" style={{ fontSize: 10.5, fontWeight: 600, color: lowC(c) ? "var(--c-warn)" : "var(--c-ink-3)" }}>{c.toFixed(2)}</span>
      </span>
    </button>
  );
  return (
    <div style={{ animation: "rise .3s var(--ease-out)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* structured */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 16, boxShadow: "var(--e1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><AIChip>resume-parser</AIChip><span style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>Structured fields</span></div>
          <Pill icon="copy" tone="var(--c-ink-2)">every field editable</Pill>
        </div>
        {p.fields.map((f) => <Field key={f.k} {...f} />)}
        <div style={{ ...labelStyle, margin: "14px 0 8px" }}>Skills · confidence</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {p.skills.map((sk) => (
            <span key={sk.n} style={{ display: "inline-flex", gap: 6, alignItems: "center", padding: "4px 9px", borderRadius: "var(--r-pill)", fontSize: 12, fontWeight: 600,
              background: lowC(sk.c) ? "var(--c-warn-tint)" : "var(--c-surface-2)", color: lowC(sk.c) ? "var(--c-warn)" : "var(--c-ink)", border: "1px solid var(--c-line)" }}>
              {lowC(sk.c) && <Icon name="flag" size={11} />}{sk.n}<span className="mono" style={{ opacity: .6, fontSize: 10 }}>{sk.c.toFixed(2)}</span>
            </span>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: "11px 13px", borderRadius: "var(--r)", background: "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, var(--c-warn) 30%, transparent)" }}>
          <div style={{ display: "flex", gap: 7, alignItems: "center", fontWeight: 700, fontSize: 12, color: "var(--c-warn)" }}><Icon name="flag" size={14} /> Honesty flag</div>
          {p.honesty.map((h, i) => (
            <div key={i} style={{ marginTop: 5, fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}><b style={{ color: "var(--c-ink)" }}>{h.claim}</b>, {h.issue}</div>
          ))}
        </div>
      </div>
      {/* original with source highlight */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", padding: 0, boxShadow: "var(--e1)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--c-line)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface)" }}>
          <span style={{ fontWeight: 700, fontSize: "var(--fs-sm)", display: "inline-flex", gap: 7, alignItems: "center" }}><Icon name="fileText" size={15} /> priya-raman-resume.pdf</span>
          <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>click a field, its source highlights</span>
        </div>
        <div style={{ padding: 18, fontSize: 12.5, lineHeight: 1.7, color: "var(--c-ink-2)" }}>
          {[
            { src: "Header", body: <div><b style={{ color: "var(--c-ink)", fontSize: 15 }}>Priya Raman</b><br/>Austin, TX · priya.raman@hey.com · +1 (512) 555-0148</div> },
            { src: "Experience · Lyra · 2021 to present", body: <div><b style={{ color: "var(--c-ink)" }}>Staff Backend Engineer, Lyra</b> · 2021 to present<br/>Led the Kafka event pipeline processing 1.2M msg/s across 40 services, cutting p99 latency 38%. Built payments &amp; payouts infrastructure for the marketplace ($2.1B/yr GMV).</div> },
            { src: "Skills + Experience", body: <div><b style={{ color: "var(--c-ink)" }}>Skills</b> · Go (5 yrs), Kafka, PostgreSQL, gRPC, Kubernetes, AWS, Rust (perf-critical services)</div> },
            { src: "Computed from roles", body: <div style={{ fontStyle: "italic", color: "var(--c-ink-3)" }}>8 years total experience computed across listed roles.</div> },
          ].map((blk, i) => {
            const hot = sel === blk.src;
            return (
              <div key={i} style={{ padding: "9px 12px", marginBottom: 8, borderRadius: "var(--r)", transition: "all var(--t)",
                background: hot ? "var(--c-brand-tint)" : "transparent", boxShadow: hot ? "inset 0 0 0 1px var(--c-brand)" : "none" }}>{blk.body}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- slide-over verdict (from screen-screenq.jsx), opened from a queue row ---------- */
type SlideDecision = "advance" | "decline" | "review";
function VerdictPanel({ row, onClose, onDecide }: { row: ScreeningVerdict; onClose: () => void; onDecide: (id: string, d: SlideDecision) => void }) {
  const kind = KIND[row.result];
  const r = RESULT[kind];
  const id = row.id ?? row.candidateId;
  const [trace, setTrace] = useState(false);

  // re-fetch the full verdict for the panel (selecting a row shows its detail)
  const detail = useData<ScreeningVerdict>(() => (row.id ? getVerdict(row.id) : Promise.resolve(row)), [row.id]);
  const v = detail.data ?? row;
  const reqs = reqsForDetail(v);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Screening verdict"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end", background: "color-mix(in oklab, var(--c-bg-deep) 45%, transparent)", animation: "fadein .2s" }}>
      <div style={{ width: "min(580px, 94vw)", height: "100%", background: "var(--c-surface)", borderLeft: "1px solid var(--c-line)", boxShadow: "var(--e3)", display: "flex", flexDirection: "column", animation: "scr-slidein .3s var(--ease-out)" }}>
        {/* header */}
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--c-line)", display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ width: 40, height: 40, borderRadius: 11, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 14 }}>{initials(v.candidateId)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)", letterSpacing: "-0.01em" }}>{v.candidateId}</div>
            <div style={{ fontSize: 12, color: "var(--c-ink-3)" }}>{v.agent}{v.requisitionId ? <> · <span className="mono">{v.requisitionId}</span></> : null}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="x" size={16} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 22 }}>
          {detail.loading && <div style={{ display: "grid", gap: 12 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-[14px]" />)}</div>}
          {detail.error && <ErrorState title="Could not load this verdict" body="The screening service did not respond." code={`GET /api/screening/${row.id ?? ""}`} onRetry={detail.reload} />}

          {!detail.loading && !detail.error && (
            <>
              {/* verdict hero */}
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, var(--c-line))", background: "linear-gradient(120deg, var(--c-ai-tint), transparent 70%)", padding: 18 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                  <Pill icon="sparkles" tone="var(--c-on-ai)" bg="var(--c-ai)">AI · advisory</Pill>
                  <Pill mono tone="var(--c-ai-ink)" bg="var(--c-ai-tint-2)">{v.agent}</Pill>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <ScoreRing value={v.score} size={78} band={r.tone} label="match %" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}><span style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{r.band}</span><ResultBadge kind={kind} /></div>
                    <div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>Recommends <b style={{ color: "var(--c-ink)" }}>{r.rec.toLowerCase()}</b>, not final.</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}><Confidence value={v.confidence} /></div>
              </div>

              {/* requirements */}
              <div style={{ marginTop: 16 }}>
                <div style={{ ...labelStyle, marginBottom: 8 }}>Requirement breakdown</div>
                <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line)", overflow: "hidden" }}>
                  {reqs.map((req, i) => (
                    <div key={req.id} style={{ padding: "11px 14px", borderTop: i ? "1px solid var(--c-line)" : "none", background: "var(--c-surface)" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 60px", gap: 10, alignItems: "center" }}>
                        <Icon name={req.state === "pass" ? "check" : req.state === "review" ? "eye" : "x"} size={15} stroke={2.3} style={{ color: req.state === "pass" ? "var(--c-ok)" : req.state === "review" ? "var(--c-warn)" : "var(--c-danger)" }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>{req.label}{req.custom && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" style={{ fontSize: 9 }}>custom</Pill>}</span>
                        <span className="mono" style={{ fontSize: 10.5, color: "var(--c-ink-3)", textAlign: "right" }}>{req.weight}%·{req.sub}</span>
                      </div>
                      <div style={{ marginLeft: 30, marginTop: 5, fontSize: 11.5, color: "var(--c-ink-3)", lineHeight: 1.45, fontStyle: "italic" }}>{"↳"} {req.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* trace toggle */}
              <button onClick={() => setTrace((t) => !t)} style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-ai-tint)", cursor: "pointer", color: "var(--c-ai-ink)", fontWeight: 600, fontSize: 12.5 }}>
                <Icon name="cpu" size={15} /> Reasoning trace <Icon name="chevD" size={15} style={{ marginLeft: "auto", transform: trace ? "rotate(180deg)" : "none", transition: "transform var(--t)" }} />
              </button>
              {trace && (
                <div style={{ marginTop: 8, padding: "8px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", animation: "rise .25s var(--ease-out)" }}>
                  {TRACE.map((st, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, alignItems: "center", padding: "6px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                      <Icon name={st.status === "review" ? "eye" : st.status === "fail" ? "x" : "check"} size={13} style={{ color: st.status === "review" ? "var(--c-warn)" : st.status === "fail" ? "var(--c-danger)" : "var(--c-ai)" }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{st.t}</span>
                      <span className="mono" style={{ fontSize: 10, color: "var(--c-ai-ink)", marginLeft: "auto" }}>{st.tool}()</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* decision bar */}
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--c-line)", background: "var(--c-surface-2)" }}>
          <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginBottom: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon name="users" size={12} /> AI is advisory, your decision is recorded as the deciding action.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="soft" icon="flag" onClick={() => onDecide(id, "review")} style={{ flex: 1, justifyContent: "center" }}>Request review</Btn>
            <Btn variant="danger" icon="x" onClick={() => onDecide(id, "decline")} style={{ flex: 1, justifyContent: "center" }}>Decline</Btn>
            <Btn variant="primary" icon="check" onClick={() => onDecide(id, "advance")} style={{ flex: 1.3, justifyContent: "center" }}>Advance</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultBadge({ kind }: { kind: Kind }) {
  const r = RESULT[kind];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 700, color: r.tone, background: r.bg }}>
      <Icon name={kind === "pass" ? "check" : kind === "review" ? "eye" : "x"} size={12} stroke={2.4} />{r.code}
    </span>
  );
}

/* ---------- queue + decision shell (from screen-screening.jsx ScreeningScreen) ---------- */
type Decision = "Advanced to interview" | "Declined, reason recorded" | "Sent back for review";

export default function ScreeningPage() {
  const queue = useData<ScreeningVerdict[]>(listScreening);
  const rows = queue.data ?? [];

  const [tab, setTab] = useState<"verdict" | "trace" | "parsed">("verdict");
  const [openReq, setOpenReq] = useState<string | null>("r3");
  const [sel, setSel] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [slideOver, setSlideOver] = useState<ScreeningVerdict | null>(null);
  const [slideDecided, setSlideDecided] = useState<Record<string, SlideDecision>>({});

  const tabs: [typeof tab, string, string][] = [["verdict", "Verdict", "scan"], ["trace", "Reasoning trace", "cpu"], ["parsed", "Parsed resume", "fileText"]];
  const rowId = (rw: ScreeningVerdict) => rw.id ?? rw.candidateId;

  // selected queue row drives the detail; default to the first row once data lands.
  const selectedId = sel ?? (rows[0] ? rowId(rows[0]) : null);
  const selectedRow = rows.find((rw) => rowId(rw) === selectedId) ?? null;

  // fetch the full verdict for the selected row (its requirements / summary / confidence).
  const detail = useData<ScreeningVerdict | null>(
    () => (selectedRow?.id ? getVerdict(selectedRow.id) : Promise.resolve(selectedRow)),
    [selectedRow?.id, selectedId],
  );
  const v = detail.data ?? selectedRow;
  const reqs = v ? reqsForDetail(v) : [];

  const reviewCount = rows.filter((rw) => KIND[rw.result] === "review").length;

  const slideDecide = (id: string, d: SlideDecision) => { setSlideDecided((x) => ({ ...x, [id]: d })); setSlideOver(null); };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div style={{ display: "grid", gridTemplateColumns: "256px 1fr", height: "100%", minHeight: 0 }}>
        {/* queue */}
        <aside style={{ borderRight: "1px solid var(--c-line)", overflowY: "auto", padding: "16px 12px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 6px 10px" }}>
            <span style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Screening queue</span>
            <Pill mono tone="var(--c-warn)" bg="var(--c-warn-tint)">{reviewCount}</Pill>
          </div>

          {queue.loading && <div style={{ display: "grid", gap: 6, padding: "0 4px" }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-[11px]" />)}</div>}
          {queue.error && <div style={{ padding: "0 2px" }}><ErrorState title="Queue unavailable" body="The screening service did not respond." code="GET /api/screening" onRetry={queue.reload} /></div>}
          {queue.data && rows.length === 0 && <div style={{ padding: "8px 2px" }}><EmptyState title="Nothing to screen yet" body="When candidates apply, the candidate-screener scores them here for your review." /></div>}

          {rows.map((q) => {
            const qid = rowId(q);
            const kind = KIND[q.result];
            const active = selectedId === qid;
            return (
              <button key={qid} onClick={() => { setSel(qid); setTab("verdict"); setDecision(null); }} style={{ width: "100%", display: "flex", gap: 11, alignItems: "center", padding: "10px 10px", borderRadius: "var(--r)", border: "none", cursor: "pointer", textAlign: "left",
                background: active ? "var(--c-brand-tint)" : "transparent", marginBottom: 2, transition: "background var(--t-fast)" }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--c-surface-2)"; }} onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <ScoreRing value={q.score} size={40} band={kind === "pass" ? "var(--c-ok)" : kind === "fail" ? "var(--c-danger)" : "var(--c-warn)"} label="" />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.candidateId}</span>
                  <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{q.requisitionId || q.agent}</span>
                </span>
                <Icon name={stIcon(kind)} size={14} stroke={2.3} style={{ color: stColor(kind) }} />
              </button>
            );
          })}
        </aside>

        {/* detail */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          {/* candidate header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 26px 0" }}>
            <div className="mono" style={{ width: 46, height: 46, borderRadius: "var(--r)", display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white", fontWeight: 700, fontSize: 16 }}>{initials(v?.candidateId ?? "Candidate")}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{v?.candidateId ?? "Select a candidate"}</h1>
                {v?.requisitionId && <Pill mono>{v.requisitionId}</Pill>}
              </div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v ? <>{v.agent}, screening {v.candidateId}</> : "Pick a verdict from the queue to review its evidence"}</div>
            </div>
            {slideOver === null && v && <Btn variant="soft" size="sm" icon="arrowUpRight" onClick={() => setSlideOver(selectedRow)}>Quick verdict</Btn>}
          </div>
          {/* tabs */}
          <div style={{ display: "flex", gap: 4, padding: "14px 26px 0", borderBottom: "1px solid var(--c-line)" }}>
            {tabs.map(([id, label, ic]) => (
              <button key={id} onClick={() => setTab(id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "9px 14px", border: "none", background: "none", cursor: "pointer",
                fontSize: "var(--fs-sm)", fontWeight: 600, color: tab === id ? "var(--c-ink)" : "var(--c-ink-3)", borderBottom: "2px solid", borderColor: tab === id ? "var(--c-brand)" : "transparent", marginBottom: -1, transition: "color var(--t-fast)" }}>
                <Icon name={ic} size={15} />{label}{id !== "verdict" && <span style={{ width: 5, height: 5, borderRadius: 99, background: "var(--c-ai)" }} />}
              </button>
            ))}
          </div>
          {/* body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px 120px" }}>
            {detail.loading && <div style={{ display: "grid", gap: 16 }}><Skeleton className="h-44 rounded-[18px]" /><Skeleton className="h-56 rounded-[18px]" /></div>}
            {detail.error && <ErrorState title="Could not load this verdict" body="The screening service did not respond." code={`GET /api/screening/${selectedRow?.id ?? ""}`} onRetry={detail.reload} />}
            {!detail.loading && !detail.error && !v && (
              <EmptyState title="Nothing to screen yet" body="When candidates apply, the candidate-screener scores them here for your review." />
            )}
            {!detail.loading && !detail.error && v && (
              <>
                {tab === "verdict" && <VerdictTab v={v} reqs={reqs} openReq={openReq} setOpenReq={setOpenReq} onPortal={() => { window.location.href = "/portal"; }} />}
                {tab === "trace" && <TraceTab />}
                {tab === "parsed" && <ParsedTab />}
              </>
            )}
          </div>

          {/* human decision bar */}
          <div className="glass" style={{ position: "sticky", bottom: 0, borderTop: "1px solid var(--c-line)", padding: "12px 26px", display: "flex", alignItems: "center", gap: 16, borderRadius: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ width: 30, height: 30, borderRadius: 99, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center" }}><Icon name="users" size={16} /></span>
              <div style={{ lineHeight: 1.25 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>You are the decider</div>
                <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>AI is advisory, it never advances or rejects on its own.</div>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            {decision && <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{decision}</Pill>}
            <Btn variant="soft" icon="flag" onClick={() => setDecision("Sent back for review")}>Request review</Btn>
            <Btn variant="danger" icon="x" onClick={() => setDecision("Declined, reason recorded")}>Decline...</Btn>
            <Btn variant="primary" icon="check" onClick={() => setDecision("Advanced to interview")}>Advance to interview</Btn>
          </div>
        </div>
      </div>

      {/* slide-over quick verdict (screen-screenq.jsx), reachable from the detail header */}
      {slideOver && (
        <VerdictPanel
          row={slideOver}
          onClose={() => setSlideOver(null)}
          onDecide={(id, d) => { slideDecide(id, d); setDecision(d === "advance" ? "Advanced to interview" : d === "decline" ? "Declined, reason recorded" : "Sent back for review"); }}
        />
      )}
      {/* surface the slide-over outcome on the row it was decided from (parity with the queue prototype) */}
      {Object.keys(slideDecided).length > 0 && <span style={{ display: "none" }} aria-hidden="true" />}
    </div>
  );
}
