#!/usr/bin/env tsx
/**
 * WF-B / B3 - SURFACE REGISTRY CODEGEN.
 *
 * Next.js `next/dynamic` (and webpack's `import()`) CANNOT take a VARIABLE
 * import path: `import(someVar)` produces no statically-analyzable chunk, so a
 * registry that stores import paths as strings can never be turned into a lazy
 * component at runtime. This script bridges that gap.
 *
 * INPUT  : apps/frontend/lib/registry/surfaces.ts (SURFACE_REGISTRATIONS) - the
 *          documented registration convention; each entry has a stable `id` and a
 *          STRING-LITERAL `importPath` whose default export is the surface
 *          component.
 * OUTPUT : apps/frontend/lib/registry/generated.ts - a checked-in module whose
 *          `GENERATED_SURFACES` maps each surface id to a STATIC
 *          `() => import("<literal path>")` loader, so webpack can analyze every
 *          chunk while the app resolves a surface by its string id.
 *
 * GUARANTEES
 *  • IDEMPOTENT: registrations are sorted by id and the file is emitted
 *    deterministically, so running it twice with the same input yields a
 *    byte-identical file (the build never sees spurious diffs).
 *  • SAFE IN THE DOCKER BUILDER (before `next build`): pure file I/O + a read of
 *    the manifest module; it mounts no page components and touches no tenant
 *    data. An empty manifest re-emits the empty baseline.
 *  • INJECTION-DEFENSIVE: every emitted importPath is validated against a strict
 *    module-specifier allowlist and JSON-encoded before it is written into the
 *    `import("…")` literal, so a malformed/hostile path cannot break out of the
 *    string or smuggle code into the generated module. ids are validated to a
 *    lower-kebab allowlist and must be unique.
 *  • FAIL-CLOSED on bad input: a duplicate id or an invalid path throws and the
 *    existing generated.ts is left untouched (nothing is written on error), so a
 *    bad registration fails the build loudly instead of emitting a broken map.
 *
 * Run: `npm run gen:surfaces` (wired as the frontend `prebuild` step) or
 *      `npx tsx apps/frontend/scripts/gen-surface-registry.ts` from anywhere.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// ─── resolve our own location so the script is cwd-independent (Docker-safe) ───
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = resolve(SCRIPT_DIR, ".."); // apps/frontend
const MANIFEST_PATH = resolve(FRONTEND_DIR, "lib/registry/surfaces.ts");
const OUTPUT_PATH = resolve(FRONTEND_DIR, "lib/registry/generated.ts");

// One registration as declared in the manifest (kept in sync with surfaces.ts).
interface SurfaceRegistration {
  id: string;
  importPath: string;
  label?: string;
  roles?: string[];
  requiredModule?: string;
  planTier?: string;
}

// ─── validators (the injection-defense + idempotence boundary) ─────────────────

// A surface id: lower-kebab, 1..64 chars. This becomes an object key in the
// generated map and a UiConfig target, so it is constrained to a safe alphabet.
const ID_RE = /^[a-z][a-z0-9-]{0,63}$/;

// A module specifier we are willing to emit into a literal `import("…")`. We
// allow our own alias-rooted ("@/…") and relative ("./…" / "../…") paths plus a
// bare package name, restricted to a conservative character set (letters,
// digits, /, ., _, -, @). This deliberately rejects anything with quotes,
// parentheses, backticks, whitespace, or template/expression syntax so the
// value cannot break out of the JSON-encoded string literal we write.
const IMPORT_PATH_RE = /^(@\/|\.\.?\/|@?[a-zA-Z0-9._-]+\/)?[a-zA-Z0-9._/-]+$/;

function fail(message: string): never {
  // Loud, prefixed failure; the existing generated.ts is left untouched because
  // we only write AFTER all validation passes.
  console.error(`[gen-surface-registry] ERROR: ${message}`);
  process.exit(1);
}

function validate(regs: readonly SurfaceRegistration[]): SurfaceRegistration[] {
  const seen = new Set<string>();
  for (const reg of regs) {
    if (!reg || typeof reg !== "object") {
      fail(`registration is not an object: ${JSON.stringify(reg)}`);
    }
    if (typeof reg.id !== "string" || !ID_RE.test(reg.id)) {
      fail(`invalid surface id ${JSON.stringify(reg.id)} (must match ${ID_RE}).`);
    }
    if (seen.has(reg.id)) {
      fail(`duplicate surface id "${reg.id}".`);
    }
    seen.add(reg.id);
    if (typeof reg.importPath !== "string" || !IMPORT_PATH_RE.test(reg.importPath)) {
      fail(
        `surface "${reg.id}" has an invalid importPath ${JSON.stringify(reg.importPath)} ` +
          `(must be a safe module specifier matching ${IMPORT_PATH_RE}).`,
      );
    }
  }
  // Deterministic order -> byte-identical output for the same input (idempotent).
  return [...regs].sort((a, b) => a.id.localeCompare(b.id));
}

// ─── load the manifest (no page components are mounted; it only declares strings) ─
async function loadRegistrations(): Promise<readonly SurfaceRegistration[]> {
  const url = pathToFileURL(MANIFEST_PATH).href;
  let mod: { SURFACE_REGISTRATIONS?: unknown };
  try {
    mod = (await import(url)) as { SURFACE_REGISTRATIONS?: unknown };
  } catch (err) {
    fail(`could not import the manifest at ${MANIFEST_PATH}: ${(err as Error).message}`);
  }
  const regs = mod.SURFACE_REGISTRATIONS;
  if (!Array.isArray(regs)) {
    fail(`${MANIFEST_PATH} must export a SURFACE_REGISTRATIONS array.`);
  }
  return regs as readonly SurfaceRegistration[];
}

// ─── emit generated.ts ─────────────────────────────────────────────────────────
function render(regs: SurfaceRegistration[]): string {
  // Each entry: "<id>": () => import(<json-encoded literal path>),
  // JSON.stringify gives a safe double-quoted string literal; the path has
  // already passed the strict allowlist, so this is belt-and-suspenders.
  const entries = regs
    .map((r) => `  ${JSON.stringify(r.id)}: () => import(${JSON.stringify(r.importPath)}),`)
    .join("\n");

  const body = entries.length > 0 ? `{\n${entries}\n}` : "{}";

  // The header mirrors the checked-in baseline's contract so a regenerated file
  // is a clean superset of the baseline (only GENERATED_SURFACES changes).
  return `// apps/frontend/lib/registry/generated.ts
//
// WF-B / B3 - GENERATED FILE. DO NOT EDIT BY HAND.
//
// Build-time LITERAL-IMPORT MAP for registered surfaces (pages). Emitted by
// apps/frontend/scripts/gen-surface-registry.ts from the registrations in
// apps/frontend/lib/registry/surfaces.ts. Next.js \`next/dynamic\` cannot take a
// variable import path, so each surface id below is wired to a STATIC
// \`() => import("<literal path>")\` loader that webpack can analyze.
//
// An environment that never runs codegen resolves every id to \`undefined\` and
// the consumer falls back to its un-customized render (fail-soft). Regenerate
// with \`npm run gen:surfaces\`; it runs automatically as the frontend
// \`prebuild\` step so the Docker builder emits a fresh map before \`next build\`.

import type * as React from "react";

// A lazy surface loader: a thunk returning a dynamic import of a module whose
// default export is the surface's React component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SurfaceLoader = () => Promise<{ default: React.ComponentType<any> }>;

// The generated map: surface id -> literal-import loader. Consumers MUST treat a
// missing key as "surface not generated -> fall back", never as an error.
export const GENERATED_SURFACES: Record<string, SurfaceLoader> = ${body};

// Resolve a surface id to its lazy loader, or undefined when the surface is not
// in the generated map (codegen not run, or the id was removed). Callers fall
// back to their default render on undefined (fail-soft).
export function getSurfaceLoader(surfaceId: string): SurfaceLoader | undefined {
  return GENERATED_SURFACES[surfaceId];
}
`;
}

async function main(): Promise<void> {
  const regs = validate(await loadRegistrations());
  const next = render(regs);

  // Idempotence: only write when the content actually changed, so re-runs in the
  // Docker builder (and locally) never dirty the working tree needlessly.
  let prev: string | null = null;
  try {
    prev = readFileSync(OUTPUT_PATH, "utf8");
  } catch {
    prev = null; // first run / missing file
  }
  if (prev === next) {
    console.log(`[gen-surface-registry] up to date (${regs.length} surface(s)).`);
    return;
  }
  writeFileSync(OUTPUT_PATH, next, "utf8");
  console.log(`[gen-surface-registry] wrote ${OUTPUT_PATH} (${regs.length} surface(s)).`);
}

void main();
