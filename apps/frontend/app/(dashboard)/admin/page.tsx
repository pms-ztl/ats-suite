"use client";
// app/(dashboard)/admin/page.tsx
// Super-admin entry point. Redirects to the standalone Claude Design Platform
// Operator console served from /public/super-admin (its own full-bleed shell,
// 17 screens). Super-admin-gated by admin/layout.tsx; the console reads the
// session JWT for live data (Tenants is wired to /api/super-admin/tenants).
import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => {
    window.location.replace("/super-admin/index.html");
  }, []);
  return null;
}
