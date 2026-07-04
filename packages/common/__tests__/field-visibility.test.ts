/**
 * Vitest suite for the SERVER-SIDE RBAC field-visibility matrix
 * (packages/common/src/rbac/field-visibility.ts).
 *
 * Closes the FORBIDDEN "UI-only permission hiding" gap: sensitive fields must be
 * stripped by the OWNING service before serialization, never merely hidden in
 * the frontend. These tests assert, per role, that:
 *   - each role SEES the fields it should on candidate/interview/offer/analytics;
 *   - each role does NOT see the fields it must not (salaries, interviewer notes,
 *     scores, decisions);
 *   - unknown / empty roles fall back to the LEAST-PRIVILEGE (most restrictive)
 *     view (only non-sensitive fields);
 *   - SUPER_ADMIN sees everything;
 *   - ownership (`isOwner`) grants the ADMIN-equivalent view of one's own entity;
 *   - filterVisibleFields never mutates its input and passes non-sensitive
 *     fields through untouched.
 *
 * Run:  npx vitest run packages/common/__tests__/field-visibility.test.ts
 */
import { describe, it, expect } from "vitest";
import {
  RBAC_ROLES,
  canViewField,
  filterVisibleFields,
} from "../src/rbac/field-visibility.js";

// A representative entity per type, mixing NON-sensitive fields (always visible)
// with the SENSITIVE fields the matrix governs.
const CANDIDATE = {
  id: "c1",
  fullName: "Ada Lovelace",
  stage: "INTERVIEW",
  recruiterNotes: "strong on SQL",
  alignmentScore: 82,
  screeningScore: 77,
  expectedSalary: 145000,
  currentSalary: 120000,
};

const INTERVIEW = {
  id: "i1",
  scheduledAt: "2026-07-10T15:00:00.000Z",
  roomUrl: "https://app/interview/room/i1",
  interviewerNotes: "hesitant on system design",
  interviewNotes: "hesitant on system design",
  panelistNotes: "ok",
  interviewScores: [4, 5],
  scores: [4, 5],
  rating: 4,
};

const OFFER = {
  id: "o1",
  candidateId: "c1",
  status: "PENDING",
  salary: 160000,
  salaryBand: "L5",
  compensation: 190000,
  baseSalary: 160000,
  bonus: 15000,
  equity: "0.05%",
  decision: "HIRE",
};

const ANALYTICS = {
  id: "a1",
  period: "2026-Q2",
  headcount: 42,
  analytics: { timeToHire: 21 },
  metrics: { funnel: [100, 40, 10] },
  compensationSpend: 3_400_000,
  salaryBenchmarks: { L5: 165000 },
  decision: "APPROVED",
};

describe("RBAC_ROLES list", () => {
  it("includes the additive org-leadership roles and HR_MANAGER", () => {
    expect(RBAC_ROLES).toContain("DEPARTMENT_HEAD");
    expect(RBAC_ROLES).toContain("EXECUTIVE");
    expect(RBAC_ROLES).toContain("HR_MANAGER");
  });

  it("keeps every legacy identity role", () => {
    for (const r of [
      "SUPER_ADMIN",
      "ADMIN",
      "RECRUITER",
      "HIRING_MANAGER",
      "COMPLIANCE_OFFICER",
      "INTERVIEWER",
      "CANDIDATE",
    ]) {
      expect(RBAC_ROLES).toContain(r);
    }
  });
});

describe("non-sensitive fields are always visible", () => {
  it("passes through name/stage/schedule/room for any role", () => {
    expect(canViewField("INTERVIEWER", "candidate", "fullName")).toBe(true);
    expect(canViewField("CANDIDATE", "candidate", "stage")).toBe(true);
    expect(canViewField("INTERVIEWER", "interview", "roomUrl")).toBe(true);
    expect(canViewField("EXECUTIVE", "interview", "scheduledAt")).toBe(true);
  });
});

