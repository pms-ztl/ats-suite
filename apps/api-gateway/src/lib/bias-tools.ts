/**
 * Tool IMPLEMENTATIONS for the agentic bias-auditor (api-gateway).
 *
 *   compute_adverse_impact    → deterministic 4/5ths stats engine (the new
 *                               real "data source" — math, not a prompt dump)
 *   flag_compliance_violation → recorded compliance flag (ACTION)
 *
 * Privacy preserved: operates only on group counts, never PII.
 */
import type { ToolImpl } from "@cdc-ats/ai-engine";
import type { Logger } from "pino";

export function buildBiasTools(opts: { tenantId: string; logger: Logger }): {
  tools: Record<string, ToolImpl>;
  flagged: Array<{ attribute: string; stage: string; ratio: number; reason: string }>;
} {
  const flagged: Array<{ attribute: string; stage: string; ratio: number; reason: string }> = [];

  const tools: Record<string, ToolImpl> = {
    compute_adverse_impact: async (args: {
      groups: Array<{ name: string; applicants: number; selected: number }>;
    }) => {
      const groups = args.groups.map((g) => ({
        ...g,
        selectionRate: g.applicants > 0 ? g.selected / g.applicants : 0,
      }));
      const rates = groups.map((g) => g.selectionRate);
      const highest = Math.max(...rates, 0);
      const lowest = Math.min(...rates.filter((r) => r >= 0), highest);
      const adverseImpactRatio = highest > 0 ? Number((lowest / highest).toFixed(4)) : 1;
      const fourFifthsPass = adverseImpactRatio >= 0.8;
      const byRate = [...groups].sort((a, b) => b.selectionRate - a.selectionRate);
      return {
        groups,
        adverseImpactRatio,
        fourFifthsPass,
        highestRateGroup: byRate[0]?.name ?? "",
        lowestRateGroup: byRate[byRate.length - 1]?.name ?? "",
      };
    },

    flag_compliance_violation: async (args: {
      attribute: string;
      stage: string;
      ratio: number;
      reason: string;
    }) => {
      flagged.push(args);
      opts.logger.warn(
        { tenantId: opts.tenantId, attribute: args.attribute, stage: args.stage, ratio: args.ratio },
        "Bias auditor flagged a 4/5ths compliance violation",
      );
      return { ok: true, flagged: true };
    },
  };

  return { tools, flagged };
}
