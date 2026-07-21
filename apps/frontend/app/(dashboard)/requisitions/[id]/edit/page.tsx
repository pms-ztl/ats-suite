// app/(dashboard)/requisitions/[id]/edit/page.tsx
// Thin wrapper, same convention as the sibling [id]/page.tsx: the route just
// mounts the live component that does the real work.
import { RequisitionEditLive } from "@/components/cd/requisition-edit-live";

export default function RequisitionEditPage() {
  return <RequisitionEditLive />;
}
