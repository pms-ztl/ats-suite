"use client";
// components/cd/offers-live.tsx
// Wires the verbatim CD Offers to the gateway: listOffers() + listRequisitions() ->
// OffersData (list rows). The full letter-composer detail (band/market/justification)
// is not exposed by the gateway, so `detail` is omitted; the list + statuses are live.
import { Offers } from "./screens/Offers";
import { useData } from "@/lib/use-data";
import { listOffers, listRequisitions } from "@/lib/api";
import type { Offer as GwOffer, Requisition, OfferStatus } from "@/lib/types";
import type { OfferRow, OfferStatusKey } from "./types";
import { initials, reqTitleMap } from "./wire-helpers";

const STATUS: Record<OfferStatus, OfferStatusKey> = {
  DRAFT: "draft", PENDING_APPROVAL: "pending", APPROVED: "approved",
  SENT: "sent", ACCEPTED: "accepted", DECLINED: "declined", EXPIRED: "declined",
};

export function OffersLive() {
  const offersD = useData<GwOffer[]>(listOffers);
  const reqs = useData<Requisition[]>(listRequisitions);
  const titles = reqTitleMap(reqs.data);

  const offers: OfferRow[] = (offersD.data ?? []).map((o) => ({
    id: o.id,
    ini: initials(o.candidateId),
    name: o.candidateId,
    role: titles[o.requisitionId] ?? "",
    reqId: o.requisitionId,
    base: o.baseSalary,
    status: STATUS[o.status] ?? "draft",
    expires: "",
  }));

  return <Offers data={{ offers }} />;
}
