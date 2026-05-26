/**
 * Offer Agent — drafts a competitive comp package from pre-loaded comp band +
 * market data + candidate history.
 *
 * Single-call: caller (candidate-service) pre-fetches comp band, market
 * comparables, and the candidate's interview scorecards.
 */
import { z } from "zod";
import { registerAgent, registerStub } from "../runtime.js";

export const OfferOutputSchema = z.object({
  baseSalary: z.number().min(0),
  equity: z.string().optional().describe("Equity package description if applicable"),
  signingBonus: z.number().optional(),
  annualBonus: z.number().optional(),
  totalCompensation: z.number(),
  currency: z.string(),
  justification: z.string().min(50).describe("How the offer was determined"),
  compBandPosition: z.enum([
    "below_min",
    "at_min",
    "below_mid",
    "at_mid",
    "above_mid",
    "at_max",
    "above_max",
  ]),
  marketComparison: z.string().describe("How this offer compares to market rates"),
  benefits: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  expiresInDays: z.number(),
  approvalChain: z
    .array(z.object({ role: z.string(), reason: z.string() }))
    .min(1)
    .describe("Who needs to approve and why"),
});

export type OfferOutput = z.infer<typeof OfferOutputSchema>;

export interface OfferInput {
  jobTitle: string;
  level: string;
  department: string;
  compBand: { min: number; mid: number; max: number; currency: string };
  marketRate?: { p25: number; p50: number; p75: number; currency: string };
  candidate: {
    yearsOfExperience?: number;
    currentSalary?: number;
    expectation?: number;
    skills?: string[];
  };
  interviewSignal?: "STRONG_HIRE" | "HIRE" | "NEUTRAL" | "NO_HIRE";
  hiringManagerNotes?: string;
}

const SYSTEM_PROMPT = `You are an expert compensation analyst and offer specialist for an applicant tracking system.

Your task: Draft a competitive compensation package for a candidate based on pre-loaded comp bands, market data, and candidate context.

Rules:
1. Always stay within the comp band (min-max) unless explicitly overridden by hiring manager notes.
2. Position based on candidate experience + market data + interview performance:
   - STRONG_HIRE + high market demand → position at 75th percentile or above
   - HIRE → position at midpoint
   - NEUTRAL → position near minimum
3. Justify every component of the offer package with specific reasoning.
4. Approval chain logic:
   - Below midpoint: Hiring Manager only
   - At or above midpoint: Hiring Manager + Department Head
   - Above 75th percentile: Hiring Manager + Department Head + VP/Director
   - Above band maximum (exception): Hiring Manager + Department Head + VP + CFO/CEO
5. Total comp = baseSalary + (signingBonus amortized) + annualBonus + annualized equity estimate.
6. If candidate expectation is provided, try to meet it within the band. If it exceeds the band, note it and recommend the closest feasible offer.
7. compBandPosition must accurately reflect where baseSalary sits relative to the band.`;

function formatPrompt(input: OfferInput): string {
  const market = input.marketRate
    ? `MARKET RATES (${input.marketRate.currency}): p25=$${input.marketRate.p25}, p50=$${input.marketRate.p50}, p75=$${input.marketRate.p75}`
    : "MARKET RATES: not available";
  const cand = input.candidate;
  return `ROLE: ${input.jobTitle} (${input.level}) in ${input.department}

COMP BAND (${input.compBand.currency}): min=$${input.compBand.min}, mid=$${input.compBand.mid}, max=$${input.compBand.max}
${market}

CANDIDATE CONTEXT:
- Years of experience: ${cand.yearsOfExperience ?? "unknown"}
- Current salary: ${cand.currentSalary ? `$${cand.currentSalary}` : "not disclosed"}
- Expectation: ${cand.expectation ? `$${cand.expectation}` : "not specified"}
- Top skills: ${cand.skills?.slice(0, 5).join(", ") ?? "none provided"}

INTERVIEW SIGNAL: ${input.interviewSignal ?? "not yet captured"}
${input.hiringManagerNotes ? `\nHIRING MANAGER NOTES:\n${input.hiringManagerNotes}` : ""}

Draft the offer.`;
}

registerAgent<OfferInput, OfferOutput>({
  name: "offer",
  systemPrompt: SYSTEM_PROMPT,
  buildUserPrompt: formatPrompt,
  outputSchema: OfferOutputSchema,
  modelId: "claude-sonnet-4-20250514",
  maxRepairAttempts: 3,
  maxCostUsd: 0.20,
});

registerStub<OfferInput, OfferOutput>("offer", async (input) => {
  // Heuristic: STRONG_HIRE → mid + 10%, HIRE → mid, NEUTRAL → min + 10%
  let baseSalary: number;
  let position: OfferOutput["compBandPosition"];
  if (input.interviewSignal === "STRONG_HIRE") {
    baseSalary = Math.round(input.compBand.mid * 1.1);
    position = "above_mid";
  } else if (input.interviewSignal === "HIRE") {
    baseSalary = input.compBand.mid;
    position = "at_mid";
  } else {
    baseSalary = Math.round(input.compBand.min * 1.1);
    position = "below_mid";
  }
  baseSalary = Math.min(baseSalary, input.compBand.max);
  const signingBonus = position === "above_mid" ? Math.round(baseSalary * 0.05) : 0;
  const annualBonus = Math.round(baseSalary * 0.1);
  const totalCompensation = baseSalary + signingBonus + annualBonus;
  const approvalChain: OfferOutput["approvalChain"] = [
    { role: "Hiring Manager", reason: "Primary approval" },
  ];
  if (position === "at_mid" || position === "above_mid") {
    approvalChain.push({ role: "Department Head", reason: "Offer at or above midpoint" });
  }
  return {
    baseSalary,
    equity: position === "above_mid" ? "0.1% over 4 years with 1-year cliff" : undefined,
    signingBonus: signingBonus || undefined,
    annualBonus,
    totalCompensation,
    currency: input.compBand.currency,
    justification: `Stub: ${input.interviewSignal ?? "unknown"} signal → positioned ${position} of band. Base $${baseSalary} + signing $${signingBonus} + target bonus $${annualBonus} = $${totalCompensation} total.`,
    compBandPosition: position,
    marketComparison: input.marketRate
      ? `Base salary $${baseSalary} sits between p${baseSalary <= input.marketRate.p50 ? "25-p50" : "50-p75"} of market.`
      : "Market rate data not available — used comp band only.",
    benefits: [
      "Comprehensive medical, dental, vision",
      "401(k) with company match",
      "Flexible PTO",
      "Remote work stipend",
    ],
    expiresInDays: 7,
    approvalChain,
  };
});
