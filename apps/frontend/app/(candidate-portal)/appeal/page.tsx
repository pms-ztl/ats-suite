"use client";
// app/(portal)/appeal/page.tsx, request human review / appeal flow.
import { Card, Button } from "@/components/aurora";
export default function AppealPage() {
  return (
    <div className="mx-auto w-full max-w-[620px] p-6">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Request a human review</h1><p className="mt-1 text-ink-2">If you believe a decision about your application was wrong, a person on our team will look again.</p></header>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <form className="flex flex-col gap-4">
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">Application reference</span><input className="h-11 w-full rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring" placeholder="e.g. APP-48213" /></label>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">What would you like us to reconsider?</span><textarea rows={5} className="w-full rounded border border-line-2 bg-surface p-3 outline-none focus-visible:shadow-ring" /></label>
          {/* POST /api/public/appeal */}
          <Button variant="primary" type="submit">Submit request</Button>
          <p className="text-center text-xs text-ink-3">A human reviews every request. We will reply by email, usually within five business days.</p>
        </form>
      </Card>
    </div>
  );
}
