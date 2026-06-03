// app/(dashboard)/analytics/diversity/page.tsx
// Exact Claude Design Fairness / adverse-impact dashboard (components/cd/
// FairnessScreen.tsx), wired to the gateway via FairnessLive (getAdverseImpact).
import { FairnessLive } from "@/components/cd/fairness-live";

export default function DiversityPage() {
  return <FairnessLive />;
}
