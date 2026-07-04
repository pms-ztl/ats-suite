/**
 * MetricRollup population job (analytics-service).
 *
 * The /reporting funnel + summary read MetricRollup, but nothing populated it, so
 * they returned an empty set. This job IS the populator the schema anticipated
 * ("later, domain-event subscribers"): a low-frequency periodic sweep that, per
 * tenant, pulls the REAL per-stage application counts from candidate-service (the
 * SAME authoritative groupBy the live dashboard funnel reads) and mirrors them into
 * MetricRollup's 5 canonical funnel buckets.
 *
 * REAL DATA ONLY:
 *   - every value is candidate-service's real count, SET (not incremented) so a
 *     re-run converges to the true number rather than drifting,
 *   - a tenant whose overview read fails is SKIPPED (its existing rollup is left
 *     untouched — never overwritten with a fabricated 0),
 *   - stages with no applications yield a genuine 0 (an honest measured empty),
 *     which is correct for a funnel bucket that no one has reached.
 *
 * The granular Application stages are folded into the 5 funnel buckets the
 * MetricRollup funnel uses (applied | screened | interviewed | offered | hired).
 * REJECTED / WITHDRAWN are terminal exits, not funnel stages, so they are excluded
 * (matching the existing funnel semantics).
 *
 * Pure HTTP (no NATS/Redis) so analytics-service stays self-contained; it runs on
 * a timer and is fully idempotent.
 */
import { setMetric, FUNNEL_STAGES } from "../services/analytics.service.js";
import { listTenants, fetchApplicationsByStage } from "./rollup-client.js";
import type { Logger } from "pino";

/** Application stage -> funnel bucket. Any stage not listed (REJECTED / WITHDRAWN)
 *  is a terminal exit and contributes to no bucket. */
const STAGE_TO_FUNNEL: Record<string, (typeof FUNNEL_STAGES)[number]> = {
  APPLIED: "applied",
  SCREENED: "screened",
  PHONE_SCREEN: "screened",
  ASSESSMENT: "screened",
  INTERVIEW: "interviewed",
  TECHNICAL_ROUND: "interviewed",
  HR_ROUND: "interviewed",
  FINAL_REVIEW: "interviewed",
  OFFER: "offered",
  HIRED: "hired",
};

/** Fold a raw per-stage map into the 5 funnel buckets (every bucket present, 0 when
 *  no application currently sits in any of its stages). */
export function foldToFunnel(byStage: Record<string, number>): Record<(typeof FUNNEL_STAGES)[number], number> {
  const out = { applied: 0, screened: 0, interviewed: 0, offered: 0, hired: 0 };
  for (const [stage, count] of Object.entries(byStage)) {
    const bucket = STAGE_TO_FUNNEL[stage.toUpperCase()];
    if (!bucket || typeof count !== "number" || count < 0) continue;
    out[bucket] += count;
  }
  return out;
}

/** Roll up ONE tenant's funnel metrics. Returns true when the tenant's real counts
 *  were fetched + written, false when its overview read failed (skipped). */
export async function rollupTenant(tenantId: string, logger: Logger): Promise<boolean> {
  const byStage = await fetchApplicationsByStage(tenantId);
  if (byStage === null) return false; // candidate-service unreachable for this tenant -> leave rollup as-is
  const funnel = foldToFunnel(byStage);
  for (const stage of FUNNEL_STAGES) {
    await setMetric(tenantId, stage, funnel[stage]);
  }
  logger.debug({ tenantId, funnel }, "MetricRollup: tenant funnel rolled up");
  return true;
}

/** One full sweep across every tenant. Best-effort per tenant: one failure is
 *  logged + skipped, never aborts the sweep. */
export async function runRollupOnce(logger: Logger): Promise<{ tenants: number; rolledUp: number }> {
  const tenants = await listTenants();
  let rolledUp = 0;
  for (const t of tenants) {
    try {
      if (await rollupTenant(t.id, logger)) rolledUp += 1;
    } catch (err) {
      logger.warn({ err, tenantId: t.id }, "MetricRollup: tenant rollup failed (skipped)");
    }
  }
  return { tenants: tenants.length, rolledUp };
}

/**
 * Start the periodic MetricRollup sweep. Returns stop() for graceful shutdown.
 * Default cadence 10 min; the first sweep runs one interval after boot so startup
 * stays lean. Never overlaps a slow sweep with the next tick.
 */
export function startMetricRollup(logger: Logger, opts: { intervalMs?: number } = {}): { stop: () => Promise<void> } {
  const intervalMs = opts.intervalMs ?? 10 * 60_000;
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const res = await runRollupOnce(logger);
      if (res.rolledUp > 0) logger.info(res, "MetricRollup sweep complete");
    } catch (err) {
      logger.warn({ err }, "MetricRollup sweep failed");
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => { void tick(); }, intervalMs);
  timer.unref?.();
  logger.info({ intervalMs }, "MetricRollup sweep scheduled");
  return { stop: async () => { clearInterval(timer); } };
}
