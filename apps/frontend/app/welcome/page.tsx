"use client";
// app/(marketing)/page.tsx, flagship landing.
import { AIChip, Card, Button } from "@/components/aurora";
export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto max-w-[980px] px-6 py-20 text-center">
        <AIChip>AI you can trust</AIChip>
        <h1 className="mt-4 text-balance text-5xl font-extrabold tracking-tight md:text-6xl">Your hiring. Reinvented.</h1>
        <p className="mx-auto mt-5 max-w-[46ch] text-lg text-ink-2">TalentFlow is the applicant-tracking platform for the AI era. It screens, drafts, and audits with cited evidence, so every decision is faster, fairer, and made by a human.</p>
        <div className="mt-7 flex justify-center gap-3">
          <a href="/get-started"><Button variant="primary" size="lg">Start free</Button></a>
          <a href="/pricing"><Button variant="soft" size="lg">See pricing</Button></a>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1080px] gap-4 px-6 pb-20 md:grid-cols-3">
        {[["Evidence-backed screening", "Every score cites the résumé."], ["Human-in-the-loop", "AI advises; a person decides."], ["Fairness, built in", "Adverse-impact monitoring against 0.80."]].map(([t, d]) => (
          <Card key={t} material="flat" className="rounded-2xl border border-line p-6">
            <h2 className="text-lg font-bold">{t}</h2><p className="mt-2 text-sm text-ink-2">{d}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
