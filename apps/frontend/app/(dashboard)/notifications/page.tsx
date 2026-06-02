"use client";
// app/(dashboard)/notifications/page.tsx
// EXACT port of claude-design/Notifications.html (the notifications command
// center): the hero badge/headline/lede + "Mark all as read" CTA, the glass
// dashboard tray with the two semicircular tick gauges (Unread cleared / SLA
// on-time, each with its trend pill, caption, and segmented toggle), and the
// wide "Recent activity" feed, grouped by Today / Earlier, with icon tiles,
// unread dots, time-ago, and a filter dropdown (All / Unread / AI / SLA).
// Because this route lives inside the (dashboard) shell (sidebar + <main
// className="p-6">), the HTML's own top nav pill, full-page hero background
// video + veil, mobile menu, and the route-transition overlay (#pgxn) chrome
// are dropped, the dashboard layout supplies the frame. Every visual/section
// from the tray inward is reproduced faithfully. Scoped CSS lives under
// .notifx, :root vars moved onto .notifx; there are no @keyframes to rename in
// the retained markup. The gauges are a small SVG React component (40 ticks
// over a 180deg arc), and the feed filters / mark-all-read / segmented toggles
// are controlled React state.
//
// WIRING (rule 4): a local raw() helper does a best-effort GET /notifications
// (bearer from sessionStorage). The response (res?.data ?? res) is coerced to
// an array and mapped defensively to the feed row shape, then bucketed into
// Today / Earlier by relative age. While loading we show a Skeleton, on error
// an ErrorState, and when the backend returns nothing we fall back to the
// design's static example items so the page is never empty. The preference /
// segmented toggles are local-state chrome.
import { useMemo, useState } from "react";
import { Skeleton, ErrorState, EmptyState } from "@/components/aurora";
import { useData } from "@/lib/use-data";

