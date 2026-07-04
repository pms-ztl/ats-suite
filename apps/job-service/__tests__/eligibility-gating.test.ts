/**
 * Vitest suite for eligibility-gating (job-service apply path).
 *
 * Exercises the PURE, deterministic evaluator that job-service uses to allow or
 * block an application BEFORE any row is written:
 *   apps/job-service/src/routes/public.ts -> checkEligibility() ->
 *   evaluateEligibility(rules, answers)   (exported from @cdc-ats/contracts).
 *
 * These are pure-function tests against the EXPORTED evaluator (no HTTP, no DB,
 * no LLM), mirroring the sibling suite hiringplatform-stub-honesty.test.ts and
 * picked up by apps/job-service/vitest.config.ts (include __tests__/**). The
 * route wrapper that loads a requisition's rules and turns a failure into a 4xx
 * with the message is a thin DB read over this evaluator, so the evaluator IS
 * the gate's decision logic.
 *
 * The scenarios are GENERIC + data-driven (department, experience-years,
 * location, graduation-year), NOT hardcoded to any one campus/branch value: the
 * rules are data and the clear per-rule errorMessage is author-supplied, so the
 * same gate works for any tenant's rules.
 *
 * Run:  npx vitest run apps/job-service/__tests__/eligibility-gating.test.ts
 */
import { describe, it, expect } from "vitest";
import {
  evaluateEligibility,
  evaluateEligibilityRule,
  type EligibilityRule,
} from "@cdc-ats/contracts";

// ── Fixtures — a generic multi-rule requisition gate ─────────────────────────
// Role open to Engineering OR Product candidates, >= 2 years experience, in a
// shortlisted set of locations. Each rule carries its OWN clear, human-readable
// errorMessage (as authored in the requisition form-builder UI).
const RULES: EligibilityRule[] = [
  {
    field: "department",
    op: "in",
    values: ["Engineering", "Product"],
    errorMessage: "This role is open to Engineering or Product candidates only.",
    label: "Department",
  },
  {
    field: "yearsExperience",
    op: "gte",
    values: ["2"],
    errorMessage: "You need at least 2 years of experience to apply.",
    label: "Minimum experience",
  },
  {
    field: "location",
    op: "in",
    values: ["Remote", "Berlin", "Bangalore"],
    errorMessage: "We are only hiring in Remote, Berlin, or Bangalore for this role.",
    label: "Location",
  },
];

describe("eligibility gate: allow vs block", () => {
  it("ALLOWS a fully-qualifying applicant (all rules pass)", () => {
    const res = evaluateEligibility(RULES, {
      department: "Engineering",
      yearsExperience: "5",
      location: "Berlin",
    });
    expect(res.eligible).toBe(true);
    expect(res.errorMessage).toBeNull();
    expect(res.field).toBeNull();
  });

  it("BLOCKS on the first failing rule and surfaces THAT rule's message + field", () => {
    const res = evaluateEligibility(RULES, {
      department: "Marketing", // not in [Engineering, Product]
      yearsExperience: "5",
      location: "Berlin",
    });
    expect(res.eligible).toBe(false);
    expect(res.errorMessage).toBe("This role is open to Engineering or Product candidates only.");
    expect(res.field).toBe("department"); // for inline form highlighting
  });

  it("BLOCKS on a numeric gte rule with the numeric rule's own message", () => {
    const res = evaluateEligibility(RULES, {
      department: "Product",
      yearsExperience: "1", // < 2
      location: "Remote",
    });
    expect(res.eligible).toBe(false);
    expect(res.errorMessage).toBe("You need at least 2 years of experience to apply.");
    expect(res.field).toBe("yearsExperience");
  });

  it("short-circuits at the EARLIEST failing rule (order matters)", () => {
    // Both department AND location fail; department is first, so its message wins.
    const res = evaluateEligibility(RULES, {
      department: "Sales",
      yearsExperience: "10",
      location: "Tokyo",
    });
    expect(res.eligible).toBe(false);
    expect(res.field).toBe("department");
  });
});

describe("eligibility gate: strictness + normalization", () => {
  it("fails CLOSED when a gated field has no submitted answer", () => {
    const res = evaluateEligibility(RULES, {
      // department omitted entirely
      yearsExperience: "5",
      location: "Remote",
    });
    expect(res.eligible).toBe(false);
    expect(res.field).toBe("department");
  });

  it("matches case-insensitively and trims whitespace on the answer", () => {
    const res = evaluateEligibility(RULES, {
      department: "  engineering  ", // different case + padding
      yearsExperience: "2",          // exactly the boundary (gte is inclusive)
      location: "REMOTE",
    });
    expect(res.eligible).toBe(true);
  });
});

describe("eligibility gate: unauthored + malformed rules stay safe", () => {
  it("no rules -> eligible (unauthored gate is byte-identical to open apply)", () => {
    expect(evaluateEligibility([], { anything: "x" }).eligible).toBe(true);
    expect(evaluateEligibility(undefined, {}).eligible).toBe(true);
    expect(evaluateEligibility(null, {}).eligible).toBe(true);
  });

  it("a malformed numeric rule can never hard-block EVERY applicant (skipped)", () => {
    // A gte with a non-numeric operand is skipped by evaluateEligibility so one
    // bad rule cannot silently reject all candidates.
    const bad: EligibilityRule[] = [
      { field: "score", op: "gte", values: ["not-a-number"], errorMessage: "min score 70" },
    ];
    expect(evaluateEligibility(bad, { score: "10" }).eligible).toBe(true);
  });
});

describe("eligibility gate: operator coverage", () => {
  it("between uses inclusive bounds", () => {
    const rule: EligibilityRule = { field: "age", op: "between", values: ["21", "60"], errorMessage: "" };
    expect(evaluateEligibilityRule(rule, { age: "21" })).toBe(true);  // lower bound
    expect(evaluateEligibilityRule(rule, { age: "60" })).toBe(true);  // upper bound
    expect(evaluateEligibilityRule(rule, { age: "61" })).toBe(false); // above
  });

  it("not_in passes when the answer is NOT in the list", () => {
    const rule: EligibilityRule = { field: "country", op: "not_in", values: ["Sanctioned"], errorMessage: "" };
    expect(evaluateEligibilityRule(rule, { country: "Germany" })).toBe(true);
    expect(evaluateEligibilityRule(rule, { country: "Sanctioned" })).toBe(false);
  });

  it("neq passes when the answer differs from values[0]", () => {
    const rule: EligibilityRule = { field: "status", op: "neq", values: ["Withdrawn"], errorMessage: "" };
    expect(evaluateEligibilityRule(rule, { status: "Active" })).toBe(true);
    expect(evaluateEligibilityRule(rule, { status: "Withdrawn" })).toBe(false);
  });
});

describe("eligibility gate: the error message is data-driven, not hardcoded", () => {
  it("carries whatever the recruiter authored for a completely different tenant", () => {
    // Same evaluator, a different tenant's rule + message. Proves the gate is
    // generic and surfaces the author-supplied string, not a fixed value.
    const otherTenantRules: EligibilityRule[] = [
      {
        field: "graduationYear",
        op: "gte",
        values: ["2024"],
        errorMessage: "Only 2024 and later graduates are eligible for this campus drive.",
      },
    ];
    const res = evaluateEligibility(otherTenantRules, { graduationYear: "2022" });
    expect(res.eligible).toBe(false);
    expect(res.errorMessage).toBe("Only 2024 and later graduates are eligible for this campus drive.");
    expect(res.field).toBe("graduationYear");
  });
});
