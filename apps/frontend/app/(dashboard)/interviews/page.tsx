// app/(dashboard)/interviews/page.tsx
// Exact Claude Design Interviews (list + detail, components/cd/screens/Interviews.tsx),
// wired to the gateway via InterviewsLive (listInterviews).
import { InterviewsLive } from "@/components/cd/interviews-live";

export default function InterviewsPage() {
  return <InterviewsLive />;
}
