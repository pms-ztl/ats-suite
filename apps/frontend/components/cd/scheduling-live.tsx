"use client";
// components/cd/scheduling-live.tsx
// Fully-live scheduling workspace. Everything on this page is real data:
// candidates + requisitions feed the booking form, the round list comes from the
// requisition's configured interview loop (listRounds), booking persists via
// createInterview (POST /api/interviews), and the week-load panel is computed
// from real Interview.startsAt rows. There is NO illustrative busy-grid and no
// fabricated AI slot scores: AI slot proposals require a connected calendar, and
// the page says so honestly instead of faking them.
import { useState, useEffect, type CSSProperties } from "react";
import { SectionCard, Pill, Reveal } from "@/components/aurora-kit";
import { Btn } from "./aurora-ui";
import { Icon } from "./icon";
import { Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { EmptyChart } from "@/components/shared/charts";
import { FlowRibbon, SonarSweep } from "@/components/shared/ribbon";
import { useData } from "@/lib/use-data";
import { listCandidates, listRequisitions, listInterviews, listRounds, createInterview, type RoundLite } from "@/lib/api";
import type { Candidate, Requisition, Interview } from "@/lib/types";
import { toast } from "sonner";

const inputStyle: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: "var(--r)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none" };
const labelStyle: CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--c-ink-3)", margin: "14px 0 6px", display: "block" };

