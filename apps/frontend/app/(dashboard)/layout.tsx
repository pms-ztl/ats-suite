import type { Metadata } from "next";
import { CdShell } from "@/components/cd/cd-shell";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { AuthGuard } from "@/components/layouts/auth-guard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <CdShell>
        <ErrorBoundary>{children}</ErrorBoundary>
      </CdShell>
    </AuthGuard>
  );
}
