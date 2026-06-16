"use client";
// FairnessScreen.tsx, adverse-impact / four-fifths fairness dashboard.
// Impact ratio vs the 0.80 threshold, per attribute + intersectional heatmap,
// date-stamped, computed by bias-auditor. Ported byte-faithful from screen-fairness.jsx.
import React from "react";
import { Pill } from "./aurora-kit";
import { Btn, StatusBadge } from "./aurora-ui";
import { Icon } from "./icon";
import { BarsChart, EmptyChart, CHART_COLORS } from "@/components/shared/charts";
import type { FairnessData, FairnessAttr } from "./types";
import type { FairnessMetric } from "@/lib/types";

function Bar({ rate, max, isRef, pass }: { rate: number; max: number; isRef: boolean; pass: boolean }) {
  const w = (rate / max) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 22, borderRadius: 6, background: "var(--surface-3)", overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: w + "%", borderRadius: 6, transition: "width 1s var(--ease-out)",
          background: isRef ? "var(--brand)" : pass ? "var(--ok)" : "var(--danger)" }} />
      </div>
      <span className="mono tnum" style={{ fontSize: 12, fontWeight: 600, width: 52, textAlign: "right", color: "var(--ink)" }}>{(rate * 100).toFixed(1)}%</span>
    </div>
  );
}

function AttrCard({ a }: { a: FairnessAttr }) {
  const max = Math.max(...a.groups.map(g => g.rate));
  return (
    <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--line)",
        background: a.pass ? "transparent" : "var(--danger-tint)" }}>
        <div style={{ fontWeight: 700, fontSize: "var(--fs-md)" }}>{a.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>Impact ratio</div>
            <div className="mono" style={{ fontSize: 18, fontWeight: 600, color: a.pass ? "var(--ok)" : "var(--danger)" }}>{a.ratio.toFixed(2)}</div>
          </div>
          <StatusBadge kind={a.pass ? "pass" : "fail"} />
        </div>
      </div>
      <div style={{ padding: "14px 18px" }}>
        {a.groups.map(g => (
          <div key={g.g} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", gap: 6, alignItems: "center" }}>{g.g}
                {g.ref && <Pill tone="var(--brand)" bg="var(--brand-tint)" style={{ fontSize: 9.5, padding: "0 6px" }}>reference</Pill>}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{g.sel.toLocaleString()} / {g.app.toLocaleString()}</span>
            </div>
            <Bar rate={g.rate} max={max} isRef={!!g.ref} pass={a.pass} />
          </div>
        ))}
        <div style={{ marginTop: 4, padding: "11px 13px", borderRadius: "var(--r)", background: a.pass ? "var(--ok-tint)" : "var(--danger-tint)", display: "flex", gap: 9, alignItems: "flex-start" }}>
          <Icon name={a.pass ? "check" : "flag"} size={15} style={{ color: a.pass ? "var(--ok)" : "var(--danger)", flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{a.finding}</span>
        </div>
      </div>
    </div>
  );
}

export function FairnessScreen({ data, metrics, onMethodology, onPublish }: { data: FairnessData; metrics?: FairnessMetric[]; onMethodology?: () => void; onPublish?: () => void }) {
  const f = data;
  const failing = f.attributes.filter(a => !a.pass).length;

  // Real per-group four-fifths impact ratios (from getAdverseImpact). The 0.80 line
  // is the legal four-fifths threshold; a flagged / sub-0.80 group renders danger.
  const ratioBars = (metrics ?? []).map((m) => ({
    group: m.group,
    ratio: +(m.impactRatio ?? 0).toFixed(2),
    flagged: !!m.flagged || (m.impactRatio ?? 1) < 0.8,
  }));
  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "26px 30px 50px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 6 }}>
              <Pill icon="shield" tone="var(--brand)" bg="var(--brand-tint)">EEOC · Uniform Guidelines</Pill>
              <Pill icon="sparkles" tone="var(--ai-ink)" bg="var(--ai-tint)">computed by bias-auditor</Pill>
            </div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Adverse-impact analysis</h1>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 6 }}>{f.stage} · {f.range} · four-fifths (0.80) rule</div>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <Btn variant="soft" icon="scroll" onClick={onMethodology}>View methodology</Btn>
            <Btn variant="primary" icon="arrowUpRight" onClick={onPublish}>Publish audit summary</Btn>
          </div>
        </div>

        {/* overall banner */}
        <div style={{ borderRadius: "var(--r-xl)", padding: "18px 22px", marginBottom: 22, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
          background: failing ? "linear-gradient(110deg, var(--danger-tint), transparent 70%)" : "linear-gradient(110deg, var(--ok-tint), transparent 70%)",
          border: "1px solid " + (failing ? "color-mix(in oklab, var(--danger) 30%, transparent)" : "color-mix(in oklab, var(--ok) 30%, transparent)") }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: failing ? "var(--danger)" : "var(--ok)", color: "var(--ink-inv)", flexShrink: 0 }}>
            <Icon name={failing ? "flag" : "check"} size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-lg)" }}>{failing ? `${failing} of ${f.attributes.length} attributes show potential adverse impact` : "No adverse impact detected"}</div>
            <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-2)", marginTop: 2 }}>Any impact ratio below 0.80 warrants review of the selection procedure at this stage. The 0.80 threshold and groupings are legal facts, not thresholds we chose.</div>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {f.totals.map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div className="mono tnum" style={{ fontSize: 22, fontWeight: 600 }}>{v}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* real four-fifths impact-ratio bars (per group), with the 0.80 threshold line */}
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Impact ratio by group</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 14 }}>Each group vs the highest-selected group · 0.80 four-fifths threshold</div>
          <div style={{ height: Math.max(180, ratioBars.length * 40 + 36) }}>
            {ratioBars.length
              ? <BarsChart
                  data={ratioBars}
                  categoryKey="group"
                  series={[{ key: "ratio", name: "Impact ratio" }]}
                  valueFormatter={(v) => Number(v).toFixed(2)}
                  threshold={{ value: 0.8, label: "0.80 four-fifths" }}
                  colorFn={(row) => (row.flagged ? CHART_COLORS.danger : CHART_COLORS.brand)}
                />
              : <EmptyChart label="No demographic data yet" />}
          </div>
        </div>

        {/* attribute cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="fairness-grid">
          {f.attributes.map(a => <AttrCard key={a.name} a={a} />)}
          {/* intersection heatmap - no real intersectional grid is exposed by the
              gateway today, so it stays an honest empty state (never fabricated cells) */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", padding: 18, boxShadow: "var(--e1)" }}>
            <div style={{ fontWeight: 700, fontSize: "var(--fs-md)", marginBottom: 4 }}>Intersectional view</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginBottom: 14 }}>Selection rate · gender × ethnicity</div>
            <div style={{ height: 150 }}>
              <EmptyChart label="Intersectional grid - awaiting per-cell counts from the auditor" />
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--ink-2)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
              <Icon name="shield" size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--ai)" }} />
              Privacy-preserving: the auditor sees only group counts, never individual identities.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
