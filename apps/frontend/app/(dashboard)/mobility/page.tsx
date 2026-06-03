// app/(dashboard)/mobility/page.tsx
// Exact Claude Design MobilityScreen (components/cd/AiSurfaceScreens.tsx), mounted
// via MobilityLive with the design's example internal-mobility matches (the gateway
// exposes no internal-mobility resource yet).
import { MobilityLive } from "@/components/cd/mobility-live";

export default function MobilityPage() {
  return <MobilityLive />;
}
