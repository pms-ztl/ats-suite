"use client";
// app/(dashboard)/workspace/page.tsx
// EXACT port of claude-design/Admin Portal.html, the tenant Workspace admin
// portal. The prototype is a full shell (aurora + glass topbar with breadcrumb
// + theme toggle + avatar) wrapping a #view region that the inline script swaps
// between two hash routes: #admin (Overview) and #admin/audit (Audit log).
// Because this route lives inside the (dashboard) shell (sidebar + sticky
// topbar + theme toggle + <main className="p-6">), the prototype's own aurora,
// .top header, and theme toggle are DROPPED, the dashboard layout supplies that
// frame. We port ONLY the inner content scenes plus the two-tab strip that
// switches between them, reproduced verbatim with React state instead of the
// location.hash router.
//
// The Overview scene: pagehead, the 4 KPI cards (Members 12/15, Open
// requisitions 38, Resume quota 64%, Compliance 94), the Members list (5 rows
// with role pills + last-seen + a kebab + an "Invite member" button), the
// "Needs attention" list (3 alerts), the "Security posture" health bars (2FA
// adoption 75%, SSO coverage 0%, Seats used 80%), and the "Connected
// integrations" strip (Slack, Workday, Google Calendar, Checkr). The Audit log
// scene: pagehead + Export CSV, the toolbar (search + two selects), the audit
// table (header + 10 rows, wait, 11 rows in the source) with per-category icon
// tiles, IP suffixes, member avatars, and category tags (auth, member, config,
// billing, data, ai), plus a "Load older entries" button.
//
// Scoped CSS lives under .wsadminx; the prototype's :root / [data-theme="light"]
// token block is hung on .wsadminx (light is the default) and the
// [data-theme="dark"] block is re-targeted to `.dark .wsadminx` so the scene
// follows the dashboard shell's `.dark` toggle. The lone @keyframes `rise` is
// renamed `wsadminx-rise`. Zero em/en dashes.
//
// WIRING (rule 4, kept LIGHT so the layout never changes): a best-effort
// raw("/users/seats") GET reads the tenant's real { used, limit } seat counts.
// When it succeeds we use those numbers for the "Members" KPI value and the
// "Seats used" health bar; if it fails or is missing we keep the prototype's
// exact "12 / 15" / 80%. Every card, row, and bar from the prototype is always
// rendered.
import { useEffect, useMemo, useState } from "react";

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
  return json?.data ?? json;
}

