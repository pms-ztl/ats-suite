// app/(dashboard)/requisitions/page.tsx
// Exact Claude Design Requisitions list (components/cd/screens/Requisitions.tsx),
// wired to the gateway via RequisitionsLive (listRequisitions).
import { RequisitionsLive } from "@/components/cd/requisitions-live";

export default function RequisitionsPage() {
  return <RequisitionsLive />;
}
