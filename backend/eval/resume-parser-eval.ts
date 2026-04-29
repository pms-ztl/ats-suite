import { z } from 'zod';
import { ParsedResumeSchema, parseResume } from '../src/agents/resume-parser';
import fs from 'fs';
import path from 'path';

interface EvalCase {
  input: string;
  expected: z.infer<typeof ParsedResumeSchema>;
}

interface EvalResult {
  caseIndex: number;
  pass: boolean;
  fieldsCorrect: number;
  fieldsTotal: number;
  accuracy: number;
  errors: string[];
}

/**
 * Run offline eval against golden dataset.
 * Requires ANTHROPIC_API_KEY to be set.
 */
async function runEval() {
  const datasetPath = path.join(__dirname, 'datasets/resume-parser/golden.jsonl');
  const lines = fs.readFileSync(datasetPath, 'utf-8').trim().split('\n');
  const cases: EvalCase[] = lines.map(l => JSON.parse(l));

  console.log(`Running resume parser eval on ${cases.length} cases...\n`);

  const results: EvalResult[] = [];

  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i];
    try {
      const result = await parseResume({
        candidateId: `eval-candidate-${i}`,
        tenantId: 'eval-tenant',
        userId: 'eval-runner',
        resumeText: testCase.input,
      });

      // Compare fields
      const errors: string[] = [];
      let correct = 0;
      const fields = ['name', 'skills', 'experience', 'education', 'totalYearsExperience'];

      for (const field of fields) {
        const expected = (testCase.expected as any)[field];
        const actual = (result.parsed as any)[field];

        if (field === 'skills') {
          // Check overlap
          const expectedSet = new Set((expected as string[]).map(s => s.toLowerCase()));
          const actualSet = new Set((actual as string[]).map(s => s.toLowerCase()));
          const overlap = [...expectedSet].filter(s => actualSet.has(s)).length;
          const recall = overlap / expectedSet.size;
          if (recall >= 0.6) correct++;
          else errors.push(`skills: ${(recall * 100).toFixed(0)}% recall (need 60%+)`);
        } else if (field === 'experience') {
          if ((actual as any[]).length >= (expected as any[]).length * 0.8) correct++;
          else errors.push(`experience: found ${(actual as any[]).length}, expected ${(expected as any[]).length}`);
        } else if (field === 'name') {
          if (actual?.toLowerCase().includes(expected?.toLowerCase()?.split(' ')[0])) correct++;
          else errors.push(`name: got "${actual}", expected "${expected}"`);
        } else {
          if (actual === expected || (Array.isArray(actual) && actual.length > 0)) correct++;
          else errors.push(`${field}: mismatch`);
        }
      }

      results.push({
        caseIndex: i,
        pass: correct >= fields.length * 0.8,
        fieldsCorrect: correct,
        fieldsTotal: fields.length,
        accuracy: correct / fields.length,
        errors,
      });

      console.log(`Case ${i}: ${correct}/${fields.length} fields correct ${errors.length ? '-- ' + errors.join(', ') : '(pass)'}`);
    } catch (err: any) {
      results.push({ caseIndex: i, pass: false, fieldsCorrect: 0, fieldsTotal: 5, accuracy: 0, errors: [err.message] });
      console.log(`Case ${i}: FAILED -- ${err.message}`);
    }
  }

  const passCount = results.filter(r => r.pass).length;
  const avgAccuracy = results.reduce((s, r) => s + r.accuracy, 0) / results.length;

  console.log(`\n=== RESULTS ===`);
  console.log(`Passed: ${passCount}/${cases.length} (${((passCount / cases.length) * 100).toFixed(0)}%)`);
  console.log(`Avg field accuracy: ${(avgAccuracy * 100).toFixed(1)}%`);
  console.log(`Threshold: 80% pass rate required for CI gate`);

  process.exit(passCount >= cases.length * 0.8 ? 0 : 1);
}

runEval().catch(console.error);
