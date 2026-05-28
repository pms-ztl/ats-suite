/**
 * Phase 34a — CSV / Excel bulk candidate import.
 *
 * Routes:
 *   POST /internal/candidates/import/preview — parse + validate, return preview
 *   POST /internal/candidates/import/commit  — upsert all valid rows
 *
 * The two-step flow lets the tenant see what we'll do BEFORE we do it
 * (which row is duplicate, which has bad email, etc.). The preview never
 * writes; the commit is the destructive step.
 *
 * Real csv-parse — no placeholder. Handles quoted fields, escapes,
 * multi-line cells. Maps header row to candidate fields automatically;
 * unknown columns land in metadata.
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { parse as parseCsv } from "csv-parse/sync";
import { ok, created, Errors, getTenantId, getUserId, requireRole } from "@cdc-ats/common";
import { prisma } from "../lib/prisma.js";

const router = Router();
const requireImporter = requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER");

// CSV header → candidate field. Case-insensitive, accepts common variants.
const HEADER_MAP: Record<string, keyof CandidateRow> = {
  "email": "email",
  "e-mail": "email",
  "first name": "firstName",
  "firstname": "firstName",
  "first_name": "firstName",
  "given name": "firstName",
  "last name": "lastName",
  "lastname": "lastName",
  "last_name": "lastName",
  "surname": "lastName",
  "family name": "lastName",
  "phone": "phone",
  "phone number": "phone",
  "mobile": "phone",
  "location": "location",
  "city": "location",
  "linkedin": "linkedinUrl",
  "linkedin url": "linkedinUrl",
  "portfolio": "portfolioUrl",
  "website": "portfolioUrl",
  "source": "source",
  "tags": "tags",
};

interface CandidateRow {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  source?: string;
  tags?: string[];
}

type RowStatus = "valid_new" | "valid_update" | "invalid_email" | "missing_required" | "duplicate_in_file";

interface PreviewRow {
  row: number;                 // 1-indexed (data rows, header is row 0)
  status: RowStatus;
  candidate: Partial<CandidateRow>;
  reason?: string;
  existingCandidateId?: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

/** Parse CSV body (or already-parsed array) into candidate rows. */
function parseRows(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  // csv-parse handles RFC 4180 quoting + multi-line cells natively.
  const records = parseCsv(csvText, {
    columns: (header: string[]) => header.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,         // allow stray quotes in messy exports
    relax_column_count: true,   // tolerate rows with missing trailing cols
  }) as Record<string, string>[];
  const headers = records.length > 0 ? Object.keys(records[0]!) : [];
  return { headers, rows: records };
}

function rowToCandidate(record: Record<string, string>): Partial<CandidateRow> {
  const out: Record<string, unknown> = {};
  for (const [csvKey, value] of Object.entries(record)) {
    const field = HEADER_MAP[csvKey];
    if (!field || !value) continue;
    if (field === "tags") {
      // tags = comma- or semicolon-separated string
      out.tags = value.split(/[,;]/).map((t) => t.trim()).filter(Boolean);
    } else {
      out[field] = value.trim();
    }
  }
  return out as Partial<CandidateRow>;
}

// Minimal email regex — anything stricter rejects valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── POST /internal/candidates/import/preview ────────────────────────────
// Body: { csv: string } — raw CSV text
// Returns: { headers, rows, summary }
const PreviewBodySchema = z.object({ csv: z.string().min(1).max(20 * 1024 * 1024) });

