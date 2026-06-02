"use client";
// app/(dashboard)/analytics/source-effectiveness/page.tsx
// Aurora "Source effectiveness" slice, ported from claude-design/screen-analytics.jsx
// (the source-effectiveness SectionCard). Channels/sources ranked by hires, with
// conversion and cost-per-hire, plus a real KPI row + funnel. Wired to the gateway:
// tries GET /analytics/source-effectiveness then GET /analytics/sources; the real
// payload is coerced with res?.data ?? res. No fabricated sources; on error/404 the
// exact layout renders with EmptyState/loading.
import { useEffect, useState } from "react";
import { Funnel, KpiRow, SectionCard, Spark, Pill, type Kpi } from "@/components/aurora-kit";
import { Skeleton, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

// A normalized source row, mapped defensively from whichever payload shape the
// gateway returns (source-effectiveness or sources).
type Row = {
  source: string;
  applicants: number;
  hires: number;
  conversion: number; // 0..1
  cost: number | null; // cost-per-hire, null when the backend does not report it
};

const PALETTE = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-ok)", "var(--c-warn)", "var(--c-danger)"];

function num(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : 0;
}

// Coerce one raw record into a Row, tolerating several field-name conventions.
function toRow(r: Record<string, unknown>): Row {
  const applicants = num(r.applicants ?? r.applied ?? r.totalCandidates ?? r.candidates ?? r.total);
  const hires = num(r.hires ?? r.hired ?? r.hiredCount ?? r.hireCount);
  // conversion may arrive as a 0..1 rate, a 0..100 percent, or be derivable.
  let conversion: number;
  const rawConv = r.conversion ?? r.conversionRate ?? r.hireRate ?? r.rate;
  if (rawConv != null) {
    const c = num(rawConv);
    conversion = c > 1 ? c / 100 : c;
  } else {
    conversion = applicants > 0 ? hires / applicants : 0;
  }
  const costRaw = r.cost ?? r.costPerHire ?? r.cost_per_hire ?? r.cph;
  const cost = costRaw == null ? null : num(costRaw);
  const source = String(r.source ?? r.src ?? r.channel ?? r.name ?? "Unknown") || "Unknown";
  return { source, applicants, hires, conversion, cost };
}

// Pull the array of sources out of the coerced payload, regardless of nesting.
function extractRows(payload: unknown): Row[] {
  const body: any = (payload as any)?.data ?? payload;
  const arr: unknown =
    Array.isArray(body) ? body
    : body?.sources ?? body?.channels ?? body?.rows ?? body?.items ?? [];
  if (!Array.isArray(arr)) return [];
  return arr.map((r) => toRow(r as Record<string, unknown>));
}

