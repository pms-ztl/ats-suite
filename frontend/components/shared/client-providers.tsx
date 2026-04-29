"use client";

import { Toaster } from "sonner";
import { CommandPalette } from "@/components/shared/command-palette";
import { RouteProgress } from "@/components/shared/route-progress";
import { BackToTop } from "@/components/shared/back-to-top";

export function ClientProviders() {
  return (
    <>
      <RouteProgress />
      <Toaster position="bottom-right" richColors closeButton />
      <CommandPalette />
      <BackToTop />
    </>
  );
}
