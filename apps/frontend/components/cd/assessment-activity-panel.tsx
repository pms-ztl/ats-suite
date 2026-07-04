"use client";
// components/cd/assessment-activity-panel.tsx
// LANE 2 - the cross-candidate assessment activity board for the assessments
// dashboard. Aggregates INVITES + RESULTS across every assessment in the tenant
// into one table, sortable by score and filterable by vendor. Everything is read
// from the existing gateway routes (GET /assessments, /:id/invites, /:id/results);
// nothing is fabricated. An invite with no result yet shows "awaiting result";
// an un-graded/pending result shows its honest pending state.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SectionCard } from "@/components/cd/aurora-kit";
import { Icon } from "@/components/cd/icon";
import { useLiveRefresh } from "@/lib/use-live-refresh";
import {
  listAssessmentsLite, listInvites, getResults,
  PROVIDER_META, providerLabel,
  type AssessmentInvite, type ResultRow, type ProviderKind,
} from "@/lib/assessment-provider-api";

// One flattened activity row: an invite, joined to its result (when one exists).
interface ActivityRow {
  key: string;
  assessmentId: string;
  assessmentTitle: string;
  candidateId: string;
  provider: string | null; // vendor kind, or null for a native take
  status: string;          // invite lifecycle status
  scorePercent: number | null;
  passed: boolean | null;
  pendingReview: boolean;
  plagiarismFlag: boolean | null;
  reportUrl: string | null;
  gradedAt: string | null;
  sentAt: string | null;
  hasResult: boolean;
}

type SortKey = "score" | "recent";

function fmtDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function statusTone(status: string): { tone: string; bg: string } {
  const s = (status || "").toUpperCase();
  if (s === "COMPLETED") return { tone: "var(--ok)", bg: "var(--ok-tint)" };
  if (s === "SENT" || s === "STARTED" || s === "OPENED") return { tone: "var(--info)", bg: "var(--info-tint)" };
  if (s === "EXPIRED" || s === "CANCELLED") return { tone: "var(--danger)", bg: "var(--danger-tint)" };
  return { tone: "var(--ink-3)", bg: "var(--surface-3)" };
}

function scoreColor(pct: number | null): string {
  if (pct == null) return "var(--ink-3)";
  return pct >= 70 ? "var(--ok)" : pct >= 40 ? "var(--warn)" : "var(--danger)";
}