/* ------------------------------- inline icon ---------------------------- */
// Mirror of the prototype's I(p, s) helper: a 24x24 stroked SVG carrying the
// given inner <path>/<circle> markup at the requested pixel size.
function I({ d, s = 18 }: { d: React.ReactNode; s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

/* -------------------------- overview scene data ------------------------- */
type Kpi = { l: string; v: string; ic: React.ReactNode; d: string; dc: string };
type Member = { ini: string; nm: string; em: string; role: string; last: string };
type Pending = { ic: "mail" | "card" | "key"; c: string; t: string; d: string };
type Health = { l: string; v: number; c: string; txt?: string };

// Per-kind glyphs used by the "Needs attention" rows (verbatim ICA map).
const ICA: Record<Pending["ic"], React.ReactNode> = {
  mail: <path d="M3 7l9 6 9-6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  card: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18" />,
  key: <path d="M14 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11.5 11.5L4 19v2h3v-2h2v-2h2l1.5-1.5" />,
};

const MEMBERS: Member[] = [
  { ini: "AC", nm: "Avery Chen", em: "avery@northwind.co", role: "Admin", last: "now" },
  { ini: "JL", nm: "Jordan Lee", em: "jordan@northwind.co", role: "Hiring Manager", last: "2h" },
  { ini: "SO", nm: "Sam Okafor", em: "sam@northwind.co", role: "Recruiter", last: "1d" },
  { ini: "MI", nm: "Maya Idris", em: "maya@northwind.co", role: "Compliance", last: "3h" },
  { ini: "GP", nm: "Grace Park", em: "grace@northwind.co", role: "Interviewer", last: "5d" },
];

const PENDING: Pending[] = [
  { ic: "mail", c: "info", t: "2 pending invitations", d: "tomas@ · ben@ · sent 2d ago" },
  { ic: "card", c: "warn", t: "Resume quota at 64%", d: "Consider upgrading before month end" },
  { ic: "key", c: "danger", t: "3 members without 2FA", d: "Enforce in Security settings" },
];

const INTEGRATIONS: [string, string, string][] = [
  ["Slack", "Notifications", "ok"],
  ["Workday", "HRIS", "ok"],
  ["Google Calendar", "Scheduling", "ok"],
  ["Checkr", "Background checks", "ok"],
];

/* --------------------------- audit scene data --------------------------- */
type AuditRow = { t: string; cat: string; who: string; ini: string; txt: React.ReactNode; ip: string; ai?: boolean };

const CAT_TONE: Record<string, string> = {
  auth: "info", member: "brand", config: "warn", billing: "ok", data: "danger", ai: "ai",
};

const AUDIT_ROWS: AuditRow[] = [
  { t: "09:41:22", cat: "member", who: "Avery Chen", ini: "AC", txt: <>invited <b>tomas@northwind.co</b> as Recruiter</>, ip: "10.0.4.21" },
  { t: "09:18:50", cat: "config", who: "Avery Chen", ini: "AC", txt: <>changed data-retention to <b>24 months</b></>, ip: "10.0.4.21" },
  { t: "08:55:02", cat: "ai", who: "candidate-screener", ini: "AI", txt: <>screening verdict for <b>Priya Raman</b> · flagged for review</>, ip: ", ", ai: true },
  { t: "08:40:11", cat: "auth", who: "Jordan Lee", ini: "JL", txt: <>signed in via <b>SSO (Okta)</b></>, ip: "73.21.9.4" },
  { t: "Yesterday", cat: "member", who: "Avery Chen", ini: "AC", txt: <>changed <b>Sam Okafor</b> role to Recruiter</>, ip: "10.0.4.21" },
  { t: "Yesterday", cat: "data", who: "Maya Idris", ini: "MI", txt: <>exported <b>EEOC summary (Q2)</b></>, ip: "10.0.7.8" },
  { t: "Yesterday", cat: "billing", who: "Avery Chen", ini: "AC", txt: <>updated payment method · <b>•••• 4242</b></>, ip: "10.0.4.21" },
  { t: "May 28", cat: "config", who: "Jordan Lee", ini: "JL", txt: <>enabled <b>blind review</b> for Design reqs</>, ip: "73.21.9.4" },
  { t: "May 28", cat: "ai", who: "bias-auditor", ini: "AI", txt: <>raised adverse-impact alert · <b>ratio 0.69</b></>, ip: ", ", ai: true },
  { t: "May 27", cat: "auth", who: "Grace Park", ini: "GP", txt: <>password reset completed</>, ip: "98.14.2.55" },
  { t: "May 27", cat: "data", who: "system", ini: "SY", txt: <>retention purge · <b>1, 204 records</b> deleted</>, ip: ", " },
];

// Per-category icon tile glyphs (verbatim ci map).
const CI: Record<string, React.ReactNode> = {
  auth: <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 16l4-4-4-4M20 12H9" />,
  member: <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5" />,
  config: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a1.6 1.6 0 0 0 .3 1.8M4.6 13a1.6 1.6 0 0 1-.3 1.8" />,
  billing: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5zM3 10h18" />,
  data: <path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />,
  ai: <path d="M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z" />,
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap');
.wsadminx {
  --font-sans: "Hanken Grotesk", ui-sans-serif, system-ui, sans-serif; --font-mono: "Geist Mono", ui-monospace, monospace;
  --ease-out: cubic-bezier(.22, 1, .36, 1); --ease-spring: cubic-bezier(.34, 1.4, .5, 1);
  --r-sm: 8px; --r: 11px; --r-lg: 14px; --r-xl: 18px; --r-2xl: 24px; --r-pill: 999px;
}
.wsadminx {
  color-scheme: light;
  --bg: oklch(0.984 0.006 165); --bg-deep: oklch(0.972 0.008 165);
  --surface: oklch(0.997 0.003 165); --surface-2: oklch(0.978 0.006 165); --surface-3: oklch(0.962 0.008 165);
  --ink: oklch(0.245 0.013 175); --ink-2: oklch(0.47 0.013 175); --ink-3: oklch(0.605 0.012 175);
  --line: oklch(0.905 0.008 175); --line-2: oklch(0.86 0.01 175); --line-strong: oklch(0.80 0.012 175);
  --brand: oklch(0.585 0.122 162); --brand-2: oklch(0.515 0.118 162); --brand-ink: oklch(0.40 0.10 162);
  --brand-tint: oklch(0.955 0.028 162); --brand-tint-2: oklch(0.925 0.045 162); --on-brand: oklch(0.99 0.01 162);
  --ai: oklch(0.555 0.185 292); --ai-ink: oklch(0.44 0.16 292); --ai-tint: oklch(0.955 0.03 292); --ai-tint-2: oklch(0.925 0.05 292); --on-ai: oklch(0.99 0.01 292);
  --ok: oklch(0.60 0.13 152); --ok-tint: oklch(0.95 0.04 152);
  --warn: oklch(0.69 0.135 73); --warn-tint: oklch(0.955 0.05 80);
  --danger: oklch(0.565 0.185 25); --danger-tint: oklch(0.955 0.035 25);
  --info: oklch(0.585 0.13 245); --info-tint: oklch(0.95 0.04 245);
  --glass: oklch(0.99 0.004 165 / 0.78); --glass-edge: oklch(0.80 0.012 175 / 0.5); --glass-line: oklch(1 0 0 / 0.65); --glass-blur: 18px;
  --e1: 0 1px 2px oklch(0.4 0.03 165/.05); --e2: 0 6px 16px -6px oklch(0.35 0.04 165/.12), 0 2px 6px -3px oklch(0.35 0.04 165/.08);
  --e3: 0 22px 48px -16px oklch(0.30 0.05 165/.22), 0 10px 22px -10px oklch(0.30 0.05 165/.14);
  --grain-op: .45; --aurora-op: .65;
}
.dark .wsadminx {
  color-scheme: dark;
  --bg: oklch(0.168 0.012 178); --bg-deep: oklch(0.13 0.012 178);
  --surface: oklch(0.206 0.014 178); --surface-2: oklch(0.238 0.015 178); --surface-3: oklch(0.272 0.016 178);
  --ink: oklch(0.955 0.005 175); --ink-2: oklch(0.74 0.012 175); --ink-3: oklch(0.595 0.014 175);
  --line: oklch(0.305 0.014 178); --line-2: oklch(0.36 0.016 178); --line-strong: oklch(0.44 0.018 178);
  --brand: oklch(0.755 0.13 162); --brand-2: oklch(0.82 0.13 162); --brand-ink: oklch(0.86 0.10 162);
  --brand-tint: oklch(0.30 0.05 162); --brand-tint-2: oklch(0.36 0.07 162); --on-brand: oklch(0.17 0.04 162);
  --ai: oklch(0.715 0.155 292); --ai-ink: oklch(0.82 0.12 292); --ai-tint: oklch(0.31 0.07 292); --ai-tint-2: oklch(0.37 0.09 292); --on-ai: oklch(0.17 0.05 292);
  --ok: oklch(0.74 0.14 152); --ok-tint: oklch(0.31 0.06 152);
  --warn: oklch(0.80 0.135 80); --warn-tint: oklch(0.33 0.06 80);
  --danger: oklch(0.685 0.16 25); --danger-tint: oklch(0.33 0.07 25);
  --info: oklch(0.71 0.12 245); --info-tint: oklch(0.31 0.06 245);
  --glass: oklch(0.225 0.014 178 / 0.7); --glass-edge: oklch(0.55 0.02 178 / 0.3); --glass-line: oklch(0.85 0.02 178 / 0.10); --glass-blur: 20px;
  --e1: 0 1px 2px oklch(0 0 0/.35); --e2: 0 8px 22px -8px oklch(0 0 0/.55), 0 3px 8px -4px oklch(0 0 0/.40);
  --e3: 0 28px 56px -18px oklch(0 0 0/.68), 0 12px 26px -10px oklch(0 0 0/.52);
  --grain-op: .3; --aurora-op: .75;
}
.wsadminx { box-sizing: border-box; }
.wsadminx * { box-sizing: border-box; }
.wsadminx { font-family: var(--font-sans); font-size: 14px; line-height: 1.5; color: var(--ink); -webkit-font-smoothing: antialiased; font-feature-settings: "ss01" 1; }
.wsadminx .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.wsadminx a { color: inherit; text-decoration: none; } .wsadminx h1, .wsadminx h2, .wsadminx h3, .wsadminx p{margin:0;}

.wsadminx .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 16px; border-radius: var(--r); font-weight: 600; font-size: 13.5px; font-family: var(--font-sans); cursor: pointer; border: 1px solid transparent; transition: all .18s var(--ease-out); white-space: nowrap; }
.wsadminx .btn-primary { background: var(--brand); color: var(--on-brand); box-shadow: var(--e1); } .wsadminx .btn-primary:hover { box-shadow: var(--e2); }
.wsadminx .btn-soft { background: var(--surface-2); color: var(--ink); border-color: var(--line-2); } .wsadminx .btn-soft:hover { border-color: var(--line-strong); }
.wsadminx .btn-ghost { background: transparent; color: var(--ink-2); } .wsadminx .btn-ghost:hover { background: var(--surface-2); }
.wsadminx .btn-sm { padding: 6px 12px; font-size: 12.5px; }
.wsadminx .av { width: 32px; height: 32px; border-radius: 99px; background: linear-gradient(135deg, var(--brand), var(--ai)); color: white; display: grid; place-items: center; font-weight: 700; font-size: 11px; }

/* tabs */
.wsadminx .tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--line); flex-shrink: 0; }
.wsadminx .tabs a { padding: 13px 15px; font-size: 13.5px; font-weight: 600; color: var(--ink-3); border-bottom: 2px solid transparent; margin-bottom: -1px; display: inline-flex; gap: 7px; align-items: center; transition: color .18s; cursor: pointer; }
.wsadminx .tabs a:hover { color: var(--ink-2); }
.wsadminx .tabs a.on { color: var(--ink); border-bottom-color: var(--brand); }

