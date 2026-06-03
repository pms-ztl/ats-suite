// app/(dashboard)/admin/platform/audit/page.tsx
// Exact Claude Design PlatformAuditScreen (components/cd/PlatformScreens.tsx),
// mounted via PlatformAuditLive. Super-admin-gated by admin/layout.tsx.
import { PlatformAuditLive } from "@/components/cd/platform-live";

export default function PlatformAuditPage() {
  return <PlatformAuditLive />;
}
