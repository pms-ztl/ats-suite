"use client";
// app/(dashboard)/analytics/diversity/page.tsx - VERBATIM port of
// claude-design/screen-fairness.jsx (the adverse-impact / four-fifths fairness
// drilldown). The prototype's exact markup is reproduced element-for-element:
// the header (EEOC + bias-auditor pills, h1, sub), the overall pass/fail banner
// (icon tile + finding + stat trio), the grid of attribute cards (per-group
// selection-rate Bars, impact ratio, StatusBadge, finding callout), and the
// intersectional heatmap with the privacy-preserving note. Kit refs (Pill, Btn,
// Icon, StatusBadge) map to @/components/aurora-kit + aurora-icon, and every
// palette var(--x) is converted to its --c-x full-color companion.
//
// HONEST WIRING: the cards are driven by the real getAdverseImpact endpoint
// (FairnessMetric[]). The flat group series is folded into attribute families
// (Gender, Race / ethnicity, Age, ...) so it lands in the prototype's attribute
// shape; impact ratios, flagged groups, and the overall verdict are all real.
// loading / error / empty render INSIDE the prototype's container. The
// intersectional heatmap keeps the prototype's literal illustration (the
// endpoint exposes no gender x ethnicity cross series), matching how the parent
// analytics page treats series the gateway does not provide. Clicking an
// attribute card focuses it (useState drill). Numeric fields are guarded with
// (x ?? 0).toFixed(...) before formatting.
import { Fragment, useState } from "react";
import { Pill, Btn, StatusBadge } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";

const FOUR_FIFTHS = 0.8;

// View-model that mirrors the prototype's window.FAIRNESS.attributes[] shape.
type FGroup = { g: string; sel: number; app: number; rate: number; ref?: boolean };
type FAttr = { name: string; ratio: number; pass: boolean; finding: string; groups: FGroup[] };

// Best-effort attribute family for a fairness group name, so the flat real
// series reads like the prototype's "Gender", "Race / ethnicity", "Age" cards.
function attrLabel(group: string): string {
  const g = (group || "").toLowerCase();
  if (/wom|men|female|male|gender|non-?binary/.test(g)) return "Gender";
  if (/age|40|older|young/.test(g)) return "Age";
  if (/race|ethnic|black|asian|hispanic|latin|white|african|native|pacific/.test(g)) return "Race / ethnicity";
  if (/disab/.test(g)) return "Disability";
  if (/veteran/.test(g)) return "Veteran status";
  return "Representation";
}

// Fold a flat FairnessMetric[] into the prototype's attribute-card shape.
function toAttributes(rows: FairnessMetric[]): FAttr[] {
  const byFamily = new Map<string, FairnessMetric[]>();
  rows.forEach((m) => {
    const key = attrLabel(m.group);
    (byFamily.get(key) ?? byFamily.set(key, []).get(key)!).push(m);
  });
  return Array.from(byFamily.entries()).map(([name, members]) => {
    const maxRate = members.reduce((mx, x) => Math.max(mx, x.selectionRate || 0), 0) || 1;
    const ratio = members.reduce((mn, x) => Math.min(mn, x.impactRatio ?? 1), 1);
    const pass = !members.some((x) => x.flagged);
    const flaggedNames = members.filter((x) => x.flagged).map((x) => x.group);
    const finding = pass
      ? `All groups in this attribute clear the four-fifths rule. Lowest impact ratio ${ratio.toFixed(2)}; keep this as a routine check on the process.`
      : `${flaggedNames.join(", ")} select below 0.80 of the reference group. Review the selection procedure at this stage, never correct outcomes by group.`;
    const groups: FGroup[] = members.map((x) => ({
      g: x.group,
      sel: 0,
      app: 0,
      rate: x.selectionRate || 0,
      ref: (x.selectionRate || 0) >= maxRate,
    }));
    return { name, ratio, pass, finding, groups };
  });
}

function Bar({ rate, max, isRef, pass }: { rate: number; max: number; isRef?: boolean; pass: boolean }) {
  const w = (rate / max) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 22, borderRadius: 6, background: "var(--c-surface-3)", overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: w + "%", borderRadius: 6, transition: "width 1s var(--ease-out)",
          background: isRef ? "var(--c-brand)" : pass ? "var(--c-ok)" : "var(--c-danger)" }} />
      </div>
      <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, width: 52, textAlign: "right", color: "var(--c-ink)" }}>{((rate ?? 0) * 100).toFixed(1)}%</span>
    </div>
  );
}

