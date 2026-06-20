/**
 * Assessment authoring router (assessment-service) — SLICE G2.
 *
 * Mounted at /internal/assessments behind readAuthHeaders() + tenantContext, so
 * every handler runs with a bound request tenant and the RLS-scoped `prisma`
 * client. This is the recruiter/admin authoring surface: list/create/read/update
 * an Assessment, plus the question + section TREE (schemaJson) the builder edits.
 *
 * Design (mirrors the job-service requisition + form-schema idiom):
 *  - `questions` (Json) stays the flat inline question array the take/grade
 *    slices read.
 *  - `schemaJson` (Json) is the richer authoring TREE — { sections: [{ questions
 *    }], settings } — validated against a JSON Schema via @cdc-ats/common AJV on
 *    every write (the server-side trust boundary; tenant-authored schemas are
 *    not trusted).
 *  - Publishing is immutable + versioned: PUT /:id/schema with { publish: true }
 *    bumps `version`, records a content `publishedHash`, flips status to
 *    PUBLISHED, and derives the flat `questions` array from the tree. A PUBLISHED
 *    assessment's metadata/schema are then locked (409) — edits require a new
 *    DRAFT version.
 *
 * Real-data-only: list endpoints return [] when empty (honest empty), never
 * fabricated rows. No scores are computed or fabricated here (that is the
 * take/grade slices). Everything is gated behind requireModule('oa-assessments')
 * at the gateway (WF4).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  ok, created, Errors, getTenantId, requireRole, validateOrThrow, compileSchema,
} from "@cdc-ats/common";
import { AssessmentStatusSchema, QuestionTypeSchema } from "@cdc-ats/contracts";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Authoring is admin / recruiter / hiring-manager work (matches the
// oa-assessments module's `assessment:write` permission audience).
const requireAuthor = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");

// ─────────────────────────────────────────────────────────────────────────────
// JSON Schema for the authoring TREE (schemaJson). Validated with AJV on write.
// The tree is the editable source of truth the builder mutates; the flat
// `questions` array is DERIVED from it at publish time. We keep this as a JSON
// Schema (not zod) deliberately so the SAME schema can be shipped to the builder
// UI and reused by future tenant-defined variants — and so validation goes
// through the shared AJV trust boundary the slice mandates.
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_TYPES = QuestionTypeSchema.options; // ["MCQ_SINGLE", ...]

const ASSESSMENT_SCHEMA_JSON_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  additionalProperties: false,
  required: ["sections"],
  properties: {
    // Optional free-form authoring settings (instructions shown to the
    // candidate, calculator allowed, etc.). Kept open but bounded.
    settings: {
      type: "object",
      additionalProperties: true,
      properties: {
        instructions: { type: "string", maxLength: 20000 },
        randomizeSections: { type: "boolean" },
      },
    },
    sections: {
      type: "array",
      maxItems: 50,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "questions"],
        properties: {
          id: { type: "string", minLength: 1, maxLength: 50 },
          title: { type: "string", minLength: 1, maxLength: 200 },
          description: { type: "string", maxLength: 5000 },
          order: { type: "integer" },
          questions: {
            type: "array",
            maxItems: 200,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "type", "prompt"],
              properties: {
                id: { type: "string", minLength: 1, maxLength: 50 },
                type: { type: "string", enum: QUESTION_TYPES },
                prompt: { type: "string", minLength: 1 },
                order: { type: "integer" },
                required: { type: "boolean" },
                points: { type: "integer", minimum: 0 },
                timeLimit: { type: ["integer", "null"], minimum: 1 },
                options: {
                  type: "array",
                  maxItems: 100,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["id", "label"],
                    properties: {
                      id: { type: "string", minLength: 1, maxLength: 50 },
                      label: { type: "string", minLength: 1, maxLength: 2000 },
                    },
                  },
                },
                // The auto-grade key. NEVER surfaced to the candidate UI (the
                // public take slice strips it); persisted here for grading.
                correctAnswer: {
                  type: ["string", "array"],
                  items: { type: "string" },
                },
                language: { type: "string", maxLength: 50 },
                starterCode: { type: "string", maxLength: 100000 },
              },
            },
          },
        },
      },
    },
  },
} as const;

// Compile once (compilation is the expensive step — validateOrThrow reuses it).
const validateSchemaJson = compileSchema<AssessmentTree>(ASSESSMENT_SCHEMA_JSON_SCHEMA);

// Local shape mirroring the JSON Schema above (AJV is the runtime guard; this is
// the compile-time view used to derive the flat `questions` array).
interface TreeQuestion {
  id: string;
  type: string;
  prompt: string;
  order?: number;
  required?: boolean;
  points?: number;
  timeLimit?: number | null;
  options?: { id: string; label: string }[];
  correctAnswer?: string | string[];
  language?: string;
  starterCode?: string;
}
interface TreeSection {
  id: string;
  title: string;
  description?: string;
  order?: number;
  questions: TreeQuestion[];
}
interface AssessmentTree {
  settings?: Record<string, unknown>;
  sections: TreeSection[];
}

const EMPTY_TREE: AssessmentTree = { sections: [] };

/**
 * Flatten the authoring tree into the inline `questions` array the take/grade
 * slices read. Section nesting is collapsed to a single ordered list; the order
 * is section order then in-section order, re-indexed densely from 0.
 */
