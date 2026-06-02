"use client";
// app/(admin)/admin/plan-requests/page.tsx, operator review of tenant plan-change requests.
import { Card, Button } from "@/components/aurora";
import type { Plan } from "@/lib/types";
const REQS: { id: string; tenant: string; from: Plan; to: Plan; reason: string }[] = [
  { id: "p1", tenant: "Helios Robotics", from: "STARTER", to: "PROFESSIONAL", reason: "Onboarding 6 recruiters, need custom fields and the API." },
  { id: "p2", tenant: "Atlas Health", from: "PROFESSIONAL", to: "ENTERPRISE", reason: "SSO and a DPA review required by security." },
];
export default function PlanRequestsPage() {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Plan requests</h1><p className="mt-1 text-ink-2">Tenant upgrade requests awaiting your review.</p></header>
      <div className="flex flex-col gap-3">
        {REQS.map((r) => (
          <Card key={r.id} material="flat" className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center gap-2">
              <b>{r.tenant}</b>
              <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{r.from}</span>→
              <span className="rounded-pill bg-brand-tint px-2 py-0.5 text-xs font-semibold text-brand-ink">{r.to}</span>
            </div>
            <p className="mt-2 text-sm text-ink-2">{r.reason}</p>
            <div className="mt-3 flex gap-2"><Button variant="danger" size="sm">Deny</Button><Button variant="primary" size="sm">Approve upgrade</Button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
