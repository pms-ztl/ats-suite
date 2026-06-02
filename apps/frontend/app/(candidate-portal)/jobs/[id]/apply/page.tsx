"use client";
// app/(portal)/jobs/[id]/apply/page.tsx, dynamic application form
// (standard fields + the requisition's custom fields + résumé upload).
import { useParams } from "next/navigation";
import { Card, Button } from "@/components/aurora";

const input = "h-11 w-full rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring";

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto w-full max-w-[640px] p-6">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Apply</h1><p className="mt-1 text-ink-2">Requisition {id}. Fields marked with * are required.</p></header>
      <Card material="flat" className="rounded-2xl border border-line p-5">
        <form className="flex flex-col gap-4">
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">Full name *</span><input className={input} required /></label>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">Email *</span><input type="email" className={input} required /></label>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">Résumé *</span><input type="file" className="text-sm" required /></label>
          {/* custom fields for this requisition are appended here from GET /api/public/jobs/:id/form */}
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3">Why this role?</span><textarea rows={4} className="w-full rounded border border-line-2 bg-surface p-3 outline-none focus-visible:shadow-ring" /></label>
          {/* POST /api/public/jobs/:id/apply */}
          <Button variant="primary" type="submit">Submit application</Button>
          <p className="text-center text-xs text-ink-3">We use AI to help review applications. A human makes every decision, and you can request a human review at any time.</p>
        </form>
      </Card>
    </div>
  );
}
