"use client";
// app/(dashboard)/notifications/page.tsx - EXACT Claude Design "TalentFlow"
// notifications command center. Ported from claude-design/Notifications.html:
// hero badge + serif headline + "Mark all as read" CTA, a glass tray holding two
// 40-tick gauge cards (Unread / SLA on-time) and a wide grouped activity feed
// with icon tiles, AI handling, unread dots, time-ago, and a filter dropdown.
// Mock FEED[] is replaced with real data from GET /notifications.
import { useEffect, useMemo, useState } from "react";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";

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

// ---- row shape from the prototype: kind, title, desc, time, unread, color, bg, iconPath ----
type Row = {
  id: string;
  kind: "ai" | "warn" | "ok" | "user" | "cal" | "info";
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  color: string;
  bg: string;
  path: string;
  ts: number;
};
type Group = { label: string; items: Row[] };

const SPARK = "M12 4.5l1.4 3.6L17 9.5l-3.6 1.4L12 14.5l-1.4-3.6L7 9.5z";
const CLOCK = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2";
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const PEOPLE = "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5A3.25 3.25 0 1 0 10 5a3.25 3.25 0 0 0 0 6.5";
const CAL = "M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z";
const BELL = "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6";

// type -> visual kind. AI agents stay violet; everything else maps by intent.
function classify(type: string, title: string, body: string): Row["kind"] {
  const t = (type || "").toUpperCase();
  const hay = `${type} ${title} ${body}`.toLowerCase();
  if (/agent|screen|bias|auditor|sourc|verdict|ai/.test(hay)) return "ai";
  if (t.includes("REJECT") || /sla|deadline|approaching|due|limit|reached|fail|warn/.test(hay)) return "warn";
  if (t.includes("APPROVED") || /accept|complet|offer|approv|success|pass/.test(hay)) return "ok";
  if (/interview|schedul|calendar|feedback|loop/.test(hay)) return "cal";
  if (/referr|signup|tenant|user|seat|member/.test(hay)) return "user";
  return "info";
}

const KIND_VISUAL: Record<Row["kind"], { color: string; bg: string; path: string }> = {
  ai:   { color: "var(--c-ai)",    bg: "var(--c-ai-tint)",    path: SPARK },
  warn: { color: "var(--c-warn)",  bg: "var(--c-warn-tint)",  path: CLOCK },
  ok:   { color: "var(--c-ok)",    bg: "var(--c-ok-tint)",    path: CHECK },
  user: { color: "var(--c-info)",  bg: "var(--c-info-tint)",  path: PEOPLE },
  cal:  { color: "var(--c-ai)",    bg: "var(--c-ai-tint)",    path: CAL },
  info: { color: "var(--c-ink-2)", bg: "var(--c-surface-2)",  path: BELL },
};

function ago(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (!isFinite(ms) || ms < 0) return "now";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Translate a raw API notification into the prototype's row shape, defensively.
function toRow(n: unknown, i: number): Row {
  const o = (n ?? {}) as Record<string, unknown>;
  const id = String(o.id ?? o.notificationId ?? i);
  const type = String(o.type ?? o.kind ?? "SYSTEM");
  const title = String(o.title ?? o.message ?? o.name ?? "Notification");
  const desc = String(o.body ?? o.description ?? o.detail ?? "");
  const created = (o.createdAt ?? o.created_at ?? o.timestamp) as string | undefined;
  const readAt = o.readAt ?? o.read_at ?? null;
  const unread = readAt == null && o.read !== true;
  const k = classify(type, title, desc);
  const v = KIND_VISUAL[k];
  return {
    id, kind: k, title, desc, time: ago(created), unread,
    color: v.color, bg: v.bg, path: v.path,
    ts: created ? new Date(created).getTime() : Date.now() - i * 1000,
  };
}

// Inline gauge: 40 ticks across a 180deg arc (matches the prototype's gauge()).
function Gauge({ value, color = "var(--c-brand)" }: { value: number; color?: string }) {
  const N = 40, active = Math.round((value / 100) * N);
  const cx = 100, cy = 100, r = 80, inner = 70;
  const ticks = [];
  for (let i = 0; i < N; i++) {
    const a = Math.PI + (Math.PI * i) / (N - 1);
    const x1 = cx + Math.cos(a) * inner, y1 = cy + Math.sin(a) * inner;
    const x2 = cx + Math.cos(a) * r, y2 = cy + Math.sin(a) * r;
    ticks.push(
      <line key={i} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)}
        stroke={i < active ? color : "var(--c-line)"} strokeWidth={2.5} strokeLinecap="round" />
    );
  }
  return (
    <div className="flex w-full flex-col items-center">
      <svg viewBox="0 0 200 120" className="h-auto w-full max-w-[240px]">
        <g>{ticks}</g>
        <text x="100" y="100" textAnchor="middle" fontSize="22" fontWeight={600} fill="var(--c-ink)">{value}%</text>
      </svg>
    </div>
  );
}

