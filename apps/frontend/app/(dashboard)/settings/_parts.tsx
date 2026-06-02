"use client";
// Shared settings primitives so each settings page stays tiny and consistent.
import { Card, Button } from "@/components/aurora";

export function Panel({ title, desc, children, action }: { title: string; desc?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card material="flat" className="mb-4 rounded-2xl border border-line p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">{title}</h2>
          {desc && <p className="mt-1 text-sm text-ink-3">{desc}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export const input = "h-11 w-full rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring";

export function Toggle({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <label className="flex items-center justify-between border-t border-line py-3 text-sm first:border-0">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={on} className="size-5 accent-brand" />
    </label>
  );
}

export { Button };