.wsadminx .body { padding: 26px 0 10px; }
.wsadminx .wrap { max-width: 1100px; margin: 0 auto; }
.wsadminx .chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: var(--r-pill); font-size: 11px; font-weight: 700; }
.wsadminx .chip-brand { background: var(--brand-tint); color: var(--brand-ink); } .wsadminx .chip-ai { background: var(--ai-tint); color: var(--ai-ink); } .wsadminx .chip-ok { background: var(--ok-tint); color: var(--ok); } .wsadminx .chip-warn { background: var(--warn-tint); color: var(--warn); } .wsadminx .chip-danger { background: var(--danger-tint); color: var(--danger); } .wsadminx .chip-info { background: var(--info-tint); color: var(--info); }
.wsadminx .pagehead { margin-bottom: 20px; } .wsadminx .pagehead h1 { font-size: 25px; font-weight: 800; letter-spacing: -0.03em; } .wsadminx .pagehead p { font-size: 14px; color: var(--ink-2); margin-top: 5px; }

.wsadminx .scene { animation: wsadminx-rise .4s var(--ease-out) both; } @keyframes wsadminx-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

/* kpi cards */
.wsadminx .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.wsadminx .kpi { border-radius: var(--r-lg); border: 1px solid var(--line); background: var(--surface); padding: 15px 16px; box-shadow: var(--e1); position: relative; overflow: hidden; }
.wsadminx .kpi .l { font-size: 12px; color: var(--ink-2); font-weight: 600; display: inline-flex; gap: 7px; align-items: center; }
.wsadminx .kpi .l .ic { width: 22px; height: 22px; border-radius: 6px; display: grid; place-items: center; background: var(--surface-2); color: var(--ink-3); }
.wsadminx .kpi .v { font-size: 27px; font-weight: 800; letter-spacing: -0.03em; margin-top: 10px; }
.wsadminx .kpi .d { font-size: 11.5px; font-weight: 700; margin-top: 6px; }
@media (max-width: 820px){ .wsadminx .kpis { grid-template-columns: repeat(2, 1fr); } }

