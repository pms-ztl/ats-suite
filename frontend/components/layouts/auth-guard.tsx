"use client";

import { useRequireAuth } from "@/lib/auth-context";
import { ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirect in progress
  }

  return <>{children}</>;
}
