/**
 * GDPR — per-candidate data export + delete (right to access + right to
 * be forgotten under Articles 15 + 17 of the regulation).
 *
 *   GET    /internal/gdpr/candidates/:id/export   — bundles candidate's data
 *   DELETE /internal/gdpr/candidates/:id          — anonymizes/deletes
 *
 * The gateway exposes /api/gdpr/* and fans these out to other services
 * (resume, interview, screening) so a full per-candidate bundle ends up
 * in the response.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { ok, Errors, getTenantId, getUserId, createLogger, requireTenantAdmin } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const logger = createLogger({ serviceName: "candidate-service:gdpr" });
const router = Router();

// ── GET /internal/gdpr/candidates/:id/export ──────────────────────────────
router.get("/candidates/:id/export", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const candidate = await prisma.candidate.findFirst({
      where: { id, tenantId },
      include: {
        applications: true,
        notes: true,
      },
    });
    if (!candidate) throw Errors.notFound("Candidate");

    // Optional attachments
    const attachments = await prisma.applicationAttachment.findMany({
      where: { tenantId, applicationId: { in: candidate.applications.map((a) => a.id) } },
    });

    ok(res, {
      exportedAt: new Date().toISOString(),
      gdprArticle: "Article 15 — Right of access",
      candidate: {
        id: candidate.id,
        email: candidate.email,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        phone: candidate.phone,
        location: candidate.location,
        linkedinUrl: candidate.linkedinUrl,
        portfolioUrl: candidate.portfolioUrl,
        source: candidate.source,
        tags: candidate.tags,
        summary: candidate.summary,
        createdAt: candidate.createdAt,
        updatedAt: candidate.updatedAt,
      },
      applications: candidate.applications.map((a) => ({
        id: a.id,
        requisitionId: a.requisitionId,
        stage: a.stage,
        status: a.status,
        formResponses: a.formResponses,
        createdAt: a.createdAt,
        stageUpdatedAt: a.stageUpdatedAt,
      })),
      notes: candidate.notes.map((n) => ({
        id: n.id,
        content: n.content,
        authorUserId: n.authorUserId,
        isPrivate: n.isPrivate,
        createdAt: n.createdAt,
      })),
      attachments: attachments.map((a) => ({
        id: a.id,
        applicationId: a.applicationId,
        fieldId: a.fieldId,
        fileName: a.fileName,
        fileSize: a.fileSize,
        mimeType: a.mimeType,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) { next(err); }
});

// ── GET /internal/gdpr/tenant/export ──────────────────────────────────────
// Phase 31c — full tenant data export (GDPR Article 20 — data portability).
// Returns every candidate, application, note, and attachment metadata for
// the caller's tenant. Admin-only.
//
// Memory note: this loads everything into memory. For tenants with >50k
// candidates the response will be tens of MB; that's acceptable for a manual
// admin export. Future optimisation: stream-as-NDJSON or chunk to S3.
router.get("/tenant/export", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);

    const [candidates, applications, notes, attachments] = await Promise.all([
      prisma.candidate.findMany({ where: { tenantId } }),
      prisma.application.findMany({ where: { tenantId } }),
      prisma.candidateNote.findMany({ where: { tenantId } }),
      prisma.applicationAttachment.findMany({ where: { tenantId } }),
    ]);

    ok(res, {
      service: "candidate",
      counts: {
        candidates: candidates.length,
        applications: applications.length,
        notes: notes.length,
        attachments: attachments.length,
      },
      candidates,
      applications,
      notes,
      attachmentsMeta: attachments.map((a) => ({
        id: a.id, applicationId: a.applicationId, fieldId: a.fieldId,
        fileName: a.fileName, fileSize: a.fileSize, mimeType: a.mimeType,
        createdAt: a.createdAt,
        // intentionally NOT exporting raw bytes — the storage layer is the
        // authoritative source for those.
      })),
    });
  } catch (err) { next(err); }
});

// ── DELETE /internal/gdpr/candidates/:id ──────────────────────────────────
// Anonymizes the candidate + deletes their applications & notes. The
// candidate row is NOT physically deleted (it would orphan foreign keys
// in attached events); instead PII fields are nulled / scrambled so any
// surviving references show only the candidate ID.
// Phase 27 F-028-micro-P0: GDPR delete is destructive — tenant admin only.
router.delete("/candidates/:id", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorUserId = getUserId(req) ?? "system";
    const id = req.params["id"] as string;
    const candidate = await prisma.candidate.findFirst({ where: { id, tenantId } });
    if (!candidate) throw Errors.notFound("Candidate");

    const anonymizedEmail = `deleted-${id}@gdpr.invalid`;

    const deletedAt = new Date();
    await prisma.$transaction([
      prisma.applicationAttachment.deleteMany({
        where: { tenantId, applicationId: { in: (await prisma.application.findMany({
          where: { tenantId, candidateId: id }, select: { id: true }
        })).map((a) => a.id) } },
      }),
      prisma.candidateNote.deleteMany({ where: { tenantId, candidateId: id } }),
      prisma.application.deleteMany({ where: { tenantId, candidateId: id } }),
      prisma.candidate.update({
        where: { id },
        data: {
          email: anonymizedEmail,
          firstName: "Anonymized",
          lastName: "User",
          phone: null,
          location: null,
          linkedinUrl: null,
          portfolioUrl: null,
          summary: null,
          tags: [],
          source: "gdpr-deleted",
        },
      }),
    ]);

    logger.info({ candidateId: id, tenantId, actorUserId, deletedAt }, "GDPR delete completed");
    ok(res, {
      candidateId: id,
      deletedAt: deletedAt.toISOString(),
      gdprArticle: "Article 17 — Right to erasure",
      result: {
        anonymized: true,
        applicationsDeleted: true,
        notesDeleted: true,
        attachmentsDeleted: true,
      },
    });
  } catch (err) { next(err); }
});

export default router;
