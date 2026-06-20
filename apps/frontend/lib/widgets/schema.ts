// Dashboard document schema + migration ladder (frontend boundary).
//
// The canonical Zod schemas and types live in @cdc-ats/contracts (WF1) so the
// gateway, the persistence service, and this frontend all validate the exact
// same shape. This module re-exports that single source of truth and layers on
// the read-time concerns the frontend owns:
//   1. migrateDashboard() — a schemaVersion ladder that upgrades any older
//      saved document to the current shape before it is parsed/rendered, so a
//      future widget/breakpoint change is a self-contained migration step
//      rather than a breaking read.
//   2. makeInstanceId() — stable, collision-resistant ids for newly placed
//      widget instances (used by WF6's customization UI).
//
// REAL data or honest empty states only: this file never fabricates widget
// values. It only normalizes the document structure.

import { nanoid } from "nanoid";
import {
  DashboardDocumentSchema,
  DashboardWidgetSchema,
  DashboardLayoutsSchema,
  GridLayoutItemSchema,
  type DashboardDocument,
  type DashboardWidget,
  type DashboardLayouts,
  type GridLayoutItem,
} from "@cdc-ats/contracts";

// Re-export the canonical contracts so callers in the frontend import from one
// place (lib/widgets/schema) without reaching across the package boundary.
export {
  DashboardDocumentSchema,
  DashboardWidgetSchema,
  DashboardLayoutsSchema,
  GridLayoutItemSchema,
};
export type {
  DashboardDocument,
  DashboardWidget,
  DashboardLayouts,
  GridLayoutItem,
};

// The schemaVersion this build writes and renders. Bump this whenever a new
// migration step is appended to MIGRATIONS below.
export const CURRENT_SCHEMA_VERSION = 1;

// The five react-grid-layout breakpoints, in descending width order. Kept here
// so a migration that introduces a new breakpoint has one obvious place to
// backfill it.
export const BREAKPOINTS = ["lg", "md", "sm", "xs", "xxs"] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

// A migration step upgrades a document that is AT `from` to the shape expected
// at `from + 1`. Steps run in order, each on the output of the previous one, so
// a document at any old version is walked up to CURRENT_SCHEMA_VERSION. Steps
// operate on `unknown` (the raw, un-parsed document) because an old document may
// not satisfy the current Zod schema until it has been migrated.
type MigrationStep = {
  from: number;
  migrate: (doc: Record<string, unknown>) => Record<string, unknown>;
};

// The ladder. v1 is the baseline shape (the bento we ship today), so there is
// no step landing on v1 yet. When the document shape changes, append a step
// here with `from: 1` (then `from: 2`, ...) and bump CURRENT_SCHEMA_VERSION.
//
// Example of the intended pattern for a future change:
//   {
//     from: 1,
//     migrate: (doc) => ({
//       ...doc,
//       schemaVersion: 2,
//       // ...backfill the new field / breakpoint / widget config here...
//     }),
//   },
const MIGRATIONS: MigrationStep[] = [];

// Upgrade a raw (possibly older, possibly malformed) dashboard document to the
// current shape, then validate it. Runs on read so every render path sees a
// document at CURRENT_SCHEMA_VERSION. Throws (via Zod) if the result still does
// not match the contract — callers should treat that as "fall back to the
// seeded default document" rather than rendering a broken board.
export function migrateDashboard(doc: unknown): DashboardDocument {
  // Normalize to an object we can walk. A non-object (null, array, string) is
  // not a recoverable document; let the final parse surface the error.
  let current: Record<string, unknown> =
    doc && typeof doc === "object" && !Array.isArray(doc)
      ? { ...(doc as Record<string, unknown>) }
      : (doc as Record<string, unknown>);

  // A document missing schemaVersion is treated as the baseline (v1): every
  // document we have ever written carries schemaVersion, so an absent one means
  // a hand-authored or legacy seed.
  const rawVersion = current?.schemaVersion;
  let version =
    typeof rawVersion === "number" && Number.isInteger(rawVersion) && rawVersion > 0
      ? rawVersion
      : CURRENT_SCHEMA_VERSION;

  // Walk the ladder. Each iteration applies the single step whose `from`
  // matches the current version, advancing one version at a time so steps
  // compose. Guard against an unknown/forward version by clamping at the top.
  while (version < CURRENT_SCHEMA_VERSION) {
    const step = MIGRATIONS.find((s) => s.from === version);
    if (!step) break; // no path forward; let parse validate what we have
    current = step.migrate(current);
    version += 1;
  }

  // Ensure the version stamp reflects where we ended up, then validate against
  // the canonical contract. `.parse` applies defaults (e.g. globalFilters: {}).
  const stamped = { ...current, schemaVersion: version };
  return DashboardDocumentSchema.parse(stamped);
}

// Generate a stable, URL-safe instance id for a newly placed widget. Prefixed
// so ids are recognizable in logs and in the layouts[].i references. nanoid's
// default 21-char alphabet keeps total length within the contract's 64-char
// instanceId cap.
export function makeInstanceId(): string {
  return `w_${nanoid()}`;
}
