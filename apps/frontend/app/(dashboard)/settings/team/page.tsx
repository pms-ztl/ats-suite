"use client";
// app/(dashboard)/settings/team/page.tsx, Team & roles permission matrix.
// GET /api/settings/team. UserRole enum drives the columns.
import { Panel, Button } from "../_parts";
import { useData } from "@/lib/use-data";
import { Skeleton, ErrorState, EmptyState } from "@/components/aurora";
import type { UserRole } from "@/lib/types";

interface Member { id: string; name: string; email: string; role: UserRole; }
// GET /api/users  (workspace members)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
async function getTeam(): Promise<Member[]> {
  let t: string | null = null;
  try { t = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch {}
  const r = await fetch(`${API_BASE}/users`, { credentials: "include", headers: { ...(t ? { Authorization: `Bearer ${t}` } : {}) } });
  if (!r.ok) throw new Error(`GET /users -> ${r.status}`);
  const res: any = await r.json();
  const rows = Array.isArray(res) ? res : res?.data ?? res?.users ?? res?.members ?? [];
  return rows.map((u: any): Member => ({
    id: String(u.id ?? u.userId ?? ""),
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Member",
    email: u.email ?? "",
    role: (u.role ?? "RECRUITER") as UserRole,
  }));
}

const ROLES: UserRole[] = ["RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "ADMIN", "COMPLIANCE_OFFICER"];
const CAPS = ["View candidates", "Advance / reject", "Manage requisitions", "Approve offers", "Billing & settings"];
const MATRIX: Record<string, boolean[]> = {
  RECRUITER: [true, true, true, false, false],
  HIRING_MANAGER: [true, true, false, true, false],
  INTERVIEWER: [true, false, false, false, false],
  ADMIN: [true, true, true, true, true],
  COMPLIANCE_OFFICER: [true, false, false, false, false],
};

export default function TeamSettingsPage() {
  const { data, loading, error, reload } = useData<Member[]>(getTeam);
  return (
    <>
      <Panel title="Members" desc="People in this workspace and their role." action={<Button variant="primary" size="sm">Invite teammate</Button>}>
        {loading && <Skeleton className="h-24 rounded-lg" />}
        {error && <ErrorState title="Could not load the team" body="The team service did not respond." code="GET /api/settings/team" onRetry={reload} />}
        {data && data.length === 0 && <EmptyState title="No teammates yet" body="Invite people to collaborate on hiring." actions={<Button variant="primary">Invite teammate</Button>} />}
        {data && data.length > 0 && (
          <ul className="divide-y divide-line">
            {data.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5">
                <span><b className="text-sm">{m.name}</b><span className="block text-xs text-ink-3">{m.email}</span></span>
                <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{m.role}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Permission matrix" desc="What each role can do. Roles use the verbatim UserRole enum.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink-3"><tr><th className="p-2">Capability</th>{ROLES.map((r) => <th key={r} className="p-2 text-center">{r}</th>)}</tr></thead>
            <tbody>
              {CAPS.map((cap, i) => (
                <tr key={cap} className="border-t border-line">
                  <td className="p-2 font-medium">{cap}</td>
                  {ROLES.map((r) => <td key={r} className="p-2 text-center">{MATRIX[r][i] ? <span className="text-ok">Yes</span> : <span className="text-ink-3">,</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
