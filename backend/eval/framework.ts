import fs from 'fs';
import path from 'path';

export interface EvalCase {
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  tags?: string[];
}

export interface EvalResult {
  caseIndex: number;
  pass: boolean;
  score: number; // 0-1
  metrics: Record<string, number>;
  errors: string[];
  latencyMs: number;
  tokensUsed: number;
  costUsd: number;
}

export interface EvalSummary {
  agentType: string;
  totalCases: number;
  passed: number;
  failed: number;
  passRate: number;
  avgScore: number;
  avgLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  results: EvalResult[];
  timestamp: string;
}

/**
 * Load golden dataset from JSONL file.
 */
export function loadGoldenDataset(agentType: string): EvalCase[] {
  const filePath = path.join(__dirname, 'datasets', agentType, 'golden.jsonl');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Golden dataset not found: ${filePath}`);
  }
  const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  return lines.map(line => JSON.parse(line));
}

/**
 * Compute eval summary from individual results.
 */
export function computeSummary(agentType: string, results: EvalResult[]): EvalSummary {
  const passed = results.filter(r => r.pass).length;
  return {
    agentType,
    totalCases: results.length,
    passed,
    failed: results.length - passed,
    passRate: results.length > 0 ? passed / results.length : 0,
    avgScore: results.length > 0 ? results.reduce((s, r) => s + r.score, 0) / results.length : 0,
    avgLatencyMs: results.length > 0 ? results.reduce((s, r) => s + r.latencyMs, 0) / results.length : 0,
    totalTokens: results.reduce((s, r) => s + r.tokensUsed, 0),
    totalCostUsd: results.reduce((s, r) => s + r.costUsd, 0),
    results,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Save eval results to a JSON file for historical tracking.
 */
export function saveEvalResults(summary: EvalSummary): string {
  const dir = path.join(__dirname, 'results');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${summary.agentType}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, JSON.stringify(summary, null, 2));
  return filePath;
}

/**
 * Check if eval results pass the CI gate threshold.
 */
export function checkCIGate(summary: EvalSummary, threshold: number = 0.80): {
  pass: boolean;
  message: string;
} {
  const pctPass = (summary.passRate * 100).toFixed(0);
  const pctThreshold = (threshold * 100).toFixed(0);

  if (summary.passRate >= threshold) {
    return {
      pass: true,
      message: `PASS ${summary.agentType}: ${pctPass}% pass rate (threshold: ${pctThreshold}%)`,
    };
  }
  return {
    pass: false,
    message: `FAIL ${summary.agentType}: ${pctPass}% pass rate BELOW threshold ${pctThreshold}% -- blocking merge`,
  };
}
