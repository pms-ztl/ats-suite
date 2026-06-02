"use client";
// app/(dashboard)/requisitions/page.tsx
// VERBATIM port of claude-design/req-list.jsx (ReqListScreen): the requisitions
// DataTable (Requisition / Status / Salary range / Cands / Heads / Recruiter /
// Created) + the FilterBar (search + status select + department select + density
// toggle) + the "Create requisition" CTA + footer pagination. Markup, inline
// styles, and copy are copied from the prototype; palette var(--x) tokens are
// mapped to their full-color var(--c-x) companions. The mock REQ_LIST is replaced
// with real gateway data via useData + listRequisitions; loading -> Skeleton,
// error -> ErrorState, empty -> EmptyState rendered inside the table container.
import { useState, useMemo } from "react";
import { Btn } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listRequisitions } from "@/lib/api";
import type { Requisition, RequisitionStatus } from "@/lib/types";

type StatusMeta = { label: string; tone: string; bg: string; icon: string };
const REQ_STATUS: Record<RequisitionStatus, StatusMeta> = {
  DRAFT:     { label: "Draft",     tone: "var(--c-ink-3)",  bg: "var(--c-surface-3)",   icon: "dot" },
  OPEN:      { label: "Open",      tone: "var(--c-brand)",  bg: "var(--c-brand-tint)",  icon: "dot" },
  ON_HOLD:   { label: "On hold",   tone: "var(--c-warn)",   bg: "var(--c-warn-tint)",   icon: "clock" },
  FILLED:    { label: "Filled",    tone: "var(--c-ok)",     bg: "var(--c-ok-tint)",     icon: "check" },
  CLOSED:    { label: "Closed",    tone: "var(--c-ink-2)",  bg: "var(--c-surface-3)",   icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "var(--c-danger)", bg: "var(--c-danger-tint)", icon: "x" },
};

function StatusChip({ s }: { s: RequisitionStatus }) {
  const m = REQ_STATUS[s] ?? REQ_STATUS.DRAFT;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px 3px 8px", borderRadius: "var(--r-pill)", fontSize: "var(--fs-xs)", fontWeight: 600, color: m.tone, background: m.bg }}>
      <Icon name={m.icon} size={12} stroke={2.4} />{m.label}
    </span>
  );
}

// Initials for the recruiter avatar (prototype's recI), derived from a name.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "--";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

