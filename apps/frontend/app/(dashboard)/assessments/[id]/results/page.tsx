"use client";
// app/(dashboard)/assessments/[id]/results/page.tsx (SLICE G11).
//
// Recruiter-side online-assessment (OA) results report. Two panes wired to the
// gateway module route /api/assessments (gated behind requireModule('oa-assessments')):
//
//   GET  /api/assessments/:id/results              → graded attempts for one OA
//   GET  /api/assessments/attempts/:attemptId      → full per-attempt breakdown
//   PATCH /api/assessments/attempts/:attemptId/grade → HITL human-point override
//
// What it surfaces, all from REAL persisted grading (never fabricated here):
//   - a section/attempt list with the real raw/percent score + pass bar,
//   - per-question detail with REAL per-test-case Judge0 code verdicts and
//     per-criterion LLM essay rationale read back verbatim from the grader,
//   - the ProctorEvent timeline + the deterministic, transparent riskScore the
//     service computed (fixed-weight, not an LLM number),
//   - a HITL humanPoints grading panel (cloning the review-queue interaction:
//     structured input + an honest "recorded to audit trail" confirmation),
//     wired to PATCH .../grade. It records a HUMAN decision; it never auto-rejects
//     (GDPR Art. 22, adverse routing stays in the existing HITL flow).
//
// Honest empty / honest unknown discipline throughout: an ungraded attempt shows
// "Awaiting grade" not a zero; a question still in manual review shows a null
// (dash) score not a fabricated value; an attempt with no proctor signal shows a
// clean "No proctoring signals captured" timeline, not an invented risk.
//
// Hidden test cases NEVER reach this UI; the service strips hidden-case I/O and
// the answer key before responding; the page only renders what it is given.
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Btn, Pill, ScoreRing, StatusBadge, SectionCard } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { formatDate } from "@/lib/format-date";

// ─────────────────────────────────────────────────────────────────────────────
// API shapes (mirror what apps/assessment-service/src/routes/results.ts returns,
// unwrapped from the { success, data } envelope). All optional/nullable fields
// reflect the service's honest-empty contract.
// ─────────────────────────────────────────────────────────────────────────────
type ResultRow = {
  id: string;
  attemptId: string;
  candidateId: string;
  rawScore: number;
  maxScore: number;
  scorePercent: number | null;
  passed: boolean | null;
  pendingManualReview: boolean;
  gradedAt: string | null;
  attempt: {
    id: string;
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    durationSeconds: number | null;
    inviteId: string;
  } | null;
};

type ResultsList = {
  assessmentId: string;
  title: string;
  passingScore: number | null;
  total: number;
  results: ResultRow[];
};

type TestCase = {
  name: string | null;
  hidden: boolean;
  passed: boolean | null;
  status: string | null; // real Judge0 status verbatim
  timeMs: number | null;
  memoryKb: number | null;
  stdin?: unknown;
  expectedOutput?: unknown;
  actualOutput?: unknown;
};

type Criterion = {
  name: string | null;
  score: number | null;
  maxScore: number | null;
  rationale: string | null;
};

type QuestionDetail = {
  questionId: string;
  type: string | null;
  prompt: string | null;
  correct: boolean | null;
  pointsAwarded: number | null;
  pointsPossible: number | null;
  manuallyGraded: boolean;
  autoGraded: boolean;
  answer: unknown;
  timeSpentSeconds: number | null;
  testCases?: TestCase[];
  criteria?: Criterion[];
  rationale?: string;
};

type ProctorEvent = { id: string; type: string; metadata: Record<string, unknown>; occurredAt: string };

type AttemptDetail = {
  attempt: {
    id: string;
    assessmentId: string;
    candidateId: string;
    inviteId: string;
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    durationSeconds: number | null;
  };
  assessment: { id: string; title: string; passingScore: number | null } | null;
  invite: { id: string; email: string; status: string } | null;
  result: {
    id: string;
    rawScore: number;
    maxScore: number;
    scorePercent: number | null;
    passed: boolean | null;
    pendingManualReview: boolean;
    gradedAt: string | null;
  } | null;
  questions: QuestionDetail[];
  proctoring: { riskScore: number; byType: Record<string, number>; events: ProctorEvent[] };
};

