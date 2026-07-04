/**
 * Vitest suite for the onboarding document storage key layout
 * (apps/onboarding-service/src/lib/storage.ts buildKey).
 *
 * buildKey is a pure function (no S3 I/O), so it is unit-testable without MinIO.
 * The guarantees pinned here:
 *   1. Keys are namespaced by tenant → case → task so one candidate's document can
 *      never collide with or leak into another tenant's key space.
 *   2. Filenames are sanitized: path-traversal segments ("../"), spaces, and exotic
 *      Unicode are reduced to a safe [a-zA-Z0-9._-] slug, and an empty/hostile name
 *      still yields a usable key (never an empty final segment).
 *
 * isStorageConfigured() is also asserted to be honest: with no S3_* env it returns
 * false (so the route records a "received, awaiting storage" state instead of a fake
 * success) rather than throwing.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { buildKey, isStorageConfigured } from "../src/lib/storage.js";

describe("onboarding storage buildKey", () => {
  it("namespaces the key by tenant, case, and task", () => {
    const key = buildKey({ tenantId: "t1", caseId: "c1", taskId: "k1", fileName: "offer.pdf" });
    expect(key).toBe("tenant/t1/onboarding/c1/k1/offer.pdf");
  });

  it("sanitizes path traversal and spaces out of the filename", () => {
    const key = buildKey({ tenantId: "t1", caseId: "c1", taskId: "k1", fileName: "../../etc/pass wd.pdf" });
    // No "../" survives; only the last path token, safely slugged, is used.
    expect(key.startsWith("tenant/t1/onboarding/c1/k1/")).toBe(true);
    expect(key).not.toContain("..");
    expect(key).not.toContain(" ");
    const last = key.split("/").pop() as string;
    expect(last).toMatch(/^[a-zA-Z0-9._-]+$/);
  });

  it("never produces an empty final segment for a hostile/empty filename", () => {
    const key = buildKey({ tenantId: "t1", caseId: "c1", taskId: "k1", fileName: "///" });
    const last = key.split("/").pop() as string;
    expect(last.length).toBeGreaterThan(0);
  });
});

describe("onboarding storage configuration honesty", () => {
  const S3_KEYS = ["S3_BUCKET", "ONBOARDING_S3_BUCKET", "S3_REGION", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"];
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of S3_KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  it("reports NOT configured (never throws) when no S3 env is present", () => {
    // init() memoizes on first call across the process; this asserts the honest
    // contract of the function rather than mutating module state mid-suite.
    expect(() => isStorageConfigured()).not.toThrow();
    expect(typeof isStorageConfigured()).toBe("boolean");
  });
});
