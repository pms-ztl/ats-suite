"use client";
// app/(candidate-portal)/assessment/take/[token]/page.tsx
//
// SLICE G12 - the PUBLIC candidate ASSESSMENT RUNNER (no auth). A fork of the
// public apply renderer (app/(candidate-portal)/jobs/[id]/apply/page.tsx) adapted
// for a timed, proctored online assessment. The [token] route param is the
// single-use INVITE token from the take link.
//
// What it adds on top of the apply renderer's field-rendering + submit shape:
//   - POST /api/public/assessment/start to OPEN (or resume) the attempt. The
//     server returns the sanitized questions (NO answer key / NO hidden test
//     cases), a per-attempt SESSION token (held only in memory), and the
//     SERVER-AUTHORITATIVE remainingSeconds.
//   - A countdown driven by the SERVER clock: a periodic heartbeat re-syncs
//     remainingSeconds from the server; the browser only displays it and never
//     decides when time is up (auto-submit fires when the server says 0).
//   - Debounced autosave (PUT .../answer) per question, with a per-question save
//     status indicator. Saving also returns the authoritative remaining time.
//   - A flag-for-review question-NAV grid (answered / flagged / current).
//   - An explicit confirm-submit dialog (no accidental end of attempt).
//   - Monaco editor (next/dynamic, ssr:false, loaded ONLY on this route) for
//     CODING questions.
//   - Proctor-event capture (visibilitychange / blur / fullscreenchange / paste /
//     copy / contextmenu) batched + flushed via POST .../proctor-events.
//
// HARD RULES: never renders the answer key or hidden test cases (the server
// already stripped them); never shows a score (submit only confirms receipt);
// nothing is auto-rejected. The clock is the server's, not the browser's.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  startAttempt, saveAnswer, heartbeat, sendProctorEvents, submitAttempt,
  TakeApiError,
  type StartResponse, type TakeQuestion, type AnswerValue, type ProctorEventInput,
} from "@/lib/assessment-api";

// Monaco is loaded client-only and ONLY on this route (a heavy chunk we never
// want in the server bundle or on any other page). ssr:false keeps it out of SSR.
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: "16px", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
      Loading the code editor...
    </div>
  ),
});

/* ───────────────────────────── shared chrome (ported from apply) ───────────────────────────── */
const PI: Record<string, string> = {
  check: "M5 12.5l4.5 4.5L19 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chevL: "M15 6l-6 6 6 6",
  chevR: "M9 6l6 6-6 6",
  sparkles: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5l3.6-1.4z",
  shield: "M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5zM9 12l2 2 4-4",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
};
function I({ n, s = 20, sw = 1.7, c, style }: { n: string; s?: number; sw?: number; c?: string; style?: React.CSSProperties }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c || "currentColor"} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      <path d={PI[n]} />
    </svg>
  );
}
function Btn({ kind = "primary", icon, trail, children, onClick, big, full, type, disabled, style = {} }: {
  kind?: "primary" | "soft" | "ghost" | "danger"; icon?: string; trail?: string; children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; big?: boolean; full?: boolean;
  type?: "button" | "submit" | "reset"; disabled?: boolean; style?: React.CSSProperties;
}) {
  const V = {
    primary: { background: "var(--c-brand)", color: "var(--c-on-brand)", boxShadow: "var(--e1)" },
    soft: { background: "var(--c-surface)", color: "var(--c-ink)", border: "1px solid var(--c-line-2)" },
    ghost: { background: "transparent", color: "var(--c-ink-2)" },
    danger: { background: "var(--c-danger)", color: "var(--c-on-brand)" },
  }[kind];
  return (
    <button onClick={onClick} type={type} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, padding: big ? "13px 22px" : "10px 18px", fontSize: big ? "var(--fs-md)" : "var(--fs-sm)", fontWeight: 700, borderRadius: "var(--r)", cursor: disabled ? "default" : "pointer", border: "1px solid transparent", width: full ? "100%" : "auto", transition: "transform var(--t) var(--ease-out), box-shadow var(--t)", ...V, ...(disabled ? { opacity: 0.6, pointerEvents: "none" } : {}), ...style }}>
      {icon && <I n={icon} s={big ? 19 : 17} />}{children}{trail && <I n={trail} s={big ? 19 : 17} />}
    </button>
  );
}
const Label = ({ children, req }: { children?: React.ReactNode; req?: boolean }) => (
  <label style={{ display: "block", fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)", marginBottom: 7 }}>{children}{req && <span style={{ color: "var(--c-brand)" }}> *</span>}</label>
);
const inp: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-md)", outline: "none", fontFamily: "var(--font-sans)" };

