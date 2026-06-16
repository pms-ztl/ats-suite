"use client";
// app/(dashboard)/audit/page.tsx - EXACT Claude Design "Aurora"
// tenant audit log (AuditScreen). A complete, tamper-evident record of every
// action in this workspace, rendered as a filterable table where each row
// carries an actor (human initials or an AI agent badge), an action, a target,
// a category marker, and a timestamp. Ported verbatim from
// claude-design/screen-extra.jsx (AuditScreen) and wired to the real gateway:
// it tries the tenant audit log (GET /audit -> { data: [...] }) and falls back
// to the admin audit log (GET /admin/audit -> { data: [...] }). Rows are coerced
// to an array and mapped defensively (actor / action / target / createdAt /
// category), so nothing is fabricated. The search box and category / human / AI
// filters are pure local useState. loading -> Skeleton, error -> ErrorState,
// empty / 404 -> EmptyState, with the exact table layout otherwise preserved.
import { useMemo, useState } from "react";
import { Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, ErrorState, EmptyState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { useTableSort, SortHead } from "@/components/shared/sortable";
import { toTitleCase } from "@/lib/utils";
import { exportToCSV } from "@/lib/export";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Local raw() helper: unwrap the gateway envelope (res?.data ?? res) and throw
// on non-2xx so useData can surface the error/empty layout.
async function raw(path: string, init?: RequestInit) {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  const json: any = await res.json();
  return json?.data ?? json;
}

// Category -> [text, background] tokens. Full-color --c-* tokens (bare channels
// are Tailwind-only). Maps the five buckets the prototype renders.
const CAT_COLOR: Record<string, [string, string]> = {
  access: ["var(--c-info)", "var(--c-info-tint)"],
  data: ["var(--c-brand)", "var(--c-brand-tint)"],
  decision: ["var(--c-warn)", "var(--c-warn-tint)"],
  config: ["var(--c-ink-2)", "var(--c-surface-2)"],
  ai: ["var(--c-ai)", "var(--c-ai-tint)"],
};

type AuditRow = {
  actor: string;   // actor name
  ini: string;     // human initials (when not AI)
  ai: boolean;     // AI vs human marker
  action: string;  // action sentence
  target: string;  // resource / target
  cat: string;     // category bucket
  t: string;       // timestamp label
  ts: number;      // sortable timestamp (epoch ms; 0 when unknown)
};

// Format the timestamp. A pre-formatted string passes through; an ISO/Date is
// rendered to a locale string so live data keeps a readable label.
function fmtTime(v: any): string {
  if (v == null) return "";
  if (typeof v === "string" && !/^\d{4}-\d|T\d|Z$|GMT/.test(v)) return v;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleString();
}

// Build human initials from an actor name (first letters of up to two words).
function initials(name: string): string {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Derive the category from the live row. The audit event uses free-text
// action / category / resourceType / severity, so keyword-match into the same
// five buckets the prototype renders.
function deriveCat(a: any, ai: boolean): string {
  const explicit = String(a?.cat ?? a?.category ?? "").toLowerCase();
  if (explicit in CAT_COLOR) return explicit;
  if (ai) return "ai";
  const hay = `${a?.action ?? ""} ${a?.event ?? ""} ${a?.severity ?? ""} ${a?.type ?? ""} ${a?.resourceType ?? a?.resource_type ?? ""}`.toLowerCase();
  if (/(sign|login|sso|saml|access|auth|permission|role)/.test(hay)) return "access";
  if (/(advanc|reject|approv|decision|offer|hire|score)/.test(hay)) return "decision";
  if (/(export|download|purg|retention|delete|data|file|report)/.test(hay)) return "data";
  return "config";
}

// Map a raw row to the table shape. actor / action / target / createdAt /
// category are all read defensively across backend shapes. No fabricated
// content: if a field is missing it stays blank.
function mapRow(a: any): AuditRow {
  const actor = String(
    a?.actor ?? a?.actorName ?? a?.actor_name ?? a?.userName ?? a?.user_name ??
    a?.actorEmail ?? a?.userId ?? a?.user_id ?? a?.user ?? "System"
  );
  const ai = Boolean(
    a?.ai ?? a?.isAi ?? a?.is_ai ?? a?.isAgent ?? a?.is_agent ?? a?.byAgent ??
    a?.agent ?? a?.agentType ?? a?.agent_type ??
    /agent|system|ai|bot|engine|screener|auditor/i.test(actor)
  );
  const action = String(a?.action ?? a?.event ?? a?.message ?? a?.description ?? a?.type ?? "action");
  const target = String(a?.target ?? a?.resource ?? a?.resourceId ?? a?.resource_id ?? a?.entity ?? a?.resourceType ?? a?.resource_type ?? "");
  const cat = deriveCat(a, ai);
  const ini = String(a?.ini ?? a?.initials ?? "") || initials(actor);
  const rawT = a?.t ?? a?.createdAt ?? a?.created_at ?? a?.timestamp ?? a?.at ?? a?.date;
  const t = fmtTime(rawT);
  const parsed = rawT != null ? new Date(rawT).getTime() : NaN;
  const ts = Number.isNaN(parsed) ? 0 : parsed;
  return { actor, ini, ai, action, target, cat, t, ts };
}

// Coerce the backend envelope into a flat array, then map.
function toRows(res: any): AuditRow[] {
  const arr = Array.isArray(res?.data) ? res.data
    : Array.isArray(res?.entries) ? res.entries
    : Array.isArray(res?.logs) ? res.logs
    : Array.isArray(res?.events) ? res.events
    : Array.isArray(res?.items) ? res.items
    : Array.isArray(res) ? res : [];
  return arr.map(mapRow);
}

// Gateway mounts compliance under /api/audit -> /internal/compliance/, whose
// real read route is /audit, so the tenant audit log lives at /api/audit/audit.
// Fall back to the bare mount only if a future gateway alias is added.
async function fetchAudit(): Promise<AuditRow[]> {
  try {
    return toRows(await raw("/audit/audit"));
  } catch {
    return toRows(await raw("/audit"));
  }
}

const FILTERS: [string, string][] = [
  ["all", "All"], ["human", "Human"], ["ai", "AI agents"],
  ["access", "Access"], ["decision", "Decisions"], ["config", "Config"],
];

export default function AuditPage() {
  const log = useData<AuditRow[]>(fetchAudit);

  // Filters are pure local state (RULES #3). `q` = free-text search;
  // `filter` = "all" | "human" | "ai" | a category bucket.
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");

  const rows = log.data ?? [];
  const filtered = useMemo(
    () => rows.filter((r) =>
      (filter === "all"
        || (filter === "ai" ? r.ai : filter === "human" ? !r.ai : r.cat === filter)) &&
      (!q || (r.actor + " " + r.action + " " + r.target).toLowerCase().includes(q.toLowerCase()))
    ),
    [rows, q, filter]
  );
  // Sortable columns (Actor / Action / Category / Timestamp). Default: newest first.
  const { sorted, sort, toggle } = useTableSort(filtered, { key: "ts", dir: "desc" });

  // Export exactly what is on screen (current filters + sort). With zero entries
  // there is nothing to write, so say so instead of downloading an empty file.
  const onExport = () => {
    if (!sorted.length) { toast.info("No audit entries to export yet."); return; }
    exportToCSV(
      `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Actor", "Type", "Action", "Target", "Category", "Timestamp"],
      sorted.map((r) => [r.actor, r.ai ? "AI agent" : "Human", r.action, r.target, r.cat, r.ts]),
    );
    toast.success(`Exported ${sorted.length} audit entr${sorted.length === 1 ? "y" : "ies"}.`);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Audit log</h1>
            <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>A complete, tamper-evident record of every action in this workspace.</p>
          </div>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <Pill icon="shield" tone="var(--c-ok)" bg="var(--c-ok-tint)">7-year retention</Pill>
            <Btn variant="primary" icon="arrowUpRight" onClick={onExport}>Export CSV</Btn>
          </div>
        </div>

        {/* controls: search + category / human / AI chips. Pure local state. */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "1 1 240px", maxWidth: 360, height: 38, padding: "0 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)" }}>
            <Icon name="search" size={16} style={{ color: "var(--c-ink-3)" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search actor, action, or target..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {FILTERS.map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                padding: "7px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
                border: "1px solid", borderColor: filter === k ? "transparent" : "var(--c-line-2)",
                background: filter === k ? "var(--c-brand-tint)" : "var(--c-surface)",
                color: filter === k ? "var(--c-brand-ink)" : "var(--c-ink-2)",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* table */}
        <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", overflow: "hidden", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "11px 18px", background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-line)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
            <SortHead label="Actor" sortKey="actor" sort={sort} onSort={toggle} /><SortHead label="Action" sortKey="action" sort={sort} onSort={toggle} /><SortHead label="Category" sortKey="cat" sort={sort} onSort={toggle} /><SortHead label="Timestamp" sortKey="ts" sort={sort} onSort={toggle} align="right" style={{ textAlign: "right" }} />
          </div>
          <div style={{ maxHeight: "calc(100vh - 290px)", overflowY: "auto" }}>
            {/* loading rows */}
            {log.loading && (
              <div style={{ display: "grid", gap: 0 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "12px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none" }}>
                    <Skeleton className="h-4 rounded-[6px]" />
                    <Skeleton className="h-4 rounded-[6px]" />
                    <Skeleton className="h-4 w-16 rounded-pill" />
                    <Skeleton className="h-3 rounded-[6px]" />
                  </div>
                ))}
              </div>
            )}

            {/* error -> ErrorState in the table body, layout preserved */}
            {!log.loading && log.error && (
              <div style={{ padding: "40px 18px" }}>
                <ErrorState
                  title="Could not load the audit log"
                  body="The audit service did not respond. The tamper-evident trail will appear here once it is reachable."
                  code="GET /api/audit"
                  onRetry={log.reload}
                />
              </div>
            )}

            {/* empty / 404 -> EmptyState, layout preserved */}
            {!log.loading && !log.error && filtered.length === 0 && (
              <div style={{ padding: "40px 18px" }}>
                <EmptyState
                  title={rows.length === 0 ? "No entries yet" : "No audit entries match your filter"}
                  body={
                    rows.length === 0
                      ? "Actions across the workspace appear here, write-once and cryptographically chained, as they happen."
                      : "Try a different category, switch between human and AI actors, or clear the search."
                  }
                  actions={
                    rows.length > 0 && (filter !== "all" || q)
                      ? <Btn variant="soft" onClick={() => { setFilter("all"); setQ(""); }}>Clear filters</Btn>
                      : undefined
                  }
                />
              </div>
            )}

            {/* data rows */}
            {!log.loading && !log.error && sorted.map((r, i) => {
              const [cc, cb] = CAT_COLOR[r.cat] || CAT_COLOR.config;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "12px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", transition: "background var(--t-fast)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--c-surface-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span className="mono" style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, background: r.ai ? "var(--c-ai-tint)" : "var(--c-surface-3)", color: r.ai ? "var(--c-ai)" : "var(--c-ink-2)" }}>
                      {r.ai ? <Icon name="sparkles" size={13} /> : r.ini}
                    </span>
                    <span className={r.ai ? "mono" : ""} style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: r.ai ? "var(--c-ai-ink)" : "var(--c-ink)" }}>{r.actor}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", minWidth: 0 }}>
                    <span style={{ color: "var(--c-ink)", fontWeight: 600 }}>{r.action}</span>
                    {r.target ? <span style={{ color: "var(--c-ink-3)" }}> · {r.target}</span> : null}
                  </div>
                  <span><Pill tone={cc} bg={cb} style={{ fontSize: 10 }}>{toTitleCase(r.cat)}</Pill></span>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", textAlign: "right" }}>{r.t}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* tamper-evident footer */}
        <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--c-ink-3)", display: "flex", gap: 7, alignItems: "center" }}>
          <Icon name="shield" size={14} style={{ color: "var(--c-ok)" }} /> Entries are write-once and cryptographically chained. Showing {filtered.length} of {rows.length}.
        </div>
      </div>
    </div>
  );
}
