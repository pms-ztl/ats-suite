// @cdc-ats/ai-engine — agent runtime + agent definitions
//
// Each agent registers both a real LLM definition AND a deterministic stub.
// The runtime picks based on whether ANTHROPIC_API_KEY is set, so dev/CI
// works without API keys and prod with a key gets real Claude calls.
export * from "./runtime.js";
export * from "./agents/resume-parser.js";
export * from "./agents/screening.js";
export * from "./agents/interview-kit.js";
export * from "./agents/jd-author.js";
