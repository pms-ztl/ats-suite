"use client";
// components/screens/Scheduling.tsx
// Scheduling calendar with AI-proposed slots (advisory), ported pixel-exact from
// screen-scheduling.jsx. The agent suggests slots ranked by fit; the human books.
// Data via props.
import * as React from "react";
import { useState } from "react";
import { Icon } from "../icon";
import { Btn } from "../aurora-ui";
import type { SchedulingData } from "../types";

const scoreTone = (v: number) => (v >= 0.8 ? "var(--ok)" : v >= 0.6 ? "var(--warn)" : "var(--danger)");

export function Scheduling({ data, onBook }: { data: SchedulingData; onBook?: (slotIndex: number) => void }) {
  const s = data;
  const [picked, setPicked] = useState(Math.max(0, s.slots.findIndex((x) => x.selected)));
  const [booked, setBooked] = useState(false);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", height: "100%", minHeight: 0 }}>
      <div style={{ overflowY: "auto", padding: "24px 28px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
          <div><h1 style={{ margin: 0, fontSize: "var(--fs-2xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>Schedule interview</h1>
            <p style={{ margin: "4px 0 0", color: "var(--ink-2)", fontSize: "var(--fs-sm)" }}>{s.round} · {s.candidate} · {s.dur} min · {s.participants.length} participants</p></div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} style={{ transform: "rotate(180deg)" }} /></button>
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>{s.weekLabel}</span>
            <button style={{ width: 32, height: 32, borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink-2)", display: "grid", placeItems: "center", cursor: "pointer" }}><Icon name="chevR" size={15} /></button>
          </div>
        </div>

        <div style={{ borderRadius: "var(--r-xl)", border: "1px solid var(--line)", background: "var(--surface)", overflow: "hidden", boxShadow: "var(--e1)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", borderBottom: "1px solid var(--line)" }}>
            <div></div>
            {s.week.map((d) => <div key={d} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 700, borderLeft: "1px solid var(--line)" }}>{d}</div>)}
          </div>
          {s.hours.map((h, hi) => (
            <div key={h} style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", borderTop: hi ? "1px solid var(--line)" : "none", minHeight: 46 }}>
              <div style={{ padding: "4px 8px", fontSize: 10.5, color: "var(--ink-3)", textAlign: "right" }} className="mono">{h}{hi < 3 ? "a" : "p"}</div>
              {s.week.map((day) => {
                const busyHere = Object.entries(s.busy).filter(([, slots]) => (slots as [string, number, number][]).some(([d, a, b]) => d === day && hi >= a && hi < b));
                return (
                  <div key={day} style={{ borderLeft: "1px solid var(--line)", padding: 2, position: "relative" }}>
                    {busyHere.length > 0 && <div style={{ position: "absolute", inset: 2, borderRadius: 5, background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 4px, transparent 4px, transparent 8px)", border: "1px solid var(--line)" }} title={busyHere.map((b) => b[0]).join(", ") + " busy"} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 18, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--ink-2)" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: "repeating-linear-gradient(45deg, var(--surface-3), var(--surface-3) 3px, transparent 3px, transparent 6px)", border: "1px solid var(--line)" }} /> Busy</span>
          <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12, color: "var(--ink-2)" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--ai-tint)", border: "1px solid var(--ai)" }} /> AI-proposed slot</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {s.participants.map((p) => <span key={p.who} title={p.who} className="mono" style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, background: p.role === "Candidate" ? "linear-gradient(135deg, var(--brand), var(--ai))" : "var(--surface-3)", color: p.role === "Candidate" ? "white" : "var(--ink-2)", border: "1px solid var(--line)" }}>{p.ini}</span>)}
            <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{s.participants.length} participants</span>
          </div>
        </div>
      </div>

      <aside style={{ borderLeft: "1px solid var(--line)", overflowY: "auto", padding: "22px 18px", background: "color-mix(in oklab, var(--surface) 50%, transparent)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}><Icon name="sparkles" size={16} style={{ color: "var(--ai)" }} /><h2 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 700 }}>AI-proposed slots</h2></div>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45 }}>The <b style={{ color: "var(--ai-ink)" }}>scheduling</b> agent ranked these by availability and preferences. It suggests, <b>you book</b>.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {s.slots.map((sl, i) => {
            const on = picked === i;
            return (
              <button key={i} onClick={() => setPicked(i)} style={{ textAlign: "left", padding: 14, borderRadius: "var(--r-lg)", cursor: "pointer", border: "1.5px solid", borderColor: on ? "var(--ai)" : "var(--line)", background: on ? "var(--ai-tint)" : "var(--surface)", transition: "all var(--t-fast)", position: "relative" }}>
                {i === 0 && <span style={{ position: "absolute", top: -8, right: 12, fontSize: 9.5, fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--on-ai)", background: "var(--ai)", padding: "2px 8px", borderRadius: 99 }}>Best</span>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ fontWeight: 700, fontSize: "var(--fs-sm)" }}>{sl.day}</div><div style={{ fontSize: 12, color: "var(--ink-2)" }}>{sl.time} · {s.dur}m</div></div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: scoreTone(sl.score) }}>{sl.score.toFixed(2)}</div>
                    <div style={{ fontSize: 9, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>fit</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 9 }}>
                  <Icon name={sl.all ? "check" : "flag"} size={12} style={{ color: sl.all ? "var(--ok)" : "var(--warn)" }} />
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>{sl.note}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: "var(--r-lg)", background: picked === 0 ? "var(--ok-tint)" : "var(--warn-tint)", border: "1px solid color-mix(in oklab, " + (picked === 0 ? "var(--ok)" : "var(--warn)") + " 26%, transparent)" }}>
          <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.45, display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Icon name={picked === 0 ? "check" : "flag"} size={14} style={{ color: picked === 0 ? "var(--ok)" : "var(--warn)", flexShrink: 0, marginTop: 1 }} />
            {picked === 0 ? "The agent is confident in this slot (>= 0.80, all available). Safe to book." : "Below the agent's confidence threshold, it would defer to you here. Confirm before booking."}
          </div>
        </div>

        {booked ? (
          <div style={{ marginTop: 14, padding: "13px 16px", borderRadius: "var(--r-lg)", background: "var(--ok-tint)", display: "flex", gap: 10, alignItems: "center", animation: "pop .3s var(--ease-spring)" }}>
            <Icon name="check" size={18} style={{ color: "var(--ok)" }} /><span style={{ fontSize: "var(--fs-sm)", fontWeight: 600 }}>Booked · invites sent to {s.participants.length}.</span>
          </div>
        ) : (
          <Btn variant="primary" icon="calendar" onClick={() => { setBooked(true); onBook?.(picked); }} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>Book {s.slots[picked].time}, {s.slots[picked].day.split(" ").slice(1).join(" ")}</Btn>
        )}
      </aside>
    </div>
  );
}
