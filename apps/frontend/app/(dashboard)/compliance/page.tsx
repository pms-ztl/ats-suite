"use client";
// app/(dashboard)/compliance/page.tsx - EXACT Claude Design "Aurora" compliance
// hub (claude-design/screen-compliancehub.jsx ComplianceHubScreen): three tabs,
// Overview (compliance-score banner + Policy compliance + Certifications),
// Adverse impact (four-fifths 0.80 banner + per-attribute impact cards + the
// intersectional heatmap), and Audit log (event timeline). The adverse-impact
// pieces are wired to the real gateway via getAdverseImpact (flat
// FairnessMetric[], one card per group), with loading/error/empty rendered inside
// the tab. Policy/cert/audit sections the API does not expose keep the prototype's
// exact structure with example content. All framing is advisory: a ratio below
// 0.80 is a signal for human review, never an automated decision.
import { useState } from "react";
import {
  Btn, Pill, StatusBadge, SectionCard, Timeline,
} from "@/components/aurora-kit";
import { ArcMeter } from "@/components/shared/ribbon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { BarsChart, EmptyChart, CHART_COLORS } from "@/components/shared/charts";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";
import { useData } from "@/lib/use-data";
import { getAdverseImpact } from "@/lib/api";
import type { FairnessMetric } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";
import { SceneArt } from "@/components/shared/scene-art";

const THRESHOLD = 0.8;

/* Policy / certification / audit context for the Overview and Audit tabs. The
   adverse-impact endpoint does not expose these, so the prototype's exact
   structure is kept with example content (the four-fifths numbers below are
   replaced by the real gateway in the Adverse-impact tab). */
const COMPLIANCE = {
  score: 94, range: "Jan 1 to May 30, 2026", generated: "May 30, 2026 · 09:14",
  policies: [
    { p: "EEOC adverse-impact monitoring", st: "active", note: "Auto-runs nightly" },
    { p: "GDPR data-retention (24 mo)", st: "active", note: "Next purge in 12 days" },
    { p: "Right-to-explanation (candidate portal)", st: "active", note: "Live · 1,204 explanations served" },
    { p: "Human-in-the-loop on rejections", st: "active", note: "No solely-automated declines" },
    { p: "Model drift alerts", st: "review", note: "1 model on watch (bias-auditor)" },
    { p: "Data Processing Agreements", st: "active", note: "All 3 sub-processors signed" },
  ],
  certs: [
    { c: "SOC 2 Type II", st: "Valid", until: "Mar 2027" },
    { c: "ISO 27001", st: "Valid", until: "Nov 2026" },
    { c: "GDPR", st: "Compliant", until: ", " },
    { c: "EEOC Uniform Guidelines", st: "Compliant", until: ", " },
  ],
  audit: [
    { who: "bias-auditor", act: "computed four-fifths report (3 attributes)", t: "3h", ai: true },
    { who: "Avery Chen", act: "exported EEOC summary (Q2)", t: "5h" },
    { who: "system", act: "retention purge, 1,204 records", t: "1d" },
    { who: "Jordan Lee", act: "overrode an AI rejection (HQ-1)", t: "1d" },
    { who: "Maya Idris", act: "updated retention policy to 24 months", t: "2d" },
  ],
};

function ImpactBar({ rate, max, isRef, pass }: { rate: number; max: number; isRef: boolean; pass: boolean }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 20, borderRadius: 6, background: "var(--c-surface-3)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: (max > 0 ? rate / max * 100 : 0) + "%", borderRadius: 6, background: isRef ? "var(--c-brand)" : pass ? "var(--c-ok)" : "var(--c-danger)", animation: "growx 1s var(--ease-out) both" }} />
    </div>
    <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, width: 48, textAlign: "right" }}>{(rate * 100).toFixed(1)}%</span>
  </div>;
}