.wsadminx .grid2 { display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; align-items: start; }
@media (max-width: 860px){ .wsadminx .grid2 { grid-template-columns: 1fr; } }
.wsadminx .card { border-radius: var(--r-xl); border: 1px solid var(--line); background: var(--surface); box-shadow: var(--e1); overflow: hidden; }
.wsadminx .card-h { display: flex; align-items: center; justify-content: space-between; padding: 13px 18px; border-bottom: 1px solid var(--line); }
.wsadminx .card-h .t { font-weight: 700; font-size: 14.5px; display: inline-flex; gap: 8px; align-items: center; }
.wsadminx .card-h a { font-size: 12.5px; font-weight: 600; color: var(--brand); display: inline-flex; gap: 4px; align-items: center; }
.wsadminx .card-b { padding: 8px 18px 16px; }

/* member rows */
.wsadminx .mrow { display: grid; grid-template-columns: 1fr 130px 80px 70px; gap: 12px; align-items: center; padding: 11px 0; border-top: 1px solid var(--line); }
.wsadminx .mrow:first-child { border-top: none; }
.wsadminx .mrow .who { display: flex; gap: 10px; align-items: center; min-width: 0; } .wsadminx .mrow .nm { font-size: 13px; font-weight: 600; } .wsadminx .mrow .em { font-size: 11px; color: var(--ink-3); }
.wsadminx .rolepill { font-size: 11px; font-weight: 600; color: var(--ink-2); background: var(--surface-2); border: 1px solid var(--line); padding: 4px 10px; border-radius: var(--r-pill); justify-self: start; }

