"use client";
// app/(dashboard)/onboarding/page.tsx, candidate onboarding configuration.
import { Card, Button } from "@/components/aurora";
function Group({ title, items }: { title: string; items: [string, boolean][] }) {
  return (
    <Card material="flat" className="rounded-2xl border border-line p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-3">{title}</h2>
      {items.map(([label, on]) => (
        <label key={label} className="flex items-center justify-between border-t border-line py-2.5 text-sm first:border-0">
          <span>{label}</span><input type="checkbox" defaultChecked={on} className="size-5 accent-brand" />
        </label>
      ))}
    </Card>
  );
}
export default function OnboardingConfigPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-3"><h1 className="text-2xl font-extrabold tracking-tight">Onboarding</h1><p className="mt-1 text-ink-2">Configure what happens once an offer is accepted. You stay in control of every step.</p></div>
      <Group title="Background checks" items={[["Identity & right to work", true], ["Employment history", true], ["Criminal record (where lawful)", false]]} />
      <Group title="Document requests" items={[["Signed offer letter", true], ["Tax & banking forms", true], ["Emergency contacts", false]]} />
      <Group title="First-day tasks" items={[["Set up accounts & access", true], ["Meet your buddy", true], ["Team welcome lunch", false]]} />
      <div className="md:col-span-3"><Button variant="primary">Save &amp; continue</Button></div>
    </div>
  );
}
