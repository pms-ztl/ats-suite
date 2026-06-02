"use client";
// Shared auth scaffold: an ambient brand panel beside a focused glass card.
import { Card, Button } from "@/components/aurora";

export function AuthShell({ heading, sub, children, foot }: { heading: string; sub?: string; children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ambient brand panel (hidden on small screens) */}
      <aside className="relative hidden overflow-hidden bg-bg-deep lg:block">
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 50% at 30% 30%, var(--brand-tint-2), transparent 60%), radial-gradient(55% 50% at 80% 80%, var(--ai-tint-2), transparent 60%)" }} aria-hidden="true" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Hire with AI you can trust.</h2>
          <p className="mt-2 max-w-[40ch] text-ink-2">Evidence-backed screening, human-in-the-loop decisions, candidate transparency.</p>
        </div>
      </aside>
      {/* focused auth card */}
      <main className="flex items-center justify-center p-6">
        <Card material="glass" className="w-full max-w-[400px] rounded-2xl p-7">
          <h1 className="text-2xl font-extrabold tracking-tight">{heading}</h1>
          {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
          <div className="mt-5">{children}</div>
          {foot && <div className="mt-5 text-center text-sm text-ink-3">{foot}</div>}
        </Card>
      </main>
    </div>
  );
}

export const input = "h-11 w-full rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring";
export function L({ children }: { children: React.ReactNode }) { return <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">{children}</span>; }
export { Button };
