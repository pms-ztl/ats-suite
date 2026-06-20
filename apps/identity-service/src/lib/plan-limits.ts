/**
 * Plan limits — identity-service uses these for seat enforcement.
 *
 * WF3-C5 (pure refactor): the hand-maintained PLAN_LIMITS copy that used to live
 * here has been COLLAPSED into the single derived object in @cdc-ats/common
 * (modules/plan-limits). This file is now a thin re-export so every call site
 * (users.ts, sso-jit.ts) keeps importing from "./plan-limits.js" / "../lib/
 * plan-limits.js" unchanged — zero call-site / gating behavior change.
 *
 * EQUIVALENCE (byte-equal to the previous in-service copy — no entitlement change):
 *   FREE         seats:1  activeJobs:3   resumesPerMonth:10   bulkUploadMax:25   agents:["resume-parser"]                                            customForms:false configurableRounds:false
 *   STARTER      seats:5  activeJobs:20  resumesPerMonth:500  bulkUploadMax:100  agents:["resume-parser","candidate-screener","interview-scheduler"] customForms:true  configurableRounds:true
 *   PROFESSIONAL seats:15 activeJobs:-1  resumesPerMonth:5000 bulkUploadMax:500  agents:"ALL"                                                        customForms:true  configurableRounds:true
 *   ENTERPRISE   seats:-1 activeJobs:-1  resumesPerMonth:-1   bulkUploadMax:1000 agents:"ALL"                                                        customForms:true  configurableRounds:true
 */
export {
  type PlanLimits,
  PLAN_LIMITS,
  isUnlimited,
  canAddSeats,
} from "@cdc-ats/common";