// "May 24" style created label from an ISO timestamp.
function created(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const GRID = "1.8fr 1fr 1.1fr 90px 80px 130px 90px";

export default function RequisitionsPage() {
  const { data, loading, error, reload } = useData<Requisition[]>(listRequisitions);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [dept, setDept] = useState("All");
  const [dense, setDense] = useState(false);

  const all = useMemo(() => data ?? [], [data]);
  const depts = useMemo(() => ["All", ...Array.from(new Set(all.map((r) => r.department).filter(Boolean)))], [all]);
  const statuses = ["All", "OPEN", "DRAFT", "ON_HOLD", "FILLED", "CLOSED", "CANCELLED"];
  const rows = all.filter((r) =>
    (!q || (r.title + r.id + (r.department || "")).toLowerCase().includes(q.toLowerCase())) &&
    (status === "All" || r.status === status) &&
    (dept === "All" || r.department === dept));
  const openCount = all.filter((r) => r.status === "OPEN").length;
  const pad = dense ? "8px 16px" : "13px 16px";

  const selStyle: React.CSSProperties = { padding: "8px 10px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer" };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Requisitions</h1>
          <p style={{ margin: "6px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>{openCount} open · {all.length} total across Northwind Talent.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <Btn variant="soft" icon="arrowUpRight">Export</Btn>
          <a href="/requisitions/new" style={{ textDecoration: "none" }}><Btn variant="primary" icon="plus">Create requisition</Btn></a>
        </div>
      </div>

      {/* filter bar */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 12px", height: 38, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", flex: "1 1 240px", maxWidth: 320 }}>
          <Icon name="search" size={16} style={{ color: "var(--c-ink-3)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, ID, recruiter..." style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "var(--fs-sm)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selStyle}>
          {statuses.map((o) => <option key={o} value={o}>{o === "All" ? "All statuses" : REQ_STATUS[o as RequisitionStatus].label}</option>)}
        </select>
        <select value={dept} onChange={(e) => setDept(e.target.value)} style={selStyle}>
          {depts.map((o) => <option key={o} value={o}>{o === "All" ? "All departments" : o}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button onClick={() => setDense((d) => !d)} title="Density" style={{ display: "inline-flex", gap: 6, alignItems: "center", height: 38, padding: "0 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: dense ? "var(--c-surface-2)" : "var(--c-surface)", color: "var(--c-ink-2)", cursor: "pointer", fontSize: "var(--fs-sm)", fontWeight: 600 }}>
          <Icon name="listChecks" size={15} />{dense ? "Comfortable" : "Compact"}
        </button>
      </div>

      {/* table */}
      <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "11px 16px", borderBottom: "1px solid var(--c-line)", background: "var(--c-surface-2)", fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>
          <span>Requisition</span><span>Status</span><span>Salary range</span><span style={{ textAlign: "center" }}>Cands</span><span style={{ textAlign: "center" }}>Heads</span><span>Recruiter</span><span style={{ textAlign: "right" }}>Created</span>
        </div>

        {loading && (
          <div style={{ padding: 16, display: "grid", gap: 10 }} aria-busy="true">
            {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-[44px] rounded-lg" />)}
          </div>
        )}
        {!loading && error && (
          <div style={{ padding: "40px 16px" }}>
            <ErrorState title="Could not load requisitions" body="The requisitions service did not respond." code="GET /api/requisitions" onRetry={reload} />
          </div>
        )}
        {!loading && !error && all.length === 0 && (
          <div style={{ padding: "40px 16px" }}>
            <EmptyState
              title="No requisitions yet"
              body="Create your first role, the jd-author agent can draft it for you."
              actions={<a href="/requisitions/new" style={{ textDecoration: "none" }}><Btn variant="ai" icon="sparkles">Create with AI</Btn></a>}
            />
          </div>
        )}

        {!loading && !error && all.length > 0 && rows.map((r, i) => {
          // The gateway Requisition view-model carries no recruiter owner; show a
          // neutral placeholder while preserving the prototype's avatar + name cell.
          const recName = "Unassigned";
          return (
            <a key={r.id} href={`/requisitions/${r.id}`} style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: pad, alignItems: "center", borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", transition: "background var(--t-fast)", textDecoration: "none", color: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--c-surface-2)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</span>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{r.id}{r.department ? ` · ${r.department}` : ""}{r.location ? ` · ${r.location}` : ""}</div>
              </div>
              <StatusChip s={r.status} />
              <span className="mono tnum" style={{ fontSize: 12.5, color: r.salaryMin ? "var(--c-ink)" : "var(--c-warn)" }}>{r.salaryMin && r.salaryMax ? `$${r.salaryMin / 1000}k to $${r.salaryMax / 1000}k` : ", not set"}</span>
              <span className="mono tnum" style={{ fontSize: 13, fontWeight: 600, textAlign: "center" }}>{r.candidateCount || ", "}</span>
              <span className="mono tnum" style={{ fontSize: 13, textAlign: "center", color: "var(--c-ink-2)" }}>{r.openings ?? "-"}</span>
              <span style={{ display: "inline-flex", gap: 7, alignItems: "center", minWidth: 0 }}>
                <span className="mono" style={{ width: 24, height: 24, borderRadius: 99, background: "var(--c-surface-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, color: "var(--c-ink-2)", flexShrink: 0 }}>{initials(recName)}</span>
                <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--c-ink-2)" }}>{recName}</span>
              </span>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--c-ink-3)", textAlign: "right" }}>{created(r.createdAt)}</span>
            </a>
          );
        })}

        {!loading && !error && all.length > 0 && rows.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>No requisitions match your filters.</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, fontSize: 12.5, color: "var(--c-ink-3)" }}>
        <span>Showing {rows.length} of {all.length}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={{ padding: "6px 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-3)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-sans)" }}>Previous</button>
          <button style={{ padding: "6px 11px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600 }}>Next</button>
        </div>
      </div>
    </div>
  );
}
