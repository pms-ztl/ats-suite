// app/(dashboard)/admin/plan-requests/page.tsx
// Exact Claude Design PlanRequestsScreen (components/cd/PlatformScreens.tsx),
// mounted via PlanRequestsLive. Super-admin-gated by admin/layout.tsx.
import { PlanRequestsLive } from "@/components/cd/platform-live";

export default function PlanRequestsPage() {
  return <PlanRequestsLive />;
}
