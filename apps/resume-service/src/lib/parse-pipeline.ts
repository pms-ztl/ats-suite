/**
 * Shared resume parse+enrich pipeline — used by BOTH the queue worker and the
 * synchronous /internal/resume/reparse endpoint, so the two never drift.
 *
 * Stages:
 *   1. resume-parser agent  → structured, confidence-scored extraction
 *   2. enrich()             → canonicalize skills/companies/schools, per-skill
 *                             YOE, normalized dates, evidence-adjusted confidence
 *   3. resume verification  → agentic verifier (corroborate claims w/ tools);
 *                             falls back to GitHub-only corroboration
 *   4. persist + publish resume.parsed
 */
import { publishEvent } from "@cdc-ats/nats-client";
import { tenantSubject as ts } from "@cdc-ats/contracts";
import {
  runAgent,
  runAgenticAgent,
  hasAgenticAgent,
  enrich,
  semanticMatchSkills,
  extractGithubHandle,
  fetchGithubProfile,
} from "@cdc-ats/ai-engine";
import type {
  ResumeParserInput,
  ResumeParserOutput,
  GithubCorroborationInput,
  GithubCorroboration,
} from "@cdc-ats/ai-engine";
import type { Logger } from "pino";
// Runs inside the background parse worker; uses the admin client and writes
// Resume rows with an explicit tenantId.
import { prismaAdmin as prisma } from "./prisma.js";
import { buildVerifierTools } from "./verifier-tools.js";
import { extractProjects, buildTags } from "./projects-tags.js";

function persistRunFor(tenantId: string, userId: string | null) {
  return async (run: any) => {
    await prisma.agentRun.create({
      data: {
        id: run.agentRunId,
        tenantId: run.tenantId,
        agentType: run.agentType,
        status: run.status,
        inputHash: run.inputHash,
        tokensIn: run.tokensIn,
        tokensOut: run.tokensOut,
        costUsd: run.costUsd,
        latencyMs: run.latencyMs,
        modelName: run.modelName,
        triggeredByUserId: run.userId,
        errorMessage: run.errorMessage ?? null,
      },
    }).catch(() => undefined);
    await publishEvent({
      subject: ts(run.tenantId, "agent", "completed"),
      type: "agent.completed",
      tenantId: run.tenantId,
      payload: {
        tenantId: run.tenantId,
        agentRunId: run.agentRunId,
        agentType: run.agentType,
        status: run.status,
        tokensIn: run.tokensIn,
        tokensOut: run.tokensOut,
        costUsd: run.costUsd,
        latencyMs: run.latencyMs,
        modelName: run.modelName,
        iterations: run.iterations,
        triggeredByUserId: run.userId,
      },
    }).catch(() => undefined);
  };
}

export interface ParsePipelineResult {
  runId: string;
  parsedSkillsCount: number;
  costUsd: number;
}

/**
 * Run the full parse+enrich+verify pipeline for one resume and persist the
 * result. `reparse` only affects the log line; behavior is identical.
 */
