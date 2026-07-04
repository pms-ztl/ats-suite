"use client";
// components/cd/candidate-assessment-section.tsx
// LANE 2 - the native "send a coding test" + real-time results section for the
// candidate profile. Rendered by candidate-profile-live.tsx above the byte-exact
// CandidateProfile screen (which stays untouched). Two jobs:
//
//   1. ONE-CLICK SEND: pick a vendor (HackerRank / HackerEarth, showing its
//      connected status), browse the vendor's REAL test library, pick a test, and
//      issue the invite through the EXISTING POST /api/assessments/:id/invite
//      { provider, providerTestId } flow. The owning Assessment is resolved from
//      the candidate's requisition (or a minimal DRAFT is created), matching the
//      existing invite contract that requires an assessmentId. The resulting
//      invite status (PENDING -> SENT) + the candidate take link are shown.
//
//   2. PROMINENT RESULTS: the vendor OA outcome (score, percentage, per-section
//      breakdown, plagiarism flag, report link) for THIS candidate, read from the
//      existing GET /api/assessments/:id/results. Honest "awaiting result" until
//      the vendor reports; nothing is fabricated.
//
// HARD RULES honored: an un-keyed vendor shows "connect your account" (never a
// fake "connected"); a not-yet-taken test shows "awaiting result"; no secret is
// ever handled here; all copy is plain English (no em/en dashes). Everything is
// gated behind the same oa-assessments module as the rest of the OA surface.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Btn } from "@/components/cd/aurora-ui";
import { Pill, SectionCard, ScoreRing } from "@/components/cd/aurora-kit";
import { Icon } from "@/components/cd/icon";
import { useModules } from "@/hooks/use-modules";
import {
  listProviders, listProviderTests, sendProviderInvite, listInvites,
  listAssessmentsLite, createAssessmentShell, getResults,
  PROVIDER_META, CODING_PROVIDERS, providerLabel,
  type ProviderKind, type ProviderStatus, type ProviderTest,
  type AssessmentInvite, type AssessmentLite, type ResultRow,
} from "@/lib/assessment-provider-api";

const MODULE_KEY = "oa-assessments";

/* ─────────────────────────── small helpers ─────────────────────────── */

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// Invite lifecycle status -> tone. Never green until the vendor actually has it.
function inviteTone(status: string): { tone: string; bg: string } {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED") return { tone: "var(--ok)", bg: "var(--ok-tint)" };
  if (s === "SENT" || s === "STARTED" || s === "OPENED") return { tone: "var(--info)", bg: "var(--info-tint)" };
  if (s === "EXPIRED" || s === "CANCELLED") return { tone: "var(--danger)", bg: "var(--danger-tint)" };
  return { tone: "var(--ink-3)", bg: "var(--surface-3)" }; // PENDING
}

function scoreBand(pct: number | null, passingScore: number | null): string {
  if (pct == null) return "var(--ink-3)";
  if (passingScore != null) return pct >= passingScore ? "var(--ok)" : "var(--danger)";
  return pct >= 70 ? "var(--ok)" : pct >= 40 ? "var(--warn)" : "var(--danger)";
}

interface CandidateInput {
  id: string;
  name: string;
  email: string;
  requisitionId?: string | null;
  applicationId?: string | null;
}

/* ─────────────────────────── main component ─────────────────────────── */

