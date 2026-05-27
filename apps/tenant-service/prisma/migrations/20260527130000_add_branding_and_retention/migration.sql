-- Phase 20: Tenant self-service branding + data retention.
-- All columns nullable / defaulted so existing rows stay valid.

ALTER TABLE "Tenant"
  ADD COLUMN "brandPrimaryColor"           TEXT,
  ADD COLUMN "brandSecondaryColor"         TEXT,
  ADD COLUMN "brandAccentColor"            TEXT,
  ADD COLUMN "brandTagline"                VARCHAR(160),
  ADD COLUMN "careerPortalWelcomeMessage"  TEXT,
  ADD COLUMN "careerPortalAboutHtml"       TEXT,
  ADD COLUMN "careerPortalHeroImageUrl"    TEXT,
  ADD COLUMN "dataRetentionDays"           INTEGER NOT NULL DEFAULT 730;
