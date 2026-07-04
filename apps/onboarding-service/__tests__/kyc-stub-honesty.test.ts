/**
 * Vitest suite for KYC stub-honesty (apps/onboarding-service/src/lib/kyc.ts).
 *
 * The default KYC provider is a STUB: it validates only the SHAPE of the input and
 * returns an honest NEEDS_PROVIDER result with a mock (null) provider reference. It
 * must NEVER masquerade as a real verification. This suite pins the two honesty
 * guarantees the STUB HONESTY mandate requires:
 *
 *   1. Structured, realistic, honest result: NEEDS_PROVIDER status, provider
 *      "stub", the additive `stub: true` marker, a masked value, and a message that
 *      says no result is fabricated. It NEVER returns VERIFIED.
 *   2. A runtime `[STUB] not production` warning is emitted ONCE per verify() call
 *      (not per item) so a stub run is visible in the logs, not just the DB row.
 *
 * The warning is asserted by capturing what the module's pino logger writes to
 * stdout (createLogger with no LOKI_URL writes JSON lines to process.stdout).
 *
 * Run:  npx vitest run apps/onboarding-service/__tests__/kyc-stub-honesty.test.ts
 */
import { describe, it, expect, vi, afterEach } from "vitest";

// The module logger is created via @cdc-ats/common createLogger, which (no LOKI_URL)
// returns a plain pino writing to fd 1 via SonicBoom - it does NOT go through
// process.stdout.write, so a stdout spy sees nothing. Instead we mock createLogger to
// return a spyable logger and assert on logger.warn() calls directly (robust to the
// pino destination/serialization). Only createLogger is overridden; all other common
// exports pass through untouched.
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

// Import AFTER the mock is declared (vi.mock/vi.hoisted are hoisted above imports).
const { getKycProvider } = await import("../src/lib/kyc.js");

/**
 * Run `fn`, capturing every logger.warn(bindings, msg) call the module made, mapped
 * into a pino-style record ({ ...bindings, msg, level: "warn" }) so the assertions
 * below read level/msg/structured-context uniformly.
 */
async function captureLogs(fn: () => Promise<void>): Promise<Array<Record<string, unknown>>> {
  warnSpy.mockClear();
  await fn();
  return warnSpy.mock.calls.map((args) => {
    const [bindings, msg] = args as [Record<string, unknown>, string];
    return { ...bindings, msg, level: "warn" };
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("KYC stub provider: honest structured result", () => {
  it("resolves to the stub provider by default (no KYC_PROVIDER set)", () => {
    const provider = getKycProvider();
    expect(provider.name).toBe("stub");
  });

  it("PAN verify returns NEEDS_PROVIDER, stub:true, a masked value, and never VERIFIED", async () => {
    const provider = getKycProvider();
    const result = await provider.verify({ type: "PAN", pan: "ABCDE1234F", nameOnPan: "Asha Rao" });

    expect(result.status).toBe("NEEDS_PROVIDER");
    expect(result.status).not.toBe("VERIFIED");
    expect(result.provider).toBe("stub");
    expect(result.stub).toBe(true);
    // A mock reference only: no real provider ran, so no real ref is minted.
    expect(result.providerRef).toBeNull();
    // Masked to the last 4 chars, never the full PAN.
    expect(result.maskedValue).toBe("•••• 234F");
    expect(result.maskedValue).not.toContain("ABCDE");
    // The message honestly states nothing is fabricated.
    expect(result.message.toLowerCase()).toContain("no result is fabricated");
  });

  it("BANK_ACCOUNT verify returns NEEDS_PROVIDER, stub:true, and a masked account", async () => {
    const provider = getKycProvider();
    const result = await provider.verify({
      type: "BANK_ACCOUNT",
      accountNumber: "123456789012",
      ifsc: "HDFC0001234",
      accountHolder: "Asha Rao",
    });

    expect(result.status).toBe("NEEDS_PROVIDER");
    expect(result.provider).toBe("stub");
    expect(result.stub).toBe(true);
    expect(result.providerRef).toBeNull();
    expect(result.maskedValue).toBe("•••• 9012");
    expect(result.maskedValue).not.toContain("12345");
  });
});

describe("KYC stub provider: [STUB] not production warning", () => {
  it("emits exactly one [STUB] not production warning per verify() call", async () => {
    const records = await captureLogs(async () => {
      const provider = getKycProvider();
      await provider.verify({ type: "PAN", pan: "ABCDE1234F" });
    });

    const stubWarnings = records.filter(
      (r) => r["level"] === "warn" && typeof r["msg"] === "string" && (r["msg"] as string).includes("[STUB]"),
    );
    expect(stubWarnings).toHaveLength(1);
    const msg = stubWarnings[0]!["msg"] as string;
    expect(msg).toContain("not production");
    expect(msg.toLowerCase()).toContain("stub");
    // The warning carries the check type as structured context.
    expect(stubWarnings[0]!["type"]).toBe("PAN");
  });

  it("warns once per call, not per item (two calls => two warnings)", async () => {
    const records = await captureLogs(async () => {
      const provider = getKycProvider();
      await provider.verify({ type: "PAN", pan: "ABCDE1234F" });
      await provider.verify({ type: "BANK_ACCOUNT", accountNumber: "123456789012" });
    });

    const stubWarnings = records.filter(
      (r) => r["level"] === "warn" && typeof r["msg"] === "string" && (r["msg"] as string).includes("[STUB]"),
    );
    expect(stubWarnings).toHaveLength(2);
  });
});