/* ----------------------------- inline raw() ----------------------------- */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function raw(path: string, init?: RequestInit): Promise<any> {
  let t: string | null = null;
  try {
    t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const json = await res.json();
  // Gateway wraps successes as { success, data }; unwrap to the payload.
  return json?.data ?? json;
}

/* ------------------------------- row shape ------------------------------ */
// kind drives the icon tile color + path and the filter buckets.
type Kind = "ai" | "warn" | "ok" | "user" | "cal";
type Row = {
  kind: Kind;
  title: string;
  desc: string;
  time: string; // already-formatted time-ago, e.g. "3m"
  unread: boolean;
};

// Visual palette + glyph per kind, taken verbatim from the source feed data.
const KIND: Record<Kind, { fg: string; bg: string; path: string }> = {
  ai:   { fg: "#7c5cff", bg: "#f1ecff", path: "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" },
  warn: { fg: "#c97a16", bg: "#fdf3e7", path: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2" },
  ok:   { fg: "#16915a", bg: "#ecfdf3", path: "M5 12.5l4.5 4.5L19 7.5" },
  user: { fg: "#2563eb", bg: "#eef4ff", path: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5" },
  cal:  { fg: "#6d4bd8", bg: "#f1ecff", path: "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" },
};

// The design's static example feed, used as the graceful fallback (rule 4)
// when the GET /notifications fetch returns nothing usable. Verbatim copy.
const FALLBACK: { group: string; items: Row[] }[] = [
  {
    group: "Today",
    items: [
      { kind: "ai",   title: "bias-auditor flagged a requisition", desc: "Adverse-impact ratio 0.69 on Design reqs · needs review", time: "3m", unread: true },
      { kind: "warn", title: "SLA approaching", desc: "2 review-queue items due in under 2 hours", time: "22m", unread: true },
      { kind: "ai",   title: "candidate-screener finished 12 verdicts", desc: "Senior Backend Engineer · 3 flagged for review", time: "1h", unread: true },
    ],
  },
  {
    group: "Earlier",
    items: [
      { kind: "ok",   title: "Offer accepted", desc: "Dana Osei accepted the Platform Engineer offer", time: "3h", unread: false },
      { kind: "user", title: "New referral", desc: "Marcus Bell referred a Senior Backend candidate", time: "5h", unread: false },
      { kind: "cal",  title: "Interview scheduled", desc: "Technical loop with Priya Raman · Tue 2:00 PM", time: "1d", unread: false },
    ],
  },
];

/* --------------------------- defensive mapping -------------------------- */
// Coerce any backend shape into our Row. Notifications differ across services,
// so we read a generous set of likely fields and never throw.
function relTime(iso: unknown): string {
  if (typeof iso !== "string") return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
function ageMs(iso: unknown): number {
  if (typeof iso !== "string") return Number.MAX_SAFE_INTEGER;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : Date.now() - t;
}
function toKind(n: any): Kind {
  const raw = String(n?.type ?? n?.category ?? n?.kind ?? n?.severity ?? "").toLowerCase();
  if (/ai|agent|screen|bias|model/.test(raw)) return "ai";
  if (/sla|warn|deadline|due|alert|risk/.test(raw)) return "warn";
  if (/offer|accept|ok|success|complete|hire/.test(raw)) return "ok";
  if (/interview|schedul|calendar|meet|loop/.test(raw)) return "cal";
  if (/referral|user|candidate|mention|invite|member/.test(raw)) return "user";
  return "ok";
}
function mapRow(n: any): Row {
  const created = n?.createdAt ?? n?.created_at ?? n?.timestamp ?? n?.time ?? n?.date;
  return {
    kind: toKind(n),
    title: String(n?.title ?? n?.subject ?? n?.heading ?? n?.event ?? "Notification"),
    desc: String(n?.body ?? n?.message ?? n?.description ?? n?.detail ?? n?.summary ?? ""),
    time: relTime(created),
    unread: !(n?.read ?? n?.isRead ?? n?.readAt ?? n?.seen ?? false),
    // keep the raw age around for bucketing via a non-enumerable-ish field
    ...( { _age: ageMs(created) } as object ),
  } as Row;
}

/* -------------------------------- gauge --------------------------------- */
// 40 ticks over a 180deg arc, the active span colored, with the % readout in
// the middle, faithfully reproducing the source's gauge() routine.
function Gauge({ value, color = "#16916a", ends }: { value: number; color?: string; ends?: [string, string] }) {
  const N = 40;
  const active = Math.round((value / 100) * N);
  const cx = 100, cy = 100, r = 80, inner = 70;
  const ticks = [];
  for (let i = 0; i < N; i++) {
    const a = Math.PI + (Math.PI * i) / (N - 1);
    const x1 = cx + Math.cos(a) * inner, y1 = cy + Math.sin(a) * inner;
    const x2 = cx + Math.cos(a) * r, y2 = cy + Math.sin(a) * r;
    ticks.push(
      <line
        key={i}
        x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}
        stroke={i < active ? color : "#d4d4d8"} strokeWidth={2.5} strokeLinecap="round"
      />,
    );
  }
  return (
    <div className="gwrap">
      <svg viewBox="0 0 200 120">
        <g>{ticks}</g>
        <text x="100" y="100" textAnchor="middle" fontSize="22" fontWeight="600" fontFamily="Inter" fill="#1a2230">
          {value}%
        </text>
      </svg>
      {ends && (
        <div className="gends">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  );
}

/* --------------------------- segmented toggle --------------------------- */
function Toggle({ a, b }: { a: string; b: string }) {
  const [on, setOn] = useState(0);
  return (
    <div className="tgl">
      <button className={on === 0 ? "on" : ""} onClick={() => setOn(0)}>{a}</button>
      <button className={on === 1 ? "on" : ""} onClick={() => setOn(1)}>{b}</button>
    </div>
  );
}

/* ---------------------------- inline icon ------------------------------- */
function Glyph({ path }: { path: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

const FILTERS: { id: Filter; label: string; dot: string }[] = [
  { id: "all",    label: "All notifications", dot: "#9aa0aa" },
  { id: "unread", label: "Unread only",       dot: "#16916a" },
  { id: "ai",     label: "AI activity",       dot: "#7c5cff" },
  { id: "sla",    label: "SLA & deadlines",   dot: "#c97a16" },
];
type Filter = "all" | "unread" | "ai" | "sla";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
.notifx{--ink:#0b0f1a;--orange:#16916a;--ai:#7c5cff;--ease:cubic-bezier(.22, 1, .36, 1);
  font-family:'Inter', system-ui, sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;position:relative;}
.notifx *{box-sizing:border-box;}
.notifx a{text-decoration:none;color:inherit;}
.notifx button{font-family:inherit;cursor:pointer;}
/* hero content (page chrome supplied by the dashboard shell) */
.notifx .hc{display:flex;flex-direction:column;align-items:center;text-align:center;padding:8px 16px 32px;}
@media(min-width:640px){.notifx .hc{padding:16px 16px 40px;}}
.notifx .badge{display:inline-flex;align-items:center;gap:8px;background:#fff;border-radius:999px;padding:6px 16px;box-shadow:0 2px 8px rgba(0, 0, 0, .06);font-size:13px;font-weight:500;}
.notifx .badge .od{width:8px;height:8px;border-radius:50%;background:var(--orange);}
.notifx h1{font-size:clamp(34px, 6vw, 60px);line-height:1.05;font-weight:500;letter-spacing:-0.02em;margin-top:22px;max-width:56rem;}
.notifx h1 .it{font-family:'Instrument Serif', serif;font-style:italic;font-weight:400;}
.notifx .sub{margin-top:18px;color:#3a4250;padding:0 8px;font-size:clamp(13px, 3.5vw, 16px);max-width:40rem;}
.notifx .cta{margin-top:26px;display:inline-flex;align-items:center;gap:12px;background:var(--ink);color:#fff;border:none;border-radius:999px;padding:8px 8px 8px 24px;font-size:14px;font-weight:500;transition:transform .15s var(--ease);}
.notifx .cta:hover{transform:translateY(-2px);}
.notifx .cta .c{width:28px;height:28px;border-radius:50%;background:rgba(255, 255, 255, .16);display:grid;place-items:center;}
/* dashboard tray */
.notifx .tray{background:rgba(255, 255, 255, 0.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);border:1px solid rgba(255, 255, 255, .7);border-radius:26px;padding:16px;width:100%;margin:0 auto;box-shadow:0 14px 40px -22px rgba(15, 25, 45, .25);}
@media(min-width:640px){.notifx .tray{padding:22px;}}
.notifx .dgrid{display:grid;grid-template-columns:1fr;gap:12px;}
@media(min-width:640px){.notifx .dgrid{grid-template-columns:1fr 1fr;gap:16px;}}
@media(min-width:1000px){.notifx .dgrid{grid-template-columns:1.05fr 1.05fr 1.6fr;}}
.notifx .dcard{background:rgba(255, 255, 255, 0.72);-webkit-backdrop-filter:blur(20px) saturate(150%);backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255, 255, 255, .7);border-radius:18px;padding:18px;box-shadow:0 12px 34px -14px rgba(15, 25, 45, .22), inset 0 1px 0 rgba(255, 255, 255, .55);}
.notifx .dch{display:flex;align-items:center;gap:8px;font-size:13px;}
.notifx .dch .o{color:var(--orange);font-weight:600;}.notifx .dch .n{color:#8a8f99;}
.notifx .bignum{font-size:28px;font-weight:600;letter-spacing:-0.02em;margin-top:10px;display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
.notifx .tpill{font-size:11px;font-weight:600;border-radius:999px;padding:2px 9px;display:inline-flex;align-items:center;gap:4px;}
.notifx .tp-up{background:#ecfdf3;color:#16915a;}.notifx .tp-dn{background:#fef2f2;color:#dc2626;}.notifx .tp-ai{background:#f1ecff;color:#6d4bd8;}
.notifx .cap{font-size:11.5px;color:#9aa0aa;margin-top:6px;}
.notifx .gauge-lbl{text-align:center;font-size:12px;color:#7a808a;font-weight:500;margin:14px 0 2px;}
.notifx .gwrap{display:flex;flex-direction:column;align-items:center;}
.notifx .gwrap svg{width:100%;max-width:240px;height:auto;}
.notifx .gends{display:flex;justify-content:space-between;width:100%;max-width:200px;font-size:11px;color:#a0a6b0;margin-top:-4px;}
.notifx .tgl{margin-top:14px;background:rgba(255, 255, 255, .55);border:1px solid rgba(255, 255, 255, .6);border-radius:999px;padding:4px;display:flex;}
.notifx .tgl button{flex:1;border:none;background:transparent;border-radius:999px;font-size:12px;font-weight:600;color:#8a8f99;padding:7px;}
.notifx .tgl button.on{background:#fff;color:#1a2230;box-shadow:0 1px 3px rgba(0, 0, 0, .08);}
/* feed card (3rd, wide) */
.notifx .feed{background:rgba(255, 255, 255, 0.72);-webkit-backdrop-filter:blur(20px) saturate(150%);backdrop-filter:blur(20px) saturate(150%);border:1px solid rgba(255, 255, 255, .7);border-radius:18px;padding:6px 6px 10px;display:flex;flex-direction:column;box-shadow:0 12px 34px -14px rgba(15, 25, 45, .22), inset 0 1px 0 rgba(255, 255, 255, .55);position:relative;}
.notifx .feedh{display:flex;align-items:center;gap:8px;padding:14px 14px 10px;position:relative;}
.notifx .feedh .o{color:var(--orange);font-weight:600;font-size:13px;}
.notifx .feedh .filt{margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--orange);background:transparent;border:none;}
.notifx .feedh .mk{font-size:12px;font-weight:600;color:#5c6470;background:rgba(255, 255, 255, .7);border:1px solid rgba(255, 255, 255, .6);border-radius:999px;padding:6px 12px;}
.notifx .flist{overflow-y:auto;max-height:360px;padding:0 6px;}
.notifx .fgrp{font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#aab0ba;padding:10px 8px 6px;}
.notifx .fitem{display:flex;gap:11px;padding:11px 9px;border-radius:13px;align-items:flex-start;transition:background .15s;}
.notifx .fitem:hover{background:rgba(255, 255, 255, .6);}
.notifx .fitem.unread{background:rgba(255, 255, 255, .55);}
.notifx .fitem .ic{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;flex-shrink:0;}
.notifx .fitem .bd{flex:1;min-width:0;}
.notifx .fitem .ti{font-size:13.5px;font-weight:600;line-height:1.3;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.notifx .fitem .ds{font-size:12px;color:#737984;margin-top:2px;line-height:1.4;}
.notifx .fitem .tm{font-size:11px;color:#aab0ba;flex-shrink:0;}
.notifx .fitem .ud{width:7px;height:7px;border-radius:50%;background:var(--orange);flex-shrink:0;margin-top:6px;}
.notifx .aipill{font-size:9.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#6d4bd8;background:#f1ecff;border-radius:999px;padding:2px 7px;}
.notifx .empty{text-align:center;color:#9aa0aa;font-size:13px;padding:40px 16px;}
/* filter dropdown */
.notifx .fdrop{position:absolute;top:calc(100% - 4px);right:14px;width:220px;background:#fff;border-radius:16px;box-shadow:0 16px 40px rgba(0, 0, 0, .16);border:1px solid #e5e5e5;padding:7px;z-index:30;}
.notifx .fdrop .ft{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#a0a6b0;padding:7px 10px 4px;}
.notifx .fdrop button{width:100%;display:flex;align-items:center;gap:9px;padding:9px 10px;border:none;background:transparent;border-radius:10px;font-size:13px;font-weight:500;color:#1a2230;text-align:left;}
.notifx .fdrop button:hover{background:#f4f4f2;}
.notifx .fdrop button.on{color:var(--orange);font-weight:600;}
.notifx .fdrop button .fc{margin-left:auto;color:var(--orange);}
.notifx .fdrop button .fd{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
@media(prefers-reduced-motion:reduce){.notifx .cta:hover{transform:none;}}
`;

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({}); // key -> read
  const [allCleared, setAllCleared] = useState(false);

  // Best-effort real notifications. Falls back to the design's example feed.
  const { data, error, loading, reload } = useData<Row[]>(async () => {
    const res = await raw("/notifications");
    const arr: any[] = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : [];
    return arr.map(mapRow);
  });

  // Decide the source of rows: real data when present, otherwise the static
  // fallback so the command center is never empty (rule 4).
  const groups = useMemo(() => {
    const real = data && data.length ? data : null;
    if (!real) return FALLBACK;
    // bucket by relative age into Today (< 24h) / Earlier.
    const today: Row[] = [];
    const earlier: Row[] = [];
    real.forEach((r) => {
      const age = (r as any)._age as number | undefined;
      (typeof age === "number" && age < 86_400_000 ? today : earlier).push(r);
    });
    return [
      { group: "Today", items: today },
      { group: "Earlier", items: earlier },
    ].filter((g) => g.items.length);
  }, [data]);

  // Apply mark-all / per-item read overrides on top of the source rows.
  const keyOf = (g: string, i: number) => `${g}:${i}`;
  const isUnread = (g: string, i: number, base: boolean) => {
    if (allCleared) return false;
    const k = keyOf(g, i);
    return k in overrides ? !overrides[k] : base;
  };

  function matches(r: Row, g: string, i: number): boolean {
    if (filter === "all") return true;
    if (filter === "unread") return isUnread(g, i, r.unread);
    if (filter === "ai") return r.kind === "ai";
    if (filter === "sla") return /SLA|approaching|due|deadline/i.test(`${r.title} ${r.desc}`);
    return true;
  }

  const markAll = () => {
    setAllCleared(true);
    setOverrides({});
  };

  // unread count drives the badge + the "need you" copy.
  const unreadCount = groups.reduce(
    (acc, g) => acc + g.items.filter((r, i) => isUnread(g.group, i, r.unread)).length,
    0,
  );

  // Visible groups after filtering.
  const visible = groups
    .map((g) => ({ group: g.group, items: g.items.filter((r, i) => matches(r, g.group, i)) }))
    .filter((g) => g.items.length);
  const anyVisible = visible.length > 0;

  return (
    <div className="notifx mx-auto w-full max-w-[1100px]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* hero content (page chrome supplied by the dashboard shell) */}
      <div className="hc">
        <span className="badge">
          <span className="od" style={allCleared ? { background: "#16915a" } : undefined} />
          {allCleared
            ? "Notifications · all caught up"
            : `Notifications · ${unreadCount} need${unreadCount === 1 ? "s" : ""} you`}
        </span>
        <h1>
          Nothing slips <span className="it">through</span>
          <br />
          the cracks
        </h1>
        <p className="sub">
          Every screening verdict, SLA, interview, and offer update, gathered in one calm command center.
        </p>
        <button className="cta" onClick={markAll}>
          Mark all as read
          <span className="c">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
        </button>
      </div>

      {/* dashboard tray */}
      <div className="tray">
        <div className="dgrid">
          {/* Card 1: Unread gauge */}
          <div className="dcard">
            <div className="dch"><span className="o">Unread</span><span className="n">This week</span></div>
            <div className="bignum">
              {allCleared ? 0 : unreadCount}
              <span className="tpill tp-dn">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5" /></svg>
                -34% vs last
              </span>
            </div>
            <div className="cap">Down from 18 last week</div>
            <div className="gauge-lbl">Inbox cleared</div>
            <Gauge value={83} ends={["0", "120"]} />
            <Toggle a="Unread" b="All" />
          </div>

          {/* Card 2: SLA gauge */}
          <div className="dcard">
            <div className="dch"><span className="o">SLA on-time</span><span className="n">Today</span></div>
            <div className="bignum">
              94%
              <span className="tpill tp-up">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M7 14l5-5 5 5" /></svg>
                +6%
              </span>
            </div>
            <div className="cap">2 review items due within 2h</div>
            <div className="gauge-lbl">Response within SLA</div>
            <Gauge value={94} />
            <Toggle a="Reviews" b="Decisions" />
          </div>

          {/* Card 3: Feed */}
          <div className="feed">
            <div className="feedh">
              <span className="o">Recent activity</span>
              <button
                className="filt"
                onClick={() => setFilterOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={filterOpen}
              >
                {filter === "all" ? "Filters" : FILTERS.find((f) => f.id === filter)?.label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <button className="mk" onClick={markAll} style={{ marginLeft: 10 }}>Mark all read</button>

              {filterOpen && (
                <div className="fdrop" role="menu">
                  <div className="ft">Filter activity</div>
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      className={filter === f.id ? "on" : ""}
                      onClick={() => { setFilter(f.id); setFilterOpen(false); }}
                    >
                      <span className="fd" style={{ background: f.dot }} />
                      {f.label}
                      {filter === f.id && (
                        <svg className="fc" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flist">
              {loading ? (
                <div className="flex flex-col gap-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-2">
                      <Skeleton className="h-[34px] w-[34px] rounded-[10px]" />
                      <div className="flex-1">
                        <Skeleton className="mb-2 h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="py-6">
                  <ErrorState
                    title="Could not load notifications"
                    body="We hit a snag reaching the activity feed. You can retry."
                    code={error.message}
                    onRetry={reload}
                  />
                </div>
              ) : !anyVisible ? (
                filter !== "all" ? (
                  <div className="empty">Nothing matches this filter.</div>
                ) : (
                  <div className="py-6">
                    <EmptyState title="All caught up" body="No notifications right now. New activity will appear here." />
                  </div>
                )
              ) : (
                visible.map((g) => (
                  <div key={g.group}>
                    <div className="fgrp">{g.group}</div>
                    {g.items.map((r) => {
                      // recover the original index within the source group for read-state keys.
                      const src = groups.find((x) => x.group === g.group)!;
                      const idx = src.items.indexOf(r);
                      const unread = isUnread(g.group, idx, r.unread);
                      const pal = KIND[r.kind];
                      return (
                        <div key={`${g.group}:${idx}`} className={"fitem" + (unread ? " unread" : "")}>
                          <span className="ic" style={{ background: pal.bg, color: pal.fg }}>
                            <Glyph path={pal.path} />
                          </span>
                          <div className="bd">
                            <div className="ti">
                              {r.title}
                              {r.kind === "ai" && <span className="aipill">AI · agent</span>}
                            </div>
                            {r.desc && <div className="ds">{r.desc}</div>}
                          </div>
                          {r.time && <span className="tm">{r.time}</span>}
                          {unread && <span className="ud" />}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
