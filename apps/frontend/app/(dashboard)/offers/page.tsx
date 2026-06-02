"use client";
// app/(dashboard)/offers/page.tsx, offers list. Composer is AI-drafted and editable,
// human-approved before send. OfferStatus enum drives the badges.
import { Button, AIChip, StatusBadge, Card, Skeleton, EmptyState, ErrorState } from "@/components/aurora";
import { useData } from "@/lib/use-data";
import { listOffers, approveOffer } from "@/lib/api";
import type { Offer, OfferStatus } from "@/lib/types";

const BADGE: Record<OfferStatus, "draft" | "review" | "pass" | "open" | "fail"> = {
  DRAFT: "draft", PENDING_APPROVAL: "review", APPROVED: "pass", SENT: "open", ACCEPTED: "pass", DECLINED: "fail", EXPIRED: "fail",
};

export default function OffersPage() {
  const { data, loading, error, reload } = useData<Offer[]>(listOffers);
  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight">Offers</h1>
        <p className="mt-1 text-ink-2">AI drafts the letter; a human approves the comp and the chain before anything sends.</p>
      </header>
      {loading && <div className="grid gap-2" aria-busy="true">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>}
      {error && <ErrorState title="Could not load offers" body="The offers service did not respond." code="GET /api/offers" onRetry={reload} />}
      {data && data.length === 0 && <EmptyState title="No offers yet" body="When a candidate reaches the offer stage, the offer-agent drafts a letter here for your approval." />}
      {data && data.length > 0 && (
        <div className="grid gap-2">
          {data.map((o) => (
            <Card key={o.id} material="flat" className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{o.candidateId}</div>
                <div className="font-mono text-xs tabular-nums text-ink-3">${o.baseSalary.toLocaleString()} base · starts {o.startDate}</div>
              </div>
              {o.aiDrafted && <AIChip>offer-agent draft</AIChip>}
              <StatusBadge status={BADGE[o.status]} icon={null} />
              {o.status === "PENDING_APPROVAL" && <Button variant="primary" size="sm" onClick={() => approveOffer(o.id)}>Approve &amp; send</Button>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
