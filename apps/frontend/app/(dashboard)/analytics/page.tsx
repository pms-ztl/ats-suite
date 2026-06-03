// app/(dashboard)/analytics/page.tsx
// Exact Claude Design Analytics (components/cd/AnalyticsScreen.tsx), wired to the
// gateway via AnalyticsLive (getDashboardKpis + getFunnel + getAdverseImpact).
import { AnalyticsLive } from "@/components/cd/analytics-live";

export default function AnalyticsPage() {
  return <AnalyticsLive />;
}
