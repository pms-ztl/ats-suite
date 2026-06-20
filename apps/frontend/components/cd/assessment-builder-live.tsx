"use client";
// components/cd/assessment-builder-live.tsx
// SLICE G10 - wires the forked AssessmentBuilder to the real assessment schema.
// A clone of form-builder-live.tsx: loads GET /api/assessments/:id/schema, lets
// the recruiter author graded questions (MCQ / coding / essay, with points,
// per-question time limits and correct-answer keys), and persists via PUT
// /api/assessments/:id/schema - either a DRAFT save in place, or publish:true
// (which bumps the version, derives the flat question array server-side, and
// flips the assessment to PUBLISHED, immutable thereafter).
//
// The builder edits a flat ordered question list; we wrap it into the backend's
// section tree as a single default section on save. Loading flattens whatever
// sections exist back into one ordered list. Real-data-only: nothing is
// fabricated; a load failure leaves the current view untouched.
import { useCallback, useEffect, useRef, useState } from "react";
import { AssessmentBuilder, type BuilderQuestion, type QType } from "./AssessmentBuilder";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import {
  getAssessmentSchema, saveAssessmentSchema,
  type AssessmentTree, type SchemaQuestion, type AssessmentStatus,
} from "@/lib/assessment-api";

const DEFAULT_SECTION_ID = "section-1";
const DEFAULT_SECTION_TITLE = "Questions";

// schema question (backend) -> builder question (UI)
function toBuilderQuestion(q: SchemaQuestion, i: number): BuilderQuestion {
  return {
    id: q.id,
    type: q.type as QType,
    prompt: q.prompt ?? "",
    required: q.required ?? true,
    points: typeof q.points === "number" ? q.points : 1,
    timeLimit: q.timeLimit ?? null,
    order: typeof q.order === "number" ? q.order : i,
    options: q.options ? q.options.map((o) => ({ id: o.id, label: o.label })) : undefined,
    correctAnswer: q.correctAnswer,
    language: q.language,
    starterCode: q.starterCode,
  };
}

// builder question (UI) -> schema question (backend); drop empty optionals so the
// AJV schema (additionalProperties:false, but optionals allowed) stays clean.
function toSchemaQuestion(q: BuilderQuestion, i: number): SchemaQuestion {
  const out: SchemaQuestion = {
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    order: i,
    required: q.required,
    points: Number.isFinite(q.points) ? q.points : 1,
  };
  if (q.timeLimit != null) out.timeLimit = q.timeLimit;
  if (q.options && q.options.length) out.options = q.options.map((o) => ({ id: o.id, label: o.label }));
  // correctAnswer only for deterministic items, and only when actually set.
  const isMcq = q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI" || q.type === "TRUE_FALSE";
  if (isMcq || q.type === "SHORT_ANSWER") {
    if (Array.isArray(q.correctAnswer)) { if (q.correctAnswer.length) out.correctAnswer = q.correctAnswer; }
    else if (typeof q.correctAnswer === "string" && q.correctAnswer !== "") out.correctAnswer = q.correctAnswer;
  }
  if (q.type === "CODING") {
    if (q.language) out.language = q.language;
    if (q.starterCode) out.starterCode = q.starterCode;
  }
  return out;
}

// Flatten the section tree the backend stores into the single ordered list the
// builder edits (section order, then in-section order).
function flatten(tree: AssessmentTree): BuilderQuestion[] {
  const sections = [...(tree.sections ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const flat: SchemaQuestion[] = [];
  for (const s of sections) {
    const qs = [...(s.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    flat.push(...qs);
  }
  return flat.map(toBuilderQuestion);
}

// Wrap the flat builder list back into a one-section tree, preserving any
// existing settings the load surfaced.
function wrap(questions: BuilderQuestion[], settings?: AssessmentTree["settings"]): AssessmentTree {
  return {
    ...(settings ? { settings } : {}),
    sections: [{
      id: DEFAULT_SECTION_ID,
      title: DEFAULT_SECTION_TITLE,
      order: 0,
      questions: questions.map(toSchemaQuestion),
    }],
  };
}

export function AssessmentBuilderLive({ assessmentId, title }: { assessmentId: string; title?: string }) {
  const [questions, setQuestions] = useState<BuilderQuestion[] | null>(null);
  const [status, setStatus] = useState<AssessmentStatus>("DRAFT");
  const [version, setVersion] = useState<number | undefined>(undefined);
  const settingsRef = useRef<AssessmentTree["settings"]>(undefined);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const seqRef = useRef(0);
  const load = useCallback(async () => {
    const seq = ++seqRef.current;
    const res = await getAssessmentSchema(assessmentId);
    if (seq !== seqRef.current) return;
    settingsRef.current = res.schemaJson.settings;
    setQuestions(flatten(res.schemaJson));
    setStatus(res.status);
    setVersion(res.version);
  }, [assessmentId]);

  useEffect(() => {
    load().catch(() => { /* keep the current view */ });
    return () => { seqRef.current++; };
  }, [load]);
  // Only background-refresh a published/archived (read-only) record - never
  // clobber an in-progress DRAFT edit session by re-pulling from the server.
  useLiveRefresh(() => { if (status !== "DRAFT") { void load(); } });

  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current); }, []);

  const persist = async (qs: BuilderQuestion[], publish: boolean) => {
    setState("saving");
    setErrorMsg(null);
    try {
      const res = await saveAssessmentSchema(assessmentId, wrap(qs, settingsRef.current), publish);
      setStatus(res.status);
      setVersion(res.version);
      settingsRef.current = res.schemaJson.settings;
      if (publish) setQuestions(flatten(res.schemaJson)); // reflect the immutable published tree
      setState("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2200);
    } catch (e) {
      setState("error");
      setErrorMsg(e instanceof Error ? e.message : "Could not save the assessment.");
    }
  };

  if (questions === null) {
    return <div style={{ padding: 24, color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading the assessment...</div>;
  }

  return (
    <>
      {errorMsg && (
        <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--danger-tint)", color: "var(--danger)", fontSize: "var(--fs-sm)", lineHeight: 1.5, marginBottom: 16, maxWidth: 720 }}>
          <span>{errorMsg}</span>
        </div>
      )}
      <AssessmentBuilder
        data={{ questions }}
        title={title}
        status={status}
        version={version}
        onSaveDraft={(qs) => persist(qs, false)}
        onPublish={(qs) => persist(qs, true)}
        publishState={state}
      />
    </>
  );
}
