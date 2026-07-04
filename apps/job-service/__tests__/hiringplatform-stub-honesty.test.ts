/**
 * Vitest suite for hiring-platform stub-honesty
 * (apps/job-service/src/providers/hiringplatform/*).
 *
 * Several board adapters have an HONEST stub path in postJob() where NO real board
 * API is called and a structured PENDING_PARTNER_APPROVAL / feed-only envelope is
 * returned instead. Those envelopes must NEVER masquerade as a real live posting.
 * This suite pins two guarantees the STUB HONESTY mandate requires for every stub
 * postJob path:
 *
 *   1. Structured, honest result: an EMPTY (or ATS-id) externalId, a non-ACTIVE
 *      status (PENDING_PARTNER_APPROVAL / POSTING), and the additive `stub: true`
 *      marker in the returned `raw` metadata. It NEVER returns ACTIVE and never
 *      fabricates a board posting id.
 *   2. A runtime `[STUB] not production` warning is emitted ONCE per postJob call
 *      (createLogger with no LOKI_URL writes JSON lines to process.stdout).
 *
 * Covered stub paths:
 *   - feed-only / no-public-API boards (always stub): adzuna, jooble, dice,
 *     wellfound, foundit, shine.
 *   - API boards, missing-credentials branch (stub only when creds absent):
 *     linkedin, seek, naukri. Their real API path (with creds) is NOT exercised
 *     here (it would touch the network) and is deliberately left untouched by the
 *     stub instrumentation.
 *
 * Run:  npx vitest run apps/job-service/__tests__/hiringplatform-stub-honesty.test.ts
 */
import { describe, it, expect, vi, afterEach } from "vitest";

// createLogger (no LOKI_URL) returns a plain pino writing to fd 1 via SonicBoom, which
// does NOT go through process.stdout.write - so a stdout spy captures nothing. Mock
// createLogger to a spyable logger and assert on warnStub's logger.warn() calls
// directly. Only createLogger is overridden; other common exports pass through.
const { warnSpy } = vi.hoisted(() => ({ warnSpy: vi.fn() }));
vi.mock("@cdc-ats/common", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@cdc-ats/common")>();
  const noop = () => {};
  return {
    ...actual,
    createLogger: () => ({
      warn: warnSpy,
      info: noop,
      error: noop,
      debug: noop,
      fatal: noop,
      trace: noop,
      child: () => ({ warn: warnSpy, info: noop }),
    }),
  };
});

import { adzunaProvider } from "../src/providers/hiringplatform/adzuna.js";
import { joobleProvider } from "../src/providers/hiringplatform/jooble.js";
import { diceProvider } from "../src/providers/hiringplatform/dice.js";
import { wellfoundProvider } from "../src/providers/hiringplatform/wellfound.js";
import { founditProvider, shineProvider } from "../src/providers/hiringplatform/foundit-shine.js";
import { linkedinProvider } from "../src/providers/hiringplatform/linkedin.js";
import { seekProvider } from "../src/providers/hiringplatform/seek.js";
import { naukriProvider } from "../src/providers/hiringplatform/naukri.js";
import type {
  HiringPlatformProvider,
  NormalizedJob,
  PlatformCredentials,
} from "../src/providers/hiringplatform/types.js";

/** A minimal, real-shaped NormalizedJob for driving postJob (no network involved
 *  on any of the stub paths under test). */
function makeJob(): NormalizedJob {
  return {
    id: "job_test_123",
    externalRefs: {},
    title: "Senior Backend Engineer",
    descriptionHtml: "<p>Build things.</p>",
    location: { country: "US", city: "Austin", region: "TX", remote: false },
    employmentType: ["FULL_TIME"],
    requirements: ["5 years backend"],
    benefits: ["Health"],
    datePublished: "2026-07-01T00:00:00.000Z",
    applyUrl: "https://ats.example.com/jobs/senior-backend-engineer/apply",
    contactEmail: "jobs@example.com",
  };
}

