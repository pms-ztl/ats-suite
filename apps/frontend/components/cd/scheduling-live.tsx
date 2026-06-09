"use client";
// components/cd/scheduling-live.tsx
// The week grid, busy blocks and proposed-slot scores are illustrative (the gateway
// exposes no busy-grid / AI-slot-proposal resource). But the candidate, round and
// the BOOK action are REAL: booking a slot persists an interview via createInterview
// (POST /api/interviews), which then shows on the Interviews page.
import { Scheduling } from "./screens/Scheduling";
import { useData } from "@/lib/use-data";
import { listCandidates, listRequisitions, createInterview } from "@/lib/api";
import type { Candidate, Requisition } from "@/lib/types";
import type { SchedulingData } from "./types";
import { toast } from "sonner";

function initials(name: string): string {
  const p = String(name).trim().split(/\s+/).filter(Boolean);
  return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() : "?";
}

export function SchedulingLive() {
  const cands = useData<Candidate[]>(listCandidates);
  const reqs = useData<Requisition[]>(listRequisitions);
  if (cands.loading || reqs.loading) return null;

  const candidate = (cands.data ?? [])[0];
  const req = (reqs.data ?? [])[0];
  const candName = candidate?.name ?? "Candidate";

  const data: SchedulingData = {
    round: req?.title ? `Interview · ${req.title}` : "Technical screen",
    candidate: candName,
    dur: 60,
    weekLabel: "Jun 1 to Jun 5",
    week: ["Mon 1", "Tue 2", "Wed 3", "Thu 4", "Fri 5"],
    hours: ["9", "10", "11", "12", "1", "2", "3", "4"],
    busy: {
      "Avery Chen": [["Mon 1", 0, 2], ["Wed 3", 4, 6]],
      "Sam Okafor": [["Tue 2", 1, 3], ["Thu 4", 5, 7]],
    },
    slots: [
      { day: "Tue Jun 2", time: "2:00 PM", score: 0.92, all: true, note: "All participants free, no conflicts", selected: true },
      { day: "Wed Jun 3", time: "10:00 AM", score: 0.81, all: true, note: "All free; tight against a prior meeting", selected: false },
      { day: "Thu Jun 4", time: "11:00 AM", score: 0.64, all: false, note: "One panelist tentative", selected: false },
    ],
    participants: [
      { who: candName, ini: initials(candName), role: "Candidate" },
      { who: "Avery Chen", ini: "AC", role: "Recruiter" },
      { who: "Sam Okafor", ini: "SO", role: "Interviewer" },
    ],
  };

  const onBook = async (slotIndex: number) => {
    if (!candidate || !req) { toast.error("No candidate or requisition available to schedule."); return; }
    // The proposed slots are illustrative, so book a concrete near-future weekday at 2pm.
    const when = new Date();
    when.setDate(when.getDate() + 2 + Math.max(0, slotIndex));
    when.setHours(14, 0, 0, 0);
    try {
      await createInterview({
        requisitionId: req.id, candidateId: candidate.id, stage: "INTERVIEW",
        type: "TECHNICAL", scheduledAt: when.toISOString(), duration: data.dur,
      });
      toast.success(`Interview scheduled for ${candName} — view it on the Interviews page.`);
    } catch (e: any) {
      toast.error(e?.message || "Could not schedule the interview.");
    }
  };

  return <Scheduling data={data} onBook={onBook} />;
}
