"use client";
// app/(dashboard)/admin/page.tsx - the platform/tenant org-overview command
// center (the exact Claude Design AdminDash). Shares the OrgOverview dashboard
// with the home route (/); this route is gated to super-admin by
// app/(dashboard)/admin/layout.tsx.
import { OrgOverview } from "@/components/dashboards/org-overview";

export default function AdminPage() {
  return <OrgOverview />;
}
