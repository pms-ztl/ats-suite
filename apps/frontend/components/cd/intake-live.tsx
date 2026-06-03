"use client";
// components/cd/intake-live.tsx
// Mounts the byte-exact CD IntakeScreen on /requisitions/new. The "Post job" and
// "Save draft" buttons are wired to the real createRequisition API, so a real
// requisition is created from whatever is in the form. The in-screen jd-author
// generation (streaming trace -> description + bias flags) is the design's own
// animation/seed; the live jd-author agent is not wired into the exact file.
import { useRouter } from "next/navigation";
import { IntakeScreen } from "./IntakeScreen";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createRequisition } from "@/lib/api";
import type { IntakeData, IntakeState } from "./types";

const INTAKE_DATA: IntakeData = {
  importance: { "must-have": { label: "Must-have" }, important: { label: "Important" }, "nice-to-have": { label: "Nice-to-have" } },
  seedCustomFields: [
    { id: "cf1", label: "Payments or fintech domain experience", value: "Has shipped ledger, payments, or banking systems", importance: "must-have" },
  ],
  jdGen: {
    description: "We are hiring a Senior Backend Engineer to design and operate the services behind our payments platform. You will own critical paths end to end, from API design through data modeling, reliability, and on-call, partnering closely with product and platform teams.",
    required: ["6+ years building production backend services", "Strong Go or a comparable systems language", "Designed and operated distributed systems at scale", "Comfortable owning reliability and on-call"],
    niceToHave: ["Payments or ledger experience", "Kafka or event streaming", "Kubernetes", "gRPC"],
    inclusivity: 92,
    biasFlags: [
      { id: "b1", type: "Gendered language", severity: "medium", text: "rockstar engineer", suggestion: "skilled engineer", where: "in the description" },
      { id: "b2", type: "Exclusionary phrasing", severity: "low", text: "young and energetic team", suggestion: "collaborative team", where: "in the description" },
    ],
    trace: [
      { t: "Parsing the role title and basics", d: "Senior Backend Engineer", status: "pass" },
      { t: "Drafting the description", d: "role, team, impact", status: "pass" },
      { t: "Splitting required vs nice-to-have", d: "4 required, 4 nice-to-have", status: "pass" },
      { t: "Auditing for biased language", d: "2 flags found", status: "review" },
    ],
  },
  initial: { title: "", dept: "", level: "", location: "", min: 0, max: 0 },
};

export function IntakeLive() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const create = async (st: IntakeState, status?: string) => {
    try {
      const req = await createRequisition({
        title: st.title,
        department: st.dept,
        location: st.location,
        description: st.description,
        requiredSkills: st.generated ? st.required : st.skills,
        niceToHave: st.niceToHave,
        salaryMin: st.min || undefined,
        salaryMax: st.max || undefined,
        employmentType: st.level || undefined,
        ...(status ? { status: status as never } : {}),
      });
      router.push(req?.id ? `/requisitions/${req.id}` : "/requisitions");
    } catch {
      router.push("/requisitions");
    }
  };

  return (
    <IntakeScreen
      data={INTAKE_DATA}
      orgName={user?.tenant?.name ?? "Your workspace"}
      onBack={() => router.push("/requisitions")}
      onPost={(st) => create(st)}
      onSaveDraft={(st) => create(st, "DRAFT")}
    />
  );
}
