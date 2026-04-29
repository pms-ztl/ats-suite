import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { judgeAgentOutput, JudgeVerdictSchema, JUDGE_PROMPTS } from '../../eval/llm-judge';

const DATASETS_DIR = path.join(__dirname, '../../eval/datasets');

const AGENT_TYPES = [
  'resume-parser',
  'screening-agent',
  'jd-author',
  'scheduling-agent',
  'candidate-experience',
  'sourcing-agent',
  'interview-kit-agent',
  'interview-intelligence',
  'offer-agent',
  'copilot-agent',
  'analytics-agent',
  'bias-auditor',
];

describe('Eval dataset expansion', () => {
  it.each(AGENT_TYPES)('%s has >= 20 golden cases', (agentType) => {
    const goldenPath = path.join(DATASETS_DIR, agentType, 'golden.jsonl');
    expect(fs.existsSync(goldenPath)).toBe(true);
    const lines = fs.readFileSync(goldenPath, 'utf-8').trim().split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(20);
  });

  it('total golden cases >= 240', () => {
    let total = 0;
    for (const agentType of AGENT_TYPES) {
      const goldenPath = path.join(DATASETS_DIR, agentType, 'golden.jsonl');
      const lines = fs.readFileSync(goldenPath, 'utf-8').trim().split('\n');
      total += lines.length;
    }
    expect(total).toBeGreaterThanOrEqual(240);
  });

  it('all JSONL files contain valid JSON on every line', () => {
    for (const agentType of AGENT_TYPES) {
      const goldenPath = path.join(DATASETS_DIR, agentType, 'golden.jsonl');
      const lines = fs.readFileSync(goldenPath, 'utf-8').trim().split('\n');
      for (let i = 0; i < lines.length; i++) {
        expect(() => JSON.parse(lines[i])).not.toThrow();
      }
    }
  });
});

describe('LLM judge module', () => {
  it('exports judgeAgentOutput function', () => {
    expect(typeof judgeAgentOutput).toBe('function');
  });

  it('judgeAgentOutput returns correct schema without API key (heuristic fallback)', async () => {
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const result = await judgeAgentOutput({
        agentType: 'resume-parser',
        input: { text: 'test resume' },
        expectedOutput: { name: 'Test' },
        actualOutput: { name: 'Test' },
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('pass');
      expect(result).toHaveProperty('dimensions');
      expect(result).toHaveProperty('reasoning');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(typeof result.pass).toBe('boolean');
      expect(result.dimensions).toHaveProperty('accuracy');
      expect(result.dimensions).toHaveProperty('completeness');
      expect(result.dimensions).toHaveProperty('relevance');
      expect(result.dimensions).toHaveProperty('safety');
      expect(result.reasoning).toContain('Heuristic');
    } finally {
      if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });

  it('JudgeVerdictSchema validates a correct verdict', () => {
    const validVerdict = {
      score: 0.85,
      pass: true,
      dimensions: {
        accuracy: 0.9,
        completeness: 0.8,
        relevance: 0.85,
        safety: 1.0,
      },
      reasoning: 'The output correctly extracted all major fields from the resume.',
    };

    const result = JudgeVerdictSchema.safeParse(validVerdict);
    expect(result.success).toBe(true);
  });

  it('JudgeVerdictSchema rejects invalid verdict', () => {
    const invalidVerdict = {
      score: 1.5, // out of range
      pass: true,
      dimensions: { accuracy: 0.9, completeness: 0.8, relevance: 0.85, safety: 1.0 },
      reasoning: 'ok',
    };

    const result = JudgeVerdictSchema.safeParse(invalidVerdict);
    expect(result.success).toBe(false);
  });

  it('JUDGE_PROMPTS covers all 12 agent types', () => {
    const expectedPromptKeys = [
      'resume-parser',
      'candidate-screener',
      'jd-author',
      'interview-scheduler',
      'candidate-assistant',
      'talent-sourcer',
      'interview-kit-generator',
      'interview-intelligence',
      'offer-generator',
      'hiring-copilot',
      'analytics-insights',
      'bias-auditor',
    ];

    for (const key of expectedPromptKeys) {
      expect(JUDGE_PROMPTS).toHaveProperty(key);
      expect(JUDGE_PROMPTS[key].length).toBeGreaterThan(50);
    }
    expect(Object.keys(JUDGE_PROMPTS).length).toBe(12);
  });
});

describe('Synthetic generation module', () => {
  it('generate-synthetic.ts is importable', async () => {
    const mod = await import('../../eval/generate-synthetic');
    expect(typeof mod.generateCases).toBe('function');
  });
});