/* list items */
.wsadminx .li { display: flex; gap: 12px; align-items: center; padding: 11px 0; border-top: 1px solid var(--line); } .wsadminx .li:first-child { border-top: none; }
.wsadminx .li .ic { width: 32px; height: 32px; border-radius: 9px; display: grid; place-items: center; flex-shrink: 0; }
.wsadminx .li .tx { flex: 1; min-width: 0; } .wsadminx .li .tt { font-size: 13px; font-weight: 600; } .wsadminx .li .td { font-size: 11.5px; color: var(--ink-3); margin-top: 1px; }

.wsadminx .health { display: flex; flex-direction: column; gap: 11px; }
.wsadminx .hbar { } .wsadminx .hbar .row { display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 5px; } .wsadminx .hbar .track { height: 7px; border-radius: 99px; background: var(--surface-3); overflow: hidden; } .wsadminx .hbar .fill { height: 100%; border-radius: 99px; }

/* audit log */
.wsadminx .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
.wsadminx .search { display: flex; align-items: center; gap: 8px; padding: 0 12px; height: 36px; border-radius: var(--r); border: 1px solid var(--line-2); background: var(--surface); flex: 1; min-width: 200px; }
.wsadminx .search input { flex: 1; border: none; outline: none; background: transparent; font-size: 13px; color: var(--ink); font-family: var(--font-sans); }
.wsadminx .fsel { height: 36px; padding: 0 10px; border-radius: var(--r); border: 1px solid var(--line-2); background: var(--surface); color: var(--ink); font-size: 12.5px; font-weight: 600; font-family: var(--font-sans); cursor: pointer; }
.wsadminx .audit { border-radius: var(--r-xl); border: 1px solid var(--line); background: var(--surface); box-shadow: var(--e1); overflow: hidden; }
.wsadminx .ahead { display: grid; grid-template-columns: 150px 1fr 130px 100px; gap: 12px; padding: 11px 18px; background: var(--surface-2); border-bottom: 1px solid var(--line); font-size: 10.5px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase; color: var(--ink-3); }
.wsadminx .arow { display: grid; grid-template-columns: 150px 1fr 130px 100px; gap: 12px; padding: 13px 18px; align-items: center; border-top: 1px solid var(--line); transition: background .15s; cursor: pointer; }
.wsadminx .arow:hover { background: var(--surface-2); }
.wsadminx .arow .ts { font-size: 11.5px; color: var(--ink-3); }
.wsadminx .arow .act { display: flex; gap: 9px; align-items: center; }
.wsadminx .arow .aic { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
.wsadminx .arow .atext { font-size: 13px; } .wsadminx .arow .atext b { font-weight: 700; }
.wsadminx .arow .who2 { display: flex; gap: 8px; align-items: center; font-size: 12.5px; }
.wsadminx .arow .av-s { width: 24px; height: 24px; border-radius: 99px; background: var(--surface-3); color: var(--ink-2); display: grid; place-items: center; font-size: 9px; font-weight: 700; }
.wsadminx .cat { font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px; justify-self: start; }
@media (max-width: 760px){ .wsadminx .ahead, .wsadminx .arow { grid-template-columns: 1fr; } .wsadminx .ahead { display: none; } .wsadminx .arow { gap: 6px; } }
@media (prefers-reduced-motion: reduce){ .wsadminx .scene{animation:none;} }

/* responsive overflow guard (added globally) */
.wsadminx *, .wsadminx *::before, .wsadminx *::after{min-width:0;}
.wsadminx img, .wsadminx svg, .wsadminx video, .wsadminx canvas{max-width:100%;}
`;

export default function WorkspaceAdminPage() {
  // Two-tab switch (replaces the prototype's location.hash router).
  const [tab, setTab] = useState<"overview" | "audit">("overview");

  // Light wiring: best-effort real seat counts. Falls back to the prototype's
  // numbers so the layout never changes.
  const [seats, setSeats] = useState<{ used: number; limit: number } | null>(null);
  useEffect(() => {
    let alive = true;
    raw("/users/seats")
      .then((d) => {
        const used = Number(d?.used);
        const limit = Number(d?.limit);
        if (alive && Number.isFinite(used) && Number.isFinite(limit) && limit > 0) {
          setSeats({ used, limit });
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // KPI #1 (Members) + the "Seats used" bar prefer the live seat counts.
  const membersValue = seats ? `${seats.used} / ${seats.limit}` : "12 / 15";
  const seatsPct = seats ? Math.min(100, Math.round((seats.used / seats.limit) * 100)) : 80;

  const KPIS: Kpi[] = useMemo(() => [
    { l: "Members", v: membersValue, ic: <path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5" />, d: "+2 this month", dc: "var(--ok)" },
    { l: "Open requisitions", v: "38", ic: <path d="M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />, d: "+4 vs last mo", dc: "var(--ok)" },
    { l: "Resume quota", v: "64%", ic: <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5z" />, d: "3, 180 / 5, 000", dc: "var(--ink-3)" },
    { l: "Compliance", v: "94", ic: <path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />, d: "Healthy", dc: "var(--ok)" },
  ], [membersValue]);

  const HEALTH: Health[] = [
    { l: "2FA adoption", v: 75, c: "var(--warn)" },
    { l: "SSO coverage", v: 0, c: "var(--ink-3)", txt: "Not configured" },
    { l: "Seats used", v: seatsPct, c: "var(--brand)" },
  ];

  return (
    <div className="wsadminx mx-auto w-full max-w-[1200px]">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Tab strip (the prototype's #admin / #admin/audit hash routes) */}
      <nav className="tabs">
        <a className={tab === "overview" ? "on" : undefined} onClick={() => setTab("overview")} aria-current={tab === "overview" ? "page" : undefined}>
          <I d={<path d="M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3" />} s={15} /> Overview
        </a>
        <a className={tab === "audit" ? "on" : undefined} onClick={() => setTab("audit")} aria-current={tab === "audit" ? "page" : undefined}>
          <I d={<path d="M6 4h11a1 1 0 0 1 1 1v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2zM10 9h5M10 13h5" />} s={15} /> Audit log
        </a>
      </nav>

      <div className="body">
        {tab === "overview" ? (
          /* ===== OVERVIEW ===== */
          <div className="scene" key="overview">
            <div className="pagehead">
              <h1>Workspace admin</h1>
              <p>Manage members, usage, security, and integrations for Northwind Talent.</p>
            </div>

            <div className="kpis">
              {KPIS.map((k) => (
                <div className="kpi" key={k.l}>
                  <div className="l"><span className="ic"><I d={k.ic} s={14} /></span>{k.l}</div>
                  <div className="v">{k.v}</div>
                  <div className="d" style={{ color: k.dc }}>{k.d}</div>
                </div>
              ))}
            </div>

            <div className="grid2">
              <div className="card">
                <div className="card-h">
                  <span className="t"><I d={<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5" />} s={16} /> Members</span>
                  <a href="/settings/team">Manage all <I d={<path d="M9 6l6 6-6 6" />} s={13} /></a>
                </div>
                <div className="card-b">
                  {MEMBERS.map((m) => (
                    <div className="mrow" key={m.em}>
                      <div className="who">
                        <span className="av">{m.ini}</span>
                        <div>
                          <div className="nm">{m.nm}</div>
                          <div className="em">{m.em}</div>
                        </div>
                      </div>
                      <span className="rolepill">{m.role}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{m.last}</span>
                      <button className="btn btn-ghost btn-sm" style={{ justifySelf: "end" }}>
                        <I d={<><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></>} s={16} />
                      </button>
                    </div>
                  ))}
                  <button className="btn btn-soft btn-sm" style={{ marginTop: 12 }}>
                    <I d={<path d="M12 5v14M5 12h14" />} s={14} /> Invite member
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card">
                  <div className="card-h">
                    <span className="t"><I d={<path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6.5 1.5 6.5h-15S6 14 6 9zM10 19a2 2 0 0 0 4 0" />} s={16} /> Needs attention</span>
                  </div>
                  <div className="card-b">
                    {PENDING.map((p) => (
                      <div className="li" key={p.t}>
                        <span className="ic" style={{ background: `var(--${p.c}-tint)`, color: `var(--${p.c})` }}><I d={ICA[p.ic]} s={16} /></span>
                        <div className="tx">
                          <div className="tt">{p.t}</div>
                          <div className="td">{p.d}</div>
                        </div>
                        <I d={<path d="M9 6l6 6-6 6" />} s={15} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-h">
                    <span className="t"><I d={<path d="M12 3l7 2.5V11c0 4.5-3 8-7 9.5C8 19 5 15.5 5 11V5.5z" />} s={16} /> Security posture</span>
                    <a href="/settings/security">Settings <I d={<path d="M9 6l6 6-6 6" />} s={13} /></a>
                  </div>
                  <div className="card-b">
                    <div className="health">
                      {HEALTH.map((h) => (
                        <div className="hbar" key={h.l}>
                          <div className="row">
                            <span style={{ color: "var(--ink-2)", fontWeight: 600 }}>{h.l}</span>
                            <span className="mono" style={{ color: "var(--ink-3)" }}>{h.txt || `${h.v}%`}</span>
                          </div>
                          <div className="track"><div className="fill" style={{ width: `${h.v}%`, background: h.c }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-h">
                <span className="t"><I d={<path d="M9 3v5M15 3v5M7 8h10v3a5 5 0 0 1-10 0zM12 16v5" />} s={16} /> Connected integrations</span>
                <a href="/integrations">Browse all <I d={<path d="M9 6l6 6-6 6" />} s={13} /></a>
              </div>
              <div className="card-b" style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 14 }}>
                {INTEGRATIONS.map((g) => (
                  <div key={g[0]} style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 14px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface-2)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ok)" }} />
                    <b style={{ fontSize: 13 }}>{g[0]}</b>
                    <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{g[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ===== AUDIT LOG ===== */
          <div className="scene" key="audit">
            <div className="pagehead" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
              <div>
                <h1>Audit log</h1>
                <p>Every action in your workspace, immutable and exportable. Retained for 7 years.</p>
              </div>
              <button className="btn btn-soft">
                <I d={<path d="M7 17 17 7M8 7h9v9" />} s={15} /> Export CSV
              </button>
            </div>

            <div className="toolbar">
              <div className="search">
                <I d={<path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM20 20l-4.8-4.8" />} s={16} />
                <input placeholder="Search actions, members, IPs…" />
              </div>
              <select className="fsel">
                <option>All categories</option>
                <option>Authentication</option>
                <option>Members</option>
                <option>Configuration</option>
                <option>Billing</option>
                <option>Data</option>
                <option>AI</option>
              </select>
              <select className="fsel">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This quarter</option>
              </select>
            </div>

            <div className="audit">
              <div className="ahead"><span>Time</span><span>Action</span><span>Member</span><span>Category</span></div>
              {AUDIT_ROWS.map((r, i) => {
                const tone = CAT_TONE[r.cat];
                return (
                  <div className="arow" key={i}>
                    <span className="ts mono">{r.t}</span>
                    <div className="act">
                      <span className="aic" style={{ background: `var(--${tone}-tint)`, color: `var(--${tone})` }}><I d={CI[r.cat]} s={15} /></span>
                      <span className="atext">{r.txt}{r.ip !== ", " && <span className="mono" style={{ color: "var(--ink-3)", fontSize: 11 }}> · {r.ip}</span>}</span>
                    </div>
                    <div className="who2">
                      <span className="av-s" style={r.ai ? { background: "var(--ai-tint)", color: "var(--ai)" } : undefined}>{r.ini}</span>{r.who}
                    </div>
                    <span className="cat" style={{ background: `var(--${tone}-tint)`, color: `var(--${tone})` }}>{r.cat}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 18 }}>
              <button className="btn btn-soft btn-sm">Load older entries</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
