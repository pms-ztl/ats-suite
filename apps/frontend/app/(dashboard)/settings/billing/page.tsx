"use client";
// app/(dashboard)/settings/billing/page.tsx
// This route used to render the prototype's EXAMPLE billing content (fake card
// •••• 4242, fictional invoice rows, static usage meters). The real, fully-wired
// billing screen lives at /billing (BillingLive: real plan, metered usage, real
// AI spend by provider, working plan-change flow), so this settings entry now
// redirects there instead of showing sample data.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsBillingRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/billing"); }, [router]);
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "var(--c-ink-3)", fontSize: "var(--fs-sm)" }}>
      Taking you to Billing &amp; Plan…
    </div>
  );
}
