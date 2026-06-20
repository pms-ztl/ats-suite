// __tests__/lib/dashboard-no-fabrication.test.ts
//
// SLICE J2 - the no-fabrication CONTRACT AUDIT for the customizable dashboard
// (WF5/WF6). This is a programmatic enforcement of the "REAL data or honest
// empty only" invariant across the three dashboard-config files:
//   - lib/widgets/registry.ts  (the widget CATALOG: every CatalogEntry)
//   - lib/widgets/sources.ts   (the E1 dataSourceKey -> real fetcher registry)
//   - lib/widgets/defaults.ts  (the SYSTEM-DEFAULT seeded dashboard documents)
//
// It does NOT trust the prose comments or the load-time assertion in registry.ts;
// it RE-DERIVES the invariant from the actual exported data so a future edit that
// (a) points a widget at a landmine, (b) seeds a landmine key into a default doc,
// or (c) seeds an unregistered widgetType, fails this test rather than silently
// shipping a fabricated metric.
//
// The three assertions (matching the slice contract):
//   (a) EVERY registry CatalogEntry.dataSourceKey resolves to a sources.ts entry
//       with realData:true - EXCEPT the source-less utility widgets
//       (markdown_note / quick_actions), whose dataSourceKey is null.
//   (b) The known not-bindable LANDMINE keys (decisions_list, source_of_hire,
//       adverse_impact, compliance_score, diversity_score) are realData:false AND
//       appear in NO registry entry AND in NO seeded default document.
//   (c) EVERY widget in EVERY seeded default document references a REGISTERED
//       widgetType (resolvable via the registry).
//
// Wiring: this file is `*.test.ts` under apps/frontend, which the frontend's
// `npm test` (= `vitest run`, see package.json) discovers automatically - no
// config change is needed to add it to the runner.

import { describe, it, expect } from "vitest";

import {
  listCatalog,
  getCatalogEntry,
  isWidgetType,
  type CatalogEntry,
} from "@/lib/widgets/registry";
import { getSource } from "@/lib/widgets/sources";
import {
  SYSTEM_DEFAULT_DASHBOARDS,
  type DefaultRole,
} from "@/lib/widgets/defaults";

// The source-less utility widgets: they read NO tenant data, so their
// dataSourceKey is legitimately null and they are exempt from the realData gate.
// (Mirrors registry.ts SOURCELESS_TYPES - re-stated here so this audit is an
// INDEPENDENT check, not a re-import of the thing it is auditing.)
const SOURCELESS_TYPES = new Set<string>(["markdown_note", "quick_actions"]);

// The explicit landmine keys the binder must NEVER bind: each has no usable
// real backend source (no gateway proxy, or the underlying number is
// structurally always 0 / honest-null) and would render a FAKE metric if bound.
const LANDMINE_KEYS = [
  "decisions_list",
  "source_of_hire",
  "adverse_impact",
  "compliance_score",
  "diversity_score",
] as const;

const DEFAULT_ROLES: DefaultRole[] = [
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
];

