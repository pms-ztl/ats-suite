"use client";
// app/(dashboard)/scheduling/page.tsx - EXACT Claude Design "Aurora" scheduling
// screen. Ported from claude-design/screen-scheduling.jsx: a two-column surface
// with a week calendar (busy overlays + participant avatars) on the left and an
// "AI-proposed slots" advisory rail on the right (the agent suggests, you book).
// Wired to the real gateway via listInterviews. The prototype's per-participant
// busy map and ranked AI fit-scores have no backend endpoint yet, so those
// render with graceful empty/loading states rather than invented numbers.
import { useMemo, useState } from "react";
import { SectionCard, StatusBadge, Btn, Pill } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listInterviews } from "@/lib/api";
import type { Interview, InterviewStatus } from "@/lib/types";

// InterviewStatus -> StatusBadge kind. The kit badge only knows
// pass|review|fail|open|draft, so map all seven enum values sensibly.
const STATUS_KIND: Record<InterviewStatus, "pass" | "review" | "fail" | "open" | "draft"> = {
  SCHEDULED: "open",
  CONFIRMED: "pass",
  IN_PROGRESS: "open",
  COMPLETED: "review",
  CANCELLED: "fail",
  NO_SHOW: "fail",
  RESCHEDULED: "draft",
};

// A fixed work-week scaffold matching the prototype's grid (the static
// calendar chrome stays as designed; real interviews are overlaid onto it).
const WEEK = ["Mon 29", "Tue 30", "Wed 31", "Thu 1", "Fri 2"];
const HOURS = ["9", "10", "11", "12", "1", "2", "3", "4", "5"];

