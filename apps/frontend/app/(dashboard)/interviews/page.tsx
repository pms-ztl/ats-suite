"use client";
// app/(dashboard)/interviews/page.tsx - EXACT Claude Design "Aurora" Interviews
// list (claude-design/screen-interviews.jsx): heading with awaiting/upcoming
// counts, status filter pills, and a card-table of rows (candidate avatar +
// round + mode pill + schedule + panel stack + status). Rows open the detail at
// /interviews/{id}. Wired to the real gateway via listInterviews; the 7-value
// InterviewStatus enum drives the status chips with a safe fallback.
import { useState } from "react";
import { Btn, Pill, StatusBadge } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listInterviews } from "@/lib/api";
import type { Interview, InterviewStatus } from "@/lib/types";

// Map the real 7-value enum to a kit StatusBadge kind (+ a tone and a human
// label), mirroring the prototype's IV_STATUS treatment with a safe fallback.
type Kind = "pass" | "review" | "fail" | "open" | "draft";
const STATUS: Record<InterviewStatus, { kind: Kind; tone: string; label: string }> = {
  SCHEDULED:   { kind: "open",   tone: "var(--c-brand)",  label: "Scheduled" },
  CONFIRMED:   { kind: "pass",   tone: "var(--c-ok)",     label: "Confirmed" },
  IN_PROGRESS: { kind: "review", tone: "var(--c-ai-ink)", label: "In progress" },
  COMPLETED:   { kind: "review", tone: "var(--c-warn)",   label: "Feedback due" },
  CANCELLED:   { kind: "fail",   tone: "var(--c-danger)", label: "Cancelled" },
  NO_SHOW:     { kind: "fail",   tone: "var(--c-danger)", label: "No show" },
  RESCHEDULED: { kind: "open",   tone: "var(--c-brand)",  label: "Rescheduled" },
};
const FALLBACK = STATUS.SCHEDULED;
const stOf = (s: InterviewStatus) => STATUS[s] ?? FALLBACK;

// Interview mode pill (VIDEO / ONSITE / PHONE), the prototype's per-row accent.
const MODE: Record<Interview["mode"], { tone: string; label: string }> = {
  VIDEO:  { tone: "var(--c-ai)",    label: "Video" },
  ONSITE: { tone: "var(--c-brand)", label: "Onsite" },
  PHONE:  { tone: "var(--c-info)",  label: "Phone" },
};
const modeOf = (m: Interview["mode"]) => MODE[m] ?? MODE.VIDEO;