function deriveQuestions(tree: AssessmentTree): TreeQuestion[] {
  const sections = [...(tree.sections ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const flat: TreeQuestion[] = [];
  for (const section of sections) {
    const qs = [...(section.questions ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0)
    );
    for (const q of qs) flat.push(q);
  }
  return flat.map((q, i) => ({ ...q, order: i }));
}

/**
 * Stable content hash of the published tree, captured at publish time so a
 * PUBLISHED assessment is reproducible / auditable. Keys are sorted so the hash
 * is insensitive to property ordering.
 */
function contentHash(tree: AssessmentTree): string {
  const canonical = JSON.stringify(tree, Object.keys(flatten(tree)).sort());
  return createHash("sha256").update(canonical).digest("hex");
}
// Build a flat key set for canonical stringify key ordering.
function flatten(obj: unknown, out: Record<string, true> = {}, prefix = ""): Record<string, true> {
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj as Record<string, unknown>)) {
      out[k] = true;
      flatten((obj as Record<string, unknown>)[k], out, prefix + k + ".");
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request bodies (zod — the metadata trust boundary; schemaJson uses AJV).
// ─────────────────────────────────────────────────────────────────────────────
const CreateAssessmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(10000).nullish(),
  requisitionId: z.string().uuid().nullish(),
  questionBankId: z.string().uuid().nullish(),
  durationMinutes: z.number().int().positive().nullish(),
  passingScore: z.number().int().min(0).max(100).nullish(),
  shuffleQuestions: z.boolean().optional(),
});

const UpdateAssessmentSchema = CreateAssessmentSchema.partial();

