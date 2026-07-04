import { defineConfig } from "vitest/config";

// onboarding-service is a NodeNext ESM package (imports use .js specifiers that
// resolve to .ts source). The KYC stub-honesty unit tests are pure logic and need
// no DB or network, so a plain node environment is enough.
export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    // Let the .js import specifiers in the source resolve to their .ts files
    // when vitest loads them directly from src.
    extensions: [".ts", ".js", ".json"],
  },
});
