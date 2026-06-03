// app/(dashboard)/requisitions/[id]/page.tsx
// Exact Claude Design requisition detail (components/cd/screens/RequisitionDetail.tsx),
// wired to the gateway via RequisitionDetailLive (getRequisition(id) + getFunnel).
import { RequisitionDetailLive } from "@/components/cd/requisition-detail-live";

export default function RequisitionDetailPage() {
  return <RequisitionDetailLive />;
}
