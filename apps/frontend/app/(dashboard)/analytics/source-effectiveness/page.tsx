"use client";
// app/(dashboard)/analytics/source-effectiveness/page.tsx - EXACT Claude Design
// "Aurora" source-effectiveness detail (the "Details" drill-down from the rich
// analytics overview, ../page.tsx). Reproduces the source-effectiveness slice of
// claude-design/screen-analytics.jsx: channels ranked by hires, with conversion %
// and cost-per-hire, plus animated bars. Matches the just-shipped overview's
// look and wiring (header + export, derived KPI strip, SectionCard table).
//
// HONEST WIRING: pulls the real per-source rows from the data layer. It tries
// GET /analytics/source-effectiveness first, then falls back to GET
// /analytics/sources. Rows are mapped flexibly from whatever field names the
// server uses (source, applied, hired). Conversion is computed from real
// applied/hired counts. Cost-per-hire renders "n/a" whenever the server does not
// expose it, never a fabricated dollar figure. loading -> Skeleton, error ->
// ErrorState, empty -> EmptyState. No invented sources.
import { KpiRow, SectionCard, Spark, Pill, Btn, type Kpi } from "@/components/aurora-kit";
import { Icon } from "@/components/aurora-icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";

/* ---------- local raw() (unwrap res?.data ?? res) ---------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}
async function raw(method: string, path: string): Promise<any> {
  const t = authToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}`);
  const body = await res.json();
  return body?.data ?? body;
}

/* ---------- view model ---------- */
type SourceRow = { source: string; applied: number; hired: number; conversion: number; cost: number | null };

// Stable palette so each source reads as its own channel, not a rainbow.
const SOURCE_COLORS = ["var(--c-brand)", "var(--c-ai)", "var(--c-info)", "var(--c-ok)", "var(--c-warn)", "var(--c-ai-2)", "var(--c-ink-3)"];
const num = (v: any): number => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

// Map one server row to the ranked-source view model. Field names vary by
// endpoint, so we read every plausible alias; cost stays null unless present.
function toSourceRow(r: any): SourceRow {
  const source = String(r?.source ?? r?.channel ?? r?.name ?? r?.label ?? r?.src ?? "Unknown");
  const applied = num(r?.applied ?? r?.applicants ?? r?.applications ?? r?.candidates ?? r?.apps ?? r?.total ?? 0);
  const hired = num(r?.hired ?? r?.hires ?? r?.placed ?? 0);
  const convRaw = r?.conversion ?? r?.conversionRate ?? r?.hireRate ?? r?.rate;
  const conversion = convRaw != null
    ? num(convRaw) <= 1 ? +(num(convRaw) * 100).toFixed(1) : +num(convRaw).toFixed(1)
    : applied > 0 ? +((hired / applied) * 100).toFixed(1) : 0;
  const costRaw = r?.costPerHire ?? r?.cost_per_hire ?? r?.cph ?? r?.cost;
  const cost = costRaw == null || !Number.isFinite(Number(costRaw)) ? null : Number(costRaw);
  return { source, applied, hired, conversion, cost };
}

// Pull rows from the source-effectiveness endpoint, falling back to /sources.
async function getSourceEffectiveness(): Promise<SourceRow[]> {
  let out: any;
  try { out = await raw("GET", "/analytics/source-effectiveness"); }
  catch { out = await raw("GET", "/analytics/sources"); }
  const rows = Array.isArray(out) ? out : (out?.sources ?? out?.rows ?? out?.items ?? out?.bySource ?? []);
  return (Array.isArray(rows) ? rows : []).map(toSourceRow).filter((r) => r.source);
}