function initials(s: string): string {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function fmtWhen(iso?: string): string {
  if (!iso) return "Time to be confirmed";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Time to be confirmed";
  return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function SchedulingPage() {
  const { data, loading, error, reload } = useData<Interview[]>(listInterviews);
  const [picked, setPicked] = useState(0);

  // The interviews the agent has lined up. The first is the focus of the rail.
  const interviews = useMemo(() => data ?? [], [data]);
  const focus = interviews[picked] ?? interviews[0];

  const round = focus?.round ?? "Interview";
  const candidate = focus?.candidateId ?? "Candidate";
  const dur = focus?.durationMins ?? 60;
  const participants = focus?.panel ?? [];
  const partCount = participants.length;

  // Position the focused interview on the week grid (decorative best-effort:
  // place the busy block in the day column that matches its weekday, if any).
  const focusDayIndex = useMemo(() => {
    if (!focus?.startsAt) return -1;
    const d = new Date(focus.startsAt);
    if (isNaN(d.getTime())) return -1;
    // WEEK is Mon..Fri; getDay() is 0=Sun..6=Sat, so Mon=1 -> index 0.
    const idx = d.getDay() - 1;
    return idx >= 0 && idx < WEEK.length ? idx : -1;
  }, [focus?.startsAt]);

  const focusHourIndex = useMemo(() => {
    if (!focus?.startsAt) return -1;
    const d = new Date(focus.startsAt);
    if (isNaN(d.getTime())) return -1;
    const h = d.getHours();
    // HOURS run 9a..5p; map clock hour to row index (12 and 1..5 wrap to pm rows).
    const idx = h >= 9 ? h - 9 : h + 3;
    return idx >= 0 && idx < HOURS.length ? idx : -1;
  }, [focus?.startsAt]);

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "start" }}>
        {/* calendar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Schedule interview</h1>
              <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>
                {round} · {candidate} · {dur} min · {partCount} {partCount === 1 ? "participant" : "participants"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button aria-label="Previous week" style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} style={{ transform: "rotate(180deg)" }} /></button>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>May 29 to Jun 2</span>
              <button aria-label="Next week" style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} /></button>
            </div>
          </div>

          {/* week grid */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", borderBottom: "1px solid var(--c-line)" }}>
              <div />
              {WEEK.map((d) => <div key={d} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, borderLeft: "1px solid var(--c-line)" }}>{d}</div>)}
            </div>
            {HOURS.map((h, hi) => (
              <div key={h} style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", borderTop: hi ? "1px solid var(--c-line)" : "none", minHeight: 46 }}>
                <div style={{ padding: "4px 8px", fontSize: 10.5, color: "var(--c-ink-3)", textAlign: "right" }} className="mono">{h}{hi < 3 ? "a" : "p"}</div>
                {WEEK.map((day, di) => {
                  const busyHere = focusDayIndex === di && focusHourIndex === hi;
                  return (
                    <div key={day} style={{ borderLeft: "1px solid var(--c-line)", padding: 2, position: "relative" }}>
                      {busyHere && (
                        <div
                          title={`${round} · ${candidate}`}
                          style={{ position: "absolute", inset: 2, borderRadius: 5, background: "var(--c-ai-tint)", border: "1px solid var(--c-ai)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* legend + participants */}
          <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: "repeating-linear-gradient(45deg, var(--c-surface-3), var(--c-surface-3) 3px, transparent 3px, transparent 6px)", border: "1px solid var(--c-line)" }} /> Busy
            </span>
            <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--c-ai-tint)", border: "1px solid var(--c-ai)" }} /> Scheduled interview
            </span>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {participants.slice(0, 6).map((p, i) => (
                <span key={p + i} title={p} className="mono" style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, background: i === 0 ? "linear-gradient(135deg, var(--c-brand), var(--c-ai))" : "var(--c-surface-3)", color: i === 0 ? "white" : "var(--c-ink-2)", border: "1px solid var(--c-line)" }}>{initials(p)}</span>
              ))}
              <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{partCount} {partCount === 1 ? "participant" : "participants"}</span>
            </div>
          </div>
        </div>

        {/* AI-proposed slots rail */}
        <aside style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", boxShadow: "var(--e1)", padding: "22px 18px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
            <Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} />
            <h2 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>AI-proposed slots</h2>
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>
            The <b style={{ color: "var(--c-ai-ink)" }}>scheduling</b> agent ranks slots by availability and preferences. It suggests, <b>you book</b>.
          </p>

          {/* loading */}
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }} aria-busy="true">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-[12px]" />)}
            </div>
          )}

          {/* error */}
          {error && (
            <ErrorState
              title="Could not load the schedule"
              body="The interviews service did not respond."
              code="GET /api/interviews"
              onRetry={reload}
            />
          )}

          {/* empty: no interviews lined up */}
          {data && interviews.length === 0 && (
            <EmptyState
              title="No interviews to schedule"
              body="When an interview is requested, the scheduling agent ranks open slots here for you to book."
              actions={<a href="/interviews"><Btn variant="ai" icon="calendar">View interviews</Btn></a>}
            />
          )}

          {/* real interviews, surfaced as the schedule the agent lined up */}
          {data && interviews.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {interviews.slice(0, 8).map((iv, i) => {
                  const on = picked === i;
                  return (
                    <button
                      key={iv.id}
                      onClick={() => setPicked(i)}
                      style={{ textAlign: "left", padding: 14, borderRadius: "var(--r-lg)", cursor: "pointer", border: "1.5px solid", borderColor: on ? "var(--c-ai)" : "var(--c-line)", background: on ? "var(--c-ai-tint)" : "var(--c-surface)", transition: "all var(--t-fast)", position: "relative" }}
                    >
                      {i === 0 && <span style={{ position: "absolute", top: -8, right: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-on-ai)", background: "var(--c-ai)", padding: "2px 8px", borderRadius: 99 }}>Next</span>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "var(--fs-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iv.candidateId || "Candidate"}</div>
                          <div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{iv.round} · {iv.durationMins}m</div>
                        </div>
                        <StatusBadge kind={STATUS_KIND[iv.status] ?? "open"} />
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 9 }}>
                        <Icon name="clock" size={12} style={{ color: "var(--c-ink-3)" }} />
                        <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{fmtWhen(iv.startsAt)}</span>
                        {iv.mode && <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ marginLeft: "auto" }}>{iv.mode}</Pill>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* advisory callout: honest about what the agent will and won't do */}
              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: "var(--r-lg)", background: "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, var(--c-warn) 26%, transparent)" }}>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Icon name="flag" size={14} style={{ color: "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
                  The agent surfaces availability and preferences, the final booking and the invites stay with you. Confirm before booking.
                </div>
              </div>

              {focus && (
                <a href="/interviews" style={{ display: "block", marginTop: 14 }}>
                  <Btn variant="primary" icon="calendar" style={{ width: "100%", justifyContent: "center" }}>
                    Open {focus.round}
                  </Btn>
                </a>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
