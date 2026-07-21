"use client";
// components/cd/requisitions-live.tsx
// Wires the verbatim CD Requisitions list (./screens/Requisitions) to the gateway:
// listRequisitions() -> ReqListData. The list reads rows from props directly, so no
// load gate is needed. Gateway reqs carry no owner, so the recruiter shows as
// "Unassigned"; everything else (title, dept, status, salary band, counts) is live.
import { useRouter } from "next/navigation";
import { Requisitions } from "./screens/Requisitions";
import { Pill, SectionCard } from "./aurora-kit";
import { HoneyComb } from "@/components/shared/ribbon-ext";
import { useData } from "@/lib/use-data";
import { useCurrentUser } from "@/hooks/use-current-user";
import { listRequisitions } from "@/lib/api";
import { exportToCSV } from "@/lib/export";
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

// Comb order keeps the lifecycle reading open -> draft -> on hold -> filled ->
// closed -> cancelled; the bead tone reuses each status' table-badge color.
const STATUS_ORDER: ReqStatusKey[] = ["OPEN", "DRAFT", "ON_HOLD", "FILLED", "CLOSED", "CANCELLED"];
const STATUS_COMB_COLOR: Record<ReqStatusKey, string> = {
  OPEN: "var(--ok)", DRAFT: "var(--ink-3)", ON_HOLD: "var(--warn)",
  FILLED: "var(--brand)", CLOSED: "var(--ink-2)", CANCELLED: "var(--danger)",
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

  // Real CSV export of exactly the requisitions shown (data in hand — no backend).
  const onExport = () =>
    exportToCSV(
      `requisitions-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Title", "Department", "Location", "Status", "Openings", "Candidates", "Salary min", "Salary max", "Created"],
      rows.map((r) => [r.title, r.dept, r.loc, r.status, r.head, r.cands, r.min ?? "", r.max ?? "", r.created]),
    );

  // "Requisition mix" comb: one hex per real requisition, grouped by status in
  // lifecycle order, colored with the same tone the status badge uses in the
  // table. Empty statuses drop out; HoneyComb renders its own empty state when
  // there are no requisitions at all.
  const statusComb = STATUS_ORDER
    .map((s) => ({ label: STATUS_META[s].label, n: rows.filter((r) => r.status === s).length, color: STATUS_COMB_COLOR[s] }))
    .filter((g) => g.n > 0);

  return (
    <Requisitions
      data={{ rows, statusMeta: STATUS_META, workspaceName: user?.tenant?.name ?? "your workspace" }}
      onExport={onExport}
      onCreate={() => router.push("/requisitions/new")}
      onOpen={(id) => router.push(`/requisitions/${id}`)}
      ribbonSlot={
        <SectionCard title="Requisition mix" icon="grid"
          headRight={<Pill icon="briefcase" style={{ textTransform: "none" }}>every hex = one requisition</Pill>}>
          <HoneyComb
            groups={statusComb}
            valueLabel={(n) => `${n}`}
            emptyLabel="The comb fills in once requisitions are opened." />
        </SectionCard>
      }
    />
  );
}
