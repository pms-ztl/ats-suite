"use client";
// app/(dashboard)/scheduling/page.tsx - VERBATIM Claude Design "Aurora" scheduling
// screen (claude-design/screen-scheduling.jsx): a week calendar grid on the left
// (with per-participant busy stripes) and an AI-proposed-slots rail on the right
// that the agent ranks by availability and fit, marked advisory (it suggests,
// you book). The prototype's exact markup, inline styles, and copy are preserved
// element-for-element. Palette var(--x) refs are converted to var(--c-x); effect
// and size tokens (--r*, --fs-*, --t-fast, --ease-spring) stay bare.
//
// Real data: listInterviews() via useData drives the round / candidate / panel /
// participant header when a scheduled or proposed interview exists. The
// per-participant busy map and the per-slot AI fit-scores have no gateway
// endpoint, so those parts keep the prototype's exact advisory example content
// (the SCHED shape), exactly as the port guide directs. Slot selection and the
// confirm interaction are useState. Loading / error / empty render inside the rail.
import { useState } from "react";
import { Btn } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listInterviews } from "@/lib/api";
import type { Interview } from "@/lib/types";

type Slot = { day: string; time: string; score: number; all: boolean; selected?: boolean; note: string };
type Participant = { who: string; role: string; ini: string };
type Sched = {
  candidate: string; role: string; round: string; dur: number;
  participants: Participant[];
  slots: Slot[];
  week: string[];
  hours: string[];
  busy: Record<string, [string, number, number][]>;
};

// AI-proposed slots, the per-participant busy map, the week/hours scaffold, and
// the fit-scores have no gateway endpoint. Per the Aurora port guide, keep the
// prototype's EXACT advisory example content here; real interviews (below) take
// precedence for the header copy when the gateway returns any.
const SCHED: Sched = {
  candidate: "Aisha Bello", role: "Sr. Backend Engineer", round: "Technical screen", dur: 60,
  participants: [
    { who: "Aisha Bello", role: "Candidate", ini: "AB" },
    { who: "Sam Okafor", role: "Staff Engineer", ini: "SO" },
    { who: "Yuki Tanaka", role: "Senior Engineer", ini: "YT" },
  ],
  slots: [
    { day: "Wed May 31", time: "10:00 AM", score: 0.94, all: true, selected: true, note: "All available · morning preference met" },
    { day: "Wed May 31", time: "2:00 PM", score: 0.82, all: true, note: "All available" },
    { day: "Thu Jun 1", time: "11:00 AM", score: 0.78, all: true, note: "All available · short notice" },
    { day: "Thu Jun 1", time: "4:00 PM", score: 0.61, all: false, note: "Yuki tentative · late in day" },
    { day: "Fri Jun 2", time: "3:00 PM", score: 0.42, all: false, note: "Friday afternoon, avoided" },
  ],
  week: ["Mon 29", "Tue 30", "Wed 31", "Thu 1", "Fri 2"],
  hours: ["9", "10", "11", "12", "1", "2", "3", "4", "5"],
  busy: { "Sam Okafor": [["Mon 29", 0, 2], ["Tue 30", 4, 6]], "Yuki Tanaka": [["Mon 29", 3, 5], ["Thu 1", 7, 9]], "Aisha Bello": [["Tue 30", 0, 1]] },
};

