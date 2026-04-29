import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';

// Since eval/ is outside src/ (rootDir), we use dynamic path resolution
// rather than a relative import that would break tsc rootDir constraints.
// Vitest/tsx handles this fine at runtime.
import { loadGoldenDataset, computeSummary, checkCIGate, type EvalResult } from '../../eval/framework';

describe('Eval Framework', () => {
  it('loads resume-parser golden dataset', () => {
    const dataset = loadGoldenDataset('resume-parser');
    expect(dataset.length).toBeGreaterThanOrEqual(3);
  });

  it('loads screening-agent golden dataset', () => {
    const dataset = loadGoldenDataset('screening-agent');
    expect(dataset.length).toBeGreaterThanOrEqual(3);
  });

  it('loads jd-author golden dataset', () => {
    const dataset = loadGoldenDataset('jd-author');
    expect(dataset.length).toBeGreaterThanOrEqual(3);
  });

  it('loads scheduling-agent golden dataset', () => {
    const dataset = loadGoldenDataset('scheduling-agent');
    expect(dataset.length).toBeGreaterThanOrEqual(3);
  });

  it('loads candidate-experience golden dataset', () => {
    const dataset = loadGoldenDataset('candidate-experience');
    expect(dataset.length).toBeGreaterThanOrEqual(3);
  });

  it('computeSummary produces correct metrics', () => {
    const results: EvalResult[] = [
      { caseIndex: 0, pass: true, score: 0.9, metrics: {}, errors: [], latencyMs: 100, tokensUsed: 500, costUsd: 0.01 },
      { caseIndex: 1, pass: true, score: 0.8, metrics: {}, errors: [], latencyMs: 200, tokensUsed: 600, costUsd: 0.02 },
      { caseIndex: 2, pass: false, score: 0.4, metrics: {}, errors: ['low score'], latencyMs: 150, tokensUsed: 400, costUsd: 0.01 },
    ];
    const summary = computeSummary('test-agent', results);
    expect(summary.totalCases).toBe(3);
    expect(summary.passed).toBe(2);
    expect(summary.failed).toBe(1);
    expect(summary.passRate).toBeCloseTo(0.667, 2);
    expect(summary.totalTokens).toBe(1500);
  });

  it('checkCIGate passes above threshold', () => {
    const summary = computeSummary('test', [
      { caseIndex: 0, pass: true, score: 1, metrics: {}, errors: [], latencyMs: 0, tokensUsed: 0, costUsd: 0 },
    ]);
    expect(checkCIGate(summary, 0.8).pass).toBe(true);
  });

  it('checkCIGate fails below threshold', () => {
    const summary = computeSummary('test', [
      { caseIndex: 0, pass: false, score: 0, metrics: {}, errors: ['fail'], latencyMs: 0, tokensUsed: 0, costUsd: 0 },
    ]);
    expect(checkCIGate(summary, 0.8).pass).toBe(false);
  });
});