const PutSchemaBody = z.object({
  // The full authoring tree. Shape-validated by AJV below (zod just gates the
  // envelope); passthrough so AJV sees the untouched object.
  schemaJson: z.record(z.unknown()),
  // When true, publish: bump version, record publishedHash, derive `questions`,
  // flip status -> PUBLISHED. Otherwise the tree is saved on a DRAFT in place.
  publish: z.boolean().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments — list the tenant's assessments (honest empty []).
// Optional ?status= and ?requisitionId= filters.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const statusRaw = req.query["status"] as string | undefined;
    const requisitionId = req.query["requisitionId"] as string | undefined;

    const where: { tenantId: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"; requisitionId?: string } = { tenantId };
    if (statusRaw) {
      const parsed = AssessmentStatusSchema.safeParse(statusRaw);
      if (!parsed.success) throw Errors.validation(`Invalid status filter '${statusRaw}'`);
      where.status = parsed.data;
    }
    if (requisitionId) where.requisitionId = requisitionId;

    const assessments = await prisma.assessment.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 200,
      // Counts give the list UI something honest to render without shipping the
      // (potentially large) schema tree per row.
      include: { _count: { select: { invites: true, attempts: true, results: true } } },
    });
    ok(res, assessments);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /internal/assessments — create a DRAFT. Starts with an empty schema tree
// (version 1, no publishedHash). The builder fills it via PUT /:id/schema.
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", requireAuthor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const body = CreateAssessmentSchema.parse(req.body);
    const assessment = await prisma.assessment.create({
      data: {
        tenantId,
        title: body.title,
        description: body.description ?? null,
        requisitionId: body.requisitionId ?? null,
        questionBankId: body.questionBankId ?? null,
        durationMinutes: body.durationMinutes ?? null,
        passingScore: body.passingScore ?? null,
        shuffleQuestions: body.shuffleQuestions ?? false,
        status: "DRAFT",
        questions: [],
        schemaJson: EMPTY_TREE as object,
        version: 1,
      },
    });
    created(res, assessment);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/:id — full record incl. the authoring tree.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const assessment = await prisma.assessment.findFirst({
      where: { id, tenantId },
      include: { _count: { select: { invites: true, attempts: true, results: true } } },
    });
    if (!assessment) throw Errors.notFound("Assessment");
    ok(res, assessment);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /internal/assessments/:id — update metadata. Only DRAFT assessments are
// mutable; a PUBLISHED/ARCHIVED record is immutable (409) — clone to a new DRAFT
// to change it. (Schema tree edits go through PUT /:id/schema.)
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id", requireAuthor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const body = UpdateAssessmentSchema.parse(req.body);

    const existing = await prisma.assessment.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Assessment");
    if (existing.status !== "DRAFT") {
      throw Errors.conflict(`Assessment is ${existing.status} and immutable. Clone it to a new DRAFT to edit.`);
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined) data["title"] = body.title;
    if (body.description !== undefined) data["description"] = body.description ?? null;
    if (body.requisitionId !== undefined) data["requisitionId"] = body.requisitionId ?? null;
    if (body.questionBankId !== undefined) data["questionBankId"] = body.questionBankId ?? null;
    if (body.durationMinutes !== undefined) data["durationMinutes"] = body.durationMinutes ?? null;
    if (body.passingScore !== undefined) data["passingScore"] = body.passingScore ?? null;
    if (body.shuffleQuestions !== undefined) data["shuffleQuestions"] = body.shuffleQuestions;

    const { count } = await prisma.assessment.updateMany({ where: { id, tenantId }, data });
    if (count === 0) throw Errors.notFound("Assessment");
    const updated = await prisma.assessment.findFirst({ where: { id, tenantId } });
    ok(res, updated);
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /internal/assessments/:id/schema — the authoring tree + version meta.
// Returns the FULL tree (incl. correctAnswer keys) — this is the AUTHOR surface,
// not the candidate surface; the public take slice is what strips answer keys.
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/schema", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const a = await prisma.assessment.findFirst({
      where: { id, tenantId },
      select: {
        id: true, status: true, version: true, publishedHash: true,
        publishedAt: true, schemaJson: true, updatedAt: true,
      },
    });
    if (!a) throw Errors.notFound("Assessment");
    ok(res, {
      assessmentId: a.id,
      status: a.status,
      version: a.version,
      publishedHash: a.publishedHash,
      publishedAt: a.publishedAt,
      schemaJson: a.schemaJson ?? EMPTY_TREE,
      updatedAt: a.updatedAt,
    });
  } catch (err) { next(err); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /internal/assessments/:id/schema — validate + save the authoring tree.
//   - body.schemaJson is validated against ASSESSMENT_SCHEMA_JSON_SCHEMA via the
//     shared AJV trust boundary (400 VALIDATION_ERROR with { field, message }[]).
//   - DRAFT save (no publish): persist the tree in place; version unchanged.
//   - publish: true: only from DRAFT; bump version, record publishedHash, derive
//     the flat `questions` array, set status PUBLISHED + publishedAt. PUBLISHED
//     is immutable thereafter (409) — versioning is forward-only.
// ─────────────────────────────────────────────────────────────────────────────
router.put("/:id/schema", requireAuthor, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const id = req.params["id"] as string;
    const envelope = PutSchemaBody.parse(req.body);

    const existing = await prisma.assessment.findFirst({ where: { id, tenantId } });
    if (!existing) throw Errors.notFound("Assessment");
    if (existing.status !== "DRAFT") {
      throw Errors.conflict(`Assessment is ${existing.status} and immutable. Clone it to a new DRAFT to edit the schema.`);
    }

    // Server-side trust boundary: validate the tenant-authored tree. Throws an
    // AppError(VALIDATION_ERROR, 400) carrying { field, message }[] on failure.
    const tree = validateOrThrow<AssessmentTree>(validateSchemaJson, envelope.schemaJson);

    // Cross-field integrity AJV cannot express: question + section ids unique;
    // MCQ correctAnswer ids must reference declared options.
    assertTreeIntegrity(tree);

    if (!envelope.publish) {
      // DRAFT save in place — version is NOT bumped (only publish advances it).
      const updated = await prisma.assessment.update({
        where: { id },
        data: { schemaJson: tree as object },
      });
      return ok(res, {
        assessmentId: updated.id,
        status: updated.status,
        version: updated.version,
        publishedHash: updated.publishedHash,
        schemaJson: updated.schemaJson,
      });
    }

    // Publish: refuse an empty assessment (nothing to take).
    const questions = deriveQuestions(tree);
    if (questions.length === 0) {
      throw Errors.validation("Cannot publish an assessment with no questions.");
    }

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        schemaJson: tree as object,
        questions: questions as object[],
        version: { increment: 1 },
        publishedHash: contentHash(tree),
        publishedAt: new Date(),
        status: "PUBLISHED",
      },
    });
    ok(res, {
      assessmentId: updated.id,
      status: updated.status,
      version: updated.version,
      publishedHash: updated.publishedHash,
      publishedAt: updated.publishedAt,
      questionCount: questions.length,
    });
  } catch (err) { next(err); }
});

