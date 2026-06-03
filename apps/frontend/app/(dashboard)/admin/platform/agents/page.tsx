// app/(dashboard)/admin/platform/agents/page.tsx
// Exact Claude Design PlatformAgentsScreen (components/cd/PlatformScreens.tsx),
// mounted via PlatformAgentsLive. Super-admin-gated by admin/layout.tsx.
import { PlatformAgentsLive } from "@/components/cd/platform-live";

export default function PlatformAgentsPage() {
  return <PlatformAgentsLive />;
}
