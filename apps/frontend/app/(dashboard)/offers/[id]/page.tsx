"use client";
// app/(dashboard)/offers/[id]/page.tsx, offer-letter composer (AI-drafted, editable,
// human-approved before send). Comp breakdown + approval chain.
import { useParams } from "next/navigation";
import { Button, AIChip, Card } from "@/components/aurora";

const COMP = [["Base salary", "$185,000"], ["Signing bonus", "$20,000"], ["Equity", "4,000 RSUs / 4 yrs"], ["Start date", "Jul 7, 2026"]] as const;
const CHAIN = [["Avery Chen", "Recruiter", "done"], ["You", "Hiring Manager", "current"], ["Finance", "Budget sign-off", "wait"]] as const;

export default function OfferComposerPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div>
        <header className="mb-4 flex items-center gap-2"><h1 className="text-2xl font-extrabold tracking-tight">Offer {id}</h1><AIChip>offer-agent draft</AIChip></header>
        <Card material="flat" className="rounded-2xl border border-line p-5">
          <textarea rows={12} className="w-full rounded border border-line-2 bg-surface p-3 text-sm outline-none focus-visible:shadow-ring"
            defaultValue={"Dear Dana,\n\nWe are delighted to offer you the role of Platform Engineer at Northwind Talent. The full details of your compensation are below. We were impressed by your systems thinking and look forward to building with you."} />
          <p className="mt-2 text-xs text-ink-3">AI drafted this letter. Edit freely, a human approves before anything sends.</p>
        </Card>
      </div>
      <aside className="flex flex-col gap-4">
        <Card material="flat" className="rounded-2xl border border-line p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Compensation</h2>
          {COMP.map(([k, v]) => <div key={k} className="flex justify-between border-t border-line py-2 text-sm first:border-0"><span className="text-ink-2">{k}</span><span className="font-mono tabular-nums font-semibold">{v}</span></div>)}
        </Card>
        <Card material="flat" className="rounded-2xl border border-line p-4">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-3">Approval chain</h2>
          {CHAIN.map(([who, role, state]) => (
            <div key={who} className="flex items-center gap-2 py-1.5 text-sm">
              <span className={"size-2 rounded-full " + (state === "done" ? "bg-ok" : state === "current" ? "bg-brand" : "bg-ink-3")} />
              <span className="font-semibold">{who}</span><span className="text-xs text-ink-3">{role}</span>
              {state === "current" && <span className="ml-auto rounded-pill bg-brand-tint px-2 py-0.5 text-xs font-bold text-brand-ink">Your approval</span>}
            </div>
          ))}
        </Card>
        {/* POST /api/offers/:id/approve */}
        <Button variant="primary">Approve &amp; send</Button>
      </aside>
    </div>
  );
}
