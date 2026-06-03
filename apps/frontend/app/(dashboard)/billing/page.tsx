// app/(dashboard)/billing/page.tsx
// Exact Claude Design billing & plan screen (components/cd/BillingScreen.tsx),
// wired via BillingLive: real plan (tenant.plan) + real usage (/billing/usage),
// honest placeholders for the card + invoices this FREE tenant does not have.
import { BillingLive } from "@/components/cd/billing-live";

export default function BillingPage() {
  return <BillingLive />;
}