describe("SUPER_ADMIN sees everything", () => {
  it.each([
    ["candidate", "expectedSalary"],
    ["interview", "interviewerNotes"],
    ["offer", "salary"],
    ["analytics", "compensationSpend"],
  ] as const)("%s.%s", (entity, field) => {
    expect(canViewField("SUPER_ADMIN", entity, field)).toBe(true);
  });

  it("filterVisibleFields keeps all keys for SUPER_ADMIN", () => {
    const out = filterVisibleFields(OFFER, "SUPER_ADMIN", "offer");
    expect(Object.keys(out).sort()).toEqual(Object.keys(OFFER).sort());
  });
});

describe("RECRUITER + HR_MANAGER see most", () => {
  for (const role of ["RECRUITER", "HR_MANAGER"] as const) {
    it(`${role} sees recruiter notes + scores + candidate salary`, () => {
      expect(canViewField(role, "candidate", "recruiterNotes")).toBe(true);
      expect(canViewField(role, "candidate", "alignmentScore")).toBe(true);
      expect(canViewField(role, "candidate", "expectedSalary")).toBe(true);
    });
    it(`${role} sees offer salary + decision`, () => {
      expect(canViewField(role, "offer", "salary")).toBe(true);
      expect(canViewField(role, "offer", "decision")).toBe(true);
    });
    it(`${role} sees interviewer notes + interview scores`, () => {
      expect(canViewField(role, "interview", "interviewerNotes")).toBe(true);
      expect(canViewField(role, "interview", "interviewScores")).toBe(true);
    });
  }
});

describe("HIRING_MANAGER sees candidate + scores but NOT raw salary unless owner", () => {
  it("sees candidate alignment score + recruiter notes", () => {
    expect(canViewField("HIRING_MANAGER", "candidate", "alignmentScore")).toBe(true);
    expect(canViewField("HIRING_MANAGER", "candidate", "recruiterNotes")).toBe(true);
    expect(canViewField("HIRING_MANAGER", "interview", "interviewScores")).toBe(true);
  });

  it("does NOT see the raw offer salary band by default", () => {
    expect(canViewField("HIRING_MANAGER", "offer", "salary")).toBe(false);
    expect(canViewField("HIRING_MANAGER", "offer", "salaryBand")).toBe(false);
    expect(canViewField("HIRING_MANAGER", "offer", "compensation")).toBe(false);
  });

  it("DOES see the raw offer salary when it owns the requisition (isOwner)", () => {
    expect(canViewField("HIRING_MANAGER", "offer", "salary", { isOwner: true })).toBe(true);
    const out = filterVisibleFields(OFFER, "HIRING_MANAGER", "offer", { isOwner: true });
    expect(out.salary).toBe(160000);
  });

  it("still sees the hire decision (not comp) on the offer", () => {
    expect(canViewField("HIRING_MANAGER", "offer", "decision")).toBe(true);
  });
});

describe("INTERVIEWER sees interview + candidate basics, NOT salaries or others' notes", () => {
  it("does NOT see other panelists' notes by default", () => {
    expect(canViewField("INTERVIEWER", "interview", "interviewerNotes")).toBe(false);
    expect(canViewField("INTERVIEWER", "interview", "panelistNotes")).toBe(false);
  });

  it("DOES see its OWN notes when marked owner", () => {
    expect(canViewField("INTERVIEWER", "interview", "interviewerNotes", { isOwner: true })).toBe(true);
  });

  it("does NOT see any offer compensation", () => {
    expect(canViewField("INTERVIEWER", "offer", "salary")).toBe(false);
    expect(canViewField("INTERVIEWER", "offer", "compensation")).toBe(false);
    expect(canViewField("INTERVIEWER", "offer", "bonus")).toBe(false);
  });

  it("does NOT see candidate salary fields", () => {
    expect(canViewField("INTERVIEWER", "candidate", "expectedSalary")).toBe(false);
    expect(canViewField("INTERVIEWER", "candidate", "currentSalary")).toBe(false);
  });

  it("filterVisibleFields strips notes/scores but keeps the interview shell", () => {
    const out = filterVisibleFields(INTERVIEW, "INTERVIEWER", "interview");
    expect(out.id).toBe("i1");
    expect(out.roomUrl).toBe(INTERVIEW.roomUrl);
    expect(out.scheduledAt).toBe(INTERVIEW.scheduledAt);
    expect(out.interviewerNotes).toBeUndefined();
    expect(out.panelistNotes).toBeUndefined();
    expect(out.interviewScores).toBeUndefined();
    // `rating` is explicitly allowed to interviewers.
    expect(out.rating).toBe(4);
  });
});

