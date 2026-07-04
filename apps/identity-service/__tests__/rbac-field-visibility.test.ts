/**
 * Vitest suite for RBAC per-role per-field visibility (identity-service).
 *
 * Exercises the PURE, deterministic resolver that the field-visibility policy is
 * built on:
 *   canSeeField(rules, field, role)               (exported from @cdc-ats/contracts)
 *   VisibilityFieldSchema / VisibilityRoleSchema  (the field + role matrix)
 *
 * The policy is a sparse map  field -> role -> canSee. A MISSING entry means
 * "visible" (fail-open, byte-identical to today's behavior); only an authored
 * `false` hides a field. SUPER_ADMIN always sees everything. This is exactly the
 * decision an owning service must make before serializing a sensitive field, so
 * these tests pin the role matrix / field-filter helper down.
 *
 * Pure-function tests against the EXPORTED resolver (no HTTP, no DB). identity-
 * service has no vitest.config of its own; this is a plain node-environment
 * vitest suite that only imports workspace packages, runnable from the repo root:
 *
 * Run:  npx vitest run apps/identity-service/__tests__/rbac-field-visibility.test.ts
 *
 * Roles are sourced from the shared ROLES constant in @cdc-ats/common so the
 * matrix stays in lock-step with the auth model instead of being duplicated.
 */
import { describe, it, expect } from "vitest";
import {
  canSeeField,
  VisibilityFieldSchema,
  VisibilityRoleSchema,
  type VisibilityPolicyDTO,
} from "@cdc-ats/contracts";
import { ROLES } from "@cdc-ats/common";

type Rules = VisibilityPolicyDTO["rules"];

describe("field visibility: unauthored policy is fully fail-open", () => {
  it("no policy -> every role can see every field", () => {
    const fields = VisibilityFieldSchema.options; // salary, interviewNotes, ...
    const roles = VisibilityRoleSchema.options;   // ADMIN, RECRUITER, ...
    for (const field of fields) {
      for (const role of roles) {
        expect(canSeeField({}, field, role)).toBe(true);
        expect(canSeeField(undefined, field, role)).toBe(true);
        expect(canSeeField(null, field, role)).toBe(true);
      }
    }
  });
});

describe("field visibility: an authored deny is surgical", () => {
  it("authored false hides exactly the named field+role, nothing else", () => {
    const rules: Rules = { salary: { INTERVIEWER: false } };
    // Hidden for the named role...
    expect(canSeeField(rules, "salary", ROLES.INTERVIEWER)).toBe(false);
    // ...but visible for every OTHER role (no entry = visible)
    expect(canSeeField(rules, "salary", ROLES.RECRUITER)).toBe(true);
    expect(canSeeField(rules, "salary", ROLES.HIRING_MANAGER)).toBe(true);
    expect(canSeeField(rules, "salary", ROLES.ADMIN)).toBe(true);
    // ...and OTHER fields are untouched for the hidden role
    expect(canSeeField(rules, "interviewNotes", ROLES.INTERVIEWER)).toBe(true);
    expect(canSeeField(rules, "assessmentScores", ROLES.INTERVIEWER)).toBe(true);
  });

  it("authored true is visible (explicit allow reads the same as default)", () => {
    const rules: Rules = { alignmentScore: { HIRING_MANAGER: true, INTERVIEWER: false } };
    expect(canSeeField(rules, "alignmentScore", ROLES.HIRING_MANAGER)).toBe(true);
    expect(canSeeField(rules, "alignmentScore", ROLES.INTERVIEWER)).toBe(false);
  });
});

describe("field visibility: SUPER_ADMIN override", () => {
  it("SUPER_ADMIN sees every field even when explicitly denied", () => {
    for (const field of VisibilityFieldSchema.options) {
      const lockedDown = { [field]: { SUPER_ADMIN: false } } as unknown as Rules;
      expect(canSeeField(lockedDown, field, ROLES.SUPER_ADMIN)).toBe(true);
    }
  });
});

describe("field visibility: a realistic multi-field, multi-role matrix", () => {
  const policy: Rules = {
    salary: { INTERVIEWER: false, RECRUITER: true },
    candidatePii: { INTERVIEWER: false },
    interviewNotes: { INTERVIEWER: true }, // panelists keep their own notes
    recruiterNotes: { INTERVIEWER: false, HIRING_MANAGER: false },
    analytics: { INTERVIEWER: false },
  };

  it("INTERVIEWER loses comp/PII/private-notes/analytics, keeps panel notes + scores", () => {
    expect(canSeeField(policy, "salary", ROLES.INTERVIEWER)).toBe(false);
    expect(canSeeField(policy, "candidatePii", ROLES.INTERVIEWER)).toBe(false);
    expect(canSeeField(policy, "recruiterNotes", ROLES.INTERVIEWER)).toBe(false);
    expect(canSeeField(policy, "analytics", ROLES.INTERVIEWER)).toBe(false);
    expect(canSeeField(policy, "interviewNotes", ROLES.INTERVIEWER)).toBe(true);
    // A field with no INTERVIEWER entry stays visible.
    expect(canSeeField(policy, "assessmentScores", ROLES.INTERVIEWER)).toBe(true);
  });

  it("RECRUITER is explicitly allowed salary and denied nothing else here", () => {
    expect(canSeeField(policy, "salary", ROLES.RECRUITER)).toBe(true);
    expect(canSeeField(policy, "recruiterNotes", ROLES.RECRUITER)).toBe(true);
  });

  it("HIRING_MANAGER is denied only recruiterNotes; the rest stay visible", () => {
    expect(canSeeField(policy, "recruiterNotes", ROLES.HIRING_MANAGER)).toBe(false);
    expect(canSeeField(policy, "salary", ROLES.HIRING_MANAGER)).toBe(true);
    expect(canSeeField(policy, "candidatePii", ROLES.HIRING_MANAGER)).toBe(true);
  });
});

describe("field visibility: matrix integrity + defensive defaults", () => {
  it("every VisibilityField resolves to a boolean for every VisibilityRole", () => {
    const policy: Rules = {};
    for (const field of VisibilityFieldSchema.options) {
      for (const role of VisibilityRoleSchema.options) {
        expect(typeof canSeeField(policy, field, role)).toBe("boolean");
      }
    }
  });

  it("a role not listed under a field's rule falls open (defaults visible)", () => {
    const rules: Rules = { salary: { INTERVIEWER: false } };
    expect(canSeeField(rules, "salary", "COMPLIANCE_OFFICER")).toBe(true);
  });
});