export async function runParsePipeline(opts: {
  resumeId: string;
  candidateId: string;
  tenantId: string;
  userId: string | null;
  resumeText: string;
  bulkUploadId?: string | null;
  logger: Logger;
  reparse?: boolean;
}): Promise<ParsePipelineResult> {
  const { resumeId, candidateId, tenantId, userId, resumeText, logger } = opts;
  const persistRun = persistRunFor(tenantId, userId);

  // 1. Extract
  const result = await runAgent<ResumeParserInput, ResumeParserOutput>({
    agentType: "resume-parser",
    input: { resumeText },
    context: { tenantId, userId, persistRun },
  });

  // 2. Enrich (canonicalize + per-skill YOE + dates + evidence-adjusted confidence)
  const enriched = enrich(result.output, { sourceText: resumeText });
  // 2b. Semantic skill matching — fill canonicalIds alias-matching missed
  //     (no-op when no embeddings key is configured).
  try {
    const sem = await semanticMatchSkills(enriched);
    if (sem.matched > 0) logger.info({ resumeId, semanticallyMatched: sem.matched }, "semantic skill matches applied");
  } catch (err) {
    logger.warn({ err }, "semantic skill matching skipped");
  }

  // 3. Verify — prefer the agentic resume-verifier (ReAct: corroborate claims
  //    with tools). Falls back to the single GitHub-corroboration call.
  // Cost gate: the verifier is a SECOND LLM run per resume. On by default;
  // set AGENTIC_RESUME_VERIFY=0 to skip it (falls back to GitHub-only).
  let verification: any = null;
  let githubCorroboration: GithubCorroboration | null = null;
  const ghHandle = extractGithubHandle(result.output.links?.github);
  const verifyEnabled = process.env["AGENTIC_RESUME_VERIFY"] !== "0";
  // GitHub corroboration is a SEPARATE LLM call (~6-12k tokens) that only
  // fires when the resume has a GitHub URL and the agentic verifier did not
  // run. On by default; set RESUME_GITHUB_CORROBORATE=0 to skip it to stay
  // under a tight free-tier token budget (e.g. bulk re-screens on Groq free).
  const githubCorroborateEnabled = process.env["RESUME_GITHUB_CORROBORATE"] !== "0";

  if (verifyEnabled && hasAgenticAgent("resume-verifier")) {
    try {
      const ver = await runAgenticAgent<any, any>({
        agentType: "resume-verifier" as any,
        input: { candidateId, resumeId, githubHandle: ghHandle ?? null },
        context: {
          tenantId,
          userId,
          toolImpls: buildVerifierTools({ tenantId, resumeId, resumeText, enriched, logger }),
          persistRun,
        },
      });
      verification = { ...ver.output, trace: ver.steps, toolsUsed: ver.toolsUsed };
    } catch (err) {
      logger.warn({ err }, "agentic resume verification failed; falling back to GitHub-only");
    }
  }

  if (!githubCorroborateEnabled && !verification && ghHandle) {
    logger.info({ resumeId, ghHandle }, "GitHub corroboration disabled (RESUME_GITHUB_CORROBORATE=0); skipping");
  }
  if (githubCorroborateEnabled && !verification && ghHandle) {
    const ghProfile = await fetchGithubProfile(ghHandle);
    if (ghProfile) {
      try {
        const corro = await runAgent<GithubCorroborationInput, GithubCorroboration>({
          agentType: "github-corroborator" as any,
          input: { candidateProfileJson: JSON.stringify(enriched), githubProfileJson: JSON.stringify(ghProfile) },
          context: { tenantId, userId, persistRun: async () => undefined },
        });
        githubCorroboration = corro.output;
      } catch (err) {
        logger.warn({ err, ghHandle }, "GitHub corroboration failed; continuing");
      }
    }
  }

  // 4. Derive additive structured facets from the REAL parsed text + enriched
  //    output (no extra LLM call): projects[] from an actual "Projects" section,
  //    tags[] as a flat facet list of the canonical skills / certs / languages /
  //    format already extracted. Honest-empty when the resume lacks the content.
  const canonicalSkillLabels = enriched.skills.map((s) => s.label).filter(Boolean);
  const projects = extractProjects(resumeText, canonicalSkillLabels);
  const tags = buildTags({ canonicalSkillLabels, parsed: result.output });

  // 5. Persist
  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      parsedData: { raw: result.output, enriched, githubCorroboration, verification } as any,
      projects: projects as any,
      tags,
      parseStatus: "PARSED",
      parsedAt: new Date(),
    },
  });

  await publishEvent({
    subject: ts(tenantId, "resume", "parsed"),
    type: "resume.parsed",
    tenantId,
    payload: {
      tenantId,
      candidateId,
      resumeId,
      bulkUploadId: opts.bulkUploadId ?? null,
      parsedSkillsCount: enriched.skills.length,
      parseCostUsd: result.snapshot.costUsd,
      parsed: result.output,
      enriched,
      projects,
      tags,
      githubCorroboration,
      verification,
    },
  }).catch(() => undefined);

  logger.info(
    { resumeId, candidateId, reparse: !!opts.reparse, skills: enriched.skills.length, projects: projects.length, tags: tags.length, verified: !!verification },
    "resume parse pipeline complete",
  );

  return {
    runId: result.agentRunId,
    parsedSkillsCount: enriched.skills.length,
    costUsd: result.snapshot.costUsd,
  };
}