describe("dashboard no-fabrication contract audit (SLICE J2)", () => {
  // The whole catalog, enumerated once.
  const catalog: CatalogEntry[] = listCatalog();

  /* ───────────────── (a) every catalog source is real ───────────────── */
  describe("(a) every registry CatalogEntry binds a realData:true source", () => {
    it("has a non-empty catalog to audit", () => {
      // A regression that empties the catalog would vacuously pass every per-entry
      // check below, so guard the audit has real entries to run against.
      expect(catalog.length).toBeGreaterThan(0);
    });

    for (const entry of catalog) {
      it(`"${entry.type}" -> real source (or is source-less)`, () => {
        if (SOURCELESS_TYPES.has(entry.type)) {
          // A source-less widget MUST declare a null dataSourceKey - not a stray
          // key that quietly slips past the realData gate.
          expect(entry.dataSourceKey).toBeNull();
          return;
        }

        // Every other widget MUST name a key.
        expect(entry.dataSourceKey).toBeTruthy();

        const source = getSource(entry.dataSourceKey as string);
        // The key MUST resolve to a registered E1 source (no typos / removed rows).
        expect(
          source,
          `"${entry.type}" -> unknown dataSourceKey "${entry.dataSourceKey}" (not in sources.ts)`,
        ).toBeDefined();
        // And that source MUST be realData:true - never a landmine.
        expect(
          source?.realData,
          `"${entry.type}" -> "${entry.dataSourceKey}" is realData:false (${source?.blockedReason ?? "no real source"})`,
        ).toBe(true);
      });
    }
  });

  /* ──────────── (b) landmine keys: false, unreferenced, unseeded ──────────── */
  describe("(b) landmine keys are realData:false and never referenced", () => {
    // The set of dataSourceKeys actually referenced by any catalog entry.
    const referencedSourceKeys = new Set(
      catalog.map((e) => e.dataSourceKey).filter((k): k is string => k !== null),
    );

    // The set of every dataSourceKey + widget type used across all seeded defaults.
    const seededKeys = new Set<string>();
    const seededTypes = new Set<string>();
    for (const role of DEFAULT_ROLES) {
      for (const w of SYSTEM_DEFAULT_DASHBOARDS[role].widgets) {
        seededKeys.add(w.dataSourceKey);
        seededTypes.add(w.type);
      }
    }

    for (const key of LANDMINE_KEYS) {
      it(`"${key}" is a realData:false landmine`, () => {
        const source = getSource(key);
        // The landmine MUST still be recorded in sources.ts (so the binder can
        // explain WHY it is refused) ...
        expect(source, `landmine "${key}" missing from sources.ts`).toBeDefined();
        // ... and it MUST be flagged realData:false.
        expect(source?.realData).toBe(false);
        // ... with an honest blockedReason for the binder UI.
        expect(typeof source?.blockedReason).toBe("string");
        expect(source?.blockedReason?.length ?? 0).toBeGreaterThan(0);
      });

      it(`"${key}" is bound by NO registry widget`, () => {
        expect(
          referencedSourceKeys.has(key),
          `landmine "${key}" is referenced by a catalog entry`,
        ).toBe(false);
      });

      it(`"${key}" appears in NO seeded default document`, () => {
        expect(
          seededKeys.has(key),
          `landmine "${key}" is seeded as a widget.dataSourceKey in a default dashboard`,
        ).toBe(false);
      });
    }
  });

  /* ──────────── (c) every seeded widget is a registered type ──────────── */
  describe("(c) every widget in every seeded default is registered + real", () => {
    for (const role of DEFAULT_ROLES) {
      const doc = SYSTEM_DEFAULT_DASHBOARDS[role];

      it(`${role} default seeds at least one widget`, () => {
        // A default that seeds nothing would vacuously pass the per-widget checks.
        expect(doc.widgets.length).toBeGreaterThan(0);
      });

      for (const w of doc.widgets) {
        it(`${role}: widget "${w.instanceId}" (type "${w.type}") is registered`, () => {
          // The type MUST be a known widget kind ...
          expect(
            isWidgetType(w.type),
            `${role} seeds unregistered widgetType "${w.type}"`,
          ).toBe(true);

          const entry = getCatalogEntry(w.type);
          expect(entry).toBeDefined();

          // ... and its seeded dataSourceKey MUST match the catalog's binding for
          // that type. Source-less utility widgets key on their own type (per
          // defaults.ts toWidget); everything else MUST carry the catalog key,
          // which (by assertion (a)) is a realData:true source - so a seeded doc
          // can never quietly bind a different / fake source than the catalog.
          if (SOURCELESS_TYPES.has(w.type)) {
            expect(entry?.dataSourceKey).toBeNull();
            expect(w.dataSourceKey).toBe(w.type);
          } else {
            expect(w.dataSourceKey).toBe(entry?.dataSourceKey);
            const source = getSource(w.dataSourceKey);
            expect(source?.realData).toBe(true);
          }
        });
      }
    }
  });
});
