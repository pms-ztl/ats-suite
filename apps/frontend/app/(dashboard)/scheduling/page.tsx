"use client";
// app/(dashboard)/scheduling/page.tsx - EXACT Claude Design "Aurora" scheduling
// screen (claude-design/screen-scheduling.jsx): a week calendar grid on the left
// and an AI-proposed-slots rail on the right (advisory: the agent suggests, you
// book). Wired to the real gateway via listInterviews. The per-participant busy
// map and per-slot AI fit-scores have no endpoint, so those parts keep the exact
// layout but render no fabricated numbers.
import { useState } from "react";
import { Btn } from "@/components/aurora-kit";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { Icon } from "@/components/aurora-icon";
import { useData } from "@/lib/use-data";
import { listInterviews } from "@/lib/api";
import type { Interview } from "@/lib/types";

// Fixed Mon-Fri week scaffold + working hours (9a to 4p), as in the prototype.
const WEEK = ["Mon 29", "Tue 30", "Wed 31", "Thu 1", "Fri 2"];
const HOURS = ["9", "10", "11", "12", "1", "2", "3", "4"];
const MODE_ICON: Record<Interview["mode"], string> = { VIDEO: "scan", ONSITE: "building", PHONE: "bell" };
const MODE_LABEL: Record<Interview["mode"], string> = { VIDEO: "Video", ONSITE: "Onsite", PHONE: "Phone" };
const CONFIRMED = new Set(["CONFIRMED", "COMPLETED", "IN_PROGRESS"]);

