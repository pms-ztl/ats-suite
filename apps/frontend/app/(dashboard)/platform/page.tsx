"use client";
// app/(dashboard)/platform/page.tsx — super-admin cross-tenant operator view.
//
// Previously this page fetched a non-existent /api/platform/tenants endpoint and
// fell back to a hardcoded FALLBACK_TENANTS table with fabricated PLAT_KPIS
// sparklines (142 tenants / $86.4k MRR — none of it real). It now mounts the
// live TenantsLive screen, which hydrates REAL data from /api/super-admin/tenants
// + /api/super-admin/stats (per-tenant plan, users, 30-day AI cost, agent runs)
// and renders the real-data Aurora chart kit: a margin-map ScatterPlot (MRR vs
// 30d AI cost, bubble = users, red = over-budget) and a Tenants-by-plan BarsChart.
import { TenantsLive } from "@/components/cd/platform-live";

export default function PlatformPage() {
  return <TenantsLive />;
}
