"use client";
// app/(dashboard)/compliance/page.tsx - EXACT Claude Design "Aurora" fairness
// dashboard (claude-design/screen-fairness.jsx): adverse-impact analysis against
// the four-fifths (0.80) rule. Per-group selection-rate bars, impact ratio vs the
// 0.80 threshold, an overall pass/fail banner, and EEOC export. The framing is
// advisory: monitoring surfaces potential adverse impact, it does not decide; a
// ratio below 0.80 warrants a human review of the selection procedure.
// Wired to the real gateway via getAdverseImpact (flat FairnessMetric[]); no
// demographics are fabricated, every number is computed from returned metrics.
import { Btn, Pill, StatusBadge, Reveal } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";

const THRESHOLD = 0.8;

/** A horizontal selection-rate bar; the reference (highest) group reads brand,
 *  the rest read ok when at/above 0.80 and danger when below. */
function RateBar({ rate, max, isRef, pass }: { rate: number; max: number; isRef: boolean; pass: boolean }) {
  const w = max > 0 ? (rate / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 22, borderRadius: 6, background: "var(--c-surface-3)", overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: w + "%", borderRadius: 6, transition: "width 1s var(--ease-out)",
          background: isRef ? "var(--c-brand)" : pass ? "var(--c-ok)" : "var(--c-danger)" }} />
      </div>
      <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, width: 52, textAlign: "right", color: "var(--c-ink)" }}>{(rate * 100).toFixed(1)}%</span>
    </div>
  );
}

/** One group's adverse-impact card: header with impact ratio + status, the
 *  group's selection-rate bar against the reference, and an advisory finding. */
function GroupCard({ m, max, isRef }: { m: FairnessMetric; max: number; isRef: boolean }) {
  const pass = !m.flagged && m.impactRatio >= THRESHOLD;
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--c-line)",
        background: pass ? "transparent" : "var(--c-danger-tint)" }}>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 700, fontSize: "var(--fs-md)" }}>
          {m.group}
          {isRef && <Pill tone="var(--c-brand)" bg="var(--c-brand-tint)" style={{ fontSize: 9.5, padding: "0 6px" }}>reference</Pill>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Impact ratio</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: pass ? "var(--c-ok)" : "var(--c-danger)" }}>{m.impactRatio.toFixed(2)}</div>
          </div>
          <StatusBadge kind={pass ? "pass" : "fail"} />
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600 }}>Selection rate</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>vs 0.80 threshold</span>
          </div>
          <RateBar rate={m.selectionRate} max={max} isRef={isRef} pass={pass} />
        </div>
        <div style={{ marginTop: 4, padding: "11px 13px", borderRadius: "var(--r)", background: pass ? "var(--c-ok-tint)" : "var(--c-danger-tint)", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name={pass ? "check" : "flag"} size={15} style={{ color: pass ? "var(--c-ok)" : "var(--c-danger)", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.5 }}>
            {pass
              ? `Impact ratio at or above 0.80; no adverse impact indicated for ${m.group} at this stage.`
              : `Impact ratio below 0.80 for ${m.group}. Review the selection procedure at this stage; this is a signal for human review, not a decision.`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const { data, loading, error, reload } = useData<FairnessMetric[]>(getAdverseImpact);

  const metrics = data ?? [];
  const failing = metrics.filter((m) => m.flagged || m.impactRatio < THRESHOLD).length;
  // The reference group is the one with the highest selection rate (the basis the
  // four-fifths ratio is computed against), and it sets the bar scale. Computed,
  // never assumed.
  const maxRate = metrics.reduce((mx, m) => Math.max(mx, m.selectionRate), 0);

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <Pill icon="shield" tone="var(--c-brand)" bg="var(--c-brand-tint)">EEOC · Uniform Guidelines</Pill>
            <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">computed by bias-auditor</Pill>
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Adverse-impact analysis</h1>
          <p style={{ margin: "6px 0 0", fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>
            Selection rates by group against the four-fifths (0.80) rule. Monitoring is advisory and supports your compliance review; it does not decide.
          </p>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Btn variant="soft" icon="scroll">View methodology</Btn>
          <Btn variant="primary" icon="arrowUpRight">Export EEOC report</Btn>
        </div>
      </header>

      {loading && (
        <div className="grid gap-4">
          <Skeleton className="h-[92px] rounded-[18px]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-[18px]" />)}
          </div>
        </div>
      )}

      {error && (
        <ErrorState title="Could not load fairness data" body="The compliance service did not respond." code="GET /api/compliance/adverse-impact" onRetry={reload} />
      )}

      {data && data.length === 0 && (
        <EmptyState
          title="Not enough data yet"
          body="Once enough decisions are recorded, impact ratios appear here against the 0.80 threshold, date-stamped for the EEOC export."
        />
      )}

      {data && data.length > 0 && (
        <>
          {/* overall banner */}
          <Reveal>
            <div style={{ borderRadius: "var(--r-xl)", padding: "18px 22px", marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
              background: failing ? "linear-gradient(110deg, var(--c-danger-tint), transparent 70%)" : "linear-gradient(110deg, var(--c-ok-tint), transparent 70%)",
              border: "1px solid " + (failing ? "color-mix(in oklab, var(--c-danger) 30%, transparent)" : "color-mix(in oklab, var(--c-ok) 30%, transparent)") }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: failing ? "var(--c-danger)" : "var(--c-ok)", color: "white", flexShrink: 0 }}>
                <Icon name={failing ? "flag" : "check"} size={26} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>
                  {failing
                    ? `${failing} of ${metrics.length} group${metrics.length === 1 ? "" : "s"} show${failing === 1 ? "s" : ""} potential adverse impact`
                    : "No adverse impact detected"}
                </div>
                <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 2 }}>
                  Any impact ratio below 0.80 warrants review of the selection procedure at this stage. The 0.80 threshold and the four-fifths rule are legal facts, not thresholds we chose.
                </div>
              </div>
              <div style={{ display: "flex", gap: 18 }}>
                {[["Groups", metrics.length], ["At or above 0.80", metrics.length - failing], ["Flagged", failing]].map(([k, v]) => (
                  <div key={k as string} style={{ textAlign: "center" }}>
                    <div className="mono tnum" style={{ fontSize: 22, fontWeight: 600 }}>{v as number}</div>
                    <div style={{ fontSize: 10.5, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{k as string}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* group cards + methodology panel */}
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((m, i) => (
              <Reveal key={m.group} i={i + 1}>
                <GroupCard m={m} max={maxRate} isRef={m.selectionRate === maxRate && maxRate > 0} />
              </Reveal>
            ))}

            <Reveal i={metrics.length + 1}>
              <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>How this is computed</div>
                <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 14 }}>Four-fifths (0.80) rule · EEOC Uniform Guidelines</div>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.55, marginBottom: 14 }}>
                  Each group&apos;s selection rate is divided by the rate of the highest-selected (reference) group. A resulting impact ratio below 0.80 flags potential adverse impact for that group and warrants a human review of the procedure.
                </div>
                <div style={{ fontSize: 11.5, color: "var(--c-ink-2)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
                  <Icon name="shield" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--c-ai)" }} />
                  Privacy-preserving: the auditor sees only aggregate group counts, never individual identities. Intersectional breakdowns and date stamps are included in the EEOC export.
                </div>
              </div>
            </Reveal>
          </div>

          <p style={{ marginTop: 12, fontSize: "var(--fs-xs)", color: "var(--c-ink-3)" }}>
            A ratio below 0.80 flags potential adverse impact for review. This monitoring is advisory; the final compliance decision stays with your team.
          </p>
        </>
      )}
    </div>
  );
}
