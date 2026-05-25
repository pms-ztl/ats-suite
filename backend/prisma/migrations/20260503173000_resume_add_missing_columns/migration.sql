-- Add missing Resume columns that exist in Prisma schema but not in DB.
-- The schema introduced originalFilename, extractedText, parseStatus over time
-- but no migration was generated. This caused 500 errors on /api/resume/upload
-- (PrismaClientKnownRequestError: column originalFilename does not exist).

ALTER TABLE "Resume"
  ADD COLUMN IF NOT EXISTS "originalFilename" TEXT,
  ADD COLUMN IF NOT EXISTS "extractedText"    TEXT,
  ADD COLUMN IF NOT EXISTS "parseStatus"      TEXT NOT NULL DEFAULT 'PENDING';

-- Make storageKey defaultable (schema declares @default(""))
ALTER TABLE "Resume" ALTER COLUMN "storageKey" SET DEFAULT '';