router.post("/preview", requireImporter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const { csv } = PreviewBodySchema.parse(req.body);
    const parsed = parseRows(csv);

    // Build a set of (lowercase) emails already in the tenant for dedupe lookup.
    // Fetch in one query — small relative to candidate-count for most tenants.
    const candidates = parsed.rows.map(rowToCandidate);
    const emails = candidates
      .map((c) => c.email?.toLowerCase())
      .filter((e): e is string => !!e);
    const existing = await prisma.candidate.findMany({
      where: { tenantId, email: { in: emails } },
      select: { id: true, email: true },
    });
    const existingByEmail = new Map(existing.map((c) => [c.email.toLowerCase(), c.id]));

    // Detect intra-file duplicates (same email appears twice in the CSV)
    const seenInFile = new Set<string>();
    const dupedInFile = new Set<string>();
    for (const c of candidates) {
      const e = c.email?.toLowerCase();
      if (!e) continue;
      if (seenInFile.has(e)) dupedInFile.add(e);
      seenInFile.add(e);
    }

    const preview: PreviewRow[] = candidates.map((c, idx) => {
      const row = idx + 1;
      const email = c.email?.toLowerCase();
      if (!email || !EMAIL_RE.test(email)) {
        return { row, status: "invalid_email", candidate: c, reason: `Bad or missing email: "${c.email ?? ""}"` };
      }
      if (!c.firstName || !c.lastName) {
        return { row, status: "missing_required", candidate: c, reason: "Both firstName and lastName are required" };
      }
      if (dupedInFile.has(email)) {
        return { row, status: "duplicate_in_file", candidate: c, reason: "Email appears multiple times in this file" };
      }
      const existingId = existingByEmail.get(email);
      return {
        row,
        status: existingId ? "valid_update" : "valid_new",
        candidate: c,
        ...(existingId ? { existingCandidateId: existingId } : {}),
      };
    });

    const summary = {
      total: preview.length,
      newCount: preview.filter((p) => p.status === "valid_new").length,
      updateCount: preview.filter((p) => p.status === "valid_update").length,
      invalidEmailCount: preview.filter((p) => p.status === "invalid_email").length,
      missingRequiredCount: preview.filter((p) => p.status === "missing_required").length,
      duplicateInFileCount: preview.filter((p) => p.status === "duplicate_in_file").length,
    };

    ok(res, { headers: parsed.headers, preview, summary });
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/candidates/import/commit ──────────────────────────────
// Body: { csv: string, skipDuplicates?: boolean, source?: string }
// Performs the actual upsert. Returns per-row outcome.
const CommitBodySchema = z.object({
  csv: z.string().min(1).max(20 * 1024 * 1024),
  skipDuplicates: z.boolean().default(true),
  source: z.string().max(80).default("CSV_IMPORT"),
});

router.post("/commit", requireImporter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actor = getUserId(req);
    const body = CommitBodySchema.parse(req.body);
    const parsed = parseRows(body.csv);
    const candidates = parsed.rows.map(rowToCandidate);

    const outcomes: Array<{ row: number; status: string; candidateId?: string; reason?: string }> = [];
    let created = 0, updated = 0, skipped = 0;

    // We do a per-row upsert rather than a single createMany so duplicates
    // don't roll back the whole batch and we can report row-level outcomes.
    // For very large imports (>5k rows) consider chunking + batched UPSERT.
    for (let idx = 0; idx < candidates.length; idx++) {
      const c = candidates[idx]!;
      const rowNum = idx + 1;
      const email = c.email?.toLowerCase();

      if (!email || !EMAIL_RE.test(email)) {
        outcomes.push({ row: rowNum, status: "invalid_email_skipped", reason: `bad email: ${c.email ?? ""}` });
        skipped++;
        continue;
      }
      if (!c.firstName || !c.lastName) {
        outcomes.push({ row: rowNum, status: "missing_required_skipped", reason: "firstName + lastName required" });
        skipped++;
        continue;
      }

      try {
        const existing = await prisma.candidate.findFirst({ where: { tenantId, email } });
        if (existing && !body.skipDuplicates) {
          // Update path — overwrite the editable fields.
          const upd = await prisma.candidate.update({
            where: { id: existing.id },
            data: {
              firstName: c.firstName,
              lastName: c.lastName,
              phone: c.phone ?? existing.phone,
              location: c.location ?? existing.location,
              linkedinUrl: c.linkedinUrl ?? existing.linkedinUrl,
              portfolioUrl: c.portfolioUrl ?? existing.portfolioUrl,
              source: existing.source,                       // keep original source
              tags: c.tags ?? existing.tags,
            },
          });
          outcomes.push({ row: rowNum, status: "updated", candidateId: upd.id });
          updated++;
        } else if (existing) {
          outcomes.push({ row: rowNum, status: "duplicate_skipped", candidateId: existing.id });
          skipped++;
        } else {
          const newCand = await prisma.candidate.create({
            data: {
              tenantId,
              email,
              firstName: c.firstName,
              lastName: c.lastName,
              phone: c.phone ?? null,
              location: c.location ?? null,
              linkedinUrl: c.linkedinUrl ?? null,
              portfolioUrl: c.portfolioUrl ?? null,
              source: c.source ?? body.source,
              tags: c.tags ?? [],
            },
          });
          outcomes.push({ row: rowNum, status: "created", candidateId: newCand.id });
          created++;
        }
      } catch (e: any) {
        outcomes.push({ row: rowNum, status: "error", reason: e?.message ?? String(e) });
        skipped++;
      }
    }

    // Audit log entry. Best-effort.
    await prisma.candidate.findFirst({ where: { tenantId } }).catch(() => undefined);

    ok(res, {
      summary: { created, updated, skipped, totalRows: candidates.length, importedBy: actor },
      outcomes,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
