"use client";
// components/cd/requisitions-live.tsx
// Wires the verbatim CD Requisitions list (./screens/Requisitions) to the gateway:
// listRequisitions() -> ReqListData. The list reads rows from props directly, so no
// load gate is needed. Gateway reqs carry no owner, so the recruiter shows as
// "Unassigned"; everything else (title, dept, status, salary band, counts) is live.
import { useRouter } from "next/navigation";
import { Requisitions } from "./screens/Requisitions";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { listRequisitions } from "@/lib/api";
import type { Requisition } from "@/lib/types";
import type { ReqRow, ReqStatusKey, ReqStatusMeta } from "./types";

const STATUS_META: Record<ReqStatusKey, ReqStatusMeta> = {
  OPEN: { label: "Open", tone: "var(--ok)", bg: "var(--ok-tint)", icon: "dot" },
  DRAFT: { label: "Draft", tone: "var(--ink-3)", bg: "var(--surface-3)", icon: "dot" },
  ON_HOLD: { label: "On hold", tone: "var(--warn)", bg: "var(--warn-tint)", icon: "clock" },
  FILLED: { label: "Filled", tone: "var(--brand)", bg: "var(--brand-tint)", icon: "check" },
  CLOSED: { label: "Closed", tone: "var(--ink-2)", bg: "var(--surface-3)", icon: "x" },
  CANCELLED: { label: "Cancelled", tone: "var(--danger)", bg: "var(--danger-tint)", icon: "x" },
};

function fmtDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function toRow(r: Requisition): ReqRow {
  return {
    id: r.id,
    title: r.title,
    dept: r.department || "",
    loc: r.location || "",
    status: r.status as ReqStatusKey,
    min: r.salaryMin,
    max: r.salaryMax,
    cands: r.candidateCount,
    head: r.openings ?? 1,
    rec: "Unassigned",
    recI: "—",
    created: fmtDate(r.createdAt),
  };
}

export function RequisitionsLive() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const reqs = useData<Requisition[]>(listRequisitions);
  const rows = (reqs.data ?? []).map(toRow);

  return (
    <Requisitions
      data={{ rows, statusMeta: STATUS_META, workspaceName: user?.tenant?.name ?? "your workspace" }}
      onCreate={() => router.push("/requisitions/new")}
      onOpen={(id) => router.push(`/requisitions/${id}`)}
    />
  );
}