export function CandidateAssessmentSection({ candidate }: { candidate: CandidateInput }) {
  const modules = useModules();
  const moduleEnabled = modules.allEnabled || (modules.enabledKeys?.includes(MODULE_KEY) ?? false);

  // The Assessment record this candidate's invites hang off. Resolved lazily from
  // the requisition (or created as a DRAFT) the first time we send a test.
  const [assessment, setAssessment] = useState<AssessmentLite | null>(null);
  const [invites, setInvites] = useState<AssessmentInvite[]>([]);
  const [results, setResults] = useState<{ passingScore: number | null; rows: ResultRow[] }>({ passingScore: null, rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  // Resolve the candidate's owning assessment WITHOUT creating one (read-only load).
  const resolveAssessment = useCallback(async (): Promise<AssessmentLite | null> => {
    // Prefer an assessment scoped to the candidate's requisition; fall back to any.
    if (candidate.requisitionId) {
      const scoped = await listAssessmentsLite(candidate.requisitionId);
      if (scoped.length > 0) return scoped[0];
    }
    const all = await listAssessmentsLite();
    // If a requisition is known, only accept a matching one; otherwise take the first.
    if (candidate.requisitionId) {
      const match = all.find((a) => a.requisitionId === candidate.requisitionId);
      return match ?? null;
    }
    return all[0] ?? null;
  }, [candidate.requisitionId]);

  const seqRef = useRef(0);
  const load = useCallback(async () => {
    const seq = ++seqRef.current;
    try {
      const a = await resolveAssessment();
      if (seq !== seqRef.current) return;
      setAssessment(a);
      if (a) {
        const [inv, res] = await Promise.all([
          listInvites(a.id).catch(() => [] as AssessmentInvite[]),
          getResults(a.id).catch(() => ({ passingScore: null, results: [] as ResultRow[], total: 0, assessmentId: a.id, title: "" })),
        ]);
        if (seq !== seqRef.current) return;
        setInvites(inv.filter((i) => i.candidateId === candidate.id));
        setResults({ passingScore: res.passingScore, rows: res.results.filter((r) => r.candidateId === candidate.id) });
      } else {
        setInvites([]);
        setResults({ passingScore: null, rows: [] });
      }
      setError(null);
    } catch (e) {
      if (seq !== seqRef.current) return;
      setError(e instanceof Error ? e.message : "Could not load assessments.");
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, [resolveAssessment, candidate.id]);

  useEffect(() => {
    if (!moduleEnabled) { setLoading(false); return; }
    load();
    return () => { seqRef.current++; };
  }, [load, moduleEnabled]);

  // Ensure an owning Assessment exists before the first invite. Creates a DRAFT
  // scoped to the requisition when the tenant has none for this role.
  const ensureAssessment = useCallback(async (): Promise<AssessmentLite> => {
    if (assessment) return assessment;
    const existing = await resolveAssessment();
    if (existing) { setAssessment(existing); return existing; }
    const created = await createAssessmentShell({
      title: "Coding assessment",
      requisitionId: candidate.requisitionId ?? null,
    });
    setAssessment(created);
    return created;
  }, [assessment, resolveAssessment, candidate.requisitionId]);

  if (!moduleEnabled) return null;

  const hasResult = results.rows.length > 0;
  const hasInvites = invites.length > 0;

  return (
    <SectionCard
      title="Coding test"
      icon="terminal"
      headRight={
        <Btn variant="ai" size="sm" icon="plug" onClick={() => setPicking(true)}>
          Send coding test
        </Btn>
      }
    >
      {loading ? (
        <div style={{ padding: "10px 0", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading assessment status...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {error && (
            <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: "var(--r)", background: "var(--warn-tint)", color: "var(--warn)", fontSize: "var(--fs-sm)" }}>
              <Icon name="flag" size={15} />{error}
            </div>
          )}

          {/* PROMINENT RESULTS - the outcome, front and centre when it exists */}
          {hasResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.rows.map((r) => (
                <ResultCard key={r.id} row={r} passingScore={results.passingScore} />
              ))}
            </div>
          ) : hasInvites ? (
            // Invited but no result yet: honest "awaiting result".
            <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--surface-2)", border: "1px solid var(--line)", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
              <Icon name="clock" size={16} style={{ color: "var(--info)", flexShrink: 0 }} />
              Awaiting result. The score and report will appear here the moment the vendor reports this candidate's test.
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--surface-2)", border: "1px dashed var(--line-2)", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
              <Icon name="terminal" size={16} style={{ color: "var(--ink-3)", flexShrink: 0, marginTop: 1 }} />
              No coding test sent yet. Send a HackerRank or HackerEarth test to this candidate; the invite and the real-time result will track here.
            </div>
          )}

          {/* INVITE STATUS TRACK - each invite with its live status + take link */}
          {hasInvites && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>Invites</div>
              {invites.map((inv) => (
                <InviteRow key={inv.id} invite={inv} />
              ))}
            </div>
          )}
        </div>
      )}

      {picking && (
        <SendTestModal
          candidate={candidate}
          ensureAssessment={ensureAssessment}
          onClose={() => setPicking(false)}
          onSent={() => { setPicking(false); load(); }}
        />
      )}
    </SectionCard>
  );
}

