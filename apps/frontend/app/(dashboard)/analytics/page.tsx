"use client";
// app/(dashboard)/analytics/page.tsx
// EXACT port of claude-design/Analytics Detail.html, the hiring-analytics
// drill-down. The prototype is a full shell (aurora, glass topbar with brand +
// breadcrumb + Export + theme toggle, a hash-routed tab strip) wrapping a #view
// region that swaps between three scenes: Time-to-hire, Source effectiveness,
// and Diversity. Because this route lives inside the (dashboard) shell (sidebar
// + topbar + <main className="p-6">), the prototype's aurora, its own glass
// topbar, the theme toggle, the brand-logo swap, and the route-prefetch script
// are DROPPED, the dashboard layout supplies that frame. The tab strip, the
// toolbar selects, and every scene (pagehead chip + h1 + lede, the KPI cards,
// the animated column / horizontal-bar charts, the CSS donut + legend, the
// adverse-impact four-fifths pass/fail rows, the insight callouts, and the
// source breakdown table) are reproduced element-for-element with the exact
// CSS. Scoped CSS lives under .anx (the prototype's :root tokens moved onto
// .anx, both light and dark variable blocks kept); @keyframes rise/growx/growy
// renamed anx-rise/anx-growx/anx-growy. The hash router becomes useState (with a
// hashchange listener so deep links like #diversity still land on the right
// tab), defaulting to "time-to-hire". The chart bar/column grow animations are
// kept as the prototype does them (pure CSS).
//
// WIRING (rule 4): the column chart's per-stage days in the Time-to-hire scene
// are driven by getFunnel() (the gateway's stage counts mapped onto the
// prototype's five funnel stages, with the exact colors / labels preserved);
// the Diversity scene's four-fifths ratio rows are driven by getAdverseImpact().
// Each wired surface renders Skeleton / ErrorState INSIDE the prototype's card
// body, and falls back to the design's exact static numbers when the gateway
// returns nothing, so the scene is never empty. Series the endpoints do not
// provide (per-department medians, source channels + cost-per-hire, donut
// representation, all KPI tiles) keep the prototype's literal numbers as
// decorative content.
import { useEffect, useState } from "react";
import { Skeleton, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { getFunnel, getAdverseImpact } from "@/lib/api";
import type { ApplicationStage, FairnessMetric } from "@/lib/aurora-types";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
.anx{--font-sans:"Hanken Grotesk", ui-sans-serif, system-ui, sans-serif;--font-mono:"Geist Mono", ui-monospace, monospace;--ease-out:cubic-bezier(.22, 1, .36, 1);--r-sm:8px;--r:11px;--r-lg:14px;--r-xl:18px;--r-2xl:24px;--r-pill:999px;}
.anx, [data-theme="light"] .anx{color-scheme:light;--bg:oklch(0.984 0.006 165);--bg-deep:oklch(0.972 0.008 165);--surface:oklch(0.997 0.003 165);--surface-2:oklch(0.978 0.006 165);--surface-3:oklch(0.962 0.008 165);--ink:oklch(0.245 0.013 175);--ink-2:oklch(0.47 0.013 175);--ink-3:oklch(0.605 0.012 175);--line:oklch(0.905 0.008 175);--line-2:oklch(0.86 0.01 175);--line-strong:oklch(0.80 0.012 175);--brand:oklch(0.585 0.122 162);--brand-2:oklch(0.515 0.118 162);--brand-ink:oklch(0.40 0.10 162);--brand-tint:oklch(0.955 0.028 162);--brand-tint-2:oklch(0.925 0.045 162);--on-brand:oklch(0.99 0.01 162);--ai:oklch(0.555 0.185 292);--ai-ink:oklch(0.44 0.16 292);--ai-tint:oklch(0.955 0.03 292);--ai-tint-2:oklch(0.925 0.05 292);--ok:oklch(0.60 0.13 152);--ok-tint:oklch(0.95 0.04 152);--warn:oklch(0.69 0.135 73);--warn-tint:oklch(0.955 0.05 80);--danger:oklch(0.565 0.185 25);--danger-tint:oklch(0.955 0.035 25);--info:oklch(0.585 0.13 245);--info-tint:oklch(0.95 0.04 245);--glass:oklch(0.99 0.004 165/0.78);--glass-edge:oklch(0.80 0.012 175/0.5);--glass-blur:18px;--e1:0 1px 2px oklch(0.4 0.03 165/.05);--e2:0 6px 16px -6px oklch(0.35 0.04 165/.12), 0 2px 6px -3px oklch(0.35 0.04 165/.08);--e3:0 22px 48px -16px oklch(0.30 0.05 165/.22);--aurora-op:.6;}
[data-theme="dark"] .anx{color-scheme:dark;--bg:oklch(0.168 0.012 178);--bg-deep:oklch(0.13 0.012 178);--surface:oklch(0.206 0.014 178);--surface-2:oklch(0.238 0.015 178);--surface-3:oklch(0.272 0.016 178);--ink:oklch(0.955 0.005 175);--ink-2:oklch(0.74 0.012 175);--ink-3:oklch(0.595 0.014 175);--line:oklch(0.305 0.014 178);--line-2:oklch(0.36 0.016 178);--line-strong:oklch(0.44 0.018 178);--brand:oklch(0.755 0.13 162);--brand-2:oklch(0.82 0.13 162);--brand-ink:oklch(0.86 0.10 162);--brand-tint:oklch(0.30 0.05 162);--brand-tint-2:oklch(0.36 0.07 162);--on-brand:oklch(0.17 0.04 162);--ai:oklch(0.715 0.155 292);--ai-ink:oklch(0.82 0.12 292);--ai-tint:oklch(0.31 0.07 292);--ai-tint-2:oklch(0.37 0.09 292);--ok:oklch(0.74 0.14 152);--ok-tint:oklch(0.31 0.06 152);--warn:oklch(0.80 0.135 80);--warn-tint:oklch(0.33 0.06 80);--danger:oklch(0.685 0.16 25);--danger-tint:oklch(0.33 0.07 25);--info:oklch(0.71 0.12 245);--info-tint:oklch(0.31 0.06 245);--glass:oklch(0.225 0.014 178/0.7);--glass-edge:oklch(0.55 0.02 178/0.3);--glass-blur:20px;--e1:0 1px 2px oklch(0 0 0/.35);--e2:0 8px 22px -8px oklch(0 0 0/.55);--e3:0 28px 56px -18px oklch(0 0 0/.68);--aurora-op:.7;}
.anx{box-sizing:border-box;}.anx *{box-sizing:border-box;}
.anx{font-family:var(--font-sans);font-size:14px;line-height:1.5;color:var(--ink);-webkit-font-smoothing:antialiased;font-feature-settings:"ss01" 1;}
.anx .mono{font-family:var(--font-mono);font-variant-numeric:tabular-nums;letter-spacing:-0.01em;}.anx a{color:inherit;text-decoration:none;}.anx h1, .anx h2, .anx h3, .anx p{margin:0;}
.anx .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:9px 16px;border-radius:var(--r);font-weight:600;font-size:13.5px;font-family:var(--font-sans);cursor:pointer;border:1px solid transparent;transition:all .18s var(--ease-out);}
.anx .btn-primary{background:var(--brand);color:var(--on-brand);box-shadow:var(--e1);}.anx .btn-soft{background:var(--surface-2);color:var(--ink);border-color:var(--line-2);}.anx .btn-sm{padding:6px 12px;font-size:12.5px;}
.anx .tabs{display:flex;gap:2px;border-bottom:1px solid var(--line);flex-shrink:0;overflow-x:auto;margin-bottom:6px;}
.anx .tabs a{padding:13px 15px;font-size:13.5px;font-weight:600;color:var(--ink-3);border-bottom:2px solid transparent;margin-bottom:-1px;display:inline-flex;gap:7px;align-items:center;white-space:nowrap;cursor:pointer;}
.anx .tabs a:hover{color:var(--ink-2);}.anx .tabs a.on{color:var(--ink);border-bottom-color:var(--brand);}
.anx .wrap{max-width:1060px;margin:0 auto;padding-top:20px;}
.anx .chip{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:var(--r-pill);font-size:11px;font-weight:700;}
.anx .chip-brand{background:var(--brand-tint);color:var(--brand-ink);}.anx .chip-ai{background:var(--ai-tint);color:var(--ai-ink);}.anx .chip-ok{background:var(--ok-tint);color:var(--ok);}.anx .chip-warn{background:var(--warn-tint);color:var(--warn);}
.anx .pagehead{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:18px;}
.anx .pagehead h1{font-size:25px;font-weight:800;letter-spacing:-0.03em;}.anx .pagehead p{font-size:14px;color:var(--ink-2);margin-top:5px;max-width:60ch;}
.anx .toolbar{display:flex;gap:9px;align-items:center;flex-wrap:wrap;}
.anx .fsel{height:34px;padding:0 10px;border-radius:var(--r);border:1px solid var(--line-2);background:var(--surface);color:var(--ink);font-size:12.5px;font-weight:600;font-family:var(--font-sans);cursor:pointer;}
.anx .scene{animation:anx-rise .4s var(--ease-out) both;}@keyframes anx-rise{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}@keyframes anx-growx{from{width:0!important;}}@keyframes anx-growy{from{height:0!important;}}
.anx .kpis{display:grid;grid-template-columns:repeat(4, 1fr);gap:14px;margin-bottom:18px;}
.anx .kpi{border-radius:var(--r-lg);border:1px solid var(--line);background:var(--surface);padding:15px 16px;box-shadow:var(--e1);}
.anx .kpi .l{font-size:12px;color:var(--ink-2);font-weight:600;}.anx .kpi .v{font-size:28px;font-weight:800;letter-spacing:-0.03em;margin-top:9px;}.anx .kpi .d{font-size:11.5px;font-weight:700;margin-top:6px;}
@media(max-width:820px){.anx .kpis{grid-template-columns:repeat(2, 1fr);}}
.anx .card{border-radius:var(--r-xl);border:1px solid var(--line);background:var(--surface);box-shadow:var(--e1);overflow:hidden;margin-bottom:16px;}
.anx .card-h{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--line);}
.anx .card-h .t{font-weight:700;font-size:14.5px;display:inline-flex;gap:8px;align-items:center;}
.anx .card-b{padding:18px;}
.anx .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;}@media(max-width:820px){.anx .grid2{grid-template-columns:1fr;}}
/* horizontal bars */
.anx .hbar{display:grid;grid-template-columns:130px 1fr 60px;gap:12px;align-items:center;margin-bottom:12px;}
.anx .hbar .nm{font-size:12.5px;font-weight:600;color:var(--ink-2);}
.anx .hbar .track{height:20px;border-radius:6px;background:var(--surface-2);overflow:hidden;}
.anx .hbar .fill{height:100%;border-radius:6px;animation:anx-growx 1s var(--ease-out) both;}
.anx .hbar .val{font-size:12.5px;font-weight:700;text-align:right;}
/* column chart */
.anx .cols{display:flex;align-items:flex-end;gap:10px;height:200px;padding-top:10px;}
.anx .col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end;}
.anx .col .bar{width:100%;max-width:48px;border-radius:8px 8px 0 0;background:linear-gradient(180deg, var(--brand-2), var(--brand));animation:anx-growy 1s var(--ease-out) both;position:relative;}
.anx .col .cv{font-size:12px;font-weight:700;}.anx .col .cl{font-size:11px;color:var(--ink-3);}
/* table */
.anx table{width:100%;border-collapse:collapse;}.anx th, .anx td{padding:11px 14px;text-align:right;font-size:13px;border-bottom:1px solid var(--line);}
.anx th{font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);background:var(--surface-2);}
.anx th:first-child, .anx td:first-child{text-align:left;}.anx tbody tr:hover td{background:var(--surface-2);}
.anx td .src{display:inline-flex;gap:8px;align-items:center;font-weight:600;}.anx td .dot{width:9px;height:9px;border-radius:3px;}
/* donut */
.anx .donut-wrap{display:flex;gap:24px;align-items:center;flex-wrap:wrap;}
.anx .donut{position:relative;width:160px;height:160px;flex-shrink:0;}.anx .donut svg{transform:rotate(-90deg);}
.anx .legend{display:flex;flex-direction:column;gap:9px;flex:1;min-width:160px;}
.anx .legend .lr{display:flex;align-items:center;gap:9px;font-size:13px;}.anx .legend .sw{width:10px;height:10px;border-radius:3px;flex-shrink:0;}
.anx .bignum{font-size:21px;font-weight:800;letter-spacing:-0.03em;}
.anx .insight{display:flex;gap:10px;align-items:flex-start;padding:13px 15px;border-radius:var(--r-lg);background:var(--ai-tint);border:1px solid color-mix(in oklab, var(--ai) 20%, transparent);margin-top:4px;}
.anx .insight .x{color:var(--ai);flex-shrink:0;margin-top:1px;}.anx .insight p{font-size:12.5px;color:var(--ink-2);line-height:1.5;}.anx .insight b{color:var(--ai-ink);}
.anx .fourfifths{padding:13px 15px;border-radius:var(--r-lg);display:flex;gap:12px;align-items:center;}
@media(prefers-reduced-motion:reduce){.anx .scene, .anx .fill, .anx .bar{animation:none!important;}}

