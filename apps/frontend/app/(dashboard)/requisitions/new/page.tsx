"use client";
// app/(dashboard)/requisitions/new/page.tsx, requisition intake, the showpiece.
// Path 1: type a title, the jd-author agent generates the full JD (qualifications,
// inclusivity score, bias flags with one-click fixes). Path 2: paste a full JD.
import { useState } from "react";
import { Button, AIChip, Card } from "@/components/aurora";
import { generateJD, createRequisition } from "@/lib/api";

type Gen = Awaited<ReturnType<typeof generateJD>>;

export default function NewRequisitionPage() {
  const [mode, setMode] = useState<"ai" | "paste">("ai");
  const [title, setTitle] = useState("");
  const [gen, setGen] = useState<Gen | null>(null);
  const [busy, setBusy] = useState(false);

  async function onGenerate() {
    setBusy(true);
    try { setGen(await generateJD(title)); }   // POST /api/jd-author
    catch { /* surface a toast in real wiring */ }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-4">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight">New requisition</h1>
          <p className="mt-1 text-ink-2">Start a role. AI drafts it, you approve every word.</p>
        </header>

        <div role="tablist" aria-label="Intake mode" className="inline-flex gap-1 rounded-pill bg-surface-2 p-1">
          <button role="tab" aria-selected={mode === "ai"} onClick={() => setMode("ai")}
            className={"rounded-pill px-4 py-1.5 text-sm font-semibold " + (mode === "ai" ? "bg-ai-tint text-ai-ink" : "text-ink-2")}>Generate with AI</button>
          <button role="tab" aria-selected={mode === "paste"} onClick={() => setMode("paste")}
            className={"rounded-pill px-4 py-1.5 text-sm font-semibold " + (mode === "paste" ? "bg-brand-tint text-brand-ink" : "text-ink-2")}>Paste a JD</button>
        </div>

        {mode === "ai" ? (
          <Card material="clay" className="rounded-2xl p-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-3" htmlFor="jt">Job title</label>
            <input id="jt" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer"
              className="mt-2 h-11 w-full rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring" />
            <Button variant="ai" className="mt-3" disabled={!title || busy} onClick={onGenerate}>
              {busy ? "Drafting." : "Generate job description"}
            </Button>
            <p className="mt-2 text-xs text-ink-3">The jd-author agent drafts requirements, an inclusivity score, and flags biased language. You edit before publishing.</p>
          </Card>
        ) : (
          <Card material="flat" className="rounded-2xl border border-line p-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-3" htmlFor="jd">Paste the job description</label>
            <textarea id="jd" rows={8} className="mt-2 w-full rounded border border-line-2 bg-surface p-3 outline-none focus-visible:shadow-ring" />
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-3" htmlFor="rs">Required skills (comma separated)</label>
            <input id="rs" className="mt-2 h-11 w-full rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring" />
          </Card>
        )}

        {/* Central custom-fields section: admin types a LABEL + value + importance, feeding the AI screener */}
        <Card material="flat" className="rounded-2xl border border-line p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3">Custom screening criteria</h2>
          <p className="mb-3 mt-1 text-xs text-ink-3">Each label + value + importance feeds the candidate-screener directly.</p>
          <div className="grid grid-cols-[1fr_1fr_120px] gap-2 text-sm">
            <input placeholder="Label, e.g. Payments domain" className="h-10 rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring" />
            <input placeholder="Value" className="h-10 rounded border border-line-2 bg-surface px-3 outline-none focus-visible:shadow-ring" />
            <select className="h-10 rounded border border-line-2 bg-surface px-2 outline-none focus-visible:shadow-ring"><option>Must have</option><option>Important</option><option>Nice to have</option></select>
          </div>
        </Card>
      </div>

      {/* live candidate-facing preview + pay-transparency nudge */}
      <aside className="flex flex-col gap-4">
        <Card material="glass" className="rounded-2xl p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink-3">Candidate preview</h2>
            {gen && <AIChip>jd-author</AIChip>}
          </div>
          {gen ? (
            <div>
              <p className="text-sm text-ink-2">{gen.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="font-semibold">Inclusivity</span>
                <span className="font-mono tabular-nums text-ok">{gen.inclusivityScore}/100</span>
              </div>
              {gen.biasFlags?.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {gen.biasFlags.map((b, i) => (
                    <li key={i} className="rounded border border-warn/40 bg-warn-tint p-2 text-xs">
                      <b>{b.phrase}</b> , {b.suggestion} <Button variant="soft" size="sm" className="ml-1">Fix</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-3">Generate or paste a JD to preview what candidates will see.</p>
          )}
        </Card>
        <Card material="clay" className="rounded-2xl p-4">
          <p className="text-sm"><b>Add a pay range.</b> Postings with transparent pay get more qualified applicants and meet pay-transparency law.</p>
        </Card>
        <Button variant="primary" onClick={() => createRequisition({ title })}>Publish requisition</Button>
      </aside>
    </div>
  );
}