describe("DEPARTMENT_HEAD + EXECUTIVE see analytics + decisions + salaries, NOT raw interviewer notes", () => {
  for (const role of ["DEPARTMENT_HEAD", "EXECUTIVE"] as const) {
    it(`${role} sees analytics + comp spend + decision`, () => {
      expect(canViewField(role, "analytics", "analytics")).toBe(true);
      expect(canViewField(role, "analytics", "compensationSpend")).toBe(true);
      expect(canViewField(role, "analytics", "decision")).toBe(true);
    });
    it(`${role} sees offer salary + decision`, () => {
      expect(canViewField(role, "offer", "salary")).toBe(true);
      expect(canViewField(role, "offer", "compensation")).toBe(true);
      expect(canViewField(role, "offer", "decision")).toBe(true);
    });
    it(`${role} does NOT see raw interviewer/panelist notes`, () => {
      expect(canViewField(role, "interview", "interviewerNotes")).toBe(false);
      expect(canViewField(role, "interview", "panelistNotes")).toBe(false);
      // but they DO see the numeric interview scores (aggregatable signal).
      expect(canViewField(role, "interview", "interviewScores")).toBe(true);
    });
  }
});

describe("least-privilege default for unknown / empty / CANDIDATE roles", () => {
  for (const role of ["", "GHOST_ROLE", "CANDIDATE"]) {
    it(`${role || "(empty)"} sees only non-sensitive fields`, () => {
      // non-sensitive passes
      expect(canViewField(role, "candidate", "fullName")).toBe(true);
      // every sensitive field is stripped
      expect(canViewField(role, "candidate", "recruiterNotes")).toBe(false);
      expect(canViewField(role, "candidate", "alignmentScore")).toBe(false);
      expect(canViewField(role, "offer", "salary")).toBe(false);
      expect(canViewField(role, "interview", "interviewerNotes")).toBe(false);
      expect(canViewField(role, "analytics", "compensationSpend")).toBe(false);
    });

    it(`${role || "(empty)"} filterVisibleFields drops all sensitive offer keys`, () => {
      const out = filterVisibleFields(OFFER, role, "offer");
      expect(out.id).toBe("o1");
      expect(out.status).toBe("PENDING");
      expect(out.salary).toBeUndefined();
      expect(out.compensation).toBeUndefined();
      expect(out.decision).toBeUndefined();
    });
  }
});

describe("filterVisibleFields purity + edge cases", () => {
  it("does not mutate the input entity", () => {
    const clone = JSON.parse(JSON.stringify(OFFER));
    filterVisibleFields(OFFER, "INTERVIEWER", "offer");
    expect(OFFER).toEqual(clone);
  });

  it("returns null/undefined/primitives as-is", () => {
    expect(filterVisibleFields(null, "INTERVIEWER", "candidate")).toBeNull();
    expect(filterVisibleFields(undefined, "INTERVIEWER", "candidate")).toBeUndefined();
    expect(filterVisibleFields(42 as unknown as object, "INTERVIEWER", "candidate")).toBe(42);
  });

  it("maps arrays element-by-element", () => {
    const list = [CANDIDATE, { ...CANDIDATE, id: "c2" }];
    const out = filterVisibleFields(list as unknown as object, "INTERVIEWER", "candidate") as unknown as Array<Record<string, unknown>>;
    expect(out).toHaveLength(2);
    expect(out[0].fullName).toBe("Ada Lovelace");
    expect(out[0].expectedSalary).toBeUndefined();
    expect(out[1].id).toBe("c2");
    expect(out[1].alignmentScore).toBeUndefined();
  });
});
