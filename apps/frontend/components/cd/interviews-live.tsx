"use client";
// components/cd/interviews-live.tsx
// Wires the verbatim CD Interviews to the gateway: listInterviews() + listRequisitions()
// -> InterviewsData (list rows + type/status meta). The per-interview AI intelligence +
// panelist scorecards are not exposed by the gateway, so `detail` is omitted; the list,
// types, modes and statuses are live.
import { Interviews } from "./screens/Interviews";
import { useData } from "@/lib/use-data";
import { listInterviews, listRequisitions } from "@/lib/api";
import type { Interview as GwInterview, Requisition, InterviewStatus } from "@/lib/types";
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

export function InterviewsLive() {
  const ivs = useData<GwInterview[]>(listInterviews);
  const reqs = useData<Requisition[]>(listRequisitions);
  const titles = reqTitleMap(reqs.data);

  const interviews: InterviewRow[] = (ivs.data ?? []).map((iv) => ({
    id: iv.id,
    ini: initials(iv.candidateId),
    name: iv.candidateId,
    role: titles[iv.requisitionId] ?? "",
    reqId: iv.requisitionId,
    round: iv.round,
    type: "standard",
    when: whenLabel(iv.startsAt),
    dur: iv.durationMins,
    mode: MODE[iv.mode] ?? iv.mode,
    panel: iv.panel ?? [],
    status: STATUS[iv.status] ?? "scheduled",
  }));

  return <Interviews data={{ interviews, types: TYPES, statusMeta: STATUS_META }} />;
}
