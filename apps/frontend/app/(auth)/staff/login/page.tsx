"use client";

import Link from "next/link";
import { LoginCard } from "@/components/auth/login-card";

export default function StaffLoginPage() {
  return (
    <LoginCard
      tierLabel="Staff"
      title="Staff Sign-In"
      subtitle="Recruiters, hiring managers, and interviewers"
      letter="◉"
      accentClass="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_24px_-4px_rgb(16_185_129/0.5)]"
      homeUrl="/"
      allowedRoles={["RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER"]}
      redirectMap={{
        SUPER_ADMIN: { url: "/super-admin/login", label: "Platform sign-in" },
        ADMIN:       { url: "/login",             label: "Tenant Admin sign-in" },
        CANDIDATE:   { url: "/status",            label: "Candidate Portal" },
      }}
      footerSlot={
        <>
          <p className="text-2xs text-muted-foreground text-center">
            Are you a tenant admin? <Link href="/login" className="text-primary hover:underline">Sign in here</Link>
          </p>
          <p className="text-2xs text-muted-foreground text-center">
            Need an account? Ask your tenant admin to invite you from Settings → Team.
          </p>
        </>
      }
    />
  );
}
