/** Reporting logic + rollup access — pure of HTTP concerns, unit-testable. */
import { prisma } from "../lib/prisma.js";
import type { IngestInput } from "../schemas/analytics.schemas.js";

export const FUNNEL_STAGES = ["applied", "screened", "interviewed", "offered", "hired"] as const;

export async function ingest(tenantId: string, b: IngestInput) {
  const row = await prisma.metricRollup.upsert({
    where: { tenantId_metric_dimension_period: { tenantId, metric: b.metric, dimension: b.dimension, period: b.period } },
    create: { tenantId, metric: b.metric, dimension: b.dimension, period: b.period, value: b.delta },
    update: { value: { increment: b.delta } },
  });
  return { metric: row.metric, dimension: row.dimension, period: row.period, value: row.value };
}

export async function summary(tenantId: string) {
  const rollups = await prisma.metricRollup.findMany({ where: { tenantId }, orderBy: { metric: "asc" } });
  return { count: rollups.length, rollups };
}

export async function funnel(tenantId: string) {
  const rows = await prisma.metricRollup.findMany({
    where: { tenantId, metric: { in: [...FUNNEL_STAGES] }, dimension: "all", period: "all" },
  });
  const byMetric: Record<string, number> = {};
  for (const r of rows) byMetric[r.metric] = (byMetric[r.metric] ?? 0) + r.value;
  return FUNNEL_STAGES.map((s, i) => {
    const count = byMetric[s] ?? 0;
    const prev = i > 0 ? byMetric[FUNNEL_STAGES[i - 1]!] ?? 0 : count;
    return { stage: s, count, conversionFromPrev: prev ? Number((count / prev).toFixed(3)) : null };
  });
}

export async function metrics(tenantId: string, metric?: string, period?: string) {
  const where: { tenantId: string; metric?: string; period?: string } = { tenantId };
  if (metric) where.metric = metric;
  if (period) where.period = period;
  return prisma.metricRollup.findMany({ where, orderBy: { updatedAt: "desc" }, take: 200 });
}