/* ─────────────────────────── one result card ─────────────────────────── */

function ResultCard({ row, passingScore }: { row: ResultRow; passingScore: number | null }) {
  const pct = row.scorePercent;
  const v = row.vendor;
  const sections = v?.sections ?? [];
  const sectionPct = (s: { percentage: number | null; score: number | null; maxScore: number | null }): number | null =>
    s.percentage != null
      ? Math.round(s.percentage)
      : s.score != null && s.maxScore != null && s.maxScore > 0
        ? Math.round((s.score / s.maxScore) * 100)
        : null;

  return (
    <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)", padding: "14px 16px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <ScoreRing value={pct ?? 0} size={68} band={scoreBand(pct, passingScore)} label={pct == null ? "n/a" : "score"} />
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {v && <Pill icon="plug" tone="var(--ai-ink)" bg="var(--ai-tint)">{providerLabel(v.provider)}</Pill>}
            {row.pendingManualReview ? (
              <Pill icon="eye" tone="var(--warn)" bg="var(--warn-tint)">Pending review</Pill>
            ) : row.passed === true ? (
              <Pill icon="check" tone="var(--ok)" bg="var(--ok-tint)">Passed</Pill>
            ) : row.passed === false ? (
              <Pill icon="x" tone="var(--danger)" bg="var(--danger-tint)">Did not pass</Pill>
            ) : null}
            {v?.plagiarismFlag === true && (
              <Pill icon="flag" tone="var(--danger)" bg="var(--danger-tint)">Plagiarism flagged</Pill>
            )}
          </div>
          <div style={{ marginTop: 7, fontSize: "var(--fs-sm)", color: "var(--ink-2)", display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span className="mono" style={{ fontWeight: 600 }}>
              {row.pendingManualReview ? "Awaiting grade" : `${row.rawScore} / ${row.maxScore} pts`}
              {pct != null ? ` · ${pct}%` : ""}
            </span>
            {row.gradedAt && <span style={{ color: "var(--ink-3)" }}>Graded {fmtDate(row.gradedAt)}</span>}
            {passingScore != null && <span style={{ color: "var(--ink-3)" }}>Passing bar {passingScore}%</span>}
          </div>
        </div>
        {v?.reportUrl && (
          <a href={v.reportUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", gap: 6, alignItems: "center", fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--ai-ink)", textDecoration: "none" }}>
            <Icon name="arrowUpRight" size={15} /> Open vendor report
          </a>
        )}
      </div>

      {/* problems-solved / per-section breakdown the vendor reported */}
      {sections.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 7 }}>
            Section breakdown
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sections.map((s, i) => {
              const p = sectionPct(s);
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface-2)", padding: "8px 11px" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name ?? `Section ${i + 1}`}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--ink-2)", display: "inline-flex", gap: 10 }}>
                    {s.score != null && s.maxScore != null && <span>{s.score} / {s.maxScore}</span>}
                    {p != null ? <span style={{ fontWeight: 600 }}>{p}%</span> : (s.score == null && <span style={{ color: "var(--ink-3)" }}>not reported</span>)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {v && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5 }}>
          Ingested in real time from {providerLabel(v.provider)}. Every figure is read back exactly as the vendor reported it. AI never rejects a candidate; a person makes the final call.
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── one invite row ─────────────────────────── */

