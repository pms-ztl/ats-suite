// app/(dashboard)/candidates/[id]/page.tsx
// Exact Claude Design candidate profile (components/cd/screens/CandidateProfile.tsx),
// wired to the gateway via CandidateProfileLive (getCandidate + getVerdict +
// listCandidates for prev/next + listRequisitions for the applied role).
import { CandidateProfileLive } from "@/components/cd/candidate-profile-live";

export default function CandidateProfilePage() {
  return <CandidateProfileLive />;
}
