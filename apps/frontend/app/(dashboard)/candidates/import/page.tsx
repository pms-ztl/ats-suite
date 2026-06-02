"use client";
// app/(dashboard)/candidates/import/page.tsx, bulk import.
import { Button, AIChip, Card } from "@/components/aurora";

export default function ImportPage() {
  return (
    <div className="mx-auto w-full max-w-[760px]">
      <header className="mb-5"><h1 className="text-2xl font-extrabold tracking-tight">Bulk import</h1><p className="mt-1 text-ink-2">Upload résumés or a CSV. The resume-parser structures each one for you.</p></header>
      <Card material="clay" className="rounded-2xl p-8 text-center">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-brand-tint text-brand">⬆</div>
        <div className="font-semibold">Drop files here, or browse</div>
        <div className="mt-1 text-sm text-ink-3">PDF, DOCX, or ZIP · up to 200 files</div>
        <input type="file" multiple className="mt-4 text-sm" />
        {/* POST /api/candidates/import */}
        <div className="mt-5"><Button variant="primary">Upload &amp; parse</Button></div>
      </Card>
      <p className="mt-3 flex items-center gap-2 text-xs text-ink-3"><AIChip>resume-parser</AIChip> Low-confidence parses are flagged for your review, never auto-accepted.</p>
    </div>
  );
}
