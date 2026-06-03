// app/(dashboard)/admin/platform/cost/page.tsx
// Exact Claude Design PlatformCostScreen (components/cd/AiSurfaceScreens.tsx),
// mounted via PlatformCostLive. Super-admin-gated by admin/layout.tsx.
import { PlatformCostLive } from "@/components/cd/platform-live";

export default function PlatformCostPage() {
  return <PlatformCostLive />;
}
