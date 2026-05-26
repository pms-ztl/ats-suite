"use client";

import Link from "next/link";
import { LoginCard } from "@/components/auth/login-card";

export default function SuperAdminLoginPage() {
  return (
    <LoginCard
      tierLabel="Platform Admin"
      title="Platform Admin Sign-In"
      subtitle="CDC ATS — the platform provider portal"
      letter="◆"
      accentClass="bg-gradient-to-br from-violet-600 to-purple-700 shadow-[0_0_24px_-4px_rgb(168_85_247/0.5)]"
      homeUrl="/admin"
      allowedRoles={["SUPER_ADMIN"]}
      redirectMap={{
        ADMIN:              { url: "/login",        label: "/login (Tenant Admin)" },
        RECRUITER:          { url: "/staff/login",  label: "/staff/login (Staff)" },
        HIRING_MANAGER:     { url: "/staff/login",  label: "/staff/login (Staff)" },
        INTERVIEWER:        { url: "/staff/login",  label: "/staff/login (Staff)" },
        COMPLIANCE_OFFICER: { url: "/login",        label: "/login (Tenant)" },
        CANDIDATE:          { url: "/status",       label: "Candidate Portal" },
      }}
      footerSlot={
        <p className="text-2xs text-muted-foreground text-center">
          Not a platform admin?{" "}
          <Link href="/login" className="text-primary hover:underline">Tenant sign-in</Link>{" · "}
          <Link href="/staff/login" className="text-primary hover:underline">Staff sign-in</Link>
        </p>
      }
    />
  );
}