function AttrCard({ a, focused, onFocus }: { a: FAttr; focused: boolean; onFocus: () => void }) {
  const max = Math.max(...a.groups.map((g) => g.rate), 0.0001);
  return (
    <div onClick={onFocus} style={{ borderRadius: "var(--r-xl)", border: "1px solid " + (focused ? "color-mix(in oklab, var(--c-brand) 45%, var(--c-line))" : "var(--c-line)"), background: "var(--c-surface)", overflow: "hidden", boxShadow: focused ? "var(--e2)" : "var(--e1)", cursor: "pointer", transition: "border-color var(--t), box-shadow var(--t)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--c-line)",
        background: a.pass ? "transparent" : "var(--c-danger-tint)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{a.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Impact ratio</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: a.pass ? "var(--c-ok)" : "var(--c-danger)" }}>{(a.ratio ?? 0).toFixed(2)}</div>
          </div>
          <StatusBadge kind={a.pass ? "pass" : "fail"} />
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {a.groups.map((g) => (
          <div key={g.g} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>{g.g}
                {g.ref && <Pill tone="var(--c-brand)" bg="var(--c-brand-tint)" style={{ fontSize: 9.5, padding: "0 6px" }}>reference</Pill>}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{((g.rate ?? 0) * 100).toFixed(1)}% selected</span>
            </div>
            <Bar rate={g.rate} max={max} isRef={g.ref} pass={a.pass} />
          </div>
        ))}
        <div style={{ marginTop: 4, padding: "11px 13px", borderRadius: "var(--r)", background: a.pass ? "var(--c-ok-tint)" : "var(--c-danger-tint)", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name={a.pass ? "check" : "flag"} size={15} style={{ color: a.pass ? "var(--c-ok)" : "var(--c-danger)", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.5 }}>{a.finding}</span>
        </div>
      </div>
    </div>
  );
}

export default function DiversityPage() {
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const rows = fairness.data ?? [];
  const attributes = toAttributes(rows);
  const failing = attributes.filter((a) => !a.pass).length;
  const stage = "Phone screen";
  const range = "Last 90 days";

  // Drill interaction: clicking an attribute card focuses it.
  const [focusedAttr, setFocusedAttr] = useState<string | null>(null);

  // Banner stat trio (the prototype shows Applicants / Selected / Stages; the
  // FairnessMetric series exposes no raw counts, so we surface the honest
  // derived signals that drive this screen).
  const minRatio = rows.length ? rows.reduce((m, x) => Math.min(m, x.impactRatio ?? 1), 1) : 1;
  const flaggedCount = rows.filter((m) => m.flagged).length;
  const bannerStats: [string, string][] = [
    ["Groups tracked", String(rows.length)],
    ["Flagged groups", String(flaggedCount)],
    ["Lowest ratio", (minRatio ?? 0).toFixed(2)],
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6 }}>
            <Pill icon="shield" tone="var(--c-brand)" bg="var(--c-brand-tint)">EEOC · Uniform Guidelines</Pill>
            <Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">computed by bias-auditor</Pill>
          </div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Adverse-impact analysis</h1>
          <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 6 }}>{stage} · {range} · four-fifths (0.80) rule</div>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="soft" icon="scroll">View methodology</Btn>
          <Btn variant="primary" icon="arrowUpRight">Publish audit summary</Btn>
        </div>
      </div>

      {/* loading / error / empty for the wired fairness series, in-place */}
      {fairness.loading && (
        <div style={{ display: "grid", gap: 16 }}>
          <Skeleton className="h-[92px] rounded-[18px]" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[260px] rounded-[18px]" />)}
          </div>
        </div>
      )}
      {fairness.error && (
        <ErrorState title="Could not load adverse-impact analysis" body="The bias-auditor service did not respond." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />
      )}
      {fairness.data && rows.length === 0 && (
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", boxShadow: "var(--e1)", padding: "40px 18px" }}>
          <EmptyState title="No adverse-impact data yet" body="Selection rates and four-fifths impact ratios by group appear here once enough candidates have moved through the funnel. Representation is read as a signal about your process, never a quota." />
        </div>
      )}

      {fairness.data && rows.length > 0 && (
        <>
          {/* overall banner */}
          <div style={{ borderRadius: "var(--r-xl)", padding: "18px 22px", marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
            background: failing ? "linear-gradient(110deg, var(--c-danger-tint), transparent 70%)" : "linear-gradient(110deg, var(--c-ok-tint), transparent 70%)",
            border: "1px solid " + (failing ? "color-mix(in oklab, var(--c-danger) 30%, transparent)" : "color-mix(in oklab, var(--c-ok) 30%, transparent)") }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: failing ? "var(--c-danger)" : "var(--c-ok)", color: "white", flexShrink: 0 }}>
              <Icon name={failing ? "flag" : "check"} size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{failing ? `${failing} of ${attributes.length} attributes show potential adverse impact` : "No adverse impact detected"}</div>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 2 }}>Any impact ratio below 0.80 warrants review of the selection procedure at this stage. The 0.80 threshold and groupings are legal facts, not thresholds we chose.</div>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              {bannerStats.map(([k, v]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div className="mono tnum" style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
                  <div style={{ fontSize: 10.5, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* attribute cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {attributes.map((a) => <AttrCard key={a.name} a={a} focused={focusedAttr === a.name} onFocus={() => setFocusedAttr((cur) => (cur === a.name ? null : a.name))} />)}
            {/* intersection heatmap */}
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Intersectional view</div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 14 }}>Selection rate · gender × ethnicity</div>
              <div style={{ display: "grid", gridTemplateColumns: "84px repeat(3, 1fr)", gap: 4, fontSize: 11 }}>
                <div></div>
                {["White", "Asian", "Black"].map((c) => <div key={c} style={{ textAlign: "center", fontWeight: 600, color: "var(--c-ink-3)", paddingBottom: 4 }}>{c}</div>)}
                {([["Men", [0.24, 0.25, 0.17]], ["Women", [0.22, 0.23, 0.15]], ["Non-binary", [0.21, 0.20, 0.14]]] as [string, number[]][]).map(([row, vals]) => (
                  <Fragment key={row}>
                    <div style={{ fontWeight: 600, color: "var(--c-ink-3)", display: "flex", alignItems: "center" }}>{row}</div>
                    {vals.map((v, i) => {
                      const ok = v >= 0.18;
                      return <div key={i} className="mono" style={{ height: 38, borderRadius: 7, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600,
                        color: ok ? "var(--c-ink)" : "white", background: ok ? `color-mix(in oklab, var(--c-ok) ${v*180}%, var(--c-surface-2))` : `color-mix(in oklab, var(--c-danger) ${(0.25-v)*420}%, var(--c-surface-2))` }}>{(v*100).toFixed(0)}%</div>;
                    })}
                  </Fragment>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--c-ink-2)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
                <Icon name="shield" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--c-ai)" }} />
                Privacy-preserving: the auditor sees only group counts, never individual identities.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
