"use client";
// app/(admin)/admin/support/page.tsx, super-admin support ticket queue.
import { StatusBadge, Card, Button } from "@/components/aurora";
const TICKETS = [
  ["#4821", "Northwind Talent", "SSO metadata question", "review"],
  ["#4830", "Helios Robotics", "Bulk import column mapping", "open"],
  ["#4835", "Atlas Health", "Feature request: Lever import", "draft"],
] as const;
export default function PlatformSupportPage() {
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Support queue</h1><p className="mt-1 text-ink-2">Tickets across all tenants.</p></header>
      <Card material="flat" className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-3"><tr><th className="p-3">Ticket</th><th className="p-3">Tenant</th><th className="p-3">Subject</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {TICKETS.map(([id, tenant, subj, s]) => (
              <tr key={id} className="border-b border-line last:border-0">
                <td className="p-3 font-mono tabular-nums">{id}</td><td className="p-3">{tenant}</td><td className="p-3 text-ink-2">{subj}</td>
                <td className="p-3"><StatusBadge status={s as "review" | "open" | "draft"} icon={null} /></td>
                <td className="p-3 text-right"><Button variant="soft" size="sm">Open</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
