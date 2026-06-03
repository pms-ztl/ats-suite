// app/(dashboard)/hitl/page.tsx
// Exact Claude Design HITL review queue (components/cd/screens/HITL.tsx), wired to
// the gateway via HitlLive (listReviewQueue).
import { HitlLive } from "@/components/cd/hitl-live";

export default function HitlPage() {
  return <HitlLive />;
}