/* One group's adverse-impact card. The prototype renders one card per attribute
   with nested groups; the real gateway returns flat per-group metrics, so each
   card is one group, keeping the prototype's exact header (impact ratio +
   status), the selection-rate bar against the reference, and the finding box. */
function AttrCard({ a }: { a: FairnessMetric & { ref: boolean; max: number } }) {
  const pass = !a.flagged && a.impactRatio >= THRESHOLD;
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--c-line)", background: pass ? "transparent" : "var(--c-danger-tint)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{a.group}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Impact ratio</div><div className="mono" style={{ fontSize: 18, fontWeight: 600, color: pass ? "var(--c-ok)" : "var(--c-danger)" }}>{a.impactRatio.toFixed(2)}</div></div>
          <StatusBadge kind={pass ? "pass" : "fail"} />
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>Selection rate{a.ref && <Pill tone="var(--c-brand)" bg="var(--c-brand-tint)" style={{ fontSize: 9.5, padding: "0 6px" }}>reference</Pill>}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>vs 0.80 threshold</span>
          </div>
          <ImpactBar rate={a.selectionRate} max={a.max} isRef={a.ref} pass={pass} />
        </div>
        <div style={{ marginTop: 4, padding: "11px 13px", borderRadius: "var(--r)", background: pass ? "var(--c-ok-tint)" : "var(--c-danger-tint)", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name={pass ? "check" : "flag"} size={15} style={{ color: pass ? "var(--c-ok)" : "var(--c-danger)", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.5 }}>{pass
            ? `Impact ratio at or above 0.80; no adverse impact indicated for ${a.group} at this stage.`
            : `Selection ratio for ${a.group} is ${a.impactRatio.toFixed(2)} of the highest-selected group, below the 0.80 four-fifths threshold. This is a signal for human review, not a decision.`}</span>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceHubScreen() {
  const c = COMPLIANCE;
  const fairness = useData<FairnessMetric[]>(getAdverseImpact);
  const [tab, setTab] = useState("overview");

  const metrics = fairness.data ?? [];
  const failing = metrics.filter((a) => a.flagged || a.impactRatio < THRESHOLD).length;
  const maxRate = metrics.reduce((mx, m) => Math.max(mx, m.selectionRate), 0);
  const attrs = metrics.map((m) => ({ ...m, ref: m.selectionRate === maxRate && maxRate > 0, max: maxRate }));
  // Real four-fifths impact-ratio bars (per group) for the kit BarsChart + 0.80 line.
  const ratioBars = metrics.map((m) => ({
    group: m.group,
    ratio: +(m.impactRatio ?? 0).toFixed(2),
    flagged: m.flagged || m.impactRatio < THRESHOLD,
  }));

  // Download the REAL EEOC adverse-impact (four-fifths) report from the live
  // fairness metrics shown in the Adverse-impact tab.
  const onDownloadEEOC = () => {
    if (metrics.length === 0) { toast.info("No adverse-impact data to export yet. It appears once enough decisions are recorded."); return; }
    exportToCSV(
      `eeoc-adverse-impact-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Group", "Selection rate", "Impact ratio", "Four-fifths threshold", "Status"],
      metrics.map((m) => [m.group, m.selectionRate.toFixed(3), m.impactRatio.toFixed(2), THRESHOLD.toFixed(2), (!m.flagged && m.impactRatio >= THRESHOLD) ? "PASS" : "REVIEW"]),
    );
  };
  const onMethodology = () => toast.info(
    "EEOC four-fifths rule: each group's selection rate is divided by the highest group's rate. A ratio below 0.80 flags potential adverse impact for human review — advisory only, never an automated decision.",
    { duration: 9000 },
  );

  const tabs: [string, string, string][] = [["overview", "Overview", "shield"], ["impact", "Adverse impact", "flag"], ["audit", "Audit log", "scroll"]];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ padding: "0 0 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Compliance &amp; governance</h1><Pill icon="sparkles" tone="var(--c-ai-ink)" bg="var(--c-ai-tint)">bias-auditor</Pill><Pill icon="eye" tone="var(--c-warn)" bg="var(--c-warn-tint)">Overview &amp; audit log show reference framework data · Adverse impact is live</Pill></div>
            <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>EEOC · GDPR · model oversight · {c.range}</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}><Btn variant="soft" icon="scroll" onClick={onMethodology}>Methodology</Btn><Btn variant="primary" icon="arrowUpRight" onClick={onDownloadEEOC}>Download EEOC report</Btn></div>
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 16, borderBottom: "1px solid var(--c-line)" }}>
          {tabs.map(([id, l, ic]) => (
            <button key={id} onClick={() => setTab(id)} style={{ display: "inline-flex", gap: 7, alignItems: "center", padding: "10px 14px", border: "none", background: "none", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600, color: tab === id ? "var(--c-ink)" : "var(--c-ink-3)", borderBottom: "2px solid", borderColor: tab === id ? "var(--c-brand)" : "transparent", marginBottom: -1 }}>
              <Icon name={ic} size={15} />{l}{id === "impact" && failing > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--c-danger)", background: "var(--c-danger-tint)", padding: "0 6px", borderRadius: 99 }}>{failing}</span>}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "22px 0 0" }}>
        {tab === "overview" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", animation: "rise .3s var(--ease-out)" }}>
            {/* score banner */}
            <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: "var(--r-xl)", background: "linear-gradient(110deg, var(--c-brand-tint-2), transparent 65%)", border: "1px solid color-mix(in oklab, var(--c-brand) 22%, var(--c-line))", marginBottom: 18, flexWrap: "wrap" }}>
              <div style={{ width: 210, maxWidth: "100%", flexShrink: 0 }}><ArcMeter value={c.score} label="score" sub="compliance" height={190} /></div>
              <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>Compliance score {c.score} / 100</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 2 }}>{failing} open adverse-impact finding{failing !== 1 ? "s" : ""} · 1 model on watch · all policies active.</div></div>
              <div style={{ display: "flex", gap: 16 }}>{([["Certs valid", "4 / 4"], ["Audit events", "1,240"], ["DPAs signed", "3 / 3"]] as [string, string][]).map(([k, v]) => <div key={k} style={{ textAlign: "center" }}><div className="mono tnum" style={{ fontSize: 20, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 10, color: "var(--c-ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div></div>)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, alignItems: "start" }}>
              <SectionCard title="Policy compliance" icon="shield" headRight={<Pill tone="var(--c-ok)" bg="var(--c-ok-tint)" icon="check">{c.score} / 100</Pill>}>
                {c.policies.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: p.st === "active" ? "var(--c-ok-tint)" : "var(--c-warn-tint)", color: p.st === "active" ? "var(--c-ok)" : "var(--c-warn)" }}><Icon name={p.st === "active" ? "check" : "eye"} size={13} stroke={2.3} /></span>
                    <div style={{ flex: 1 }}><div style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{p.p}</div><div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{p.note}</div></div>
                    <Pill tone={p.st === "active" ? "var(--c-ok)" : "var(--c-warn)"} bg="transparent">{toTitleCase(p.st)}</Pill>
                  </div>
                ))}
              </SectionCard>
              <SectionCard title="Certifications" icon="shield">
                {c.certs.map((ct, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                    <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{ct.c}</div>{ct.until !== ", " && <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>valid until {ct.until}</div>}</div>
                    <Pill icon="check" tone="var(--c-ok)" bg="var(--c-ok-tint)">{ct.st}</Pill>
                  </div>
                ))}
              </SectionCard>
            </div>
            <div style={{ padding: "32px 0 4px" }}>
              <SceneArt scene="compliance" maxWidth={420}
                title="Fairness, monitored end to end"
                body="Adverse-impact ratios, policy status and certifications stay continuously checked against the four-fifths rule. Open the Adverse impact tab for the evidence behind every signal." />
            </div>
          </div>
        )}

        {tab === "impact" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)" }}>Application to Phone screen · {c.range} · <b style={{ color: "var(--c-ink)" }}>four-fifths (0.80) rule</b></div>
              <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>generated {c.generated}</span>
            </div>

            {fairness.loading && (
              <div className="grid gap-4">
                <Skeleton className="h-[78px] rounded-[18px]" />
                <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-[18px]" />)}</div>
              </div>
            )}
            {fairness.error && (
              <ErrorState title="Could not load fairness data" body="The compliance service did not respond." code="GET /api/bias/four-fifths" onRetry={fairness.reload} />
            )}
            {fairness.data && metrics.length === 0 && (
              <EmptyState title="Not enough data yet" body="Once enough decisions are recorded, impact ratios appear here against the 0.80 threshold, date-stamped for the EEOC export." />
            )}

            {fairness.data && metrics.length > 0 && (
              <>
                <div style={{ borderRadius: "var(--r-xl)", padding: "16px 20px", marginBottom: 18, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", background: failing ? "linear-gradient(110deg, var(--c-danger-tint), transparent 70%)" : "linear-gradient(110deg, var(--c-ok-tint), transparent 70%)", border: "1px solid " + (failing ? "color-mix(in oklab, var(--c-danger) 28%, transparent)" : "color-mix(in oklab, var(--c-ok) 28%, transparent)") }}>
                  <span style={{ width: 46, height: 46, borderRadius: 13, display: "grid", placeItems: "center", background: failing ? "var(--c-danger)" : "var(--c-ok)", color: "var(--c-ink-inv)", flexShrink: 0 }}><Icon name={failing ? "flag" : "check"} size={24} /></span>
                  <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{failing} of {metrics.length} group{metrics.length === 1 ? "" : "s"} show potential adverse impact</div><div style={{ fontSize: "var(--fs-sm)", color: "var(--c-ink-2)", marginTop: 2 }}>Any ratio below 0.80 warrants review. The threshold and groupings are legal facts, not choices.</div></div>
                </div>
                {/* real four-fifths impact-ratio bars (per group), with the 0.80 line */}
                <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)", marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Impact ratio by group</div>
                  <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 14 }}>Each group vs the highest-selected group · 0.80 four-fifths threshold</div>
                  <div style={{ height: Math.max(180, ratioBars.length * 40 + 36) }}>
                    <BarsChart
                      data={ratioBars}
                      categoryKey="group"
                      series={[{ key: "ratio", name: "Impact ratio" }]}
                      valueFormatter={(v) => Number(v).toFixed(2)}
                      threshold={{ value: THRESHOLD, label: "0.80 four-fifths" }}
                      colorFn={(row) => (row.flagged ? CHART_COLORS.danger : CHART_COLORS.brand)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {attrs.map((a) => <AttrCard key={a.group} a={a} />)}
                  {/* intersectional grid - the gateway exposes no per-cell counts, so this
                      stays an honest empty state (the fabricated demo grid was removed) */}
                  <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
                    <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Intersectional view</div>
                    <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginBottom: 14 }}>Selection rate · gender × ethnicity</div>
                    <div style={{ height: 150 }}>
                      <EmptyChart label="Intersectional grid - awaiting per-cell counts from the auditor" />
                    </div>
                    <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--c-ink-2)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}><Icon name="shield" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--c-ai)" }} />Privacy-preserving: only group counts, never individual identities.</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "audit" && (
          <div style={{ maxWidth: 720, margin: "0 auto", animation: "rise .3s var(--ease-out)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 700 }}>Audit trail</h3><Btn variant="soft" size="sm" icon="arrowUpRight">Export CSV</Btn></div>
            <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", padding: 18, boxShadow: "var(--e1)" }}>
              <Timeline items={c.audit.map((a) => ({ ic: a.ai ? "sparkles" : "scroll", ai: a.ai, who: a.who, what: a.act, t: a.t }))} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
