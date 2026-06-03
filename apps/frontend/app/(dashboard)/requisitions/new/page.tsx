// app/(dashboard)/requisitions/new/page.tsx
// Exact Claude Design requisition-intake showpiece (components/cd/IntakeScreen.tsx),
// mounted via IntakeLive. Post/Save draft are wired to the real createRequisition;
// the in-screen jd-author generation is the design's animation (see intake-live).
import { IntakeLive } from "@/components/cd/intake-live";

export default function NewRequisitionPage() {
  return <IntakeLive />;
}