const initials = (s: string) =>
  (s || "?").trim().split(/[\s_-]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

export default function SchedulingScreen() {
  const interviews = useData<Interview[]>(listInterviews);

  // Real interviews fill the header (round / candidate / participants) when the
  // gateway returns any; otherwise the advisory SCHED example stands in. The
  // calendar busy map + AI fit-scored slots stay as the prototype's example.
  const live = interviews.data ?? [];
  const focal = live[0];
  const livePanel = focal?.panel ?? [];
  const liveParticipants: Participant[] = focal
    ? [{ who: focal.candidateId, role: "Candidate", ini: initials(focal.candidateId) },
       ...livePanel.map((p) => ({ who: p, role: "Panelist", ini: initials(p) }))]
    : [];

  const s: Sched = focal
    ? {
        ...SCHED,
        candidate: focal.candidateId || SCHED.candidate,
        role: SCHED.role,
        round: focal.round || SCHED.round,
        dur: focal.durationMins || SCHED.dur,
        participants: liveParticipants.length ? liveParticipants : SCHED.participants,
      }
    : SCHED;

  const [picked, setPicked] = useState(s.slots.findIndex((x) => x.selected));
  const [booked, setBooked] = useState(false);
  const scoreTone = (v: number) => (v >= 0.8 ? "var(--c-ok)" : v >= 0.6 ? "var(--c-warn)" : "var(--c-danger)");

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", minHeight: 0 }}>
        {/* calendar */}
        <div style={{ overflowY: "auto", padding: "0 28px 40px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <div><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Schedule interview</h1>
              <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{s.round} · {s.candidate} · {s.dur} min · {s.participants.length} participants</p></div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} style={{ transform: "rotate(180deg)" }} /></button>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>May 29 to Jun 2</span>
              <button style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} /></button>
            </div>
          </div>

          {/* week grid */}
          <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--c-line)", background: "var(--c-surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", borderBottom: "1px solid var(--c-line)" }}>
              <div></div>
              {s.week.map((d) => <div key={d} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, borderLeft: "1px solid var(--c-line)" }}>{d}</div>)}
            </div>
            {s.hours.map((h, hi) => (
              <div key={h} style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", borderTop: hi ? "1px solid var(--c-line)" : "none", minHeight: 46 }}>
                <div style={{ padding: "4px 8px", fontSize: 10.5, color: "var(--c-ink-3)", textAlign: "right" }} className="mono">{h}{hi < 3 ? "a" : "p"}</div>
                {s.week.map((day) => {
                  const busyHere = Object.entries(s.busy).filter(([, slots]) => slots.some(([d, a, b]) => d === day && hi >= a && hi < b));
                  return (
                    <div key={day} style={{ borderLeft: "1px solid var(--c-line)", padding: 2, position: "relative" }}>
                      {busyHere.length > 0 && <div style={{ position: "absolute", inset: 2, borderRadius: 5, background: "repeating-linear-gradient(45deg, var(--c-surface-3), var(--c-surface-3) 4px, transparent 4px, transparent 8px)", border: "1px solid var(--c-line)" }} title={busyHere.map((b) => b[0]).join(", ") + " busy"} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* legend + participants */}
          <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: "repeating-linear-gradient(45deg, var(--c-surface-3), var(--c-surface-3) 3px, transparent 3px, transparent 6px)", border: "1px solid var(--c-line)" }} /> Busy</span>
            <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--c-ink-2)" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--c-ai-tint)", border: "1px solid var(--c-ai)" }} /> AI-proposed slot</span>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {s.participants.map((p) => <span key={p.who} title={p.who} className="mono" style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, background: p.role === "Candidate" ? "linear-gradient(135deg, var(--c-brand), var(--c-ai))" : "var(--c-surface-3)", color: p.role === "Candidate" ? "white" : "var(--c-ink-2)", border: "1px solid var(--c-line)" }}>{p.ini}</span>)}
              <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{s.participants.length} participants</span>
            </div>
          </div>
        </div>

        {/* AI-proposed slots rail */}
        <aside style={{ borderLeft: "1px solid var(--c-line)", overflowY: "auto", padding: "0 18px 22px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><h2 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>AI-proposed slots</h2></div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>The <b style={{ color: "var(--c-ai-ink)" }}>scheduling</b> agent ranked these by availability and preferences. It suggests, <b>you book</b>.</p>

          {interviews.loading && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[14px]" />)}</div>}
          {interviews.error && <div style={{ padding: "8px 0" }}><ErrorState title="Could not load interviews" body="The scheduling service did not respond. The proposed slots below are advisory examples." code="GET /api/interviews" onRetry={interviews.reload} /></div>}

          {!interviews.loading && !interviews.error && (
            <>
              {interviews.data && live.length === 0 && (
                <div style={{ marginBottom: 12 }}>
                  <EmptyState title="No interviews scheduled yet" body="When a round is created, its panel and timezone seed the agent. The slots below show how the proposal looks." />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {s.slots.map((sl, i) => {
                  const on = picked === i;
                  return (
                    <button key={i} onClick={() => { setPicked(i); setBooked(false); }} style={{ textAlign: "left", padding: 14, borderRadius: "var(--r-lg)", cursor: "pointer", border: "1.5px solid", borderColor: on ? "var(--c-ai)" : "var(--c-line)", background: on ? "var(--c-ai-tint)" : "var(--c-surface)", transition: "all var(--t-fast)", position: "relative" }}>
                      {i === 0 && <span style={{ position: "absolute", top: -8, right: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-on-ai)", background: "var(--c-ai)", padding: "2px 8px", borderRadius: 99 }}>Best</span>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{sl.day}</div><div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{sl.time} · {s.dur}m</div></div>
                        <div style={{ textAlign: "right" }}>
                          <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: scoreTone(sl.score) }}>{sl.score.toFixed(2)}</div>
                          <div style={{ fontSize: 9, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>fit</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 9 }}>
                        <Icon name={sl.all ? "check" : "flag"} size={12} style={{ color: sl.all ? "var(--c-ok)" : "var(--c-warn)" }} />
                        <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{sl.note}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: "var(--r-lg)", background: picked === 0 ? "var(--c-ok-tint)" : "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, " + (picked === 0 ? "var(--c-ok)" : "var(--c-warn)") + " 26%, transparent)" }}>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Icon name={picked === 0 ? "check" : "flag"} size={14} style={{ color: picked === 0 ? "var(--c-ok)" : "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
                  {picked === 0 ? "The agent is confident in this slot (≥ 0.80, all available). Safe to book." : "Below the agent's confidence threshold, it would defer to you here. Confirm before booking."}
                </div>
              </div>

              {booked ? (
                <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ok-tint)", display: "flex", gap: 10, alignItems: "center", animation: "pop .3s var(--ease-spring)" }}>
                  <Icon name="check" size={18} style={{ color: "var(--c-ok)" }} /><span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Booked · invites sent to {s.participants.length}.</span>
                </div>
              ) : (
                <Btn variant="primary" icon="calendar" onClick={() => setBooked(true)} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>Book {s.slots[picked].time}, {s.slots[picked].day.split(" ").slice(1).join(" ")}</Btn>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
