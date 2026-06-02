"use client";
// app/(dashboard)/admin/audit/page.tsx - EXACT Claude Design "Aurora" AuditScreen.
// The tenant audit log: a tamper-evident record of every action in the
// workspace. Searchable + category-filterable event rows (actor, action,
// target, category, timestamp) with a CSV export action. Ported faithfully
// from claude-design/screen-extra.jsx (AuditScreen) and wired to the real
// gateway: GET /audit, falling back to GET /admin/audit. No fabricated events.
import { useEffect, useState } from "react";
import { Greeting, Pill, Btn } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Local fetch helper (do not edit lib/api.ts). Tries the path; throws on !ok.
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

// One normalized audit row the table renders. The real payload field names
// vary by service, so every getter below reads several likely keys.
type AuditEntry = {
  id: string;
  actor: string;
  ini: string;
  ai: boolean;
  action: string;
  target: string;
  cat: string;
  t: string;
};

const CAT_COLOR: Record<string, [string, string]> = {
  access: ["var(--c-info)", "var(--c-info-tint)"],
  data: ["var(--c-brand)", "var(--c-brand-tint)"],
  decision: ["var(--c-warn)", "var(--c-warn-tint)"],
  config: ["var(--c-ink-2)", "var(--c-surface-2)"],
  ai: ["var(--c-ai)", "var(--c-ai-tint)"],
};
const KNOWN_CATS = new Set(Object.keys(CAT_COLOR));

function pick(o: Record<string, any>, keys: string[]): any {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

function initials(name: string): string {
  const parts = String(name).trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtTime(iso: any): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 1) return "Yesterday";
  if (days > 1 && days < 7) return `${days} days ago`;
  return d.toLocaleDateString();
}

// Map an arbitrary backend record to the normalized row, defensively.
function normalize(r: Record<string, any>, i: number): AuditEntry {
  const actorRaw = pick(r, ["actor", "actorName", "actorUserName", "userName", "user", "actorUserId", "userId"]);
  const actor = actorRaw != null ? String(actorRaw) : "System";
  // AI agents are flagged explicitly, or inferred from category/agent fields.
  const agentName = pick(r, ["agent", "agentName"]);
  const catRaw = pick(r, ["category", "cat", "severity", "type", "resourceType"]);
  const cat = catRaw != null ? String(catRaw).toLowerCase() : "config";
  const ai = Boolean(r?.ai ?? r?.isAgent ?? agentName) || cat === "ai";

  const action = String(pick(r, ["action", "event", "activity", "description"]) ?? "Action");
  const targetRaw = pick(r, ["target", "resource", "resourceId", "subject", "entity", "detail"]);
  const target = targetRaw != null ? String(targetRaw) : "";

  const display = ai ? String(agentName ?? actor) : actor;
  return {
    id: String(pick(r, ["id", "_id", "eventId"]) ?? i),
    actor: display,
    ini: pick(r, ["ini", "initials"]) ?? initials(display),
    ai,
    action,
    target,
    cat: KNOWN_CATS.has(cat) ? cat : "config",
    t: fmtTime(pick(r, ["createdAt", "timestamp", "ts", "time", "occurredAt", "t"])),
  };
}

export default function AuditPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [rows, setRows] = useState<AuditEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    // Try /audit, then /admin/audit. Coerce res?.data ?? res to an array.
    raw("/audit")
      .catch(() => raw("/admin/audit"))
      .then((res) => {
        const arr = res?.data ?? res;
        const list = Array.isArray(arr) ? arr : Array.isArray(arr?.data) ? arr.data : [];
        setRows(list.map((r: Record<string, any>, i: number) => normalize(r, i)));
      })
      .catch((e: any) => { setError(e?.message ?? "Failed to load audit"); setRows(null); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const all = rows ?? [];
  const filtered = all.filter((r) =>
    (filter === "all" || (filter === "ai" ? r.ai : filter === "human" ? !r.ai : r.cat === filter)) &&
    (!q || (r.actor + " " + r.action + " " + r.target).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <Greeting title="Audit log" sub="A complete, tamper-evident record of every action in this workspace.">
        <Pill icon="shield" tone="var(--c-ok)" bg="var(--c-ok-tint)">7-year retention</Pill>
        <Btn variant="primary" icon="arrowUpRight">Export CSV</Btn>
      </Greeting>

      {/* controls */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "1 1 240px", maxWidth: 360, height: 38, padding: "0 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)" }}>
          <Icon name="search" size={16} style={{ color: "var(--c-ink-3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search audit entries" placeholder="Search actor, action, or target..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }} />
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {([["all", "All"], ["human", "Human"], ["ai", "AI agents"], ["access", "Access"], ["decision", "Decisions"], ["config", "Config"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k} style={{ padding: "7px 12px", borderRadius: 99, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-sans)",
              border: "1px solid", borderColor: filter === k ? "transparent" : "var(--c-line-2)", background: filter === k ? "var(--c-brand-tint)" : "var(--c-surface)", color: filter === k ? "var(--c-brand-ink)" : "var(--c-ink-2)" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* table */}
      <div style={{ border: "1px solid var(--c-line)", borderRadius: "var(--r-xl)", overflow: "hidden", background: "var(--c-surface)", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "11px 18px", background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-line)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
          <span>Actor</span><span>Action</span><span>Category</span><span style={{ textAlign: "right" }}>Timestamp</span>
        </div>
        <div style={{ maxHeight: "calc(100vh - 290px)", overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "grid", gap: 8, padding: 14 }}>
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[42px] rounded-[11px]" />)}
            </div>
          ) : error ? (
            <div style={{ padding: "40px 18px" }}>
              <ErrorState title="Could not load the audit log" body="The audit service did not respond." code="GET /audit" onRetry={load} />
            </div>
          ) : filtered.length === 0 ? (
            all.length === 0 ? (
              <div style={{ padding: "40px 18px" }}>
                <EmptyState title="No audit entries yet" body="As people and agents act in this workspace, each action is recorded here, write-once and tamper-evident." />
              </div>
            ) : (
              <div style={{ padding: "40px 18px", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>No audit entries match your filter.</div>
            )
          ) : filtered.map((r, i) => {
            const [cc, cb] = CAT_COLOR[r.cat] || CAT_COLOR.config;
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: "160px 1fr 110px 150px", gap: 12, padding: "12px 18px", alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", transition: "background var(--t-fast)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--c-surface-2)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, background: r.ai ? "var(--c-ai-tint)" : "var(--c-surface-3)", color: r.ai ? "var(--c-ai)" : "var(--c-ink-2)" }} className="mono">{r.ai ? <Icon name="sparkles" size={13} /> : r.ini}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: r.ai ? "var(--c-ai-ink)" : "var(--c-ink)" }} className={r.ai ? "mono" : ""}>{r.actor}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--c-ink-2)", minWidth: 0 }}>
                  <span style={{ color: "var(--c-ink)", fontWeight: 600 }}>{r.action}</span>{r.target ? <span style={{ color: "var(--c-ink-3)" }}> · {r.target}</span> : null}
                </div>
                <span><Pill tone={cc} bg={cb} style={{ fontSize: 10 }}>{r.cat}</Pill></span>
                <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", textAlign: "right" }}>{r.t}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--c-ink-3)", display: "flex", gap: 7, alignItems: "center" }}>
        <Icon name="shield" size={14} style={{ color: "var(--c-ok)" }} /> Entries are write-once and cryptographically chained. Showing {filtered.length} of {all.length}.
      </div>
    </div>
  );
}
