// @cdc-ats/ai-engine — agent runtime + agent definitions
//
// Each agent registers both a real LLM definition AND a deterministic stub.
// The runtime picks based on whether ANTHROPIC_API_KEY is set, so dev/CI
// works without API keys and prod with a key gets real Claude calls.
export * from "./runtime.js";
export * from "./persist.js";

// Agents from Phase 6a
export * from "./agents/resume-parser.js";
export * from "./agents/screening.js";
export * from "./agents/interview-kit.js";
export * from "./agents/jd-author.js";

// Agents from Phase 6e (8 new agents from monolith)
export * from "./agents/analytics.js";
export * from "./agents/bias-auditor.js";
export * from "./agents/offer.js";
export * from "./agents/sourcing.js";
export * from "./agents/interview-intelligence.js";
export * from "./agents/scheduling.js";
export * from "./agents/candidate-experience.js";
export * from "./agents/copilot.js";
