"use client";
// app/(dashboard)/assessments/page.tsx
// SLICE G10  -  Online Assessments (OA) list. Lists the signed-in tenant's
// assessments via lib/assessment-api (GET /api/assessments) with a live
// background refresh and an honest empty state. The whole screen is GATED behind
// the `oa-assessments` module: useModules() resolves the tenant's enabled module
// set and we only render the list when the module is enabled (or when gating is
// unresolved, in which case use-modules fails soft to all-enabled). When the
// module is off we show a neutral "not enabled" notice rather than the list.
//
// Real-data-only: rows come straight from the gateway; an empty tenant renders
// the empty state, never fabricated assessments. Status / counts / version are
// all live. Clicking a row opens its builder (DRAFT) or its read-only schema.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, EmptyHint } from "@/components/cd/aurora-ui";
import { Pill, SectionCard } from "@/components/cd/aurora-kit";
import { Icon, type IconName } from "@/components/cd/icon";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import { useModules } from "@/hooks/use-modules";
import { AssessmentActivityPanel } from "@/components/cd/assessment-activity-panel";
import {
  listAssessments, createAssessment,
  type AssessmentListItem, type AssessmentStatus,
} from "@/lib/assessment-api";

const MODULE_KEY = "oa-assessments";

const STATUS_META: Record<AssessmentStatus, { label: string; tone: string; bg: string; icon: IconName }> = {
  DRAFT: { label: "Draft", tone: "var(--ink-3)", bg: "var(--surface-3)", icon: "dot" },
  PUBLISHED: { label: "Published", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
  ARCHIVED: { label: "Archived", tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
};

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: AssessmentStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.DRAFT;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px 4px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
      <Icon name={m.icon} size={13} stroke={2.2} />{m.label}
    </span>
  );
}

export default function AssessmentsPage() {
  const router = useRouter();
  const modules = useModules();
  // Module gate: enabled when the resolved set contains the key, OR when gating
  // is unresolved (use-modules fails soft to allEnabled  -  never hide a feature
  // the tenant may actually have).
  const moduleEnabled = modules.allEnabled || (modules.enabledKeys?.includes(MODULE_KEY) ?? false);

  const [rows, setRows] = useState<AssessmentListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Stable loader shared by mount + background refresh; the seq guard makes the
  // latest call win so a slow tick can never overwrite fresher data.
  const seqRef = useRef(0);
  const load = useCallback(async () => {
    const seq = ++seqRef.current;
    try {
      const data = await listAssessments();
      if (seq !== seqRef.current) return;
      setRows(data);
      setError(null);
    } catch (e) {
      if (seq !== seqRef.current) return;
      // Keep any rows already on screen; only surface an error on the first load.
      setRows((prev) => prev ?? []);
      setError(e instanceof Error ? e.message : "Could not load assessments.");
    }
  }, []);

  useEffect(() => {
    if (!moduleEnabled) return;
    load();
    return () => { seqRef.current++; };
  }, [load, moduleEnabled]);
  useLiveRefresh(load);

  const onCreate = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const a = await createAssessment({ title: "Untitled assessment" });
      router.push(`/assessments/${a.id}/builder`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the assessment.");
      setCreating(false);
    }
  }, [creating, router]);

  // While the module set is still resolving, render nothing heavy (avoid a flash
  // of the "not enabled" notice before the real state lands).
  if (modules.loading) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ padding: 24, color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading assessments...</div>
      </div>
    );
  }

  if (!moduleEnabled) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "18px 20px", borderRadius: "var(--r-xl)", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--e1)", maxWidth: 640, margin: "40px auto 0" }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ai-tint)", color: "var(--ai)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="scan" size={18} /></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Online Assessments isn't enabled</div>
            <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}>
              The Online Assessments module is part of a higher plan. Ask an admin to enable it for your workspace to build and send graded assessments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const list = rows ?? [];

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Assessments</h1>
          <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
            {rows === null ? "Loading your assessments..." : `${list.length} assessment${list.length === 1 ? "" : "s"} · graded MCQ, coding and essay questions.`}
          </p>
        </div>
        <Btn variant="primary" icon="plus" onClick={onCreate}>{creating ? "Creating..." : "New assessment"}</Btn>
      </div>

      {error && (
        <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--warn-tint)", color: "var(--warn)", fontSize: "var(--fs-sm)", lineHeight: 1.5, marginBottom: 16, maxWidth: 640 }}>
          <Icon name="flag" size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>{error}</span>
        </div>
      )}

      <SectionCard title="Your assessments" icon="scroll"
        headRight={<Pill icon="cpu" style={{ textTransform: "none" }}>auto-graded + human review</Pill>}>
        {rows === null ? (
          <div style={{ padding: "12px 0", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading...</div>
        ) : list.length === 0 ? (
          <div style={{ display: "grid", placeItems: "center", padding: "32px 0" }}>
            <EmptyHint icon="scroll" text="No assessments yet. Create one to start building graded questions." />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* column header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 110px 80px", gap: 12, padding: "0 13px 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              <span>Assessment</span><span>Status</span><span>Invites</span><span>Updated</span><span style={{ textAlign: "right" }} />
            </div>
            {list.map((a) => (
              <div key={a.id}
                onClick={() => router.push(`/assessments/${a.id}/builder`)}
                style={{ display: "grid", gridTemplateColumns: "1fr 120px 90px 110px 80px", gap: 12, alignItems: "center", padding: "12px 13px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer", boxShadow: "var(--e1)", transition: "border-color var(--t-fast)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="mono">v{a.version}</span>
                    {a.durationMinutes != null && <span>· {a.durationMinutes}m</span>}
                    {a.passingScore != null && <span>· pass {a.passingScore}</span>}
                    {a.counts.results > 0 && <span>· {a.counts.results} graded</span>}
                  </div>
                </div>
                <StatusBadge status={a.status} />
                <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{a.counts.invites}</span>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{fmtDate(a.updatedAt)}</span>
                <span style={{ display: "inline-flex", justifyContent: "flex-end", color: "var(--ink-3)" }}>
                  <Icon name={a.status === "DRAFT" ? "settings" : "eye"} size={15} />
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* LANE 2: cross-candidate invite + result activity, sortable by score and
          filterable by vendor. Reads the existing /:id/invites + /:id/results
          across the tenant's assessments; honest empty until real activity exists. */}
      <div style={{ marginTop: 20 }}>
        <AssessmentActivityPanel />
      </div>
    </div>
  );
}