export default function SourceEffectivenessPage() {
  const sources = useData<SourceRow[]>(getSourceEffectiveness);

  // Rank by hires (then applicants) so the table reads top-channel first.
  const rows = (sources.data ?? []).slice().sort((a, b) => b.hired - a.hired || b.applied - a.applied);
  const maxHires = Math.max(1, ...rows.map((r) => r.hired));

  // ----- KPI strip: derived from the real rows, never invented -----
  const totalApplied = rows.reduce((s, r) => s + r.applied, 0);
  const totalHired = rows.reduce((s, r) => s + r.hired, 0);
  const blendedConv = totalApplied > 0 ? +((totalHired / totalApplied) * 100).toFixed(1) : 0;
  const top = rows[0];

  const kpis: Kpi[] = [
    { id: "channels", label: "Active sources", value: rows.length, icon: "radar", spark: [rows.length], delta: 0, good: true },
    { id: "applicants", label: "Applicants", value: totalApplied, icon: "users", spark: rows.map((r) => r.applied), delta: 0, good: true },
    { id: "hires", label: "Hires", value: totalHired, icon: "check", spark: rows.map((r) => r.hired), delta: 0, good: true },
    { id: "conv", label: "Blended conversion", value: blendedConv, icon: "sparkles", spark: [blendedConv], delta: 0, good: true, ai: true, suffix: "%" },
  ];

  const cols = "150px 1fr 78px 96px 96px";

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* breadcrumb / back to overview */}
      <a href="/analytics" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 14, fontSize: "var(--fs-sm)", fontWeight: 600, color: "var(--c-ink-3)", textDecoration: "none" }}>
        <Icon name="chevsL" size={15} /> Back to Analytics
      </a>

      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Source effectiveness</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>Channels ranked by hires, with conversion and cost-per-hire across your pipeline.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Pill icon="clock" tone="var(--c-ink-2)" style={{ padding: "7px 12px", fontSize: "var(--fs-sm)" }}>Last 90 days</Pill>
          <Btn variant="primary" icon="arrowUpRight">Export</Btn>
        </div>
      </div>

      {/* KPI strip (derived from the real rows) */}
      {sources.loading && <div className="mb-[18px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[130px] rounded-[14px]" />)}</div>}
      {sources.error && <div className="mb-[18px]"><ErrorState title="Could not load source metrics" body="The analytics service did not return source effectiveness." code="GET /api/analytics/source-effectiveness" onRetry={sources.reload} /></div>}
      {sources.data && rows.length > 0 && <KpiRow kpis={kpis} cols={4} />}

      {/* ranked sources table */}
      <SectionCard
        title="Sources ranked by hires"
        icon="radar"
        headRight={top ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <Pill mono tone="var(--c-ok)" bg="var(--c-ok-tint)">top: {top.source}</Pill>
            <Spark data={rows.map((r) => r.hired)} w={88} h={24} color="var(--c-brand)" />
          </span>
        ) : undefined}
      >
        {sources.loading && <Skeleton className="h-48 rounded-lg" />}
        {sources.error && <ErrorState title="Sources unavailable" body="Could not load source effectiveness." code="GET /api/analytics/source-effectiveness" onRetry={sources.reload} />}
        {sources.data && rows.length === 0 && (
          <EmptyState
            title="No source data yet"
            body="Once candidates apply and get hired through tracked channels, ranked sources appear here."
            actions={<a href="/analytics"><Btn variant="soft" icon="chart">Back to Analytics</Btn></a>}
          />
        )}
        {sources.data && rows.length > 0 && (
          <>
            {/* column heads */}
            <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "0 4px 9px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)", borderBottom: "1px solid var(--c-line)" }}>
              <span>Source</span>
              <span>Hires</span>
              <span style={{ textAlign: "right" }}>Conv</span>
              <span style={{ textAlign: "right" }}>Applicants</span>
              <span style={{ textAlign: "right" }}>Cost/hire</span>
            </div>
            {rows.map((s, i) => {
              const color = SOURCE_COLORS[i % SOURCE_COLORS.length];
              return (
                <div key={s.source} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", padding: "11px 4px", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 12.5, fontWeight: 600 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />{s.source}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ flex: 1, maxWidth: 220, height: 18, borderRadius: 6, background: "var(--c-surface-2)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: ((s.hired / maxHires) * 100) + "%", borderRadius: 6, background: color, animation: "growx 1s var(--ease-out) both", animationDelay: (i * 80) + "ms" }} />
                    </div>
                    <span className="mono tnum" style={{ fontSize: 13, fontWeight: 700 }}>{s.hired.toLocaleString()}</span>
                  </div>
                  <span className="mono tnum" style={{ textAlign: "right", fontSize: 12, fontWeight: 600, color: s.conversion >= 5 ? "var(--c-ok)" : s.conversion >= 2 ? "var(--c-warn)" : "var(--c-ink-2)" }}>{s.conversion}%</span>
                  <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", color: "var(--c-ink-3)" }}>{s.applied.toLocaleString()}</span>
                  <span className="mono tnum" style={{ fontSize: 12, textAlign: "right", fontWeight: 600, color: s.cost == null ? "var(--c-ink-3)" : s.cost > 4000 ? "var(--c-danger)" : "var(--c-ink)" }}>{s.cost == null ? "n/a" : "$" + s.cost.toLocaleString()}</span>
                </div>
              );
            })}
          </>
        )}
      </SectionCard>
    </div>
  );
}
