// app/(dashboard)/offers/page.tsx
// Exact Claude Design Offers (list + composer, components/cd/screens/Offers.tsx),
// wired to the gateway via OffersLive (listOffers).
import { OffersLive } from "@/components/cd/offers-live";

export default function OffersPage() {
  return <OffersLive />;
}