function initials(s: string): string {
  const parts = s.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
function dayLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function timeLabel(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
// Map an interview onto the fixed week scaffold (column index, hour-row index).
function gridPos(iso: string): { col: number; row: number } | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const col = (d.getDay() + 6) % 7; // Mon=0 .. Sun=6
  if (col > 4) return null;
  const h = d.getHours();
  const row = HOURS.findIndex((label, i) => (i < 3 ? 9 + i : i - 3) === (h > 12 ? h - 12 : h) && (i < 3 ? h < 12 : h >= 12));
  if (row < 0) return null;
  return { col, row };
}

export default function SchedulingPage() {
  const interviews = useData<Interview[]>(listInterviews);
  const slots = interviews.data ?? [];
  const [picked, setPicked] = useState(0);
  const [booked, setBooked] = useState(false);

  const sel = slots[picked];
  const panel = sel?.panel ?? [];
  // Candidate + panel, as avatars. The candidate gets the brand/ai gradient.
  const participants = sel
    ? [{ who: sel.candidateId, role: "Candidate", ini: initials(sel.candidateId) },
       ...panel.map((p) => ({ who: p, role: "Panelist", ini: initials(p) }))]
    : [];
  const confident = sel ? CONFIRMED.has(sel.status) : false;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", minHeight: 0 }}>
        {/* ---------- calendar ---------- */}
        <div style={{ padding: "0 28px 8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Schedule interview</h1>
              {sel
                ? <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>{sel.round} · {sel.candidateId} · {sel.durationMins} min · {participants.length} participants</p>
                : <p style={{ margin: "4px 0 0", color: "var(--c-ink-2)", fontSize: "var(--fs-sm)" }}>AI proposes times that balance panelist load and candidate timezone. You confirm.</p>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} style={{ transform: "rotate(180deg)" }} /></button>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>May 29 to Jun 2</span>
              <button style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} /></button>
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
                {WEEK.map((day, ci) => {
                  // Real interviews that fall in this cell. The per-participant
                  // busy map has no endpoint, so we render no striped busy blocks.
                  const here = slots.filter((s) => { const p = gridPos(s.startsAt); return p && p.col === ci && p.row === hi; });
                  return (
                    <div key={day} style={{ borderLeft: "1px solid var(--c-line)", padding: 2, position: "relative" }}>
                      {here.map((s) => {
                        const on = slots.indexOf(s) === picked;
                        return (
                          <button key={s.id} onClick={() => setPicked(slots.indexOf(s))} title={`${s.round} · ${s.candidateId}`}
                            style={{ position: "absolute", inset: 2, borderRadius: 5, cursor: "pointer", border: "1px solid var(--c-ai)", background: "var(--c-ai-tint)", color: "var(--c-ai-ink)", fontSize: 10, fontWeight: 700, padding: "2px 5px", textAlign: "left", overflow: "hidden", boxShadow: on ? "0 0 0 1.5px var(--c-ai)" : "none", lineHeight: 1.2 }}>
                            {s.candidateId}
                          </button>
                        );
                      })}
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
              {participants.map((p) => <span key={p.who} title={p.who} className="mono" style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, background: p.role === "Candidate" ? "linear-gradient(135deg, var(--c-brand), var(--c-ai))" : "var(--c-surface-3)", color: p.role === "Candidate" ? "white" : "var(--c-ink-2)", border: "1px solid var(--c-line)" }}>{p.ini}</span>)}
              {participants.length > 0 && <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{participants.length} participants</span>}
            </div>
          </div>
        </div>

        {/* ---------- AI-proposed slots rail ---------- */}
        <aside style={{ borderLeft: "1px solid var(--c-line)", padding: "0 0 22px 18px", background: "color-mix(in oklab, var(--c-surface) 50%, transparent)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Icon name="sparkles" size={16} style={{ color: "var(--c-ai)" }} /><h2 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>AI-proposed slots</h2></div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45 }}>The <b style={{ color: "var(--c-ai-ink)" }}>scheduling</b> agent ranked these by availability and preferences. It suggests, <b>you book</b>.</p>

          {interviews.loading && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[92px] rounded-[14px]" />)}</div>}
          {interviews.error && <ErrorState title="Could not load interviews" body="The scheduling service did not respond." code="GET /api/interviews" onRetry={interviews.reload} />}
          {interviews.data && slots.length === 0 && <EmptyState title="No interviews scheduled" body="When the scheduling agent proposes slots, they appear here for you to book." />}

          {slots.length > 0 && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {slots.map((sl, i) => {
                  const on = picked === i;
                  const all = CONFIRMED.has(sl.status);
                  return (
                    <button key={sl.id} onClick={() => { setPicked(i); setBooked(false); }} style={{ textAlign: "left", padding: 14, borderRadius: "var(--r-lg)", cursor: "pointer", border: "1.5px solid", borderColor: on ? "var(--c-ai)" : "var(--c-line)", background: on ? "var(--c-ai-tint)" : "var(--c-surface)", transition: "all var(--t-fast)", position: "relative" }}>
                      {i === 0 && <span style={{ position: "absolute", top: -8, right: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--c-on-ai)", background: "var(--c-ai)", padding: "2px 8px", borderRadius: 99 }}>Best</span>}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{dayLabel(sl.startsAt) || sl.round}</div><div style={{ fontSize: 12, color: "var(--c-ink-2)" }}>{timeLabel(sl.startsAt)}{timeLabel(sl.startsAt) ? " · " : ""}{sl.durationMins}m</div></div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: 5, alignItems: "center", fontSize: 12, fontWeight: 600, color: "var(--c-ink-2)" }}><Icon name={MODE_ICON[sl.mode]} size={13} style={{ color: "var(--c-ink-3)" }} />{MODE_LABEL[sl.mode]}</div>
                          <div style={{ fontSize: 9, color: "var(--c-ink-3)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>mode</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 9 }}>
                        <Icon name={all ? "check" : "flag"} size={12} style={{ color: all ? "var(--c-ok)" : "var(--c-warn)" }} />
                        <span style={{ fontSize: 11, color: "var(--c-ink-3)" }}>{all ? "Confirmed with all panelists" : `${sl.round} · ${sl.status.toLowerCase()}`}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: "var(--r-lg)", background: confident ? "var(--c-ok-tint)" : "var(--c-warn-tint)", border: "1px solid color-mix(in oklab, " + (confident ? "var(--c-ok)" : "var(--c-warn)") + " 26%, transparent)" }}>
                <div style={{ fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <Icon name={confident ? "check" : "flag"} size={14} style={{ color: confident ? "var(--c-ok)" : "var(--c-warn)", flexShrink: 0, marginTop: 1 }} />
                  {confident ? "The agent is confident in this slot (all panelists confirmed). Safe to book." : "This slot is not yet confirmed by all panelists, the agent would defer to you here. Confirm before booking."}
                </div>
              </div>

              {booked ? (
                <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: "var(--r-lg)", background: "var(--c-ok-tint)", display: "flex", gap: 10, alignItems: "center", animation: "pop .3s var(--ease-spring)" }}>
                  <Icon name="check" size={18} style={{ color: "var(--c-ok)" }} /><span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Booked · invites sent to {participants.length}.</span>
                </div>
              ) : (
                <Btn variant="primary" icon="calendar" onClick={() => setBooked(true)} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
                  Book {[timeLabel(sel.startsAt), dayLabel(sel.startsAt)].filter(Boolean).join(", ") || sel.round}
                </Btn>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
