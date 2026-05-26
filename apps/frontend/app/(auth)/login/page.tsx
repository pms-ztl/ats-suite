"use client";

import { Suspense } from "react";
import Link from "next/link";
import { LoginCard } from "@/components/auth/login-card";

function TenantAdminLoginForm() {
  return (
    <LoginCard
      tierLabel="Tenant Admin"
      title="Welcome Back"
      subtitle="Sign in to your CDC ATS workspace"
      letter="C"
      accentClass="bg-primary glow-primary"
      homeUrl="/"
      allowedRoles={["ADMIN", "COMPLIANCE_OFFICER"]}
      redirectMap={{
        SUPER_ADMIN:    { url: "/super-admin/login", label: "/super-admin/login (Platform)" },
        RECRUITER:      { url: "/staff/login",       label: "/staff/login (Staff)" },
        HIRING_MANAGER: { url: "/staff/login",       label: "/staff/login (Staff)" },
        INTERVIEWER:    { url: "/staff/login",       label: "/staff/login (Staff)" },
        CANDIDATE:      { url: "/status",            label: "Candidate Portal" },
      }}
      footerSlot={
        <>
          <p className="text-2xs text-muted-foreground text-center">
            New to CDC ATS?{" "}
            <Link href="/get-started" className="text-primary hover:underline">Create a workspace</Link>
          </p>
          <p className="text-2xs text-muted-foreground text-center">
            <Link href="/pricing" className="hover:underline">See pricing →</Link>
          </p>
        </>
      }
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <TenantAdminLoginForm />
    </Suspense>
  );
}
