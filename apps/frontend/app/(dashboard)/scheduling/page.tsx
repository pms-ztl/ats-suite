// app/(dashboard)/scheduling/page.tsx
// Exact Claude Design scheduling calendar (components/cd/screens/Scheduling.tsx),
// mounted via SchedulingLive with the design's example week + AI-proposed slots
// (the gateway exposes no busy-grid / slot-proposal resource yet).
import { SchedulingLive } from "@/components/cd/scheduling-live";

export default function SchedulingPage() {
  return <SchedulingLive />;
}