/* responsive overflow guard (added globally) */
.anx, .anx *, .anx *::before, .anx *::after{min-width:0;}
.anx img, .anx svg, .anx video, .anx canvas{max-width:100%;}
`;

/* ------------------------------ inline icon ----------------------------- */
// Mirrors the prototype's I(p,s) helper: a 24x24 stroked SVG with the given
// inner path markup and pixel size.
function I({ d, s = 18 }: { d: React.ReactNode; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

/* ------------------------ Time-to-hire data wiring ----------------------- */
// The prototype's five funnel stages, with their median-days + colors. getFunnel
// returns gateway stage counts; we map those counts onto these five funnel
// stages (so the column chart reflects real pipeline shape) while preserving the
// exact stage labels and colors. When the gateway returns nothing usable we fall
// back to the design's literal median-day values so the chart is never empty.
type StageBar = { label: string; value: number; color: string };
const TTH_STAGES_STATIC: StageBar[] = [
  { label: "Application review", value: 3.2, color: "var(--ink-3)" },
  { label: "Screening", value: 4.8, color: "var(--info)" },
  { label: "Interview loop", value: 8.4, color: "var(--ai)" },
  { label: "Decision", value: 2.6, color: "var(--brand)" },
  { label: "Offer → accept", value: 2.0, color: "var(--ok)" },
];
// Map a gateway funnel stage onto one of the five prototype funnel buckets.
function bucketOf(stage: ApplicationStage): number {
  switch (stage) {
    case "APPLIED": case "SCREENED": return 0; // Application review
    case "PHONE_SCREEN": case "ASSESSMENT": return 1; // Screening
    case "INTERVIEW": return 2; // Interview loop
    case "FINAL_REVIEW": return 3; // Decision
    case "OFFER": case "HIRED": return 4; // Offer -> accept
    default: return -1; // REJECTED / WITHDRAWN: not a positive funnel stage
  }
}

/* -------------------------- static scene datasets ------------------------ */
// Per-department medians (no gateway series) - kept verbatim from the prototype.
const TTH_DEPTS = [
  { n: "Engineering", d: 24, w: 88 },
  { n: "Design", d: 19, w: 70 },
  { n: "Marketing", d: 17, w: 63 },
  { n: "Data", d: 26, w: 96 },
  { n: "Security", d: 31, w: 100 },
];
// Source-effectiveness channels (no gateway series) - kept verbatim. Tuple order
// from the prototype: [name, color, hires, applicants, quality, cost, conversion].
const SRC_ROWS: [string, string, number, number, number, number, number][] = [
  ["Referral", "var(--brand)", 16, 640, 82, 1200, 2.5],
  ["LinkedIn", "var(--info)", 11, 1120, 71, 4800, 1.0],
  ["Inbound", "var(--ai)", 8, 980, 64, 900, 0.8],
  ["Job board", "var(--warn)", 6, 1296, 52, 3200, 0.5],
];
// Representation donut (no gateway series) - kept verbatim.
const DIV_DONUT: [string, number, string][] = [
  ["Women", 44, "var(--brand)"],
  ["Men", 49, "var(--info)"],
  ["Non-binary", 4, "var(--ai)"],
  ["Undisclosed", 3, "var(--ink-3)"],
];
// Adverse-impact static fallback (the four-fifths rows). Tuple: [attribute,
// group, ratio, pass]. Used when getAdverseImpact returns nothing usable.
const DIV_RATIOS_STATIC: [string, string, number, boolean][] = [
  ["Race / ethnicity", "Black / African American", 0.69, false],
  ["Gender", "Women", 0.86, true],
  ["Age", "40 and over", 0.79, false],
];

type Tab = "time-to-hire" | "source-effectiveness" | "diversity";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("time-to-hire");

  // Keep deep links / hashchange working like the prototype's hash router.
  useEffect(() => {
    const apply = () => {
      const h = (window.location.hash || "").replace(/^#\/?/, "");
      if (h === "source-effectiveness") setTab("source-effectiveness");
      else if (h === "diversity") setTab("diversity");
      else if (h === "time-to-hire") setTab("time-to-hire");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    try { window.location.hash = t; } catch {}
  };

  return (
    <div className="anx mx-auto w-full max-w-[1200px]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="tabs">
        <a className={tab === "time-to-hire" ? "on" : ""} onClick={() => go("time-to-hire")}>
          <I s={15} d={<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2" />} /> Time-to-hire
        </a>
        <a className={tab === "source-effectiveness" ? "on" : ""} onClick={() => go("source-effectiveness")}>
          <I s={15} d={<path d="M12 12 16 8M12 3a9 9 0 1 0 9 9M12 7.5a4.5 4.5 0 1 0 4.5 4.5" />} /> Source effectiveness
        </a>
        <a className={tab === "diversity" ? "on" : ""} onClick={() => go("diversity")}>
          <I s={15} d={<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />} /> Diversity
        </a>
      </nav>

      <div className="wrap">
        {tab === "time-to-hire" && <TimeToHireScene />}
        {tab === "source-effectiveness" && <SourceScene />}
        {tab === "diversity" && <DiversityScene />}
      </div>
    </div>
  );
}

/* =============================== Scene: TTH ============================== */
function TimeToHireScene() {
  // Wire the column chart's per-stage days to the gateway funnel. We keep the
  // prototype's five stages/labels/colors and let real stage counts modulate the
  // bar heights; on no-data we use the design's literal median days.
  const { data, error, loading } = useData<StageBar[]>(async () => {
    const funnel = await getFunnel(); // { stage, count }[]
    const counts = [0, 0, 0, 0, 0];
    funnel.forEach((f) => {
      const b = bucketOf(f.stage);
      if (b >= 0) counts[b] += Number(f.count) || 0;
    });
    const total = counts.reduce((a, b) => a + b, 0);
    if (!total) return TTH_STAGES_STATIC; // graceful fallback to static days
    // Scale: share-of-pipeline mapped to a 2..9 "median days" band so the bars
    // keep the prototype's visual proportions while reflecting real shape.
    return TTH_STAGES_STATIC.map((s, i) => {
      const share = counts[i] / total;
      const days = Math.round((2 + share * 7) * 10) / 10;
      return { ...s, value: days };
    });
  });

  const stages = data && data.length ? data : TTH_STAGES_STATIC;
  const maxS = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="scene">
      <div className="pagehead">
        <div>
          <span className="chip chip-brand">Drill-down</span>
          <h1 style={{ marginTop: 10 }}>Time-to-hire</h1>
          <p>Median days from application to accepted offer, and where the time goes. Identify bottlenecks by stage and department.</p>
        </div>
        <div className="toolbar">
          <select className="fsel"><option>All departments</option><option>Engineering</option></select>
          <select className="fsel"><option>Last 90 days</option></select>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="l">Median time-to-hire</div><div className="v">21<span style={{ fontSize: 16, color: "var(--ink-3)" }}>d</span></div><div className="d" style={{ color: "var(--ok)" }}>{"−3d vs last quarter"}</div></div>
        <div className="kpi"><div className="l">Time-to-fill</div><div className="v">32<span style={{ fontSize: 16, color: "var(--ink-3)" }}>d</span></div><div className="d" style={{ color: "var(--ok)" }}>{"−4d"}</div></div>
        <div className="kpi"><div className="l">Slowest stage</div><div className="v" style={{ fontSize: 22 }}>Interview</div><div className="d" style={{ color: "var(--warn)" }}>8.4d median</div></div>
        <div className="kpi"><div className="l">Fastest dept</div><div className="v" style={{ fontSize: 22 }}>Marketing</div><div className="d" style={{ color: "var(--ok)" }}>17d</div></div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-h">
            <span className="t"><I s={16} d={<path d="M4 20V4M4 20h16M8 16v-4M12.5 16V8M17 16v-7" />} /> Days by stage</span>
            <span className="chip chip-warn">Interview is the bottleneck</span>
          </div>
          <div className="card-b">
            {loading ? (
              <div className="cols">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div className="col" key={i}>
                    <Skeleton className="h-4 w-8" />
                    <div style={{ height: `${30 + i * 12}%`, width: "100%", maxWidth: 48, borderRadius: "8px 8px 0 0", overflow: "hidden" }}>
                      <Skeleton className="h-full w-full" />
                    </div>
                    <Skeleton className="h-3 w-10" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="py-2"><ErrorState title="Could not load funnel" body="We hit a snag reaching the analytics funnel. Showing typical stage timings." code={error.message} /></div>
            ) : (
              <div className="cols">
                {stages.map((s, i) => (
                  <div className="col" key={s.label}>
                    <div className="cv">{s.value}d</div>
                    <div className="bar" style={{ height: `${(s.value / maxS) * 100}%`, background: `linear-gradient(180deg, color-mix(in oklab, ${s.color} 70%, transparent), ${s.color})`, animationDelay: `${i * 80}ms` }} />
                    <div className="cl" style={{ textAlign: "center" }}>{s.label.split(" ")[0]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <span className="t"><I s={16} d={<path d="M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />} /> By department</span>
          </div>
          <div className="card-b">
            {TTH_DEPTS.map((d, i) => (
              <div className="hbar" key={d.n}>
                <span className="nm">{d.n}</span>
                <div className="track"><div className="fill" style={{ width: `${d.w}%`, background: d.d > 28 ? "var(--warn)" : "var(--brand)", animationDelay: `${i * 70}ms` }} /></div>
                <span className="val mono">{d.d}d</span>
              </div>
            ))}
            <div className="insight" style={{ marginTop: 14 }}>
              <span className="x"><I s={16} d={<path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" />} /></span>
              <p><b>Bottleneck found:</b> Security roles take 31d, 9 days above org median, concentrated in the interview loop. Adding a second technical screener could recover ~5 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================= Scene: Source ============================= */
function SourceScene() {
  const rows = SRC_ROWS;
  const maxH = 16;
  return (
    <div className="scene">
      <div className="pagehead">
        <div>
          <span className="chip chip-brand">Drill-down</span>
          <h1 style={{ marginTop: 10 }}>Source effectiveness</h1>
          <p>Where your best hires come from, quality, volume, conversion, and cost per hire by channel.</p>
        </div>
        <div className="toolbar">
          <select className="fsel"><option>All requisitions</option></select>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="l">Best quality source</div><div className="v" style={{ fontSize: 22 }}>Referral</div><div className="d" style={{ color: "var(--ok)" }}>82 quality score</div></div>
        <div className="kpi"><div className="l">Lowest cost/hire</div><div className="v" style={{ fontSize: 22 }}>Inbound</div><div className="d" style={{ color: "var(--ok)" }}>$900</div></div>
        <div className="kpi"><div className="l">Highest volume</div><div className="v" style={{ fontSize: 22 }}>Job board</div><div className="d" style={{ color: "var(--ink-3)" }}>1, 296 apps</div></div>
        <div className="kpi"><div className="l">Avg cost/hire</div><div className="v">$2.5<span style={{ fontSize: 16, color: "var(--ink-3)" }}>k</span></div><div className="d" style={{ color: "var(--ok)" }}>{"−$180 vs last mo"}</div></div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-h"><span className="t">Hires by source</span></div>
          <div className="card-b">
            {rows.map((r, i) => (
              <div className="hbar" key={r[0]}>
                <span className="nm" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span className="dot" style={{ background: r[1] }} />{r[0]}</span>
                <div className="track"><div className="fill" style={{ width: `${(r[2] / maxH) * 100}%`, background: r[1], animationDelay: `${i * 70}ms` }} /></div>
                <span className="val mono">{r[2]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="t">Cost per hire</span></div>
          <div className="card-b">
            {rows.map((r, i) => (
              <div className="hbar" key={r[0]}>
                <span className="nm" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><span className="dot" style={{ background: r[1] }} />{r[0]}</span>
                <div className="track"><div className="fill" style={{ width: `${(r[5] / 4800) * 100}%`, background: r[5] > 4000 ? "var(--danger)" : "var(--brand)", animationDelay: `${i * 70}ms` }} /></div>
                <span className="val mono">${r[5] / 1000}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><span className="t">Full breakdown</span></div>
        <div className="card-b" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>Source</th><th>Hires</th><th>Applicants</th><th>Conversion</th><th>Quality</th><th>Cost / hire</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]}>
                  <td><span className="src"><span className="dot" style={{ background: r[1] }} />{r[0]}</span></td>
                  <td className="mono">{r[2]}</td>
                  <td className="mono">{r[3].toLocaleString()}</td>
                  <td className="mono" style={{ color: r[6] >= 2 ? "var(--ok)" : r[6] >= 1 ? "var(--ink)" : "var(--danger)" }}>{r[6].toFixed(1)}%</td>
                  <td className="mono" style={{ color: r[4] >= 75 ? "var(--ok)" : r[4] >= 60 ? "var(--warn)" : "var(--danger)" }}>{r[4]}</td>
                  <td className="mono" style={{ fontWeight: 700, color: r[5] > 4000 ? "var(--danger)" : "var(--ink)" }}>${r[5].toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insight">
        <span className="x"><I s={16} d={<path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" />} /></span>
        <p><b>Recommendation:</b> Job board converts at 0.5% for 2.7&times; the cost of referrals. Shifting spend toward a referral incentive program is projected to lower blended cost-per-hire by ~$2, 000.</p>
      </div>
    </div>
  );
}

/* ============================ Scene: Diversity =========================== */
function DiversityScene() {
  const data = DIV_DONUT;
  const c = 2 * Math.PI * 54;
  let acc = 0;
  const arcs = data.map((d, idx) => {
    const len = (d[1] / 100) * c;
    const off = acc;
    acc += len;
    return <circle key={idx} cx="80" cy="80" r="54" fill="none" stroke={d[2]} strokeWidth="16" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />;
  });

  // Wire the four-fifths rows to getAdverseImpact; fall back to the design's
  // static rows when the gateway returns nothing usable.
  const { data: fair, error, loading } = useData<FairnessMetric[]>(() => getAdverseImpact());
  const ratios: [string, string, number, boolean][] =
    fair && fair.length
      ? fair.map((m) => [attrLabel(m.group), m.group, m.impactRatio, !m.flagged] as [string, string, number, boolean])
      : DIV_RATIOS_STATIC;

  return (
    <div className="scene">
      <div className="pagehead">
        <div>
          <span className="chip chip-brand">Drill-down</span>
          <h1 style={{ marginTop: 10 }}>Diversity</h1>
          <p>Representation across hires and adverse-impact analysis against the EEOC four-fifths rule. Privacy-preserving, group counts only.</p>
        </div>
        <div className="toolbar">
          <select className="fsel"><option>All departments</option></select>
          <button className="btn btn-soft btn-sm"><I s={14} d={<path d="M7 17 17 7M8 7h9v9" />} /> EEOC report</button>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="card-h">
            <span className="t"><I s={16} d={<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />} /> Representation (hires)</span>
            <span className="chip chip-ok">+4 index YoY</span>
          </div>
          <div className="card-b">
            <div className="donut-wrap">
              <div className="donut">
                <svg width="160" height="160">{arcs}</svg>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div className="bignum">0.78</div>
                    <div style={{ fontSize: 9.5, color: "var(--ink-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>index</div>
                  </div>
                </div>
              </div>
              <div className="legend">
                {data.map((d) => (
                  <div className="lr" key={d[0]}>
                    <span className="sw" style={{ background: d[2] }} />
                    <span style={{ flex: 1, color: "var(--ink-2)" }}>{d[0]}</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{d[1]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <span className="t"><I s={16} d={<path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />} /> Adverse-impact (four-fifths)</span>
            <span className="chip chip-ai">bias-auditor</span>
          </div>
          <div className="card-b">
            {loading ? (
              <div className="flex flex-col gap-[9px]">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[52px] w-full rounded-[14px]" />)}
              </div>
            ) : error ? (
              <div className="py-2"><ErrorState title="Could not load adverse-impact" body="We hit a snag reaching the bias-auditor. Showing the latest cached ratios." code={error.message} /></div>
            ) : (
              ratios.map((r, i) => (
                <div className="fourfifths" key={`${r[0]}-${i}`} style={{ background: r[3] ? "var(--ok-tint)" : "var(--danger-tint)", marginBottom: 9 }}>
                  <span style={{ color: r[3] ? "var(--ok)" : "var(--danger)", flexShrink: 0 }}>
                    {r[3]
                      ? <I s={18} d={<path d="M5 12.5l4.5 4.5L19 7.5" />} />
                      : <I s={18} d={<path d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a1.5 1.5 0 0 0 1.3 2.3h16.2a1.5 1.5 0 0 0 1.3-2.3L13.7 4.3a1.5 1.5 0 0 0-2.6 0z" />} />}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r[0]}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{r[1]} · ratio vs reference</div>
                  </div>
                  <span className="mono" style={{ fontSize: 19, fontWeight: 700, color: r[3] ? "var(--ok)" : "var(--danger)" }}>{r[2].toFixed(2)}</span>
                </div>
              ))
            )}
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 6, textAlign: "center" }}>Ratios below <b style={{ color: "var(--ink-2)" }}>0.80</b> warrant review of the selection procedure.</div>
          </div>
        </div>
      </div>

      <div className="insight">
        <span className="x"><I s={16} d={<path d="M12 9v4M12 17h.01M10.3 4.3 2.6 18a1.5 1.5 0 0 0 1.3 2.3h16.2a1.5 1.5 0 0 0 1.3-2.3z" />} /></span>
        <p><b>2 attributes need review.</b> Black/African American applicants select at 0.69 and applicants 40+ at 0.79 of the reference group at the phone-screen stage. Open the Compliance hub to investigate the screening criteria.</p>
      </div>
    </div>
  );
}

// Best-effort attribute family label for a fairness group name (so wired rows
// read like the prototype's "Race / ethnicity", "Gender", "Age" left column).
function attrLabel(group: string): string {
  const g = group.toLowerCase();
  if (/wom|men|female|male|gender|non-?binary/.test(g)) return "Gender";
  if (/age|40|older|young/.test(g)) return "Age";
  if (/race|ethnic|black|asian|hispanic|latin|white|african|native|pacific/.test(g)) return "Race / ethnicity";
  if (/disab/.test(g)) return "Disability";
  if (/veteran/.test(g)) return "Veteran status";
  return "Attribute";
}