// ─────────────────────────────────────────────────────────────────────────────
// Thin fetch helpers. Same envelope-unwrap + Bearer pattern as lib/api-client.ts;
// kept local so this page owns its module-route calls (the first /api/assessments
// frontend consumer).
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function authToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const t = window.sessionStorage?.getItem("ats-access-token");
    if (t) return t;
  } catch {
    /* sessionStorage may be blocked */
  }
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/);
    if (m?.[1]) return decodeURIComponent(m[1]);
  }
  return "";
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken()}` },
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error((msg as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`);
  }
  return (await res.json()).data as T;
}

async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({}));
    throw new Error((msg as { error?: { message?: string } }).error?.message ?? `Request failed (${res.status})`);
  }
  return (await res.json()).data as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// Small presentation helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmtAnswer = (v: unknown): string => {
  if (v == null) return "(no answer)";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const fmtDuration = (sec: number | null | undefined): string => {
  if (sec == null) return "-";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Score band color for the ring, mirroring the HITL detail convention.
function scoreBand(pct: number | null, passingScore: number | null): string {
  if (pct == null) return "var(--c-ink-3)";
  if (passingScore != null) return pct >= passingScore ? "var(--c-ok)" : "var(--c-danger)";
  return pct >= 70 ? "var(--c-ok)" : pct >= 40 ? "var(--c-warn)" : "var(--c-danger)";
}

// Risk band for the proctoring score (0-100, deterministic from the service).
function riskBand(score: number): { tone: string; bg: string; label: string } {
  if (score >= 50) return { tone: "var(--c-danger)", bg: "var(--c-danger-tint)", label: "High risk" };
  if (score >= 20) return { tone: "var(--c-warn)", bg: "var(--c-warn-tint)", label: "Elevated" };
  return { tone: "var(--c-ok)", bg: "var(--c-ok-tint)", label: "Low risk" };
}

const PROCTOR_LABEL: Record<string, string> = {
  TAB_SWITCH: "Tab switch",
  TAB_BLUR: "Tab lost focus",
  WINDOW_BLUR: "Window lost focus",
  COPY: "Copy",
  PASTE: "Paste",
  FACE_LOST: "Face not detected",
  MULTIPLE_FACES: "Multiple faces",
  FULLSCREEN_EXIT: "Exited fullscreen",
  DEVTOOLS_OPEN: "DevTools opened",
  NETWORK_LOSS: "Network loss",
};
const proctorLabel = (t: string) => PROCTOR_LABEL[(t || "").toUpperCase()] ?? t;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AssessmentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useData<ResultsList>(() => apiGet<ResultsList>(`/assessments/${id}/results`), [id]);

  const [openAttempt, setOpenAttempt] = useState<string | null>(null);

  // Reset the open attempt when navigating to a different assessment.
  useEffect(() => setOpenAttempt(null), [id]);

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <a
        href="/assessments"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 14, textDecoration: "none" }}
      >
        <Icon name="chevsL" size={15} /> Back to assessments
      </a>

      {loading && (
        <div className="grid gap-4" aria-busy="true">
          <Skeleton className="h-[88px] rounded-[18px]" />
          <Skeleton className="h-[260px] rounded-[18px]" />
        </div>
      )}

      {error && (
        <ErrorState
          title="Results unavailable"
          body="The graded results for this assessment could not be loaded."
          code={`GET /api/assessments/${id}/results`}
          onRetry={reload}
        />
      )}

      {data && (
        <>
          {/* header */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Pill icon="fileText">Assessment results</Pill>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>{data.title}</h1>
            </div>
            <div style={{ marginTop: 6, fontSize: "var(--fs-md)", color: "var(--c-ink-2)" }}>
              {data.total} graded {data.total === 1 ? "attempt" : "attempts"}
              {data.passingScore != null ? ` · passing bar ${data.passingScore}%` : " · no passing bar set"}
            </div>
          </div>

          {data.results.length === 0 ? (
            <SectionCard title="Graded attempts" icon="chart">
              <EmptyState
                title="No graded attempts yet"
                body="Once candidates submit and grading completes, their scored attempts appear here. Nothing is shown until a real grade exists."
              />
            </SectionCard>
          ) : (
            <div className="grid gap-3">
              {data.results.map((r) => (
                <AttemptRow
                  key={r.id}
                  row={r}
                  passingScore={data.passingScore}
                  open={openAttempt === r.attemptId}
                  onToggle={() => setOpenAttempt((cur) => (cur === r.attemptId ? null : r.attemptId))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// One attempt row in the list; expands to the full detail pane.
// ─────────────────────────────────────────────────────────────────────────────
function AttemptRow({
  row,
  passingScore,
  open,
  onToggle,
}: {
  row: ResultRow;
  passingScore: number | null;
  open: boolean;
  onToggle: () => void;
}) {
  const pct = row.scorePercent;
  const pending = row.pendingManualReview;

  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <ScoreRing value={pct ?? 0} size={56} band={scoreBand(pct, passingScore)} label={pct == null ? "n/a" : "score"} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <Pill mono>{row.candidateId}</Pill>
            {pending ? (
              <StatusBadge kind="review" />
            ) : row.passed === true ? (
              <StatusBadge kind="pass" />
            ) : row.passed === false ? (
              <StatusBadge kind="fail" />
            ) : (
              <StatusBadge kind="draft" />
            )}
          </div>
          <div style={{ marginTop: 5, fontSize: 12.5, color: "var(--c-ink-3)", display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span className="mono">
              {pending ? "Awaiting grade" : `${row.rawScore} / ${row.maxScore} pts`}
            </span>
            <span>Submitted {formatDate(row.attempt?.submittedAt, { includeTime: true })}</span>
            <span>Duration {fmtDuration(row.attempt?.durationSeconds)}</span>
          </div>
        </div>
        <Icon name={open ? "chevsL" : "chevR"} size={16} style={{ color: "var(--c-ink-3)", transform: open ? "rotate(90deg)" : "none", transition: "transform var(--t)" }} />
      </button>

      {open && (
        <div style={{ borderTop: "1px solid var(--c-line)", padding: "16px 18px", animation: "rise .25s var(--ease-out)" }}>
          <AttemptDetailPane attemptId={row.attemptId} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Full per-attempt breakdown + HITL grading panel.
// ─────────────────────────────────────────────────────────────────────────────
function AttemptDetailPane({ attemptId }: { attemptId: string }) {
  const { data, loading, error, reload } = useData<AttemptDetail>(
    () => apiGet<AttemptDetail>(`/assessments/attempts/${attemptId}`),
    [attemptId],
  );

  if (loading) {
    return (
      <div className="grid gap-3" aria-busy="true">
        <Skeleton className="h-[120px] rounded-[14px]" />
        <Skeleton className="h-[120px] rounded-[14px]" />
      </div>
    );
  }
  if (error) {
    return (
      <ErrorState
        title="Attempt detail unavailable"
        body="The per-question breakdown for this attempt could not be loaded."
        code={`GET /api/assessments/attempts/${attemptId}`}
        onRetry={reload}
      />
    );
  }
  if (!data) {
    return <EmptyState title="Nothing to show" body="This attempt has no recorded detail." />;
  }

  return <DetailContent data={data} reload={reload} />;
}

function DetailContent({ data, reload }: { data: AttemptDetail; reload: () => void }) {
  const { questions, proctoring, result } = data;
  const passingScore = data.assessment?.passingScore ?? null;
  const risk = riskBand(proctoring.riskScore);

  // HITL grading panel state: per-question human point inputs + optional notes.
  const [points, setPoints] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Questions that need (or invite) a human grade: open-ended types and anything
  // still pending. Auto-graded deterministic items are shown read-only above.
  const gradable = useMemo(
    () =>
      questions.filter((q) => {
        const t = (q.type ?? "").toUpperCase();
        return t === "ESSAY" || t === "CODING" || t === "SHORT_ANSWER" || q.correct == null;
      }),
    [questions],
  );

  const dirty = Object.values(points).some((v) => v.trim() !== "");

  const submitGrade = async () => {
    setSaveErr(null);
    setSavedAt(null);
    const grades = Object.entries(points)
      .map(([questionId, raw]) => ({ questionId, raw: raw.trim() }))
      .filter((g) => g.raw !== "")
      .map((g) => ({
        questionId: g.questionId,
        humanPoints: Number(g.raw),
        ...(notes[g.questionId]?.trim() ? { note: notes[g.questionId].trim() } : {}),
      }));

    if (grades.length === 0) {
      setSaveErr("Enter at least one human point value before recording the grade.");
      return;
    }
    if (grades.some((g) => !Number.isFinite(g.humanPoints) || g.humanPoints < 0)) {
      setSaveErr("Human points must be non-negative numbers.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiPatch<{ gradedAt: string | null }>(`/assessments/attempts/${data.attempt.id}/grade`, { grades });
      setSavedAt(res.gradedAt ?? new Date().toISOString());
      setPoints({});
      setNotes({});
      reload(); // pull the recomputed result back so the read-only score updates
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Failed to record the grade.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4">
      {/* result summary banner, honest about ungraded/pending */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "var(--r-lg)",
          background: result ? "var(--c-surface-2)" : "var(--c-warn-tint)",
          border: "1px solid var(--c-line)",
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Icon name={result ? "chart" : "clock"} size={18} style={{ color: result ? "var(--c-ink-3)" : "var(--c-warn)" }} />
        {result ? (
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center", fontSize: "var(--fs-sm)" }}>
            <span className="mono" style={{ fontWeight: 600 }}>
              {result.rawScore} / {result.maxScore} pts{result.scorePercent != null ? ` · ${result.scorePercent}%` : ""}
            </span>
            <span style={{ color: "var(--c-ink-2)" }}>
              {result.passed === true ? "Passed" : result.passed === false ? "Did not pass" : "Pass/fail not set"}
            </span>
            {result.pendingManualReview && <Pill icon="eye" tone="var(--c-warn)" bg="var(--c-warn-tint)">Pending manual review</Pill>}
            <span style={{ color: "var(--c-ink-3)" }}>Graded {formatDate(result.gradedAt, { includeTime: true })}</span>
          </div>
        ) : (
          <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)" }}>
            This attempt has not been auto-graded yet. No score is shown until a real grade exists.
          </span>
        )}
      </div>

      {/* per-question breakdown */}
      <SectionCard title="Question breakdown" icon="scroll" pad={0}>
        {questions.length === 0 ? (
          <div style={{ padding: 18 }}>
            <EmptyState title="No answers recorded" body="This attempt has no per-question detail to display." />
          </div>
        ) : (
          <div>
            {questions.map((q, i) => (
              <QuestionCard key={q.questionId} q={q} index={i} last={i === questions.length - 1} />
            ))}
          </div>
        )}
      </SectionCard>

      {/* proctoring timeline + deterministic risk score */}
      <SectionCard
        title="Proctoring"
        icon="shield"
        pad={0}
        headRight={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Pill tone={risk.tone} bg={risk.bg}>{risk.label}</Pill>
            <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: risk.tone }}>risk {proctoring.riskScore}/100</span>
          </span>
        }
      >
        <div style={{ padding: 18 }}>
          {proctoring.events.length === 0 ? (
            <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
              <Icon name="check" size={16} style={{ color: "var(--c-ok)" }} /> No proctoring signals captured for this attempt.
            </div>
          ) : (
            <>
              {/* by-type counts */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                {Object.entries(proctoring.byType).map(([t, n]) => (
                  <Pill key={t} tone="var(--c-ink-2)" bg="var(--c-surface-2)">
                    {proctorLabel(t)} <b style={{ marginLeft: 4 }}>{n}</b>
                  </Pill>
                ))}
              </div>
              {/* timeline */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {proctoring.events.map((e, i) => (
                  <div
                    key={e.id}
                    style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "9px 0", borderTop: i ? "1px solid var(--c-line)" : "none" }}
                  >
                    <Icon name="flag" size={14} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{proctorLabel(e.type)}</div>
                      {Object.keys(e.metadata).length > 0 && (
                        <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 2, wordBreak: "break-word" }}>
                          {fmtAnswer(e.metadata)}
                        </div>
                      )}
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)", whiteSpace: "nowrap" }}>
                      {formatDate(e.occurredAt, { includeTime: true })}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "var(--c-ink-3)", lineHeight: 1.5 }}>
                Risk is a deterministic, fixed-weight sum over the captured events (no model, no fabrication), so the recruiter can see exactly what drove it.
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* HITL human grading panel, clones the review-queue interaction:
          structured per-question input + an audit-trail confirmation. */}
      <SectionCard title="Human grading (HITL)" icon="cpu">
        <div style={{ marginBottom: 12, padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)", display: "flex", gap: 9, alignItems: "center" }}>
          <Icon name="shield" size={15} style={{ color: "var(--c-ai)", flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>
            Overrides record a <b>human</b> decision and are logged to the audit trail. This never auto-rejects a candidate; adverse outcomes route through the existing review flow (GDPR Art. 22).
          </div>
        </div>

        {gradable.length === 0 ? (
          <EmptyState
            title="Nothing awaiting a human grade"
            body="Every question on this attempt was deterministically auto-graded. There is nothing for a reviewer to score."
          />
        ) : savedAt ? (
          <div style={{ padding: "14px 18px", borderRadius: "var(--r-lg)", background: "var(--c-ok-tint)", border: "1px solid color-mix(in oklab, var(--c-ok) 30%, transparent)", display: "flex", gap: 10, alignItems: "center" }}>
            <Icon name="check" size={18} style={{ color: "var(--c-ok)" }} />
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
              Grade recorded {formatDate(savedAt, { includeTime: true })}. Logged to the audit trail; the result above is recomputed.
            </span>
          </div>
        ) : (
          <div className="grid gap-3">
            {gradable.map((q) => (
              <div key={q.questionId} style={{ borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>
                    {q.prompt ? (q.prompt.length > 90 ? q.prompt.slice(0, 90) + "…" : q.prompt) : q.questionId}
                  </span>
                  <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{q.type ?? "question"}</Pill>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ fontSize: 12, color: "var(--c-ink-2)", display: "inline-flex", gap: 7, alignItems: "center" }}>
                    Human points
                    <input
                      type="number"
                      min={0}
                      max={q.pointsPossible ?? undefined}
                      inputMode="decimal"
                      value={points[q.questionId] ?? ""}
                      onChange={(ev) => setPoints((p) => ({ ...p, [q.questionId]: ev.target.value }))}
                      placeholder={q.pointsAwarded != null ? String(q.pointsAwarded) : "0"}
                      style={{ width: 80, padding: "6px 9px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--c-ink)" }}
                    />
                  </label>
                  <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-3)" }}>
                    of {q.pointsPossible ?? "?"} possible{q.pointsAwarded != null ? ` · auto ${q.pointsAwarded}` : ""}
                  </span>
                </div>
                <input
                  type="text"
                  value={notes[q.questionId] ?? ""}
                  onChange={(ev) => setNotes((m) => ({ ...m, [q.questionId]: ev.target.value }))}
                  placeholder="Reviewer note (optional, logged to audit trail)"
                  style={{ marginTop: 9, width: "100%", padding: "7px 10px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", fontSize: 12.5, color: "var(--c-ink)" }}
                />
              </div>
            ))}

            {saveErr && (
              <div style={{ padding: "10px 13px", borderRadius: "var(--r)", background: "var(--c-danger-tint)", border: "1px solid color-mix(in oklab, var(--c-danger) 28%, transparent)", fontSize: 12.5, color: "var(--c-danger)", display: "flex", gap: 8, alignItems: "center" }}>
                <Icon name="flag" size={14} /> {saveErr}
              </div>
            )}

            <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <Btn variant="primary" icon="check" disabled={saving || !dirty} onClick={submitGrade}>
                {saving ? "Recording…" : "Record human grade"}
              </Btn>
              <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
                Points are capped at each question&apos;s maximum; the result is recomputed against the passing bar
                {passingScore != null ? ` (${passingScore}%)` : ""}.
              </span>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// One read-only question card: grade + answer + (CODING) Judge0 per-test-case
// verdicts + (ESSAY) per-criterion LLM rationale. Hidden-case I/O is already
// stripped server-side; we only render what we are given.
// ─────────────────────────────────────────────────────────────────────────────
function QuestionCard({ q, index, last }: { q: QuestionDetail; index: number; last: boolean }) {
  const type = (q.type ?? "").toUpperCase();
  const awarded = q.pointsAwarded;
  const possible = q.pointsPossible;

  // Grade chip: honest dash when still awaiting a human grade.
  const gradeTone =
    awarded == null
      ? { tone: "var(--c-ink-3)", bg: "var(--c-surface-3)", text: "Awaiting grade" }
      : possible != null && awarded >= possible
        ? { tone: "var(--c-ok)", bg: "var(--c-ok-tint)", text: `${awarded} / ${possible}` }
        : awarded === 0
          ? { tone: "var(--c-danger)", bg: "var(--c-danger-tint)", text: `${awarded} / ${possible ?? "?"}` }
          : { tone: "var(--c-warn)", bg: "var(--c-warn-tint)", text: `${awarded} / ${possible ?? "?"}` };

  return (
    <div style={{ padding: "14px 18px", borderTop: index ? "1px solid var(--c-line)" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>Q{index + 1}</span>
            <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" icon={type === "CODING" ? "terminal" : type === "ESSAY" ? "fileText" : "scroll"}>
              {q.type ?? "question"}
            </Pill>
            {q.manuallyGraded && <Pill tone="var(--c-ai-ink)" bg="var(--c-ai-tint)" icon="cpu">human-graded</Pill>}
            {q.autoGraded && !q.manuallyGraded && <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">auto-graded</Pill>}
          </div>
          {q.prompt && <div style={{ marginTop: 7, fontSize: "var(--fs-sm)", color: "var(--c-ink)", lineHeight: 1.5 }}>{q.prompt}</div>}
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: gradeTone.tone, background: gradeTone.bg, whiteSpace: "nowrap" }}>
          {gradeTone.text}
        </span>
      </div>

      {/* candidate answer (non-code) */}
      {type !== "CODING" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 5 }}>Candidate answer</div>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{fmtAnswer(q.answer)}</div>
        </div>
      )}

      {/* CODING: real per-test-case Judge0 verdicts */}
      {type === "CODING" && q.testCases && q.testCases.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 7, display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Icon name="terminal" size={13} /> Test cases ({q.testCases.filter((t) => t.passed === true).length}/{q.testCases.length} passed)
          </div>
          <div className="grid gap-1.5">
            {q.testCases.map((tc, i) => (
              <div key={i} style={{ borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", padding: "9px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", gap: 7, alignItems: "center" }}>
                    <Icon name={tc.passed === true ? "check" : tc.passed === false ? "x" : "dot"} size={14} style={{ color: tc.passed === true ? "var(--c-ok)" : tc.passed === false ? "var(--c-danger)" : "var(--c-ink-3)" }} />
                    {tc.name ?? `Case ${i + 1}`}
                    {tc.hidden && <Pill tone="var(--c-ink-3)" bg="var(--c-surface-3)">hidden</Pill>}
                  </span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", display: "inline-flex", gap: 10 }}>
                    {tc.status && <span>{tc.status}</span>}
                    {tc.timeMs != null && <span>{tc.timeMs}ms</span>}
                  </span>
                </div>
                {/* visible-case I/O only; hidden cases never carry I/O from the server */}
                {!tc.hidden && (tc.stdin !== undefined || tc.expectedOutput !== undefined || tc.actualOutput !== undefined) && (
                  <div className="mono" style={{ marginTop: 7, fontSize: 11, color: "var(--c-ink-3)", display: "grid", gap: 3, wordBreak: "break-word" }}>
                    {tc.stdin !== undefined && <div><span style={{ color: "var(--c-ink-2)" }}>in:</span> {fmtAnswer(tc.stdin)}</div>}
                    {tc.expectedOutput !== undefined && <div><span style={{ color: "var(--c-ink-2)" }}>expected:</span> {fmtAnswer(tc.expectedOutput)}</div>}
                    {tc.actualOutput !== undefined && <div><span style={{ color: "var(--c-ink-2)" }}>got:</span> {fmtAnswer(tc.actualOutput)}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CODING with no test-case verdicts yet (e.g. still grading) */}
      {type === "CODING" && (!q.testCases || q.testCases.length === 0) && (
        <div style={{ marginTop: 10, fontSize: 12.5, color: "var(--c-ink-3)", display: "inline-flex", gap: 7, alignItems: "center" }}>
          <Icon name="clock" size={13} /> No code verdicts recorded yet for this submission.
        </div>
      )}

      {/* ESSAY: per-criterion LLM rubric rationale, read verbatim */}
      {q.criteria && q.criteria.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-ink-3)", marginBottom: 7, display: "inline-flex", gap: 6, alignItems: "center" }}>
            <Icon name="sparkles" size={13} style={{ color: "var(--c-ai)" }} /> Rubric rationale
          </div>
          <div className="grid gap-1.5">
            {q.criteria.map((c, i) => (
              <div key={i} style={{ borderRadius: "var(--r)", border: "1px solid var(--c-line)", background: "var(--c-surface-2)", padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{c.name ?? `Criterion ${i + 1}`}</span>
                  {c.score != null && (
                    <span className="mono" style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{c.score}{c.maxScore != null ? ` / ${c.maxScore}` : ""}</span>
                  )}
                </div>
                {c.rationale && <div style={{ marginTop: 5, fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5, display: "flex", gap: 6 }}><span style={{ color: "var(--c-ai)", fontWeight: 700 }}>AI</span>{c.rationale}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* overall LLM rationale (when there are no per-criterion entries) */}
      {q.rationale && (!q.criteria || q.criteria.length === 0) && (
        <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 18%, transparent)", fontSize: 12.5, color: "var(--c-ink-2)", lineHeight: 1.5, display: "flex", gap: 7 }}>
          <Icon name="sparkles" size={14} style={{ color: "var(--c-ai)", flexShrink: 0, marginTop: 1 }} /> {q.rationale}
        </div>
      )}

      {!last && null}
    </div>
  );
}
