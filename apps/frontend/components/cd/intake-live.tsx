"use client";
// components/cd/intake-live.tsx
// Mounts the byte-exact CD IntakeScreen on /requisitions/new. The "Post job" and
// "Save draft" buttons are wired to the real createRequisition API, so a real
// requisition is created from whatever is in the form. The "Generate description"
// button is wired to the REAL jd-author agent (generateJD -> POST /api/jd-author):
// the streamed trace steps are cosmetic chrome, but the description, required /
// nice-to-have split, inclusivity score, and bias flags all come from the agent.
// On agent failure the screen shows an honest error rather than a canned JD.
import { useRouter } from "next/navigation";
import { IntakeScreen } from "./IntakeScreen";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createRequisition, generateJD } from "@/lib/api";
import type { IntakeData, IntakeState, IntakeJDGen } from "./types";

// Only cosmetic + config seed remains: the importance options, one starter custom
// field, and the (clearly-cosmetic) trace-step labels shown while the agent runs.
// The jdGen result fields are placeholders that are NEVER surfaced; the real
// agent result (via onGenerate) replaces them before anything renders.
const INTAKE_DATA: IntakeData = {
  importance: { "must-have": { label: "Must-have" }, important: { label: "Important" }, "nice-to-have": { label: "Nice-to-have" } },
  seedCustomFields: [
    { id: "cf1", label: "Payments or fintech domain experience", value: "Has shipped ledger, payments, or banking systems", importance: "must-have" },
  ],
  jdGen: {
    description: "",
    required: [],
    niceToHave: [],
    inclusivity: 0,
    biasFlags: [],
    // Cosmetic streaming labels only; the payload is produced by the live agent.
    trace: [
      { t: "Parsing the role title and basics", d: "from the form", status: "pass" },
      { t: "Drafting the description", d: "role, team, impact", status: "pass" },
      { t: "Splitting required vs nice-to-have", d: "grouping requirements", status: "pass" },
      { t: "Auditing for biased language", d: "self-audit", status: "review" },
    ],
  },
  initial: { title: "", dept: "", level: "", location: "", min: 0, max: 0 },
};

// Map the jd-author agent response (lib/api generateJD) to the IntakeJDGen shape
// the screen consumes. Bias flags carry only phrase + suggestion from the agent;
// the remaining display fields are derived, not invented content.
function toJDGen(g: Awaited<ReturnType<typeof generateJD>>): IntakeJDGen {
  return {
    description: g.description,
    required: g.requiredSkills,
    niceToHave: g.niceToHave,
    inclusivity: g.inclusivityScore,
    biasFlags: g.biasFlags
      .filter(f => f.phrase)
      .map((f, i) => ({
        id: "b" + i,
        type: "Biased language",
        severity: "medium" as const,
        text: f.phrase,
        suggestion: f.suggestion,
        where: "in the description",
      })),
    trace: INTAKE_DATA.jdGen.trace,
  };
}

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
      onGenerate={async (title) => toJDGen(await generateJD(title))}
    />
  );
}
