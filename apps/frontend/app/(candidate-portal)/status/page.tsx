"use client";
// app/(portal)/status/page.tsx, friendly candidate status page.
import { Card } from "@/components/aurora";
import type { ApplicationStage } from "@/lib/types";

const STEPS: { stage: ApplicationStage; label: string }[] = [
  { stage: "APPLIED", label: "Applied" },
  { stage: "SCREENED", label: "Under review" },
  { stage: "INTERVIEW", label: "Interview" },
  { stage: "OFFER", label: "Decision" },
];
const current: ApplicationStage = "SCREENED";

export default function StatusPage() {
  const idx = STEPS.findIndex((s) => s.stage === current);
  return (
    <div className="mx-auto w-full max-w-[620px] p-6">
      <header className="mb-6"><h1 className="text-2xl font-extrabold tracking-tight">Your application</h1><p className="mt-1 text-ink-2">Senior Backend Engineer · Northwind Talent</p></header>
      <Card material="clay" className="rounded-2xl p-6">
        <ol className="flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <li key={s.stage} className="flex items-center gap-3">
              <span className={"grid size-7 place-items-center rounded-full text-xs font-bold " + (i < idx ? "bg-ok text-white" : i === idx ? "bg-brand text-white" : "bg-surface-3 text-ink-3")}>{i < idx ? "✓" : i + 1}</span>
              <span className={i <= idx ? "font-semibold" : "text-ink-3"}>{s.label}</span>
              {i === idx && <span className="ml-auto rounded-pill bg-brand-tint px-2 py-0.5 text-xs font-bold text-brand-ink">In progress</span>}
            </li>
          ))}
        </ol>
      </Card>
      <p className="mt-4 text-center text-sm text-ink-3">Questions about a decision? You can <a href="/appeal" className="font-semibold text-brand-ink">request a human review</a>.</p>
    </div>
  );
}
