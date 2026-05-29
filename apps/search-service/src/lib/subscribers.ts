import { subscribeToEvents } from "@cdc-ats/nats-client";
import type { Logger } from "pino";
import { prisma } from "./prisma.js";

const unwrap = (f: any): any => (f && typeof f === "object" && "value" in f ? f.value : f);

/**
 * Keep the candidate side of the search index in sync: on resume.parsed, upsert
 * a CANDIDATE document from the parsed payload (defensive — accepts the Phase 37
 * confidence-wrapped shape or a flat shape).
 */
export async function startSearchSubscribers(logger: Logger): Promise<void> {
  await subscribeToEvents({
    stream: "RESUME_EVENTS",
    subject: "tenant.*.resume.parsed",
    durable: "search-service:resume-parsed",
    logger,
    handler: async (envelope: any) => {
      const p = envelope?.payload ?? {};
      const tenantId = p.tenantId;
      const refId = p.candidateId;
      if (!tenantId || !refId) return;
      const core = (envelope?.payload?.enriched ?? p.parsed?.enriched ?? p.parsed ?? p.enriched ?? {}) as any;
      const skills: string[] = Array.isArray(core.skills)
        ? core.skills.map((s: any) => (typeof s === "string" ? s : s?.raw ?? s?.name)).filter(Boolean)
        : [];
      const name = unwrap(core.name);
      const title =
        name && typeof name === "object"
          ? `${name.first ?? ""} ${name.last ?? ""}`.trim()
          : typeof name === "string"
            ? name
            : "";
      const text = [unwrap(core.summary), skills.join(", ")].filter(Boolean).join(" ");
      try {
        await prisma.searchDocument.upsert({
          where: { tenantId_kind_refId: { tenantId, kind: "CANDIDATE", refId } },
          create: { tenantId, kind: "CANDIDATE", refId, title, text, skills, metadata: { resumeId: p.resumeId ?? null } },
          update: { title, text, skills },
        });
      } catch (err) {
        logger.warn({ err, refId }, "search index upsert failed");
      }
    },
  });
  logger.info("search-service subscribers started");
}
