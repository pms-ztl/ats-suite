"use client";
// app/(admin)/admin/audit/page.tsx, tenant audit log (tamper-evident).
import { AIChip, Card, Button, Skeleton, ErrorState, EmptyState } from "@/components/aurora";
import { useData } from "@/lib/use-data";

interface Entry { id: string; actor: string; ai: boolean; action: string; target: string; cat: string; ts: string; }
// GET /api/audit  (tenant audit log)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function getAudit(): Promise<Entry[]> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}/audit`, { credentials: "include", headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
  if (!r.ok) throw new Error(`GET /audit -> ${r.status}`);
  const res: any = await r.json();
  const rows = Array.isArray(res) ? res : res?.data ?? res?.entries ?? res?.logs ?? [];
  return rows.map((e: any, i: number): Entry => ({
    id: String(e.id ?? e.eventId ?? i),
    actor: e.actorName ?? e.actor ?? e.userName ?? e.userId ?? "System",
    ai: Boolean(e.ai ?? e.isAgent ?? e.agent ?? (typeof (e.actor ?? "") === "string" && /agent/i.test(e.actor ?? ""))),
    action: e.action ?? e.event ?? e.type ?? "action",
    target: e.target ?? e.resource ?? e.entity ?? "",
    cat: e.category ?? e.cat ?? e.severity ?? e.type ?? "general",
    ts: e.createdAt ? new Date(e.createdAt).toLocaleString() : (e.ts ?? ""),
  }));
}

export default function AuditPage() {
  const { data, loading, error, reload } = useData<Entry[]>(getAudit);
  return (
    <div className="mx-auto w-full max-w-[1180px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Audit log</h1><p className="mt-1 text-ink-2">A complete, tamper-evident record of every action in this workspace.</p></div>
        <Button variant="primary" size="sm">Export CSV</Button>
      </header>
      {loading && <Skeleton className="h-48 rounded-xl" />}
      {error && <ErrorState title="Could not load the audit log" body="The audit service did not respond." code="GET /api/admin/audit" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No entries yet" body="Actions across the workspace appear here, write-once and cryptographically chained." />}
      {data && data.length > 0 && (
        <Card material="flat" className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3"><tr><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Category</th><th className="p-3 text-right">Time</th></tr></thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0">
                  <td className="p-3">{e.ai ? <AIChip>{e.actor}</AIChip> : <span className="font-semibold">{e.actor}</span>}</td>
                  <td className="p-3 text-ink-2"><b className="text-ink">{e.action}</b> · {e.target}</td>
                  <td className="p-3"><span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{e.cat}</span></td>
                  <td className="p-3 text-right font-mono text-xs tabular-nums text-ink-3">{e.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
