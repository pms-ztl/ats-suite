import { defineConfig } from "vitest/config";

// job-service is a NodeNext ESM package (imports use .js specifiers that resolve to
// .ts source). The hiring-platform stub-honesty unit tests are pure logic (the stub
// postJob paths never touch the network or DB), so a plain node environment is enough.
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
