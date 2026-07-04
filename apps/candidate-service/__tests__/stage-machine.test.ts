/**
 * Vitest suite for the application stage state machine
 * (apps/candidate-service/src/lib/stage-machine.ts).
 *
 * Covers:
 *   - legal forward moves and one-step backward corrections;
 *   - illegal jumps that must be rejected (out of terminal states, into HIRED
 *     from anything but OFFER, into an unknown/custom stage);
 *   - terminal-decline reachability from any stage (REJECTED / WITHDRAWN);
 *   - the initial-stage clamp on create;
 *   - the error envelope thrown by assertLegalTransition (VALIDATION_ERROR /
 *     400 with fromStage + toStage in details).
 *
 * Run:  npx vitest run apps/candidate-service/__tests__/stage-machine.test.ts
 */
import { describe, it, expect } from "vitest";
import {
  STAGE_ORDER,
  isKnownStage,
  isTerminalDecline,
  isLegalTransition,
  assertLegalTransition,
  clampInitialStage,
  IMMUTABLE_STAGES,
  TERMINAL_DECLINE_STAGES,
} from "../src/lib/stage-machine.js";

// The canonical active pipeline (excludes the terminal declines) in order.
const ACTIVE_ORDER = [
  "APPLIED",
  "SCREENED",
  "PHONE_SCREEN",
  "ASSESSMENT",
  "INTERVIEW",
  "TECHNICAL_ROUND",
  "HR_ROUND",
  "FINAL_REVIEW",
  "OFFER",
  "HIRED",
];

describe("STAGE_ORDER table", () => {
  it("matches the prisma ApplicationStage enum order for the active pipeline", () => {
    for (let i = 0; i < ACTIVE_ORDER.length; i++) {
      expect(STAGE_ORDER[ACTIVE_ORDER[i]!]).toBe(i);
    }
  });

  it("places terminal declines at the end so forward-only guards never regress into them", () => {
    expect(STAGE_ORDER["REJECTED"]).toBeGreaterThan(STAGE_ORDER["HIRED"]!);
    expect(STAGE_ORDER["WITHDRAWN"]).toBeGreaterThan(STAGE_ORDER["HIRED"]!);
  });
});

describe("isKnownStage / isTerminalDecline", () => {
  it("recognizes every canonical stage", () => {
    for (const s of [...ACTIVE_ORDER, "REJECTED", "WITHDRAWN"]) {
      expect(isKnownStage(s)).toBe(true);
    }
  });

  it("rejects unknown / custom stage names", () => {
    expect(isKnownStage("CUSTOM_STAGE")).toBe(false);
    expect(isKnownStage("PORTFOLIO_REVIEW")).toBe(false);
    expect(isKnownStage("")).toBe(false);
    expect(isKnownStage("hired")).toBe(false); // case-sensitive
  });

  it("flags exactly REJECTED and WITHDRAWN as terminal declines", () => {
    expect(isTerminalDecline("REJECTED")).toBe(true);
    expect(isTerminalDecline("WITHDRAWN")).toBe(true);
    expect(isTerminalDecline("HIRED")).toBe(false);
    expect(isTerminalDecline("OFFER")).toBe(false);
    expect([...TERMINAL_DECLINE_STAGES].sort()).toEqual(["REJECTED", "WITHDRAWN"]);
  });
});

describe("isLegalTransition — legal moves", () => {
  it("allows every single forward step along the active pipeline", () => {
    for (let i = 0; i < ACTIVE_ORDER.length - 1; i++) {
      const from = ACTIVE_ORDER[i]!;
      const to = ACTIVE_ORDER[i + 1]!;
      expect(isLegalTransition(from, to)).toBe(true);
    }
  });

  it("allows multi-step forward jumps between active stages (board stays permissive)", () => {
    expect(isLegalTransition("APPLIED", "INTERVIEW")).toBe(true);
    expect(isLegalTransition("SCREENED", "OFFER")).toBe(true);
    expect(isLegalTransition("PHONE_SCREEN", "FINAL_REVIEW")).toBe(true);
  });

  it("allows one-step and multi-step backward corrections between active stages", () => {
    expect(isLegalTransition("INTERVIEW", "ASSESSMENT")).toBe(true);
    expect(isLegalTransition("ASSESSMENT", "PHONE_SCREEN")).toBe(true);
    expect(isLegalTransition("OFFER", "APPLIED")).toBe(true);
  });

  it("treats a no-op re-save of the same stage as legal (idempotent)", () => {
    for (const s of [...ACTIVE_ORDER, "REJECTED", "WITHDRAWN"]) {
      expect(isLegalTransition(s, s)).toBe(true);
    }
  });

  it("allows OFFER -> HIRED (the one legitimate manual advance into HIRED)", () => {
    expect(isLegalTransition("OFFER", "HIRED")).toBe(true);
  });
});

