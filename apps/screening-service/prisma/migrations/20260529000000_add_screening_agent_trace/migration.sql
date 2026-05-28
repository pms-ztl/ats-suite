-- Phase 38 — persist the agentic screener's ReAct step trace so the UI can
-- show recruiters HOW the AI reached its verdict (reasoning, tool calls,
-- observations, final answer). Null for single-shot screenings.
ALTER TABLE "Screening" ADD COLUMN "agentTrace" JSONB;