/**
 * Integrity checks AJV's structural schema cannot express:
 *  - section ids are unique across the tree;
 *  - question ids are unique across the whole assessment (the flat array keys on
 *    them and the answer table @@unique([attemptId, questionId]) requires it);
 *  - every MCQ correctAnswer option id references a declared option.
 * Throws AppError(VALIDATION_ERROR, 400) with the same { field, message } shape
 * as AJV/zod so callers get a uniform 400.
 */
function assertTreeIntegrity(tree: AssessmentTree): void {
  const issues: { field: string; message: string }[] = [];
  const sectionIds = new Set<string>();
  const questionIds = new Set<string>();

  tree.sections.forEach((section, si) => {
    if (sectionIds.has(section.id)) {
      issues.push({ field: `sections.${si}.id`, message: `duplicate section id '${section.id}'` });
    }
    sectionIds.add(section.id);

    section.questions.forEach((q, qi) => {
      const path = `sections.${si}.questions.${qi}`;
      if (questionIds.has(q.id)) {
        issues.push({ field: `${path}.id`, message: `duplicate question id '${q.id}'` });
      }
      questionIds.add(q.id);

      const isMcq = q.type === "MCQ_SINGLE" || q.type === "MCQ_MULTI" || q.type === "TRUE_FALSE";
      if (isMcq && q.correctAnswer !== undefined) {
        const optionIds = new Set((q.options ?? []).map((o) => o.id));
        const keys = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        for (const k of keys) {
          if (!optionIds.has(k)) {
            issues.push({ field: `${path}.correctAnswer`, message: `correctAnswer '${k}' is not a declared option id` });
          }
        }
        if (q.type === "MCQ_SINGLE" && Array.isArray(q.correctAnswer) && q.correctAnswer.length > 1) {
          issues.push({ field: `${path}.correctAnswer`, message: "MCQ_SINGLE must have exactly one correct option" });
        }
      }
    });
  });

  if (issues.length > 0) {
    throw Errors.validation("Assessment schema failed integrity validation", issues);
  }
}

export default router;
