"use client";
// components/cd/scheduling-live.tsx
// Mounts the byte-exact CD Scheduling calendar. The gateway exposes no busy-grid
// or AI-slot-proposal resource, so the week, busy blocks and proposed slots are
// the design's example content (the agentic "scheduling" suggestion + book flow
// is the Scheduling screen's own interaction). onBook is a local no-op for now.
import { Scheduling } from "./screens/Scheduling";
import type { SchedulingData } from "./types";

const SCHED_DATA: SchedulingData = {
  round: "Technical screen",
  candidate: "Lena Whitfield",
  dur: 60,
  weekLabel: "Jun 1 to Jun 5",
  week: ["Mon 1", "Tue 2", "Wed 3", "Thu 4", "Fri 5"],
  hours: ["9", "10", "11", "12", "1", "2", "3", "4"],
  busy: {
    "Avery Chen": [["Mon 1", 0, 2], ["Wed 3", 4, 6]],
    "Sam Okafor": [["Tue 2", 1, 3], ["Thu 4", 5, 7]],
    "Lena Whitfield": [["Mon 1", 3, 5]],
  },
  slots: [
    { day: "Tue Jun 2", time: "2:00 PM", score: 0.92, all: true, note: "All participants free, no conflicts", selected: true },
    { day: "Wed Jun 3", time: "10:00 AM", score: 0.81, all: true, note: "All free; tight against a prior meeting", selected: false },
    { day: "Thu Jun 4", time: "11:00 AM", score: 0.64, all: false, note: "One panelist tentative", selected: false },
  ],
  participants: [
    { who: "Lena Whitfield", ini: "LW", role: "Candidate" },
    { who: "Avery Chen", ini: "AC", role: "Recruiter" },
    { who: "Sam Okafor", ini: "SO", role: "Interviewer" },
  ],
};

export function SchedulingLive() {
  return <Scheduling data={SCHED_DATA} />;
}
