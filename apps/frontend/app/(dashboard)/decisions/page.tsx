// app/(dashboard)/decisions/page.tsx
// Exact Claude Design Decisions (human-approval-gated, components/cd/screens/
// Decisions.tsx), wired to the gateway via DecisionsLive (listDecisions).
import { DecisionsLive } from "@/components/cd/decisions-live";

export default function DecisionsPage() {
  return <DecisionsLive />;
}
