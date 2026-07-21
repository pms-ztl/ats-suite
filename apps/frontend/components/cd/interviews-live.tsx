"use client";
// components/cd/interviews-live.tsx
// Wires the verbatim CD Interviews to the gateway. The list (listInterviews) is
// live, with candidate names resolved via listCandidates and roles via the
// requisition titles. The "Schedule interview" button opens a real create flow:
// pick a candidate + a requisition -> load that requisition's configured rounds ->
// choose a round + time, then POST to interview-service (createInterview) and
// refresh. (A candidate is not bound to a single requisition - the link is the
// Application - so the requisition is chosen explicitly here.)
import { useState, useEffect, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import { Interviews } from "./screens/Interviews";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import { useData } from "@/lib/use-data";
import { listInterviews, listRequisitions, listCandidates, listRounds, createInterview, type RoundLite } from "@/lib/api";
import type { Interview as GwInterview, Requisition, Candidate, InterviewStatus } from "@/lib/types";
import type { InterviewRow, IVStatusKey, IVTypeMeta, IVStatusMeta } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

const STATUS: Record<InterviewStatus, IVStatusKey> = {
  SCHEDULED: "scheduled", CONFIRMED: "scheduled", IN_PROGRESS: "scheduled", RESCHEDULED: "scheduled",
  COMPLETED: "completed", CANCELLED: "completed", NO_SHOW: "completed",
};
const MODE: Record<string, string> = { VIDEO: "Video", ONSITE: "Onsite", PHONE: "Phone" };
const TYPES: Record<string, IVTypeMeta> = { standard: { label: "Interview", tone: "var(--ai)" } };
const STATUS_META: Record<string, IVStatusMeta> = {
  scheduled: { label: "Scheduled", tone: "var(--info)", bg: "var(--info-tint)", icon: "calendar" },
  awaiting: { label: "Feedback due", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  completed: { label: "Completed", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "check" },
};
function whenLabel(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
const inputStyle: CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "var(--r)", border: "1px solid var(--line-2)", background: "var(--surface)", color: "var(--ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 6, display: "block" };

export function InterviewsLive() {
  const ivs = useData<GwInterview[]>(listInterviews);
  const reqs = useData<Requisition[]>(listRequisitions);
  const cands = useData<Candidate[]>(listCandidates);
  const titles = reqTitleMap(reqs.data);
  const candById = new Map((cands.data ?? []).map((c) => [c.id, c]));
  const [scheduling, setScheduling] = useState(false);

  // Arriving from a candidate's profile ("All feedback") scopes the whole list
  // (not just one auto-opened row, unlike screening's verdict panel — a candidate
  // can have several rounds) to that candidate's interviews only. No param -> the
  // normal, unfiltered /interviews page.
  const filterCandidateId = useSearchParams().get("candidateId") ?? undefined;
  const scopedIvs = filterCandidateId ? (ivs.data ?? []).filter((iv) => iv.candidateId === filterCandidateId) : (ivs.data ?? []);

  const interviews: InterviewRow[] = scopedIvs.map((iv) => {
    const name = candById.get(iv.candidateId)?.name ?? iv.candidateId;
    return {
      id: iv.id, ini: initials(name), name, role: titles[iv.requisitionId] ?? "",
      candidateId: iv.candidateId,
      reqId: iv.requisitionId, round: iv.round, type: "standard",
      when: whenLabel(iv.startsAt), dur: iv.durationMins, mode: MODE[iv.mode] ?? iv.mode,
      panel: iv.panel ?? [], status: STATUS[iv.status] ?? "scheduled",
    };
  });

  // "Next 7 days" pulse cells from the raw startsAt/durationMins: one cell per
  // day starting today, n = interviews that day, sub = total hours when > 0.
  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const today = new Date();
  const weekAhead = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const onDay = scopedIvs.filter((iv) => {
      const d = new Date(iv.startsAt);
      return !isNaN(d.getTime()) && dayKey(d) === dayKey(day);
    });
    const hours = onDay.reduce((s, iv) => s + (iv.durationMins || 0), 0) / 60;
    return {
      label: i === 0 ? "Today" : day.toLocaleDateString(undefined, { weekday: "short" }),
      n: onDay.length,
      sub: hours > 0 ? `${parseFloat(hours.toFixed(1))}h` : undefined,
    };
  });

  // Interview density: one {date,n} per calendar day across the loaded interviews'
  // span (clamped to the last ~8 weeks of that span), n = count that local day.
  // CalendarHeat renders its own empty state if there is < 2 days of real data.
  const isoDay = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const perDay = new Map<string, number>();
  for (const iv of scopedIvs) {
    const d = new Date(iv.startsAt);
    if (isNaN(d.getTime())) continue;
    const key = isoDay(d);
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  const densityDays = Array.from(perDay.entries())
    .map(([date, n]) => ({ date, n }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(-56); // ~8 weeks of dated buckets, oldest-first

  return (
    <>
      <Interviews data={{ interviews, types: TYPES, statusMeta: STATUS_META }} weekAhead={weekAhead} densityDays={densityDays} onSchedule={() => setScheduling(true)} />
      {scheduling && (
        <ScheduleModal
          candidates={cands.data ?? []}
          requisitions={reqs.data ?? []}
          onClose={() => setScheduling(false)}
          onScheduled={() => { setScheduling(false); ivs.reload(); }}
        />
      )}
    </>
  );
}

function ScheduleModal({ candidates, requisitions, onClose, onScheduled }: {
  candidates: Candidate[]; requisitions: Requisition[]; onClose: () => void; onScheduled: () => void;
}) {
  const [candidateId, setCandidateId] = useState("");
  const [requisitionId, setRequisitionId] = useState("");
  const [rounds, setRounds] = useState<RoundLite[]>([]);
  const [roundId, setRoundId] = useState("");
  const [when, setWhen] = useState("");
  const [dur, setDur] = useState(60);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true; // also guards out-of-order responses on quick requisition switches
    setRoundId(""); setRounds([]);
    if (requisitionId) {
      listRounds(requisitionId)
        .then((r) => { if (!alive) return; setRounds(r); if (r[0]) { setRoundId(r[0].id); setDur(r[0].durationMinutes || 60); } })
        .catch(() => { if (alive) setRounds([]); });
    }
    return () => { alive = false; };
  }, [requisitionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (busy) return;
    if (!candidateId || !requisitionId) { setErr("Pick both a candidate and a requisition."); return; }
    setBusy(true); setErr("");
    const round = rounds.find((r) => r.id === roundId);
    try {
      await createInterview({
        requisitionId, candidateId,
        stage: round?.name ?? "Interview", roundId: roundId || undefined, type: round?.interviewType,
        scheduledAt: when ? new Date(when).toISOString() : undefined, duration: dur || 60,
      });
      onScheduled();
    } catch { setErr("Could not schedule the interview. Please try again."); setBusy(false); }
  };

  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 24, background: "color-mix(in oklab, var(--bg-deep) 55%, transparent)", animation: "fadein .2s" }}>
      <div style={{ width: "min(480px, 96vw)", borderRadius: "var(--r-2xl)", background: "var(--surface)", border: "1px solid var(--line)", boxShadow: "var(--e3)", padding: 24, animation: "rise .25s var(--ease-out)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: "var(--fs-xl)", fontWeight: 700, letterSpacing: "-0.02em" }}>Schedule interview</h2>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 99, border: "1px solid var(--line)", background: "var(--surface-2)", color: "var(--ink-2)", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="x" size={16} /></button>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: "var(--fs-sm)", color: "var(--ink-2)" }}>Pick a candidate and requisition, then a round from its interview loop.</p>

        <label style={labelStyle}>Candidate</label>
        <select value={candidateId} onChange={(e) => setCandidateId(e.target.value)} style={{ ...inputStyle, cursor: "pointer", marginBottom: 14 }}>
          <option value="">Select a candidate...</option>
          {candidates.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <label style={labelStyle}>Requisition</label>
        <select value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)} style={{ ...inputStyle, cursor: "pointer", marginBottom: 14 }}>
          <option value="">Select a requisition...</option>
          {requisitions.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>

        <label style={labelStyle}>Round{requisitionId ? (rounds.length ? "" : " (none configured - a generic interview is created)") : ""}</label>
        <select value={roundId} onChange={(e) => { setRoundId(e.target.value); const r = rounds.find((x) => x.id === e.target.value); if (r) setDur(r.durationMinutes || 60); }} disabled={!rounds.length}
          style={{ ...inputStyle, cursor: rounds.length ? "pointer" : "not-allowed", marginBottom: 14, opacity: rounds.length ? 1 : 0.6 }}>
          {rounds.length ? rounds.map((r) => <option key={r.id} value={r.id}>{r.order}. {r.name} ({r.durationMinutes}m)</option>) : <option value="">{requisitionId ? "No rounds configured" : "Select a requisition first"}</option>}
        </select>

        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Date &amp; time</label>
            <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ width: 110 }}>
            <label style={labelStyle}>Duration</label>
            <input type="number" min={15} step={15} value={dur} onChange={(e) => setDur(Math.max(15, Number(e.target.value) || 60))} className="mono" style={inputStyle} />
          </div>
        </div>

        {err && <div style={{ marginBottom: 14, fontSize: 12.5, color: "var(--danger)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="flag" size={14} />{err}</div>}

        <div style={{ display: "flex", gap: 9, justifyContent: "flex-end" }}>
          <Btn variant="soft" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="calendar" onClick={submit}>{busy ? "Scheduling..." : "Schedule"}</Btn>
        </div>
      </div>
    </div>
  );
}