export default function SourceEffectivenessPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      setErrored(false);
      // Try the richer source-effectiveness endpoint first, then fall back to sources.
      let payload: unknown = null;
      try {
        payload = await raw("/analytics/source-effectiveness");
      } catch {
        try {
          payload = await raw("/analytics/sources");
        } catch {
          if (live) { setErrored(true); setRows(null); setLoading(false); }
          return;
        }
      }
      if (!live) return;
      setRows(extractRows(payload));
      setLoading(false);
    })();
    return () => { live = false; };
  }, [nonce]);

  const reload = () => setNonce((n) => n + 1);

  // Ranked by hires, strongest first (the prototype's ordering).
  const ranked = (rows ?? []).slice().sort((a, b) => b.hires - a.hires);
  const maxHires = Math.max(1, ...ranked.map((s) => s.hires));

  // Real aggregates for the KPI row, derived only from returned rows (no fabrication).
  const totalApplicants = ranked.reduce((s, r) => s + r.applicants, 0);
  const totalHires = ranked.reduce((s, r) => s + r.hires, 0);
  const overallConv = totalApplicants > 0 ? totalHires / totalApplicants : 0;
  const costRows = ranked.filter((r) => r.cost != null);
  const avgCost = costRows.length ? Math.round(costRows.reduce((s, r) => s + (r.cost ?? 0), 0) / costRows.length) : 0;
  const top = ranked[0];

  const kpis: Kpi[] = [
    { id: "sources", label: "Active sources", value: ranked.length, icon: "radar", spark: ranked.map((r) => r.applicants).slice(0, 8).reverse(), delta: 0 },
    { id: "applicants", label: "Applicants", value: totalApplicants, icon: "users", spark: ranked.map((r) => r.applicants).slice(0, 8).reverse(), delta: 0 },
    { id: "hires", label: "Hires", value: totalHires, icon: "check", spark: ranked.map((r) => r.hires).slice(0, 8).reverse(), delta: 0, good: true },
    { id: "conv", label: "Conversion", value: Math.round(overallConv * 1000) / 10, icon: "chart", spark: ranked.map((r) => Math.round(r.conversion * 100)).slice(0, 8).reverse(), delta: 0, suffix: "%", good: true },
  ];

  // Funnel reuses the kit primitive: top sources by applicants, colored from the palette.
  const funnelStages = ranked.slice(0, 6).map((r, i) => ({ stage: r.source, n: r.applicants, color: PALETTE[i % PALETTE.length] }));

  const COLS = "120px 1fr 90px 96px 96px";

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* breadcrumb / back link to /analytics */}
      <a
        href="/analytics"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-2)" }}
      >
        <Icon name="chevR" size={14} style={{ transform: "rotate(180deg)", color: "var(--c-ink-3)" }} />
        Back to Analytics
      </a>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Source effectiveness</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>
            Channels and sources ranked by hires, with conversion and cost per hire.
          </p>
        </div>
        <Pill icon="radar" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>
          {loading ? "Loading" : `${ranked.length} sources`}
        </Pill>
      </div>

      {/* KPI row */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}
        </div>
      )}
      {!loading && ranked.length > 0 && <KpiRow kpis={kpis} cols={4} />}

      {/* top-of-funnel by source (kit Funnel) */}
      {!loading && ranked.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionCard
            title="Top of funnel by source"
            icon="radar"
            headRight={<Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">{Math.round(overallConv * 1000) / 10}% applied to hired</Pill>}
          >
            <Funnel stages={funnelStages} />
          </SectionCard>
        </div>
      )}

      {/* source effectiveness table (verbatim prototype layout) */}
      <SectionCard title="Source effectiveness" icon="radar" action="Details">
        {loading && (
          <div style={{ display: "grid", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[42px] rounded-[10px]" />)}
          </div>
        )}

        {!loading && errored && (
          <EmptyState
            title="Source data is unavailable"
            body="The analytics service did not return source effectiveness. Once candidates are attributed to channels, ranked sources appear here."
          />
        )}

        {!loading && !errored && ranked.length === 0 && (
          <EmptyState
            title="No source data yet"
            body="When candidates apply through your channels, this table ranks each source by hires, conversion, and cost per hire."
          />
        )}

        {!loading && !errored && ranked.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
              <span>Source</span>
              <span>Hires</span>
              <span style={{ textAlign: "right" }}>Conversion</span>
              <span style={{ textAlign: "right" }}>Apps</span>
              <span style={{ textAlign: "right" }}>Cost/hire</span>
            </div>
            {ranked.map((s, i) => {
              const color = PALETTE[i % PALETTE.length];
              const convPct = Math.round(s.conversion * 1000) / 10;
              return (
                <div key={s.source} style={{ display: "grid", gridTemplateColumns: COLS, gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
                    {s.source}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ flex: 1, maxWidth: 200, height: 18, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: ((s.hires / maxHires) * 100) + "%", borderRadius: 6, background: color, animation: "growx 1s var(--ease-out) both", animationDelay: (i * 80) + "ms" }} />
                    </div>
                    <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700 }}>{s.hires}</span>
                  </div>
                  <span style={{ textAlign: "right", display: "inline-flex", justifyContent: "flex-end", alignItems: "center", gap: 5 }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: convPct >= 5 ? "var(--c-ok)" : convPct >= 2 ? "var(--c-warn)" : "var(--c-danger)" }}>{convPct}%</span>
                  </span>
                  <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--c-ink-3)" }}>{s.applicants.toLocaleString()}</span>
                  <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", fontWeight: 600, color: s.cost != null && s.cost > 4000 ? "var(--c-danger)" : "var(--c-ink)" }}>
                    {s.cost != null ? `$${s.cost.toLocaleString()}` : "n/a"}
                  </span>
                </div>
              );
            })}

            {/* spark summary of hires across the ranked sources (kit Spark) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--c-line)" }}>
              <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
                Top source: <b style={{ color: "var(--c-ink)" }}>{top?.source}</b>
                {avgCost > 0 ? ` · avg cost per hire $${avgCost.toLocaleString()}` : ""}
              </span>
              <Spark data={ranked.map((r) => r.hires)} w={120} h={28} color="var(--c-brand)" />
            </div>
          </>
        )}
      </SectionCard>

      {/* retry affordance when the source endpoints are down */}
      {!loading && errored && (
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <button
            onClick={reload}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface-2)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontWeight: 600, cursor: "pointer" }}
          >
            <Icon name="bolt" size={15} /> Try again
          </button>
        </div>
      )}
    </div>
  );
}
