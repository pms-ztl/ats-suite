"use client";
// app/(portal)/transparency/page.tsx, AI transparency notice (ethical-AI first).
import { AIChip, Card } from "@/components/aurora";
export default function TransparencyPage() {
  return (
    <div className="mx-auto w-full max-w-[680px] p-6">
      <header className="mb-5 flex items-center gap-2"><h1 className="text-2xl font-extrabold tracking-tight">How we use AI</h1><AIChip>assistive</AIChip></header>
      <Card material="clay" className="rounded-2xl p-6 text-sm leading-relaxed text-ink-2">
        <p className="text-base font-semibold text-ink">AI is assistive. A human decides.</p>
        <p className="mt-3">We use AI to help our team read and organize applications faster. It scores how well your experience matches a role and shows the evidence behind that score.</p>
        <p className="mt-3">It never makes the decision. Every advance, interview, and offer is made by a person on our team.</p>
        <p className="mt-3">You can ask how a decision about your application was made, and you can <a href="/appeal" className="font-semibold text-brand-ink">request a human review</a> at any time.</p>
      </Card>
    </div>
  );
}
