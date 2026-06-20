"use client";
// app/(dashboard)/assessments/[id]/builder/page.tsx
// SLICE G10 - the graded assessment builder route. A FORK of the application
// FormBuilder (components/cd/RequisitionBuilder.tsx -> FormBuilder), extended for
// graded questions and wired to the real assessment schema via
// AssessmentBuilderLive (GET/PUT /api/assessments/:id/schema).
//
// The whole screen is GATED behind the `oa-assessments` module (useModules); when
// the module is off we show a neutral notice rather than the builder. The header
// reads the assessment's real title/status; the live wrapper owns load/save/publish.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Btn } from "@/components/cd/aurora-ui";
import { Icon } from "@/components/cd/icon";
import { AssessmentBuilderLive } from "@/components/cd/assessment-builder-live";
import { useModules } from "@/hooks/use-modules";
import { getAssessment, type AssessmentListItem } from "@/lib/assessment-api";

const MODULE_KEY = "oa-assessments";

export default function AssessmentBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const modules = useModules();
  const moduleEnabled = modules.allEnabled || (modules.enabledKeys?.includes(MODULE_KEY) ?? false);

  const [meta, setMeta] = useState<AssessmentListItem | null>(null);

  useEffect(() => {
    if (!id || !moduleEnabled) return;
    let alive = true;
    getAssessment(id)
      .then((m) => { if (alive) setMeta(m); })
      .catch(() => { /* header falls back to a neutral title */ });
    return () => { alive = false; };
  }, [id, moduleEnabled]);

  if (modules.loading) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ padding: 24, color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading...</div>
      </div>
    );
  }

  if (!moduleEnabled) {
    return (
      <div className="mx-auto w-full max-w-[1280px]">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "18px 20px", borderRadius: "var(--r-xl)", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--e1)", maxWidth: 640, margin: "40px auto 0" }}>
          <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ai-tint)", color: "var(--ai)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon name="scan" size={18} /></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>Online Assessments is not enabled</div>
            <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)", lineHeight: 1.6 }}>Ask an admin to enable the Online Assessments module for your workspace.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = meta?.title ?? "Assessment";

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <button onClick={() => router.push("/assessments")} style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "var(--ink-2)", fontWeight: 600, fontSize: "var(--fs-sm)", marginBottom: 10, padding: 0, fontFamily: "var(--font-sans)" }}>
            <Icon name="chevsL" size={15} /> All assessments
          </button>
          <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</h1>
          <p style={{ margin: "5px 0 0", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>
            Build graded questions candidates answer. <span className="mono">{id}</span>
            {meta?.status ? ` - ${meta.status}` : ""}
          </p>
        </div>
        <Btn variant="soft" icon="eye" onClick={() => router.push("/assessments")}>Done</Btn>
      </div>

      <AssessmentBuilderLive assessmentId={id} title={title} />
    </div>
  );
}
