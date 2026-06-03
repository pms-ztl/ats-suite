// app/(dashboard)/admin/page.tsx
// Exact Claude Design platform Tenants console (components/cd/PlatformScreens.tsx
// TenantsScreen), mounted via TenantsLive. Super-admin-gated by admin/layout.tsx.
// Operator data is the design's example content (platform gateway not wired here).
import { TenantsLive } from "@/components/cd/platform-live";

export default function AdminTenantsPage() {
  return <TenantsLive />;
}
