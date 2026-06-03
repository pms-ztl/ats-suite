// app/(dashboard)/candidates/page.tsx
// Exact Claude Design Candidates (board + table controller, components/cd/screens/
// Candidates.tsx), wired to the gateway via CandidatesLive (listCandidates).
import { CandidatesLive } from "@/components/cd/candidates-live";

export default function CandidatesPage() {
  return <CandidatesLive />;
}