function Ic({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const FILTERS: { f: Filter; label: string; dot: string }[] = [
  { f: "all", label: "All notifications", dot: "var(--c-ink-3)" },
  { f: "unread", label: "Unread only", dot: "var(--c-brand)" },
  { f: "ai", label: "AI activity", dot: "var(--c-ai)" },
  { f: "sla", label: "SLA & deadlines", dot: "var(--c-warn)" },
];
type Filter = "all" | "unread" | "ai" | "sla";

export default function NotificationsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [cleared, setCleared] = useState(false);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await raw("/notifications?limit=50");
      const arr = (res?.data ?? res) as unknown;
      const list = Array.isArray(arr) ? arr : [];
      setRows(list.map(toRow));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const data = useMemo(() => (cleared ? (rows ?? []).map((r) => ({ ...r, unread: false })) : rows ?? []), [rows, cleared]);
  const unreadTotal = data.filter((r) => r.unread).length;

  function matches(r: Row): boolean {
    if (filter === "unread") return r.unread;
    if (filter === "ai") return r.kind === "ai";
    if (filter === "sla") return /sla|approaching|due|deadline|limit|reached/i.test(`${r.title} ${r.desc}`);
    return true;
  }

  // Group filtered rows into Today / Earlier by timestamp (matches the prototype).
  const groups: Group[] = useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const today: Row[] = [], earlier: Row[] = [];
    for (const r of data.filter(matches)) (r.ts >= start.getTime() ? today : earlier).push(r);
    const g: Group[] = [];
    if (today.length) g.push({ label: "Today", items: today });
    if (earlier.length) g.push({ label: "Earlier", items: earlier });
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filter]);

  function markAll() { setCleared(true); }

  return (
    <div className="mx-auto w-full max-w-[980px]">
      {/* hero copy */}
      <div className="mb-6 flex flex-col items-center px-4 pt-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-1.5 text-[13px] font-medium shadow-e1">
          <span className="h-2 w-2 rounded-full" style={{ background: cleared || unreadTotal === 0 ? "var(--c-ok)" : "var(--c-brand)" }} />
          {cleared || unreadTotal === 0 ? "Notifications · all caught up" : `Notifications · ${unreadTotal} need you`}
        </span>
        <h1 className="mt-[22px] max-w-[56rem] text-[clamp(34px,7vw,60px)] font-medium leading-[1.05] tracking-[-0.02em]">
          Nothing slips <span className="font-serif italic" style={{ fontWeight: 400 }}>through</span>
          <br className="hidden sm:block" /> the cracks
        </h1>
        <p className="mt-[18px] max-w-[40rem] px-2 text-[clamp(13px,3.5vw,16px)] text-ink-2">
          Every screening verdict, SLA, interview, and offer update, gathered in one calm command center.
        </p>
        <button
          onClick={markAll}
          className="mt-[26px] inline-flex items-center gap-3 rounded-pill bg-ink py-2 pl-6 pr-2 text-[14px] font-medium text-ink-inv transition-transform duration-fast ease-out hover:-translate-y-0.5"
          style={{ background: "var(--c-ink)", color: "var(--c-ink-inv)" }}
        >
          Mark all as read
          <span className="grid h-[26px] w-[26px] place-items-center rounded-full" style={{ background: "color-mix(in oklab, var(--c-ink-inv) 16%, transparent)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d={CHECK} /></svg>
          </span>
        </button>
      </div>

      {/* dashboard tray */}
      <div className="rounded-[26px] border border-line bg-surface-2 p-4 sm:p-[22px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-[1.05fr_1.05fr_1.6fr]">
          {/* Card 1: Unread gauge */}
          <div className="glass rounded-[18px] p-[18px] shadow-e2">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-semibold text-brand">Unread</span><span className="text-ink-3">This week</span>
            </div>
            <div className="mt-[10px] flex flex-wrap items-center gap-[9px] text-[28px] font-semibold tracking-[-0.02em]">
              {unreadTotal}
              <span className="inline-flex items-center gap-1 rounded-pill px-[9px] py-0.5 text-[11px] font-semibold" style={{ background: "var(--c-danger-tint)", color: "var(--c-danger)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5" /></svg> -34% vs last
              </span>
            </div>
            <div className="mt-1.5 text-[11.5px] text-ink-3">Down from 18 last week</div>
            <div className="mb-0.5 mt-[14px] text-center text-[12px] font-medium text-ink-3">Inbox cleared</div>
            <Gauge value={83} />
            <div className="mx-auto flex w-full max-w-[200px] justify-between text-[11px] text-ink-3"><span>0</span><span>120</span></div>
            <div className="mt-[14px] flex rounded-pill border border-line bg-surface p-1">
              <button className="flex-1 rounded-pill bg-surface-2 py-[7px] text-[12px] font-semibold text-ink shadow-e1">Unread</button>
              <button className="flex-1 rounded-pill py-[7px] text-[12px] font-semibold text-ink-3">All</button>
            </div>
          </div>

          {/* Card 2: SLA gauge */}
          <div className="glass rounded-[18px] p-[18px] shadow-e2">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="font-semibold text-brand">SLA on-time</span><span className="text-ink-3">Today</span>
            </div>
            <div className="mt-[10px] flex flex-wrap items-center gap-[9px] text-[28px] font-semibold tracking-[-0.02em]">
              94%
              <span className="inline-flex items-center gap-1 rounded-pill px-[9px] py-0.5 text-[11px] font-semibold" style={{ background: "var(--c-ok-tint)", color: "var(--c-ok)" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M7 14l5-5 5 5" /></svg> +6%
              </span>
            </div>
            <div className="mt-1.5 text-[11.5px] text-ink-3">2 review items due within 2h</div>
            <div className="mb-0.5 mt-[14px] text-center text-[12px] font-medium text-ink-3">Response within SLA</div>
            <Gauge value={94} />
            <div className="mt-[14px] flex rounded-pill border border-line bg-surface p-1">
              <button className="flex-1 rounded-pill bg-surface-2 py-[7px] text-[12px] font-semibold text-ink shadow-e1">Reviews</button>
              <button className="flex-1 rounded-pill py-[7px] text-[12px] font-semibold text-ink-3">Decisions</button>
            </div>
          </div>

          {/* Card 3: Feed */}
          <div className="glass flex flex-col rounded-[18px] px-1.5 pb-2.5 pt-1.5 shadow-e2">
            <div className="relative flex items-center gap-2 px-3.5 pb-2.5 pt-3.5">
              <span className="text-[13px] font-semibold text-brand">Recent activity</span>
              {/* filter dropdown trigger */}
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-2"
              >
                {filter === "all" ? "Filter" : FILTERS.find((x) => x.f === filter)?.label}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              <button onClick={markAll} className="inline-flex items-center rounded-pill border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink-2">Mark all read</button>
              {filterOpen && (
                <div className="absolute right-1.5 top-[calc(100%+6px)] z-30 w-[210px] rounded-[16px] border border-line bg-surface p-[7px] shadow-e3">
                  <div className="px-2.5 pb-1 pt-[7px] text-[10px] font-bold uppercase tracking-[0.07em] text-ink-3">Filter activity</div>
                  {FILTERS.map((opt) => (
                    <button
                      key={opt.f}
                      onClick={() => { setFilter(opt.f); setFilterOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: opt.dot }} />
                      <span className={opt.f === filter ? "font-semibold text-brand" : ""}>{opt.label}</span>
                      {opt.f === filter && (
                        <svg className="ml-auto text-brand" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d={CHECK} /></svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* feed list */}
            <div className="max-h-[360px] overflow-y-auto px-1.5">
              {loading && (
                <div className="grid gap-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-[13px]" />)}
                </div>
              )}
              {!loading && error && (
                <div className="py-6">
                  <ErrorState title="Could not load notifications" body="The notifications service did not respond." code="GET /api/notifications" onRetry={load} />
                </div>
              )}
              {!loading && !error && groups.length === 0 && (
                <div className="py-8 text-center text-[13px] text-ink-3">
                  {data.length === 0 ? (
                    <EmptyState title="You're all caught up" body="Every screening verdict, SLA, interview, and offer update will land here." />
                  ) : (
                    "Nothing matches this filter."
                  )}
                </div>
              )}
              {!loading && !error && groups.map((g) => (
                <div key={g.label}>
                  <div className="px-2 pb-1.5 pt-2.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-3">{g.label}</div>
                  {g.items.map((n) => (
                    <div key={n.id} className={`flex items-start gap-[11px] rounded-[13px] px-[9px] py-[11px] transition-colors hover:bg-surface-2 ${n.unread ? "bg-surface-2/60" : ""}`}>
                      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px]" style={{ background: n.bg, color: n.color }}>
                        <Ic d={n.path} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13.5px] font-semibold leading-[1.3]">
                          {n.title}
                          {n.kind === "ai" && (
                            <span className="ml-1.5 inline-flex items-center gap-1 rounded-pill px-1.5 py-px align-[1px] text-[10px] font-bold" style={{ background: "var(--c-ai-tint)", color: "var(--c-ai-ink)" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d={SPARK} /></svg>
                              AI
                            </span>
                          )}
                        </div>
                        {n.desc && <div className="mt-0.5 text-[12px] leading-[1.4] text-ink-3">{n.desc}</div>}
                      </div>
                      <span className="shrink-0 text-[11px] text-ink-3">{n.time}</span>
                      {n.unread && <span className="mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: "var(--c-brand)" }} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences (static chrome) */}
        <div className="glass mt-4 rounded-[18px] p-[18px] shadow-e2">
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-brand">Notification preferences</span>
            <span className="text-ink-3">Where alerts reach you</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              ["AI agent activity", "Screening, sourcing, and bias-auditor updates", true],
              ["SLA & deadlines", "Review-queue items approaching their window", true],
              ["Offers & decisions", "Acceptances, approvals, and rejections", true],
              ["Interviews", "Scheduling, reschedules, and feedback", false],
            ].map(([title, desc, on]) => (
              <div key={title as string} className="flex items-center justify-between gap-3 rounded-[12px] border border-line bg-surface px-3.5 py-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold">{title}</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-3">{desc}</div>
                </div>
                <span
                  aria-hidden="true"
                  className="relative h-[22px] w-[38px] shrink-0 rounded-pill transition-colors"
                  style={{ background: on ? "var(--c-brand)" : "var(--c-surface-3)" }}
                >
                  <span className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-surface shadow-e1 transition-all" style={{ left: on ? "18px" : "2px" }} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
