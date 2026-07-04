/**
 * Application stage state machine — single source of truth for the canonical
 * pipeline order and which stage transitions are legal.
 *
 * Historically the PATCH /internal/applications/:id route accepted ANY
 * ApplicationStage the client sent, with zero transition validation, so an
 * APPLIED -> HIRED jump succeeded silently and terminal states (REJECTED /
 * WITHDRAWN) could be edited back into the active pipeline. This module adds a
 * validator that keeps the product's existing permissive moves (forward jumps
 * and one-step backward corrections are how recruiters actually use the board)
 * but REJECTS the transitions that are clearly illegal:
 *
 *   - any move OUT of a terminal state (REJECTED / WITHDRAWN / HIRED) — those
 *     are immutable except through the dedicated /reject and /hire routes;
 *   - a move TO an unknown / non-canonical stage;
 *   - reaching HIRED via a plain stage edit unless the application is at OFFER
 *     (HIRED is the /hire route's job; the only legitimate manual PATCH into it
 *     is the final OFFER -> HIRED advance).
 *
 * Any stage may always transition to REJECTED or WITHDRAWN (a candidate can be
 * declined or withdraw from anywhere in the funnel).
 *
 * The STAGE_ORDER table mirrors the prisma ApplicationStage enum order and is
 * the same ordering the NATS subscribers use for their forward-only guard, so
 * there is one canonical order in the service.
 */
import { Errors } from "@cdc-ats/common";

/**
 * Canonical ApplicationStage order. A higher index is "later" in the pipeline.
 * Terminal stages (REJECTED / WITHDRAWN) sit at the end so the forward-only
 * subscriber guards never regress an application into them. HIRED is the last
 * active stage. Mirrors apps/candidate-service/prisma/schema.prisma.
 */
export const STAGE_ORDER: Record<string, number> = {
  APPLIED: 0,
  SCREENED: 1,
  PHONE_SCREEN: 2,
  ASSESSMENT: 3,
  INTERVIEW: 4,
  TECHNICAL_ROUND: 5,
  HR_ROUND: 6,
  FINAL_REVIEW: 7,
  OFFER: 8,
  HIRED: 9,
  REJECTED: 99,
  WITHDRAWN: 99,
};

/** The two terminal decline stages reachable from anywhere in the funnel. */
export const TERMINAL_DECLINE_STAGES = ["REJECTED", "WITHDRAWN"] as const;

/**
 * Stages that are immutable via a plain stage edit. REJECTED / WITHDRAWN are
 * terminal declines; HIRED is a terminal success. Moving OUT of any of these
 * through PATCH is rejected — reversing a decision is a deliberate, audited act
 * that does not belong on the generic stage-update path.
 */
export const IMMUTABLE_STAGES = new Set<string>(["REJECTED", "WITHDRAWN", "HIRED"]);

/** True when `stage` is a known canonical ApplicationStage. */
export function isKnownStage(stage: string): boolean {
  return Object.prototype.hasOwnProperty.call(STAGE_ORDER, stage);
}

/** True when `stage` is one of the terminal decline stages. */
export function isTerminalDecline(stage: string): boolean {
  return (TERMINAL_DECLINE_STAGES as readonly string[]).includes(stage);
}

/**
 * Pure predicate: is moving `from` -> `to` a legal stage transition?
 *
 * Rules (see module header):
 *   1. `to` must be a known canonical stage.
 *   2. A no-op (from === to) is always legal (idempotent re-save).
 *   3. Any stage may move to REJECTED / WITHDRAWN.
 *   4. From an immutable stage (REJECTED / WITHDRAWN / HIRED) no other move is
 *      legal (rule 2 + 3 already handled the allowed cases above).
 *   5. HIRED may only be reached from OFFER (the final manual advance).
 *   6. Everything else — forward jumps and backward corrections between active
 *      stages — is permitted, preserving the board's existing behavior.
 */
export function isLegalTransition(from: string, to: string): boolean {
  // 1. Unknown destination is never legal.
  if (!isKnownStage(to)) return false;
  // 2. Idempotent re-save of the same stage.
  if (from === to) return true;
  // 3. Decline from anywhere.
  if (isTerminalDecline(to)) return true;
  // 4. No move OUT of a terminal / immutable state (the legal exits were
  //    already covered by rules 2 + 3).
  if (IMMUTABLE_STAGES.has(from)) return false;
  // 5. HIRED only via OFFER -> HIRED.
  if (to === "HIRED") return from === "OFFER";
  // 6. Any other active -> active move (forward or backward) is permitted.
  return true;
}

/**
 * Assert a transition is legal or throw a VALIDATION_ERROR (400) with a clear,
 * client-facing message that names both stages and the reason. Call this in the
 * stage-update route whenever the request carries a new `stage`.
 */
export function assertLegalTransition(from: string, to: string): void {
  if (isLegalTransition(from, to)) return;

  let reason: string;
  if (!isKnownStage(to)) {
    reason = `"${to}" is not a valid stage`;
  } else if (IMMUTABLE_STAGES.has(from)) {
    reason = `${from} is a terminal stage and cannot be changed here (use the dedicated hire/reject flow to reverse a decision)`;
  } else if (to === "HIRED") {
    reason = `an application can only be marked HIRED from OFFER (use the hire action)`;
  } else {
    reason = `that transition is not allowed`;
  }

  throw Errors.validation(`Illegal stage transition ${from} -> ${to}: ${reason}`, {
    fromStage: from,
    toStage: to,
  });
}

/**
 * Clamp the initial stage supplied on application creation. Callers may only
 * open an application at APPLIED or SCREENED (the latter for pre-screened
 * imports); any other requested initial stage falls back to APPLIED rather than
 * letting a create jump straight into the middle (or end) of the pipeline.
 */
export function clampInitialStage(requested: string | undefined | null): string {
  if (requested === "SCREENED") return "SCREENED";
  return "APPLIED";
}