const initials = (s: string) =>
  (s || "?").trim().split(/[\s_-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

const fmtWhen = (iso: string) => {
  if (!iso) return "Not scheduled";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Not scheduled";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

const FILTERS: [string, string, (s: InterviewStatus) => boolean][] = [
  ["all", "All", () => true],
  ["scheduled", "Scheduled", (s) => s === "SCHEDULED" || s === "CONFIRMED" || s === "RESCHEDULED"],
  ["awaiting", "Feedback due", (s) => s === "COMPLETED" || s === "IN_PROGRESS"],
  ["completed", "Completed", (s) => s === "COMPLETED"],
];

export default function InterviewsPage() {
  const [filter, setFilter] = useState("all");
  const { data, loading, error, reload } = useData<Interview[]>(listInterviews);

  const all = data ?? [];
  const awaiting = all.filter((r) => r.status === "COMPLETED" || r.status === "IN_PROGRESS").length;
  const upcoming = all.filter((r) => r.status === "SCHEDULED" || r.status === "CONFIRMED" || r.status === "RESCHEDULED").length;
  const pred = FILTERS.find(([k]) => k === filter)?.[2] ?? (() => true);
  const rows = all.filter((r) => pred(r.status));

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      {/* heading */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--fs-3xl)", fontWeight: 800, letterSpacing: "-0.03em" }}>Interviews</h1>
          <p style={{ margin: "5px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-md)" }}>
            {awaiting} awaiting feedback · {upcoming} upcoming.
          </p>
        </div>
        <Btn variant="primary" icon="plus">Schedule interview</Btn>
      </div>

      {/* filter pills */}
      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
        {FILTERS.map(([k, l]) => {
          const on = filter === k;
          return (
            <button key={k} onClick={() => setFilter(k)}
              style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid",
                borderColor: on ? "transparent" : "var(--c-line-2)", background: on ? "var(--c-brand-tint)" : "var(--c-surface)", color: on ? "var(--c-brand-ink)" : "var(--c-ink-2)" }}>
              {l}
            </button>
          );
        })}
      </div>

      {/* loading / error / empty */}
      {loading && (
        <div className="grid gap-2" aria-busy="true">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-[16px]" />)}</div>
      )}
      {error && <ErrorState title="Could not load interviews" body="The interviews service did not respond." code="GET /api/interviews" onRetry={reload} />}
      {data && rows.length === 0 && (
        <EmptyState title={filter === "all" ? "No interviews scheduled" : "Nothing in this view"}
          body={filter === "all" ? "When you schedule a round it appears here with the panel and AI-proposed times." : "No interviews match this filter yet."} />
      )}

      {/* card-table of rows */}
      {data && rows.length > 0 && (
        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          {rows.map((r, i) => {
            const st = stOf(r.status);
            const md = modeOf(r.mode);
            const panel = r.panel ?? [];
            return (
              <a key={r.id} href={`/interviews/${r.id}`}
                style={{ display: "grid", gridTemplateColumns: "1.6fr 1.2fr 1fr 130px 130px", gap: 12, padding: "13px 18px", alignItems: "center",
                  borderTop: i ? "1px solid var(--c-line)" : "none", cursor: "pointer", textDecoration: "none", color: "inherit", transition: "background var(--t-fast)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--c-surface-2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                {/* candidate */}
                <div style={{ display: "flex", gap: 11, alignItems: "center", minWidth: 0 }}>
                  <span className="mono" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 11, background: "linear-gradient(135deg, var(--c-brand), var(--c-ai))", color: "white" }}>{initials(r.candidateId)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.candidateId || "Candidate"}</div>
                    <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>Req <span className="mono">{r.requisitionId || "unassigned"}</span></div>
                  </div>
                </div>
                {/* round + mode pill */}
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{r.round}</div>
                  <Pill tone={md.tone} bg={`color-mix(in oklab, ${md.tone} 13%, transparent)`} style={{ fontSize: 10, marginTop: 2 }}>{md.label}</Pill>
                </div>
                {/* schedule */}
                <div style={{ fontSize: 12.5, color: "var(--c-ink-2)" }}>
                  {fmtWhen(r.startsAt)}
                  <div style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{r.durationMins}m · {md.label}</div>
                </div>
                {/* panel stack */}
                <div style={{ display: "flex", marginLeft: 2 }}>
                  {panel.slice(0, 3).map((p, j) => (
                    <span key={j} title={p} className="mono" style={{ width: 26, height: 26, borderRadius: 99, marginLeft: j ? -8 : 0, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, background: "var(--c-surface-3)", color: "var(--c-ink-2)", border: "2px solid var(--c-surface)" }}>{initials(p)}</span>
                  ))}
                  {panel.length > 3 && (
                    <span className="mono" style={{ width: 26, height: 26, borderRadius: 99, marginLeft: -8, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, background: "var(--c-surface-3)", color: "var(--c-ink-3)", border: "2px solid var(--c-surface)" }}>+{panel.length - 3}</span>
                  )}
                  {panel.length === 0 && <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>No panel</span>}
                </div>
                {/* status: kit StatusBadge (kind-mapped, icon + word), prototype label below */}
                <span style={{ justifySelf: "end", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  <StatusBadge kind={st.kind} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: st.tone }}>{st.label}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
