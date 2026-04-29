#!/usr/bin/env tsx
/**
 * Generate synthetic eval cases to expand golden datasets.
 * Uses Claude Haiku to create diverse test cases from templates.
 *
 * Workflow (per plan correction #9):
 * 1. Load existing human-validated cases (calibration set)
 * 2. Generate new synthetic cases inspired by the calibration set
 * 3. Write to golden.jsonl alongside existing cases
 *
 * Usage: npx tsx eval/generate-synthetic.ts --agent resume-parser --count 20
 */

import fs from 'fs';
import path from 'path';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const AGENT_TYPES = [
  'resume-parser', 'screening-agent', 'jd-author', 'scheduling-agent',
  'candidate-experience', 'sourcing-agent', 'interview-kit-agent',
  'interview-intelligence', 'offer-agent', 'copilot-agent',
  'analytics-agent', 'bias-auditor',
];

const SyntheticCaseSchema = z.object({
  input: z.record(z.string(), z.unknown()),
  expected: z.record(z.string(), z.unknown()),
  tags: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export async function generateCases(agentType: string, count: number): Promise<void> {
  const datasetDir = path.join(__dirname, 'datasets', agentType);
  const goldenPath = path.join(datasetDir, 'golden.jsonl');

  if (!fs.existsSync(goldenPath)) {
    console.error(`No golden dataset found for ${agentType}`);
    return;
  }

  const existingCases = fs.readFileSync(goldenPath, 'utf-8').trim().split('\n');
  console.log(`${agentType}: ${existingCases.length} existing cases, generating ${count} more...`);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('No ANTHROPIC_API_KEY — generating placeholder cases instead');

    const newCases: string[] = [];
    for (let i = 0; i < count; i++) {
      const placeholder = {
        input: { placeholder: true, caseIndex: existingCases.length + i, agentType },
        expected: { placeholder: true, needsHumanLabel: true },
        tags: ['synthetic', 'needs-review'],
        difficulty: (['easy', 'medium', 'hard'] as const)[i % 3],
      };
      newCases.push(JSON.stringify(placeholder));
    }

    fs.appendFileSync(goldenPath, '\n' + newCases.join('\n'));
    console.log(`  Appended ${count} placeholder cases (need human labeling)`);
    return;
  }

  // With API key: use Haiku to generate diverse cases
  try {
    const { object } = await generateObject({
      model: anthropic('claude-3-5-haiku-20241022'),
      schema: z.object({
        cases: z.array(SyntheticCaseSchema).length(Math.min(count, 10)),
      }),
      system: `Generate diverse test cases for a ${agentType} AI agent evaluation. Each case should have realistic input data and expected output. Vary the difficulty and edge cases. Base your generation on these example cases:\n\n${existingCases.slice(0, 3).join('\n')}`,
      prompt: `Generate ${Math.min(count, 10)} new eval cases. Include easy, medium, and hard cases. Cover edge cases and diverse scenarios.`,
    });

    const newLines = object.cases.map((c: z.infer<typeof SyntheticCaseSchema>) => JSON.stringify(c));
    fs.appendFileSync(goldenPath, '\n' + newLines.join('\n'));
    console.log(`  Generated ${object.cases.length} synthetic cases via Haiku`);
  } catch (err: any) {
    console.error(`  Generation failed: ${err.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const agentIdx = args.indexOf('--agent');
  const countIdx = args.indexOf('--count');

  const agent = agentIdx >= 0 ? args[agentIdx + 1] : null;
  const count = countIdx >= 0 ? parseInt(args[countIdx + 1]) : 15;

  if (agent) {
    await generateCases(agent, count);
  } else {
    for (const a of AGENT_TYPES) {
      await generateCases(a, count);
    }
  }
}

// Only run when executed directly (not when imported)
const isDirectRun = process.argv[1]?.includes('generate-synthetic');
if (isDirectRun) {
  main().catch(console.error);
}