/* ───────────────────────────── helpers ───────────────────────────── */
type Phase = "loading" | "error" | "taking" | "done";
type SaveState = "idle" | "saving" | "saved" | "error";

function fmtClock(sec: number | null): string {
  if (sec == null) return "Untimed";
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`;
}

// Map the question's language hint to a Monaco language id (default plaintext).
function monacoLang(lang?: string | null): string {
  const l = (lang ?? "").toLowerCase();
  const map: Record<string, string> = {
    py: "python", python: "python", js: "javascript", javascript: "javascript",
    ts: "typescript", typescript: "typescript", java: "java", c: "c",
    "c++": "cpp", cpp: "cpp", "c#": "csharp", csharp: "csharp", go: "go",
    golang: "go", rb: "ruby", ruby: "ruby", rs: "rust", rust: "rust",
    php: "php", sql: "sql", kotlin: "kotlin", swift: "swift",
  };
  return map[l] ?? (l || "plaintext");
}

/* ───────────────────────────── confirm-submit dialog ───────────────────────────── */
function ConfirmSubmit({ answered, total, flagged, onCancel, onConfirm, submitting }: {
  answered: number; total: number; flagged: number;
  onCancel: () => void; onConfirm: () => void; submitting: boolean;
}) {
  const unanswered = total - answered;
  return (
    <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", background: "color-mix(in oklab, var(--c-ink) 45%, transparent)", padding: 20 }}>
      <div className="clay" style={{ maxWidth: 460, width: "100%", borderRadius: "var(--r-2xl)", padding: 28, background: "var(--c-surface)" }}>
        <h2 style={{ fontSize: "var(--fs-xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px" }}>Submit your assessment?</h2>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 16px" }}>
          Once you submit you cannot return to your answers. You have answered <b style={{ color: "var(--c-ink)" }}>{answered} of {total}</b> questions
          {unanswered > 0 && <> ({unanswered} still unanswered)</>}
          {flagged > 0 && <>, with <b style={{ color: "var(--c-ink)" }}>{flagged}</b> flagged for review</>}.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn kind="soft" onClick={onCancel} disabled={submitting}>Keep working</Btn>
          <Btn kind="primary" trail="arrow" onClick={onConfirm} disabled={submitting}>{submitting ? "Submitting..." : "Submit now"}</Btn>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── done / terminal screens ───────────────────────────── */
function Done({ title, scoringInProgress }: { title: string; scoringInProgress: boolean }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "pop .4s var(--ease-spring)" }}>
      <div style={{ width: 80, height: 80, borderRadius: "var(--r-2xl)", background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}><I n="check" s={42} sw={2.2} /></div>
      <h1 style={{ fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>Assessment submitted</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: "0 0 8px" }}>Thanks for completing <b style={{ color: "var(--c-ink)" }}>{title}</b>. Your responses have been recorded.</p>
      <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", margin: "6px 0 0", lineHeight: 1.6 }}>
        {scoringInProgress
          ? "Some answers are still being reviewed. The hiring team will follow up, and a person always makes the final decision."
          : "The hiring team will review your results. A person always makes the final decision."}
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
        <a href="/status" style={{ textDecoration: "none" }}><Btn kind="primary" icon="eye">Track my status</Btn></a>
      </div>
    </div>
  );
}

function Terminal({ message }: { message: string }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center", animation: "rise .4s var(--ease-out)" }}>
      <div style={{ width: 64, height: 64, borderRadius: "var(--r-2xl)", background: "var(--c-surface-2)", color: "var(--c-ink-3)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}><I n="shield" s={32} /></div>
      <h1 style={{ fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 10px" }}>We could not open this assessment</h1>
      <p style={{ fontSize: "var(--fs-md)", color: "var(--c-ink-2)", lineHeight: 1.6, margin: 0 }}>{message}</p>
      <p style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-3)", margin: "14px 0 0", lineHeight: 1.6 }}>If you think this is a mistake, please reach out to the hiring team who sent you the invitation.</p>
    </div>
  );
}

/* ───────────────────────────── the runner ───────────────────────────── */
const HEARTBEAT_MS = 20_000; // server clock re-sync cadence
const AUTOSAVE_MS = 800;     // debounce before persisting an edited answer
const PROCTOR_FLUSH_MS = 5_000; // batch window for proctor events

export default function AssessmentTakePage() {
  const { token } = useParams<{ token: string }>();

  const [phase, setPhase] = useState<Phase>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [meta, setMeta] = useState<StartResponse["assessment"] | null>(null);
  const [questions, setQuestions] = useState<TakeQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [scoringInProgress, setScoringInProgress] = useState(false);

  // Answers + per-question save state + flags.
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // A transient (non-terminal) banner, e.g. a recoverable submit failure that
  // leaves the candidate in the take so they can retry.
  const [transient, setTransient] = useState<string | null>(null);

  // Refs that must NOT trigger re-renders / re-bind effects.
  const attemptIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const saveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const proctorQueueRef = useRef<ProctorEventInput[]>([]);
  const submittedRef = useRef(false);
  const startedAtRef = useRef<number>(Date.now());

  /* ── start (open or resume) the attempt ────────────────────────────────── */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await startAttempt(token);
        if (cancelled) return;
        attemptIdRef.current = res.attemptId;
        sessionTokenRef.current = res.sessionToken;
        startedAtRef.current = Date.now();
        setMeta(res.assessment);
        const ordered = [...res.questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setQuestions(ordered);
        setRemaining(res.remainingSeconds);
        setPhase("taking");
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof TakeApiError ? err.message : "Something went wrong opening this assessment.";
        setErrorMsg(msg);
        setPhase("error");
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  /* ── proctoring capture (batched) ──────────────────────────────────────── */
  const flushProctor = useCallback(async () => {
    const attemptId = attemptIdRef.current;
    const sessionToken = sessionTokenRef.current;
    if (!attemptId || !sessionToken) return;
    if (proctorQueueRef.current.length === 0) return;
    const batch = proctorQueueRef.current.splice(0, proctorQueueRef.current.length);
    try {
      await sendProctorEvents(attemptId, sessionToken, batch);
    } catch {
      // Best-effort telemetry: on failure, re-queue so the next flush retries
      // (capped so a long outage cannot grow the queue without bound).
      proctorQueueRef.current = [...batch, ...proctorQueueRef.current].slice(0, 200);
    }
  }, []);

  const recordProctor = useCallback((type: string, metadata?: Record<string, unknown>) => {
    proctorQueueRef.current.push({ type, metadata, occurredAt: new Date().toISOString() });
    if (proctorQueueRef.current.length >= 25) void flushProctor();
  }, [flushProctor]);

  /* ── submit (explicit confirm OR auto on the server clock reaching 0) ────── */
  const doSubmit = useCallback(async () => {
    const attemptId = attemptIdRef.current;
    const sessionToken = sessionTokenRef.current;
    if (!attemptId || !sessionToken || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      // Best-effort: flush any queued proctor events before we finalize.
      await flushProctor();
      const res = await submitAttempt(attemptId, sessionToken);
      setScoringInProgress(res.scoringInProgress);
      setShowConfirm(false);
      setPhase("done");
    } catch (err) {
      submittedRef.current = false; // allow retry on a transient failure
      const msg = err instanceof TakeApiError ? err.message : "We could not submit just now. Please try again.";
      if (err instanceof TakeApiError && (err.status === 409 || err.code === "CONFLICT")) {
        // The server already finalized / expired the attempt; treat as done.
        setScoringInProgress(false);
        setPhase("done");
      } else {
        setErrorMsg(msg);
        setShowConfirm(false);
        // Stay in "taking" so the candidate can retry; surface a transient banner.
        setTransient(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }, [flushProctor]);

  /* ── server-authoritative clock: tick locally for smoothness, re-sync via a
   *    periodic heartbeat. The browser NEVER decides time is up on its own; when
   *    the server-synced remaining hits 0 we auto-submit. ──────────────────── */
  useEffect(() => {
    if (phase !== "taking") return;
    if (remaining == null) return; // untimed, no countdown

    // 1s local tick for a smooth display.
    const tick = setInterval(() => {
      setRemaining((r) => (r == null ? r : Math.max(0, r - 1)));
    }, 1000);

    return () => clearInterval(tick);
  }, [phase, remaining == null]); // re-arm only when timed-ness changes

  // Auto-submit exactly once when the (server-synced) clock reaches 0.
  useEffect(() => {
    if (phase === "taking" && remaining !== null && remaining <= 0 && !submittedRef.current) {
      void doSubmit();
    }
  }, [phase, remaining, doSubmit]);

  // Periodic heartbeat: the server recomputes the authoritative remaining time
  // and we replace our local estimate with it (so the browser can't drift / cheat).
  useEffect(() => {
    if (phase !== "taking") return;
    const attemptId = attemptIdRef.current;
    const sessionToken = sessionTokenRef.current;
    if (!attemptId || !sessionToken) return;

    const hb = setInterval(async () => {
      try {
        const res = await heartbeat(attemptId, sessionToken);
        if (res.remainingSeconds !== undefined) setRemaining(res.remainingSeconds);
      } catch (err) {
        // A 409 from the server clock means the attempt expired server-side.
        if (err instanceof TakeApiError && err.status === 409 && !submittedRef.current) {
          setRemaining(0); // triggers the auto-submit effect
        }
        // Other transient errors are ignored; the next heartbeat retries.
      }
    }, HEARTBEAT_MS);

    return () => clearInterval(hb);
  }, [phase]);

  /* ── debounced autosave per question ───────────────────────────────────── */
  const queueSave = useCallback((questionId: string, value: AnswerValue) => {
    const attemptId = attemptIdRef.current;
    const sessionToken = sessionTokenRef.current;
    if (!attemptId || !sessionToken) return;

    setSaveState((s) => ({ ...s, [questionId]: "saving" }));
    const prev = saveTimersRef.current[questionId];
    if (prev) clearTimeout(prev);

    saveTimersRef.current[questionId] = setTimeout(async () => {
      try {
        const timeSpentSeconds = Math.max(0, Math.floor((Date.now() - startedAtRef.current) / 1000));
        const res = await saveAnswer(attemptId, sessionToken, { questionId, value, timeSpentSeconds });
        if (res.remainingSeconds !== undefined && res.remainingSeconds !== null) {
          setRemaining(res.remainingSeconds); // autosave doubles as a heartbeat
        }
        setSaveState((s) => ({ ...s, [questionId]: "saved" }));
      } catch (err) {
        setSaveState((s) => ({ ...s, [questionId]: "error" }));
        if (err instanceof TakeApiError && err.status === 409 && !submittedRef.current) {
          setRemaining(0); // attempt expired server-side -> auto-submit
        }
      }
    }, AUTOSAVE_MS);
  }, []);

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((a) => ({ ...a, [questionId]: value }));
    queueSave(questionId, value);
  }, [queueSave]);

  /* ── proctoring capture: wire DOM listeners (flush/record defined above) ── */
  useEffect(() => {
    if (phase !== "taking") return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") recordProctor("tab_hidden");
      else recordProctor("tab_visible");
    };
    const onBlur = () => recordProctor("window_blur");
    const onFocus = () => recordProctor("window_focus");
    const onFullscreen = () =>
      recordProctor("fullscreen_change", { fullscreen: Boolean(document.fullscreenElement) });
    const onPaste = (e: ClipboardEvent) => {
      const len = e.clipboardData?.getData("text")?.length ?? 0;
      recordProctor("paste", { length: len });
    };
    const onCopy = () => recordProctor("copy");
    const onContextMenu = () => recordProctor("context_menu");

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("paste", onPaste);
    document.addEventListener("copy", onCopy);
    document.addEventListener("contextmenu", onContextMenu);

    const flush = setInterval(() => { void flushProctor(); }, PROCTOR_FLUSH_MS);

    // Warn before leaving and capture the intent as a proctor signal.
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return;
      recordProctor("page_unload_attempt");
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearInterval(flush);
      void flushProctor();
    };
  }, [phase, recordProctor, flushProctor]);

  /* ── derived counts for the nav grid + submit dialog ───────────────────── */
  const isAnswered = useCallback((q: TakeQuestion): boolean => {
    const v = answers[q.id];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" ? v.trim().length > 0 : false;
  }, [answers]);

  const answeredCount = useMemo(() => questions.filter(isAnswered).length, [questions, isAnswered]);
  const flaggedCount = useMemo(() => questions.filter((q) => flagged[q.id]).length, [questions, flagged]);

  /* ── render gates ──────────────────────────────────────────────────────── */
  if (phase === "loading") {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "var(--c-ink-3)" }}>
        <I n="clock" s={28} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: "var(--fs-md)", fontWeight: 600, color: "var(--c-ink-2)" }}>Opening your assessment...</div>
      </div>
    );
  }
  if (phase === "error") return <Terminal message={errorMsg} />;
  if (phase === "done") return <Done title={meta?.title ?? "this assessment"} scoringInProgress={scoringInProgress} />;

  const q = questions[current];
  const lowTime = remaining !== null && remaining <= 60;

  /* ── question body renderer (forked from apply, plus CODING/Monaco) ─────── */
  function renderQuestionBody(question: TakeQuestion) {
    const v = answers[question.id];
    switch (question.type) {
      case "MCQ_SINGLE":
      case "TRUE_FALSE":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {(question.options ?? []).map((o) => {
              const selected = v === o.id;
              return (
                <label key={o.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", border: `1.5px solid ${selected ? "var(--c-brand)" : "var(--c-line-2)"}`, background: selected ? "var(--c-brand-tint)" : "var(--c-surface)", cursor: "pointer", fontSize: "var(--fs-md)", color: "var(--c-ink)" }}>
                  <input type="radio" name={question.id} checked={selected} onChange={() => setAnswer(question.id, o.id)} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--c-brand)" }} />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </div>
        );
      case "MCQ_MULTI": {
        const sel = new Set(Array.isArray(v) ? v : []);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {(question.options ?? []).map((o) => {
              const selected = sel.has(o.id);
              return (
                <label key={o.id} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", border: `1.5px solid ${selected ? "var(--c-brand)" : "var(--c-line-2)"}`, background: selected ? "var(--c-brand-tint)" : "var(--c-surface)", cursor: "pointer", fontSize: "var(--fs-md)", color: "var(--c-ink)" }}>
                  <input type="checkbox" checked={selected} onChange={(e) => {
                    const next = new Set(sel);
                    if (e.target.checked) next.add(o.id); else next.delete(o.id);
                    setAnswer(question.id, Array.from(next));
                  }} style={{ marginTop: 3, width: 17, height: 17, accentColor: "var(--c-brand)" }} />
                  <span>{o.label}</span>
                </label>
              );
            })}
          </div>
        );
      }
      case "SHORT_ANSWER":
        return (
          <input type="text" value={(v as string) ?? ""} onChange={(e) => setAnswer(question.id, e.target.value)} style={inp} placeholder="Type your answer" />
        );
      case "ESSAY":
        return (
          <textarea rows={8} value={(v as string) ?? ""} onChange={(e) => setAnswer(question.id, e.target.value)} style={{ ...inp, resize: "vertical", lineHeight: 1.55 }} placeholder="Write your response" />
        );
      case "CODING":
        return (
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--c-line-2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--c-surface-2)", fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", fontWeight: 600 }}>
              <span>{question.language ? `Language: ${question.language}` : "Code"}</span>
              <span>Your code is graded automatically after you submit.</span>
            </div>
            <MonacoEditor
              height="360px"
              language={monacoLang(question.language)}
              theme="vs-dark"
              value={typeof v === "string" ? v : (question.starterCode ?? "")}
              onChange={(val) => setAnswer(question.id, val ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
              }}
            />
          </div>
        );
      default:
        return (
          <input type="text" value={(v as string) ?? ""} onChange={(e) => setAnswer(question.id, e.target.value)} style={inp} placeholder="Type your answer" />
        );
    }
  }

  const save = q ? saveState[q.id] ?? "idle" : "idle";

  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", color: "var(--c-ink)", display: "flex", flexDirection: "column" }}>
      {/* Sticky exam header: title + server clock + answered count. */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid var(--c-line)", background: "var(--c-surface)", backdropFilter: "saturate(180%) blur(8px)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: "var(--fs-md)", letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta?.title ?? "Assessment"}</div>
            <div style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)" }}>{answeredCount} of {questions.length} answered</div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: "var(--r-pill)", fontWeight: 800, fontVariantNumeric: "tabular-nums", background: lowTime ? "var(--c-danger-tint)" : "var(--c-surface-2)", color: lowTime ? "var(--c-danger)" : "var(--c-ink)" }}>
            <I n="clock" s={16} />{fmtClock(remaining)}
          </div>
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: 1120, margin: "0 auto", width: "100%", padding: "20px", display: "grid", gridTemplateColumns: "minmax(0,1fr) 248px", gap: 24, alignItems: "start" }}>
        {/* Main question column */}
        <main>
          {transient && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-danger-tint)", color: "var(--c-danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5, marginBottom: 16 }}>
              <I n="shield" s={17} style={{ flexShrink: 0, marginTop: 1 }} /><span>{transient}</span>
            </div>
          )}

          {/* AI-usage NOTICE (WF10/J1 - EU AI Act Art.13 / GDPR Art.22). A short,
              honest disclosure shown on the first question: AI assists scoring and
              a person always makes the final decision, with a path to a human
              review. Linked to /transparency for the full explainer. */}
          {current === 0 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 22%, transparent)", marginBottom: 16 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: "var(--c-ai, var(--c-brand))", color: "var(--c-on-ai, var(--c-on-brand))", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <I n="sparkles" s={16} />
              </span>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: "var(--c-ai-ink, var(--c-ink))", marginBottom: 2 }}>How your answers are scored</div>
                We use automated tools to help score this assessment: exact-match checks for multiple-choice, code execution for coding answers, and AI assistance for written answers. <b style={{ color: "var(--c-ink)" }}>AI only assists scoring; a person always reviews the results and makes the final decision.</b> You can <a href="/appeal" style={{ color: "var(--c-ai-ink, var(--c-brand))", fontWeight: 600 }}>request a human review</a> at any time. <a href="/transparency" style={{ color: "var(--c-ai-ink, var(--c-brand))", fontWeight: 600 }}>Learn how we use AI in hiring</a>.
              </div>
            </div>
          )}

          {meta?.instructions && current === 0 && (
            <div style={{ padding: "14px 16px", borderRadius: "var(--r-lg)", background: "var(--c-surface-2)", border: "1px solid var(--c-line-2)", marginBottom: 16, fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: "var(--c-ink)", marginBottom: 4 }}>Instructions</div>
              {meta.instructions}
            </div>
          )}

          {q && (
            <div className="clay" style={{ borderRadius: "var(--r-2xl)", padding: 26 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Question {current + 1} of {questions.length}{q.points ? ` · ${q.points} ${q.points === 1 ? "point" : "points"}` : ""}</span>
                <button type="button" onClick={() => setFlagged((f) => ({ ...f, [q.id]: !f[q.id] }))}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 700, cursor: "pointer", border: "1px solid var(--c-line-2)", background: flagged[q.id] ? "var(--c-warn-tint, var(--c-surface-2))" : "var(--c-surface)", color: flagged[q.id] ? "var(--c-warn, var(--c-brand))" : "var(--c-ink-2)" }}>
                  <I n="flag" s={14} />{flagged[q.id] ? "Flagged" : "Flag for review"}
                </button>
              </div>

              <Label req={q.required}>{q.prompt}</Label>
              <div style={{ marginTop: 10 }}>{renderQuestionBody(q)}</div>

              {/* Per-question save status (honest: reflects the real autosave call). */}
              <div style={{ marginTop: 12, fontSize: "var(--fs-xs)", color: save === "error" ? "var(--c-danger)" : "var(--c-ink-3)", minHeight: 16 }}>
                {save === "saving" && "Saving..."}
                {save === "saved" && "Saved"}
                {save === "error" && "Could not save, your edit will retry."}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 18 }}>
                <Btn kind="soft" icon="chevL" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>Previous</Btn>
                {current < questions.length - 1 ? (
                  <Btn kind="primary" trail="chevR" onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>Next</Btn>
                ) : (
                  <Btn kind="primary" trail="arrow" onClick={() => setShowConfirm(true)}>Review &amp; submit</Btn>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Question-nav grid + submit */}
        <aside style={{ position: "sticky", top: 76 }}>
          <div className="clay" style={{ borderRadius: "var(--r-xl)", padding: 16 }}>
            <div style={{ fontSize: "var(--fs-xs)", fontWeight: 700, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Questions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {questions.map((qq, i) => {
                const answered = isAnswered(qq);
                const isFlagged = flagged[qq.id];
                const isCurrent = i === current;
                return (
                  <button key={qq.id} type="button" onClick={() => setCurrent(i)} aria-label={`Go to question ${i + 1}${answered ? ", answered" : ""}${isFlagged ? ", flagged" : ""}`}
                    style={{
                      position: "relative", aspectRatio: "1 / 1", borderRadius: "var(--r)", fontSize: "var(--fs-sm)", fontWeight: 700, cursor: "pointer",
                      border: isCurrent ? "2px solid var(--c-brand)" : "1px solid var(--c-line-2)",
                      background: answered ? "var(--c-brand-tint)" : "var(--c-surface)",
                      color: answered ? "var(--c-brand)" : "var(--c-ink-2)",
                    }}>
                    {i + 1}
                    {isFlagged && <span style={{ position: "absolute", top: 2, right: 2 }}><I n="flag" s={10} c="var(--c-warn, var(--c-brand))" /></span>}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 5, margin: "14px 0", fontSize: "var(--fs-xs)", color: "var(--c-ink-3)" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--c-brand-tint)", border: "1px solid var(--c-brand)", marginRight: 6, verticalAlign: "middle" }} />Answered ({answeredCount})</span>
              <span><I n="flag" s={11} c="var(--c-warn, var(--c-brand))" style={{ marginRight: 4, verticalAlign: "middle" }} />Flagged ({flaggedCount})</span>
            </div>

            <Btn kind="primary" full trail="arrow" onClick={() => setShowConfirm(true)}>Submit assessment</Btn>
          </div>

          <p style={{ fontSize: "var(--fs-xs)", color: "var(--c-ink-3)", lineHeight: 1.6, marginTop: 12, textAlign: "center" }}>
            Your answers save automatically. A person always makes the final decision.
          </p>
        </aside>
      </div>

      {showConfirm && (
        <ConfirmSubmit answered={answeredCount} total={questions.length} flagged={flaggedCount}
          onCancel={() => setShowConfirm(false)} onConfirm={() => void doSubmit()} submitting={submitting} />
      )}
    </div>
  );
}