/** Empty creds: triggers the no-credentials stub branch on the API boards and is
 *  simply ignored by the feed-only boards. */
const NO_CREDS: PlatformCredentials = {};

/** Run `fn`, returning every logger.warn(bindings, msg) call the adapters made,
 *  mapped into a pino-style record so the assertions read level/msg/context. */
async function captureLogs(fn: () => Promise<void>): Promise<Array<Record<string, unknown>>> {
  warnSpy.mockClear();
  await fn();
  return warnSpy.mock.calls.map((args) => {
    const [bindings, msg] = args as [Record<string, unknown>, string];
    return { ...bindings, msg, level: "warn" };
  });
}

function stubWarnings(records: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  return records.filter(
    (r) => r["level"] === "warn" && typeof r["msg"] === "string" && (r["msg"] as string).includes("[STUB]"),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

// Provider key -> the board key string it warns/marks with.
const ALWAYS_STUB: Array<{ key: string; provider: HiringPlatformProvider }> = [
  { key: "adzuna", provider: adzunaProvider },
  { key: "jooble", provider: joobleProvider },
  { key: "dice", provider: diceProvider },
  { key: "wellfound", provider: wellfoundProvider },
  { key: "foundit", provider: founditProvider },
  { key: "shine", provider: shineProvider },
];

const NO_CRED_STUB: Array<{ key: string; provider: HiringPlatformProvider }> = [
  { key: "linkedin", provider: linkedinProvider },
  { key: "seek", provider: seekProvider },
  { key: "naukri", provider: naukriProvider },
];

describe("hiring-platform stub postJob: honest structured result", () => {
  for (const { key, provider } of [...ALWAYS_STUB, ...NO_CRED_STUB]) {
    it(`${key}: returns stub:true, a non-ACTIVE status, and never a fabricated board id`, async () => {
      const result = await provider.postJob(makeJob(), NO_CREDS);

      // Never a fake live posting.
      expect(result.status).not.toBe("ACTIVE");
      expect(["PENDING_PARTNER_APPROVAL", "POSTING"]).toContain(result.status);

      // The additive honesty marker is present in the opaque raw blob.
      const raw = result.raw as Record<string, unknown>;
      expect(raw).toBeTypeOf("object");
      expect(raw["stub"]).toBe(true);
      expect(typeof raw["reason"]).toBe("string");

      // externalId is never a fabricated board posting id: it is empty, or (dice)
      // the ATS JobPosting id we already own; never a synthesized board id.
      expect(["", "job_test_123"]).toContain(result.externalId);
    });
  }
});

describe("hiring-platform stub postJob: [STUB] not production warning", () => {
  for (const { key, provider } of ALWAYS_STUB) {
    it(`${key}: emits exactly one [STUB] warning naming the board`, async () => {
      const records = await captureLogs(async () => {
        await provider.postJob(makeJob(), NO_CREDS);
      });
      const warnings = stubWarnings(records);
      expect(warnings).toHaveLength(1);
      const w = warnings[0]!;
      expect(w["msg"]).toContain("not production");
      expect(w["provider"]).toBe(key);
    });
  }

  for (const { key, provider } of NO_CRED_STUB) {
    it(`${key}: no-credentials branch emits exactly one [STUB] warning (reason no-credentials)`, async () => {
      const records = await captureLogs(async () => {
        await provider.postJob(makeJob(), NO_CREDS);
      });
      const warnings = stubWarnings(records);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]!["provider"]).toBe(key);
      expect(warnings[0]!["reason"]).toBe("no-credentials");
    });
  }

  it("warns once per call, not per item (two stub posts => two warnings)", async () => {
    const records = await captureLogs(async () => {
      await adzunaProvider.postJob(makeJob(), NO_CREDS);
      await joobleProvider.postJob(makeJob(), NO_CREDS);
    });
    expect(stubWarnings(records)).toHaveLength(2);
  });
});