describe("isLegalTransition — terminal declines reachable from anywhere", () => {
  it("allows REJECTED and WITHDRAWN from every active stage", () => {
    for (const from of ACTIVE_ORDER) {
      expect(isLegalTransition(from, "REJECTED")).toBe(true);
      expect(isLegalTransition(from, "WITHDRAWN")).toBe(true);
    }
  });

  it("allows switching between the two terminal declines (still a decline)", () => {
    expect(isLegalTransition("REJECTED", "WITHDRAWN")).toBe(true);
    expect(isLegalTransition("WITHDRAWN", "REJECTED")).toBe(true);
  });
});

describe("isLegalTransition — illegal moves rejected", () => {
  it("rejects reaching HIRED from anything but OFFER", () => {
    for (const from of ACTIVE_ORDER) {
      if (from === "OFFER" || from === "HIRED") continue;
      expect(isLegalTransition(from, "HIRED")).toBe(false);
    }
    expect(isLegalTransition("APPLIED", "HIRED")).toBe(false);
    expect(isLegalTransition("FINAL_REVIEW", "HIRED")).toBe(false);
  });

  it("rejects any move OUT of a terminal / immutable stage", () => {
    for (const from of IMMUTABLE_STAGES) {
      // Cannot re-enter the active pipeline from a terminal state.
      expect(isLegalTransition(from, "APPLIED")).toBe(false);
      expect(isLegalTransition(from, "INTERVIEW")).toBe(false);
      expect(isLegalTransition(from, "OFFER")).toBe(false);
    }
    // HIRED cannot be walked back into the pipeline...
    expect(isLegalTransition("HIRED", "OFFER")).toBe(false);
    // ...but a hired candidate CAN still be declined/withdrawn (rule 3 wins).
    expect(isLegalTransition("HIRED", "REJECTED")).toBe(true);
    expect(isLegalTransition("HIRED", "WITHDRAWN")).toBe(true);
  });

  it("rejects a move to an unknown / custom stage name", () => {
    expect(isLegalTransition("APPLIED", "CUSTOM_STAGE")).toBe(false);
    expect(isLegalTransition("INTERVIEW", "PORTFOLIO_REVIEW")).toBe(false);
    expect(isLegalTransition("OFFER", "")).toBe(false);
    expect(isLegalTransition("APPLIED", "hired")).toBe(false); // wrong case is unknown
  });
});

describe("assertLegalTransition — error envelope", () => {
  it("does not throw for a legal transition", () => {
    expect(() => assertLegalTransition("APPLIED", "SCREENED")).not.toThrow();
    expect(() => assertLegalTransition("OFFER", "HIRED")).not.toThrow();
    expect(() => assertLegalTransition("INTERVIEW", "REJECTED")).not.toThrow();
  });

  it("throws a 400 VALIDATION_ERROR carrying from/to in the details for an illegal jump", () => {
    let caught: any;
    try {
      assertLegalTransition("APPLIED", "HIRED");
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeDefined();
    expect(caught.status).toBe(400);
    expect(caught.code).toBe("VALIDATION_ERROR");
    expect(caught.message).toContain("APPLIED");
    expect(caught.message).toContain("HIRED");
    expect(caught.details).toMatchObject({ fromStage: "APPLIED", toStage: "HIRED" });
  });

  it("explains a terminal-state edit attempt", () => {
    let caught: any;
    try {
      assertLegalTransition("REJECTED", "INTERVIEW");
    } catch (err) {
      caught = err;
    }
    expect(caught.status).toBe(400);
    expect(caught.message).toContain("terminal");
    expect(caught.details).toMatchObject({ fromStage: "REJECTED", toStage: "INTERVIEW" });
  });

  it("explains an unknown / custom target stage", () => {
    let caught: any;
    try {
      assertLegalTransition("APPLIED", "CUSTOM_STAGE");
    } catch (err) {
      caught = err;
    }
    expect(caught.status).toBe(400);
    expect(caught.message).toContain("CUSTOM_STAGE");
    expect(caught.details).toMatchObject({ fromStage: "APPLIED", toStage: "CUSTOM_STAGE" });
  });
});

describe("clampInitialStage — create clamp", () => {
  it("defaults to APPLIED when no stage is requested", () => {
    expect(clampInitialStage(undefined)).toBe("APPLIED");
    expect(clampInitialStage(null)).toBe("APPLIED");
  });

  it("allows SCREENED for pre-screened imports", () => {
    expect(clampInitialStage("SCREENED")).toBe("SCREENED");
  });

  it("clamps any other requested initial stage down to APPLIED", () => {
    expect(clampInitialStage("HIRED")).toBe("APPLIED");
    expect(clampInitialStage("OFFER")).toBe("APPLIED");
    expect(clampInitialStage("INTERVIEW")).toBe("APPLIED");
    expect(clampInitialStage("REJECTED")).toBe("APPLIED");
    expect(clampInitialStage("CUSTOM_STAGE")).toBe("APPLIED");
  });
});