export function AssessmentActivityPanel() {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vendorFilter, setVendorFilter] = useState<"all" | ProviderKind | "native">("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const seqRef = useRef(0);
  const load = useCallback(async () => {
    const seq = ++seqRef.current;
    try {
      const assessments = await listAssessmentsLite();
      // Fan out invites + results per assessment (bounded: the list is the
      // tenant's own assessments). Failures on a single assessment are tolerated.
      const per = await Promise.all(
        assessments.map(async (a) => {
          const [invites, results] = await Promise.all([
            listInvites(a.id).catch(() => [] as AssessmentInvite[]),
            getResults(a.id).then((r) => r.results).catch(() => [] as ResultRow[]),
          ]);
          return { a, invites, results };
        }),
      );
      if (seq !== seqRef.current) return;

      const out: ActivityRow[] = [];
      for (const { a, invites, results } of per) {
        // Index results by candidate for a quick join to invites.
        const resultByCand = new Map<string, ResultRow>();
        for (const r of results) {
          const prev = resultByCand.get(r.candidateId);
          // Keep the most-informative result (prefer one that is graded).
          if (!prev || (r.gradedAt && !prev.gradedAt)) resultByCand.set(r.candidateId, r);
        }
        for (const inv of invites) {
          const res = resultByCand.get(inv.candidateId);
          out.push({
            key: inv.id,
            assessmentId: a.id,
            assessmentTitle: a.title,
            candidateId: inv.candidateId,
            provider: inv.provider ?? res?.vendor?.provider ?? null,
            status: inv.status,
            scorePercent: res?.scorePercent ?? null,
            passed: res?.passed ?? null,
            pendingReview: res?.pendingManualReview ?? false,
            plagiarismFlag: res?.vendor?.plagiarismFlag ?? null,
            reportUrl: res?.vendor?.reportUrl ?? null,
            gradedAt: res?.gradedAt ?? null,
            sentAt: inv.sentAt ?? inv.createdAt ?? null,
            hasResult: !!res,
          });
        }
        // Also surface vendor results that have no matching invite row (defensive).
        for (const r of results) {
          if (!invites.some((i) => i.candidateId === r.candidateId)) {
            out.push({
              key: `res:${r.id}`,
              assessmentId: a.id,
              assessmentTitle: a.title,
              candidateId: r.candidateId,
              provider: r.vendor?.provider ?? null,
              status: r.pendingManualReview ? "COMPLETED" : "COMPLETED",
              scorePercent: r.scorePercent,
              passed: r.passed,
              pendingReview: r.pendingManualReview,
              plagiarismFlag: r.vendor?.plagiarismFlag ?? null,
              reportUrl: r.vendor?.reportUrl ?? null,
              gradedAt: r.gradedAt,
              sentAt: null,
              hasResult: true,
            });
          }
        }
      }
      setRows(out);
      setError(null);
    } catch (e) {
      if (seq !== seqRef.current) return;
      setRows((prev) => prev ?? []);
      setError(e instanceof Error ? e.message : "Could not load assessment activity.");
    }
  }, []);

  useEffect(() => {
    load();
    return () => { seqRef.current++; };
  }, [load]);
  useLiveRefresh(load);

  // Vendors actually present in the data, so the filter only offers real options.
  const vendorsPresent = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows ?? []) if (r.provider) set.add(r.provider.toLowerCase());
    return set;
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows ?? [];
    if (vendorFilter === "native") list = list.filter((r) => !r.provider);
    else if (vendorFilter !== "all") list = list.filter((r) => (r.provider ?? "").toLowerCase() === vendorFilter);
    const sorted = [...list];
    if (sort === "score") {
      // Highest score first; rows without a score sort to the bottom.
      sorted.sort((a, b) => (b.scorePercent ?? -1) - (a.scorePercent ?? -1));
    } else {
      sorted.sort((a, b) => {
        const at = new Date(a.gradedAt ?? a.sentAt ?? 0).getTime();
        const bt = new Date(b.gradedAt ?? b.sentAt ?? 0).getTime();
        return bt - at;
      });
    }
    return sorted;
  }, [rows, vendorFilter, sort]);

  const filterOptions: { key: "all" | ProviderKind | "native"; label: string }[] = [
    { key: "all", label: "All vendors" },
    ...(Object.keys(PROVIDER_META) as ProviderKind[])
      .filter((k) => vendorsPresent.has(k))
      .map((k) => ({ key: k, label: PROVIDER_META[k].name })),
    ...(vendorsPresent.size < (rows ?? []).length && (rows ?? []).some((r) => !r.provider)
      ? [{ key: "native" as const, label: "Native take" }]
      : []),
  ];

  return (
    <SectionCard
      title="Assessment activity"
      icon="listChecks"
      headRight={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setSort((s) => (s === "score" ? "recent" : "score"))}
            style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--ink-2)", background: "var(--surface-2)", border: "1px solid var(--line-2)", borderRadius: "var(--r-pill)", padding: "5px 11px", cursor: "pointer" }}
          >
            <Icon name="chart" size={13} /> Sort: {sort === "score" ? "Score" : "Most recent"}
          </button>
        </div>
      }
    >
      {/* vendor filter pills - only real vendors present in the data */}
      {filterOptions.length > 1 && (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
          {filterOptions.map((o) => {
            const on = o.key === vendorFilter;
            return (
              <button
                key={o.key}
                onClick={() => setVendorFilter(o.key)}
                style={{ padding: "5px 12px", borderRadius: "var(--r-pill)", border: on ? "1px solid transparent" : "1px solid var(--line-2)", background: on ? "var(--brand-tint)" : "var(--surface)", fontSize: 12, fontWeight: 600, color: on ? "var(--brand)" : "var(--ink-2)", cursor: "pointer" }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div role="alert" style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: "var(--r)", background: "var(--warn-tint)", color: "var(--warn)", fontSize: "var(--fs-sm)", marginBottom: 12 }}>
          <Icon name="flag" size={15} />{error}
        </div>
      )}

      {rows === null ? (
        <div style={{ padding: "12px 0", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>Loading activity...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "26px 0", textAlign: "center", color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>
          {(rows.length === 0)
            ? "No candidates have been invited to a test yet. Send a coding test from a candidate profile and its status and score will show here."
            : "No activity matches this filter."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {/* column header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 120px 90px 90px", gap: 12, padding: "0 12px 4px", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            <span>Candidate</span><span>Assessment</span><span>Vendor</span><span>Status</span><span style={{ textAlign: "right" }}>Score</span>
          </div>
          {filtered.map((r) => {
            const tone = statusTone(r.status);
            return (
              <div key={r.key} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 120px 90px 90px", gap: 12, alignItems: "center", padding: "11px 12px", borderRadius: "var(--r)", border: "1px solid var(--line)", background: "var(--surface)", boxShadow: "var(--e1)" }}>
                <a href={`/candidates/${r.candidateId}`} className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.candidateId}
                </a>
                <a href={`/assessments/${r.assessmentId}/results`} style={{ fontSize: 12.5, color: "var(--ink-2)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {r.assessmentTitle}
                </a>
                <span style={{ fontSize: 12, color: "var(--ink-2)", display: "inline-flex", gap: 5, alignItems: "center" }}>
                  {r.provider ? (
                    <><Icon name="plug" size={12} style={{ color: "var(--ai)" }} />{providerLabel(r.provider)}</>
                  ) : (
                    <span style={{ color: "var(--ink-3)" }}>Native</span>
                  )}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "3px 8px", borderRadius: "var(--r-pill)", fontSize: 10.5, fontWeight: 700, color: tone.tone, background: tone.bg, whiteSpace: "nowrap" }}>
                  {r.status.toUpperCase()}
                </span>
                <span style={{ textAlign: "right", display: "inline-flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  {r.hasResult ? (
                    r.pendingReview ? (
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--warn)" }}>In review</span>
                    ) : r.scorePercent != null ? (
                      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: scoreColor(r.scorePercent) }}>{r.scorePercent}%</span>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--ink-3)" }}>graded</span>
                    )
                  ) : (
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-3)" }}>Awaiting result</span>
                  )}
                  {r.plagiarismFlag === true && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--danger)", display: "inline-flex", gap: 3, alignItems: "center" }}>
                      <Icon name="flag" size={10} /> flagged
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