function InviteRow({ invite }: { invite: AssessmentInvite }) {
  const tone = inviteTone(invite.status);
  const [copied, setCopied] = useState(false);
  const link = invite.candidateTestUrl || invite.rawTokenUrl || null;

  const copy = () => {
    if (!link) return;
    try {
      navigator.clipboard?.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked - the link is still shown below */ }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)" }}>
      {invite.provider && <Pill tone="var(--ink-2)" bg="var(--surface-2)">{providerLabel(invite.provider)}</Pill>}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 9px", borderRadius: "var(--r-pill)", fontSize: 11, fontWeight: 700, color: tone.tone, background: tone.bg }}>
        {invite.status.toUpperCase()}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {invite.email}{invite.sentAt ? ` · sent ${fmtDate(invite.sentAt)}` : invite.status.toUpperCase() === "PENDING" ? " · sending to vendor" : ""}
      </span>
      {link ? (
        <Btn variant="ghost" size="sm" icon={copied ? "check" : "copy"} onClick={copy}>
          {copied ? "Copied" : "Copy take link"}
        </Btn>
      ) : invite.status.toUpperCase() === "PENDING" ? (
        <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>Take link appears once the vendor confirms</span>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── send-test modal ─────────────────────────── */

function SendTestModal({
  candidate, ensureAssessment, onClose, onSent,
}: {
  candidate: CandidateInput;
  ensureAssessment: () => Promise<AssessmentLite>;
  onClose: () => void;
  onSent: () => void;
}) {
  const [providers, setProviders] = useState<ProviderStatus[] | null>(null);
  const [kind, setKind] = useState<ProviderKind | null>(null);
  const [tests, setTests] = useState<ProviderTest[] | null>(null);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Load connected status for the coding vendors on open.
  useEffect(() => {
    let alive = true;
    listProviders()
      .then((all) => { if (alive) setProviders(all.filter((p) => CODING_PROVIDERS.includes(p.kind))); })
      .catch(() => { if (alive) setProviders(CODING_PROVIDERS.map((k) => ({ kind: k, name: PROVIDER_META[k].name, connected: false, testCount: null }))); });
    return () => { alive = false; };
  }, []);

  const connectedOf = useCallback((k: ProviderKind) => providers?.find((p) => p.kind === k)?.connected ?? false, [providers]);

  // When a vendor is picked AND it is connected, load its REAL test library.
  const pickVendor = useCallback((k: ProviderKind) => {
    setKind(k);
    setSelectedTest(null);
    setTests(null);
    setTestsError(null);
    if (!connectedOf(k)) return; // un-keyed vendor: show "connect your account", no fetch
    listProviderTests(k)
      .then((list) => setTests(list))
      .catch((e) => setTestsError(e instanceof Error ? e.message : "Could not load the test library."));
  }, [connectedOf]);

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!tests) return [];
    if (!q) return tests;
    return tests.filter((t) => t.name.toLowerCase().includes(q) || (t.category ?? "").toLowerCase().includes(q));
  }, [tests, query]);

  const send = useCallback(async () => {
    if (!kind || !selectedTest || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const a = await ensureAssessment();
      const parts = (candidate.name || "").trim().split(/\s+/).filter(Boolean);
      await sendProviderInvite({
        assessmentId: a.id,
        candidateId: candidate.id,
        email: candidate.email,
        provider: kind,
        providerTestId: selectedTest,
        applicationId: candidate.applicationId ?? null,
        ...(parts.length ? { candidateFirstName: parts[0] } : {}),
        ...(parts.length > 1 ? { candidateLastName: parts[parts.length - 1] } : {}),
      });
      onSent();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not send the test.";
      setSendError(
        /email/i.test(msg) ? "This candidate has no email on file, which the vendor invite requires." : msg,
      );
      setSending(false);
    }
  }, [kind, selectedTest, sending, ensureAssessment, candidate, onSent]);

  const noEmail = !candidate.email;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 60, background: "color-mix(in oklab, var(--ink) 45%, transparent)", display: "grid", placeItems: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 96vw)", maxHeight: "88vh", overflow: "auto", borderRadius: "var(--r-xl)", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--e3)", padding: 22 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Send a coding test</h2>
            <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
              Invite {candidate.name || "this candidate"} to a real test on your connected vendor.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-3)", padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {noEmail && (
          <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: "var(--r)", background: "var(--warn-tint)", color: "var(--warn)", fontSize: "var(--fs-sm)", marginBottom: 14 }}>
            <Icon name="flag" size={15} />This candidate has no email on file. Add one before sending a vendor test.
          </div>
        )}

        {/* step 1: vendor */}
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>1. Choose a vendor</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          {(providers ?? CODING_PROVIDERS.map((k) => ({ kind: k, name: PROVIDER_META[k].name, connected: false, testCount: null } as ProviderStatus))).map((p) => {
            const on = kind === p.kind;
            const meta = PROVIDER_META[p.kind];
            return (
              <button
                key={p.kind}
                onClick={() => pickVendor(p.kind)}
                style={{ textAlign: "left", cursor: "pointer", padding: "12px 13px", borderRadius: "var(--r-lg)", border: on ? "1.5px solid var(--brand)" : "1px solid var(--line-2)", background: on ? "var(--brand-tint)" : "var(--surface)", display: "flex", gap: 11, alignItems: "center" }}
              >
                <span className="mono" style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0, fontWeight: 800, fontSize: 13, background: `color-mix(in oklab, ${meta.color} 16%, var(--surface))`, color: meta.color }}>{meta.abbr}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "var(--fs-sm)", fontWeight: 700 }}>{p.name}</div>
                  {p.connected ? (
                    <div style={{ fontSize: 11, color: "var(--ok)", fontWeight: 600, display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <Icon name="check" size={12} /> Connected{typeof p.testCount === "number" ? ` · ${p.testCount} tests` : ""}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Not connected</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* step 2: test library */}
        {kind && (
          <>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>2. Pick a test</div>

            {!connectedOf(kind) ? (
              // Honest "connect your account" empty state - no fabricated tests.
              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "16px 16px", borderRadius: "var(--r-lg)", border: "1px dashed var(--line-2)", background: "var(--surface-2)", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                  <Icon name="plug" size={16} style={{ color: "var(--ink-3)" }} />
                  Connect your {PROVIDER_META[kind].name} account first
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Add your {PROVIDER_META[kind].name} API credentials in Settings, then its real test library will show here to pick from. Nothing is shown until the account is connected.
                </p>
                <a href="/settings/integrations" style={{ display: "inline-flex", gap: 6, alignItems: "center", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--brand)", textDecoration: "none" }}>
                  <Icon name="settings" size={14} /> Open integration settings
                </a>
              </div>
            ) : tests === null && !testsError ? (
              <div style={{ padding: "16px 0", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading {PROVIDER_META[kind].name} test library...</div>
            ) : testsError ? (
              <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: "var(--r)", background: "var(--danger-tint)", color: "var(--danger)", fontSize: "var(--fs-sm)", marginBottom: 16 }}>
                <Icon name="x" size={15} />{testsError}
              </div>
            ) : (tests?.length ?? 0) === 0 ? (
              <div style={{ padding: "16px 16px", borderRadius: "var(--r-lg)", border: "1px dashed var(--line-2)", background: "var(--surface-2)", fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginBottom: 16 }}>
                Your {PROVIDER_META[kind].name} account has no tests to invite to yet. Create a test in {PROVIDER_META[kind].name} and it will appear here.
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 11px", height: 36, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", marginBottom: 10 }}>
                  <Icon name="search" size={15} style={{ color: "var(--ink-3)", flexShrink: 0 }} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${PROVIDER_META[kind].name} tests...`}
                    style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--ink)", fontFamily: "var(--font-sans)" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 260, overflow: "auto", marginBottom: 16 }}>
                  {filteredTests.length === 0 ? (
                    <div style={{ padding: "12px 0", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>No tests match your search.</div>
                  ) : filteredTests.map((t) => {
                    const on = selectedTest === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTest(t.id)}
                        style={{ textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: "var(--r)", border: on ? "1.5px solid var(--brand)" : "1px solid var(--line)", background: on ? "var(--brand-tint)" : "var(--surface)" }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {t.category && <span>{t.category}</span>}
                            {t.durationMinutes != null && <span>{t.category ? "· " : ""}{t.durationMinutes} min</span>}
                          </div>
                        </div>
                        {on && <Icon name="check" size={16} style={{ color: "var(--brand)", flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {sendError && (
          <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: "var(--r)", background: "var(--danger-tint)", color: "var(--danger)", fontSize: "var(--fs-sm)", marginBottom: 12 }}>
            <Icon name="x" size={15} />{sendError}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 4 }}>
          <Btn variant="ghost" size="sm" onClick={() => { if (!sending) onClose(); }}>Cancel</Btn>
          <Btn
            variant="primary"
            size="sm"
            icon="plug"
            onClick={send}
            style={sending || !selectedTest || noEmail ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            {sending ? "Sending..." : "Send test"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
