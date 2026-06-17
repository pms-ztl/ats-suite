/**
 * ensurePublishedPosting — idempotent guarantee that an OPEN requisition has a
 * published JobPosting so it surfaces on the public career portal.
 *
 * One posting per requisitionId. The slug is per-requisition and stable:
 *   slugify(title) + "-" + <short stable suffix from requisitionId>
 * so two requisitions named "Senior ML Engineer" never collide on
 * "senior-ml-engineer" (which would violate @@unique([tenantId, slug])).
 *
 * Callers treat this as best-effort: it must never throw into the main op.
 */
import type { PrismaClient } from "../generated/prisma/index.js";

/** Lowercase, ASCII-fold-ish, hyphenate. Keeps slugs URL-safe and readable. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritical marks
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "job";
}

/** Short, stable, per-requisition suffix (first 6 hex chars of the uuid). */
export function reqSuffix(requisitionId: string): string {
  return requisitionId.replace(/[^a-z0-9]/gi, "").slice(0, 6).toLowerCase() || "req";
}

/**
 * Ensure a published JobPosting exists for `requisitionId`. Returns the existing
 * or newly created posting, or null if the requisition is missing or the op
 * failed (never throws — best-effort by contract).
 *
 * Pass an ADMIN (non-RLS) client when calling from an unauthenticated/system
 * path, or the request-scoped RLS client when serving an authenticated request.
 */
export async function ensurePublishedPosting(
  db: PrismaClient,
  tenantId: string,
  requisitionId: string,
): Promise<{ id: string; slug: string } | null> {
  try {
    // Already has a posting? Make sure it's published; reuse its slug.
    const existing = await db.jobPosting.findFirst({
      where: { tenantId, requisitionId },
      select: { id: true, slug: true, isPublished: true },
    });
    if (existing) {
      if (!existing.isPublished) {
        await db.jobPosting.update({
          where: { id: existing.id },
          data: { isPublished: true, publishedAt: new Date() },
        });
      }
      return { id: existing.id, slug: existing.slug };
    }

    const req = await db.requisition.findFirst({
      where: { id: requisitionId, tenantId },
      select: { title: true, description: true, requirements: true },
    });
    if (!req) return null;

    const slug = `${slugify(req.title)}-${reqSuffix(requisitionId)}`;
    const posting = await db.jobPosting.create({
      data: {
        tenantId,
        requisitionId,
        slug,
        title: req.title,
        description: req.description ?? req.title,
        requirements: (req.requirements ?? []) as string[],
        isPublished: true,
        publishedAt: new Date(),
      },
      select: { id: true, slug: true },
    });
    return posting;
  } catch {
    // Best-effort: a concurrent create (unique slug) or any error must not break
    // the requisition create/update that triggered us.
    return null;
  }
}
