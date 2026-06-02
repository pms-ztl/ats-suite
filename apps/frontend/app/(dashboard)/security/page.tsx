"use client";
// app/(dashboard)/security/page.tsx, security posture & audit summary.
import { StatusBadge, Card } from "@/components/aurora";
const CHECKS = [["SOC 2 Type II", "pass"], ["Data encrypted at rest", "pass"], ["MFA enforced", "pass"], ["SSO configured", "pass"], ["Penetration test (annual)", "review"]] as const;
export default function SecurityPage() {
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Security</h1><p className="mt-1 text-ink-2">Your workspace's security posture at a glance.</p></header>
      <Card material="flat" className="rounded-2xl border border-line p-2">
        {CHECKS.map(([label, s]) => (
          <div key={label} className="flex items-center justify-between border-b border-line px-3 py-3 text-sm last:border-0">
            <span className="font-medium">{label}</span>
            <StatusBadge status={s as "pass" | "review"} icon={null} />
          </div>
        ))}
      </Card>
    </div>
  );
}
