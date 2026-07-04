/**
 * applicationCount rollup (job-service).
 *
 * The accept-fast public apply path (public.ts) deliberately DROPPED the per-apply
 * `JobPosting.applicationCount` UPDATE because that write took a row-level lock on
 * the JobPosting under an apply spike (a top contention point). The comment there
 * promised the count would be "refreshed by a periodic rollup" — this module IS
 * that rollup, so the field no longer silently drifts.
 *
 * REAL COUNTS ONLY. The Application rows live in candidate-service (DB-per-service),
 * so job-service cannot count them locally. We ask candidate-service for the real
 * per-requisition count (fetchApplicationCountForRequisition) and write that exact
 * number onto the JobPosting. We NEVER increment a guess or fabricate a total:
 *   - a candidate-service read error -> we leave the stored count untouched (no 0),
 *   - a response AT candidate-service's 200-row read cap -> we only ever RAISE the
 *     stored count to the observed floor (200), never LOWER a higher stored value
 *     down to a capped read (which would understate a genuinely larger posting).
 *
 * Two complementary drivers (both call the same reconcile core):
 *   1. EVENT-DRIVEN (application-count-subscriber.ts) — reconciles the affected
 *      requisition's postings the moment a lifecycle event (stage.changed / hired /
 *      rejected) arrives, so a count is fresh right after pipeline movement.
 *   2. PERIODIC (startApplicationCountRollup below) — a low-frequency sweep that
 *      reconciles every published posting, catching the ONE case events miss: a
 *      brand-new accept-fast apply (candidate-service emits no submit event, so a
 *      fresh application at APPLIED never triggers the event driver until it moves).
 *
 * Runs entirely outside any HTTP request -> uses the admin (non-RLS) client scoped
 * EXPLICITLY by tenantId on every query, like the other cross-service workers.
 */
import { prismaAdmin as prisma } from "./prisma.js";
import { fetchApplicationCountForRequisition } from "./service-client.js";
import type { Logger } from "pino";

/**
 * Reconcile JobPosting.applicationCount for every posting of ONE requisition to the
 * REAL count candidate-service reports. tenant-scoped on every query. Returns the
 * number of postings whose stored count actually changed (0 = already accurate, or
 * the count read was skipped because candidate-service was unreachable).
 *
 * A JobPosting is keyed on requisitionId, and a requisition MAY have more than one
 * posting (e.g. re-published), so we reconcile all of them to the same real total.
 */
export async function reconcileApplicationCountForRequisition(
  tenantId: string,
  requisitionId: string,
  logger: Logger,
): Promise<number> {
  const postings = await prisma.jobPosting.findMany({
    where: { tenantId, requisitionId },
    select: { id: true, applicationCount: true },
  });
  if (postings.length === 0) return 0; // no posting for this requisition -> nothing to roll up

  const real = await fetchApplicationCountForRequisition(tenantId, requisitionId);
  if (real === null) return 0; // candidate-service unreachable -> leave stored counts as-is (no fabricated 0)

  let changed = 0;
  for (const p of postings) {
    // Capped read: candidate-service returned AT its 200-row cap, so `real.count`
    // is a FLOOR, not the exact total. Only raise a stored count that is behind the
    // floor; never lower a higher stored value to the cap (that would understate a
    // genuinely larger posting). An uncapped read is the exact total -> set it.
    const target = real.capped ? Math.max(p.applicationCount, real.count) : real.count;
    if (target === p.applicationCount) continue;
    const { count } = await prisma.jobPosting.updateMany({
      where: { id: p.id, tenantId },
      data: { applicationCount: target },
    });
    if (count > 0) {
      changed += count;
      logger.debug(
        { postingId: p.id, requisitionId, from: p.applicationCount, to: target, capped: real.capped },
        "applicationCount rollup: reconciled",
      );
    }
  }
  return changed;
}

/**
 * One periodic sweep: reconcile applicationCount for every PUBLISHED posting across
 * all tenants (the sweep is a trusted cross-tenant background task, scoped by the
 * posting's own tenantId on the per-requisition reconcile). Unpublished postings
 * take no public applies, so we skip them to keep the sweep light. De-duplicates by
 * requisitionId so a requisition with multiple postings costs ONE candidate-service
 * read. Best-effort per requisition: one failed read is logged + skipped, never
 * aborts the sweep.
 */
export async function runApplicationCountRollupOnce(logger: Logger): Promise<{ requisitions: number; postingsChanged: number }> {
  const published = await prisma.jobPosting.findMany({
    where: { isPublished: true },
    select: { tenantId: true, requisitionId: true },
  });
  // De-dup (tenantId, requisitionId) so multi-posting requisitions read once.
  const seen = new Set<string>();
  const pairs: { tenantId: string; requisitionId: string }[] = [];
  for (const p of published) {
    const key = `${p.tenantId}::${p.requisitionId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ tenantId: p.tenantId, requisitionId: p.requisitionId });
  }

  let postingsChanged = 0;
  for (const { tenantId, requisitionId } of pairs) {
    try {
      postingsChanged += await reconcileApplicationCountForRequisition(tenantId, requisitionId, logger);
    } catch (err) {
      logger.warn({ err, tenantId, requisitionId }, "applicationCount rollup: reconcile failed for requisition (skipped)");
    }
  }
  return { requisitions: pairs.length, postingsChanged };
}

/**
 * Start the periodic applicationCount rollup sweep on a fixed interval. Returns a
 * stop() for graceful shutdown. Default cadence is 5 min — high enough to keep the
 * denormalized count close to real without hammering candidate-service; the
 * event-driven subscriber keeps it fresh on pipeline movement between sweeps. The
 * first sweep runs one interval AFTER boot (not immediately) so startup stays lean.
 */
export function startApplicationCountRollup(
  logger: Logger,
  opts: { intervalMs?: number } = {},
): { stop: () => Promise<void> } {
  const intervalMs = opts.intervalMs ?? 5 * 60_000;
  let running = false;
  const tick = async () => {
    if (running) return; // never overlap a slow sweep with the next tick
    running = true;
    try {
      const res = await runApplicationCountRollupOnce(logger);
      if (res.postingsChanged > 0) {
        logger.info(res, "applicationCount rollup sweep complete");
      }
    } catch (err) {
      logger.warn({ err }, "applicationCount rollup sweep failed");
    } finally {
      running = false;
    }
  };
  const timer = setInterval(() => { void tick(); }, intervalMs);
  timer.unref?.(); // do not keep the event loop alive on shutdown
  logger.info({ intervalMs }, "applicationCount rollup sweep scheduled");
  return {
    stop: async () => {
      clearInterval(timer);
    },
  };
}