function whenLabel(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// "in 45m" / "in 7h" / "in 2d" from a real ms-until-start delta.
function untilLabel(ms: number): string {
  const h = ms / 3_600_000;
  if (h < 1) return `in ${Math.max(1, Math.round(ms / 60_000))}m`;
  if (h < 48) return `in ${Math.round(h)}h`;
  return `in ${Math.round(h / 24)}d`;
}

export function SchedulingLive() {
  const cands = useData<Candidate[]>(() => listCandidates());
  const reqs = useData<Requisition[]>(listRequisitions);
  const interviews = useData<Interview[]>(listInterviews);

  const [candidateId, setCandidateId] = useState("");
  const [requisitionId, setRequisitionId] = useState("");
  const [rounds, setRounds] = useState<RoundLite[]>([]);
  const [roundId, setRoundId] = useState("");
  // Default the slot to the next weekday at 10:00 so booking is two picks + a click.
  const [when, setWhen] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [dur, setDur] = useState(60);
  const [busy, setBusy] = useState(false);

  // Real interview loop for the chosen requisition.
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

  // Real per-day load for the coming 7 days (Interview.startsAt + durations).
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const weekDays: { day: string; n: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfDay); d.setDate(d.getDate() + i);
    const next = new Date(d); next.setDate(next.getDate() + 1);
    const n = (interviews.data ?? []).filter((iv) => {
      if (!iv.startsAt) return false;
      const t = new Date(iv.startsAt).getTime();
      return t >= d.getTime() && t < next.getTime();
    }).length;
    weekDays.push({ day: i === 0 ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" }), n });
  }
  const weekTotal = weekDays.reduce((s, w) => s + w.n, 0);
  const upcoming = (interviews.data ?? [])
    .filter((iv) => (iv.status === "SCHEDULED" || iv.status === "CONFIRMED" || iv.status === "RESCHEDULED") && iv.startsAt && new Date(iv.startsAt).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 6);
  const candById = new Map((cands.data ?? []).map((c) => [c.id, c.name]));

  // Radar blips: the same real upcoming interviews, placed at their true distance
  // into the next 7 days (at = hoursUntil / 168, clamped 0..1).
  const nowMs = Date.now();
  const radarWindowMs = 7 * 24 * 3_600_000;
  const radar = (interviews.data ?? [])
    .filter((iv) => (iv.status === "SCHEDULED" || iv.status === "CONFIRMED" || iv.status === "RESCHEDULED") && iv.startsAt)
    .map((iv) => ({ iv, t: new Date(iv.startsAt).getTime() }))
    .filter(({ t }) => !isNaN(t) && t >= nowMs && t <= nowMs + radarWindowMs)
    .sort((a, b) => a.t - b.t)
    .slice(0, 12)
    .map(({ iv, t }) => ({
      label: candById.get(iv.candidateId) ?? "Candidate",
      at: Math.max(0, Math.min(1, (t - nowMs) / radarWindowMs)),
      sub: untilLabel(t - nowMs),
    }));

  const onBook = async () => {
    if (busy) return;
    if (!candidateId || !requisitionId) { toast.error("Pick both a candidate and a requisition."); return; }
    if (!when) { toast.error("Pick a date and time."); return; }
    setBusy(true);
    const round = rounds.find((r) => r.id === roundId);
    try {
      await createInterview({
        requisitionId, candidateId,
        stage: round?.name ?? "Interview", roundId: roundId || undefined, type: round?.interviewType,
        scheduledAt: new Date(when).toISOString(), duration: dur || 60,
      });
      toast.success("Interview scheduled — it is live on the Interviews page.");
      setWhen(""); interviews.reload();
    } catch (e: any) {
      toast.error(e?.message || "Could not schedule the interview.");
    } finally { setBusy(false); }
  };

  const loading = cands.loading || reqs.loading;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Scheduling</h1>
        <p className="mt-1 text-ink-2">Book a real interview against a requisition&apos;s configured loop. AI slot proposals switch on once a Google or Outlook calendar is connected.</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
        <Reveal i={1}><SectionCard title="Book an interview" icon="calendar">
          {loading && <div className="grid gap-2"><Skeleton className="h-10 rounded-[11px]" /><Skeleton className="h-10 rounded-[11px]" /><Skeleton className="h-10 rounded-[11px]" /></div>}
          {!loading && (cands.error || reqs.error) && <ErrorState title="Could not load scheduling data" body="Candidates or requisitions did not respond." code="GET /api/candidates · /api/requisitions" onRetry={() => { cands.reload(); reqs.reload(); }} />}
          {!loading && !cands.error && !reqs.error && (
            <div>
              <label style={{ ...labelStyle, marginTop: 0 }}>Candidate</label>
              <select value={candidateId} onChange={(e) => setCandidateId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select a candidate...</option>
                {(cands.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <label style={labelStyle}>Requisition</label>
              <select value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Select a requisition...</option>
                {(reqs.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>

              <label style={labelStyle}>Round{requisitionId && !rounds.length ? " (none configured · a generic interview is created)" : ""}</label>
              <select value={roundId} onChange={(e) => { setRoundId(e.target.value); const r = rounds.find((x) => x.id === e.target.value); if (r) setDur(r.durationMinutes || 60); }} disabled={!rounds.length}
                style={{ ...inputStyle, cursor: rounds.length ? "pointer" : "not-allowed", opacity: rounds.length ? 1 : 0.6 }}>
                {rounds.length
                  ? rounds.map((r) => <option key={r.id} value={r.id}>{r.order}. {r.name} ({r.durationMinutes}m)</option>)
                  : <option value="">{requisitionId ? "No rounds configured" : "Select a requisition first"}</option>}
              </select>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Date &amp; time</label>
                  <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ width: 110 }}>
                  <label style={labelStyle}>Duration</label>
                  <input type="number" min={15} step={15} value={dur} onChange={(e) => setDur(Math.max(15, Number(e.target.value) || 60))} className="mono" style={inputStyle} />
                </div>
              </div>

              <div style={{ marginTop: 18, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ opacity: candidateId && requisitionId && when ? 1 : 0.55 }}>
                  <Btn variant="primary" icon="calendar" onClick={onBook}>{busy ? "Scheduling..." : "Book interview"}</Btn>
                </span>
                <span style={{ fontSize: 11.5, color: candidateId && requisitionId && when ? "var(--c-ink-3)" : "var(--c-warn)" }}>
                  {candidateId && requisitionId && when
                    ? "Creates a real interview the whole panel can see."
                    : `To book, pick ${[!candidateId && "a candidate", !requisitionId && "a requisition", !when && "a date & time"].filter(Boolean).join(" · ")}.`}
                </span>
              </div>
            </div>
          )}
        </SectionCard></Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal i={2}><SectionCard title="This week's load" icon="chart"
            headRight={weekTotal ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)">{weekTotal} scheduled</Pill> : undefined}>
            {(interviews.loading || interviews.error) && (
              <div style={{ height: 170 }}>
                {interviews.loading && <Skeleton className="h-full rounded-[11px]" />}
                {interviews.error && <EmptyChart label="Interview data unavailable right now." />}
              </div>
            )}
            {interviews.data && (
              <FlowRibbon
                points={weekDays.map((w) => ({ label: w.day, n: w.n }))}
                showShare={false}
                height={190}
                valueLabel={(n) => `${n}`}
                emptyLabel="No interviews booked in the coming week yet."
              />
            )}
          </SectionCard></Reveal>

          <Reveal i={3}><SectionCard title="On the radar" icon="radar"
            headRight={radar.length ? <Pill tone="var(--c-ink-2)" bg="var(--c-surface-2)" style={{ textTransform: "none" }}>{radar.length} in range</Pill> : undefined}>
            {(interviews.loading || interviews.error) && (
              <div style={{ height: 300 }}>
                {interviews.loading && <Skeleton className="h-full rounded-[11px]" />}
                {interviews.error && <EmptyChart label="Interview data unavailable right now." />}
              </div>
            )}
            {interviews.data && (
              <SonarSweep
                items={radar}
                centerLabel={`${radar.length}`}
                centerSub="upcoming"
                rangeLabel="outer ring = 7 days out"
                height={300}
                emptyLabel="No interviews on the 7-day radar yet."
              />
            )}
          </SectionCard></Reveal>

          <Reveal i={4}><SectionCard title="Next up" icon="clock">
            {interviews.loading && <div className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-[11px]" />)}</div>}
            {interviews.data && upcoming.length === 0 && <EmptyState title="Nothing scheduled" body="Booked interviews appear here in start-time order." />}
            {interviews.data && upcoming.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {upcoming.map((iv) => (
                  <a key={iv.id} href="/interviews" style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 11px", borderRadius: "var(--r)", border: "1px solid var(--c-line)", textDecoration: "none", color: "inherit" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, display: "grid", placeItems: "center", background: "var(--c-ai-tint)", color: "var(--c-ai)", flexShrink: 0 }}><Icon name="calendar" size={14} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{candById.get(iv.candidateId) ?? "Candidate"}</div>
                      <div style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>{iv.round} · {iv.durationMins}m</div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: "var(--c-ink-2)", whiteSpace: "nowrap" }}>{whenLabel(iv.startsAt)}</span>
                  </a>
                ))}
              </div>
            )}
          </SectionCard></Reveal>

          <div style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "11px 14px", borderRadius: "var(--r)", background: "var(--c-ai-tint)", border: "1px solid color-mix(in oklab, var(--c-ai) 20%, transparent)", fontSize: 12, color: "var(--c-ink-2)", lineHeight: 1.5 }}>
            <Icon name="sparkles" size={14} style={{ color: "var(--c-ai)", flexShrink: 0, marginTop: 2 }} />
            <span><b style={{ color: "var(--c-ink)" }}>AI slot proposals are off.</b> Once a Google or Outlook calendar is connected, the scheduling agent reads real availability and proposes conflict-free times here. Until then, nothing on this page is simulated.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
