import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { AuthGuard } from "@/components/layouts/auth-guard";

export const metadata: Metadata = { title: "Dashboard" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        <ErrorBoundary>{children}</ErrorBoundary>
      </DashboardLayout>
    </AuthGuard>
  );
}
