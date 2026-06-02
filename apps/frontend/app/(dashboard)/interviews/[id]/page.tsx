"use client";
// app/(dashboard)/interviews/[id]/page.tsx, interview detail: panelist feedback +
// AI interview-intelligence summary (advisory).
import { useParams } from "next/navigation";
import { Button, AIChip, Card } from "@/components/aurora";

const FEEDBACK = [
  ["Sam Rivera", "Strong systems design, clear tradeoff reasoning.", "Lean hire"],
  ["Dana Osei", "Solid coding, a little slow on edge cases.", "Hire"],
] as const;

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto w-full max-w-[900px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Interview {id}</h1><p className="mt-1 text-ink-2">Technical loop · panelist feedback and AI summary.</p></header>

      <Card material="clay" className="mb-4 rounded-2xl p-5">
        <div className="mb-2 flex items-center gap-2"><AIChip>interview-intelligence</AIChip></div>
        <p className="text-sm text-ink-2">Panel leans positive: strong on systems design and communication, minor concern on edge-case handling. Suggested follow-up: a short take-home. This summary supports your scorecard, it does not replace it.</p>
      </Card>

      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Panelist feedback</h2>
      <div className="flex flex-col gap-2">
        {FEEDBACK.map(([who, note, rec]) => (
          <Card key={who} material="flat" className="rounded-xl border border-line p-4">
            <div className="flex items-center justify-between"><b className="text-sm">{who}</b><span className="rounded-pill bg-surface-3 px-2 py-0.5 text-xs font-semibold">{rec}</span></div>
            <p className="mt-1 text-sm text-ink-2">{note}</p>
          </Card>
        ))}
      </div>
      <div className="mt-4"><Button variant="primary">Submit scorecard</Button></div>
    </div>
  );
}
