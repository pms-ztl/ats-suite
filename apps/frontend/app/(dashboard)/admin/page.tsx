"use client";
// app/(admin)/admin/page.tsx, tenant admin portal home.
import { Card, Button } from "@/components/aurora";
const KPIS = [["Members", "12"], ["Open reqs", "38"], ["This month's hires", "9"], ["Plan", "PROFESSIONAL"]];
export default function AdminHomePage() {
  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Admin</h1><p className="mt-1 text-ink-2">Manage your workspace, team, and audit trail.</p></div>
        <a href="/admin/audit"><Button variant="soft" size="sm">View audit log</Button></a>
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map(([l, v]) => (
          <Card key={l} material="flat" className="rounded-xl border border-line p-4">
            <div className="text-xs font-semibold text-ink-2">{l}</div>
            <div className="mt-2 font-mono text-2xl font-extrabold tabular-nums">{v}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
