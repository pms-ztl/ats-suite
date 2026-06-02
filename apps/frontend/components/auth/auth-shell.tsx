"use client";
// components/auth/auth-shell.tsx
// Claude Design "Aurora" AuthShell: an ambient brand panel beside a focused
// auth card. Shared by every (auth) route so they all wear the design's
// two-panel sign-in layout. Visual only, the page's own form logic is unchanged.
import * as React from "react";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ambient brand panel (hidden on small screens) */}
      <aside className="relative hidden overflow-hidden bg-bg-deep lg:block" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 50% at 30% 30%, var(--c-brand-tint-2), transparent 60%), radial-gradient(55% 50% at 80% 80%, var(--c-ai-tint-2), transparent 60%)" }}
        />
        <div className="relative flex h-full flex-col justify-end p-12">
          <h2 className="text-3xl font-extrabold tracking-tight">Hire with AI you can trust.</h2>
          <p className="mt-2 max-w-[40ch] text-ink-2">Evidence-backed screening, human-in-the-loop decisions, candidate transparency.</p>
        </div>
      </aside>
      {/* focused auth content */}
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="flex w-full max-w-[440px] flex-col items-center gap-5">{children}</div>
      </main>
    </div>
  );
}
