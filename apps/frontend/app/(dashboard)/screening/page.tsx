// app/(dashboard)/screening/page.tsx
// Exact Claude Design screening queue + slide-over verdict panel (components/cd/
// screens/Screening.tsx via screen-screenq.jsx), wired to the real gateway through
// ScreeningLive (listScreening -> ScreeningData). AI is advisory; the human decides.
import { ScreeningLive } from "@/components/cd/screening-live";

export default function ScreeningPage() {
  return <ScreeningLive />;
}
