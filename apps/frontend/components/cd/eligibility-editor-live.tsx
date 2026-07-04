"use client";
// components/cd/eligibility-editor-live.tsx
// Wires the byte-idiom EligibilityRulesEditor (RequisitionBuilder) to the real
// requisition. Loads the stored eligibility spec (lane-local getEligibilityRules,
// which reads the requisition row's `eligibilityRules` column) plus the current
// application form fields (so the recruiter authors custom criteria against REAL
// field ids), and persists via a PATCH that sends ONLY eligibilityRules (additive
// and backward-compatible), so no other requisition field is touched.
//
// The gating engine (job-service requisitions.ts / public.ts) already enforces
// this spec on the public apply path; this screen only authors it. Empty spec =
// open to all (honest empty state).
import { useCallback, useEffect, useRef, useState } from "react";
import { EligibilityRulesEditor, type EligibilityFieldOption } from "./RequisitionBuilder";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import { getApplicationForm } from "@/lib/api";
import { getEligibilityRules, saveEligibilityRules, type EligibilityRuleDef } from "./eligibility-api";

// The well-known quick-rule fields are always offered even if the form does not
// (yet) declare them explicitly, since candidates commonly answer them.
const IMPLICIT_FIELDS: EligibilityFieldOption[] = [
  { id: "department", label: "Department" },
  { id: "degree", label: "Degree" },
  { id: "cgpa", label: "CGPA" },
];

function mergeFieldOptions(formFields: { id: string; label: string }[]): EligibilityFieldOption[] {
  const seen = new Set<string>();
  const out: EligibilityFieldOption[] = [];
  for (const f of formFields) {
    if (!f?.id || seen.has(f.id)) continue;
    seen.add(f.id);
    out.push({ id: f.id, label: f.label || f.id });
  }
  for (const f of IMPLICIT_FIELDS) {
    if (!seen.has(f.id)) { seen.add(f.id); out.push(f); }
  }
  return out;
}

export function EligibilityEditorLive({ requisitionId }: { requisitionId: string }) {
  const [rules, setRules] = useState<EligibilityRuleDef[] | null>(null);
  const [fieldOptions, setFieldOptions] = useState<EligibilityFieldOption[]>([]);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // seq guard: latest load wins; a stale response (previous requisition or a slow
  // background tick) can never overwrite fresher data. Errors keep the view.
  const seqRef = useRef(0);
  const load = useCallback(async () => {
    const seq = ++seqRef.current;
    const [stored, form] = await Promise.all([
      getEligibilityRules(requisitionId),
      getApplicationForm(requisitionId).catch(() => ({ fields: [] as { id: string; label: string }[] })),
    ]);
    if (seq !== seqRef.current) return;
    setRules(stored);
    setFieldOptions(mergeFieldOptions((form.fields ?? []).map((f) => ({ id: f.id, label: f.label }))));
  }, [requisitionId]);

  useEffect(() => {
    load().catch(() => { /* keep the current view */ });
    return () => { seqRef.current++; };
  }, [load]);
  useLiveRefresh(load);

  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current); }, []);
  const save = async (next: EligibilityRuleDef[]) => {
    setState("saving");
    try {
      await saveEligibilityRules(requisitionId, next);
      setRules(next);
      setState("saved");
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2200);
    } catch { setState("error"); }
  };

  if (rules == null) return <div style={{ padding: 24, color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading eligibility rules...</div>;
  // key on the loaded spec so a background refresh that changes the stored rules
  // reseeds the editor's internal draft (matching FormBuilderLive's snapshot model).
  return <EligibilityRulesEditor key={rules.map((r) => r.field + r.op + (r.values ?? []).join(",")).join("|")} rules={rules} fieldOptions={fieldOptions} onSave={save} saveState={state} />;
}
