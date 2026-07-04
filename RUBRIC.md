# ATS Scoring Rubric (As Implemented)

This document describes how the candidate score (0-100) is actually computed in this
codebase today. It is a description of shipped behavior, not a design proposal. Every
number cited below comes from source code, with the file (and line numbers at the time
of writing) noted so it can be re-verified. Where a knob is fixed or a code branch is
currently inert, that is stated plainly.

Line numbers drift as files change; the file paths and identifier names are the stable
reference.

---

## 1. Score at a glance

| Field | Range | Meaning |
|---|---|---|
| `score` | 0-100 | Overall fit of the candidate against the requisition |
| `matchPercentage` | 0-100 | Share of requirements demonstrably met |
| `result` | `PASS` / `REVIEW` / `FAIL` | Band derived from the score |

Both fields are persisted on the `Screening` row
(`apps/screening-service/src/workers/screening.worker.ts:231-244`) and emitted on the
`screening.completed` event. After deterministic recalibration (section 4), `score` and
`matchPercentage` are set to the same calibrated value.

There are two distinct scoring entry points that share the same agent but differ in
post-processing:

1. **Pipeline screening** (async, per candidate): `ai-screening` BullMQ worker,
   `apps/screening-service/src/workers/screening.worker.ts`. Uses the agentic ReAct
   screener by default and then applies deterministic recalibration.
2. **Bulk-archive staging score** (sync, candidate-less): `POST /internal/screening/score`,
   `apps/screening-service/src/routes/screening.ts:21-81`. Used by the ZIP bulk-import
   worker to rank staging items before any Candidate exists. Uses the single-shot
   screener and does **not** apply recalibration, so its bands are the LLM prompt bands
   (70/40), not the recalibrated env bands (65/40). This asymmetry is real and current.

---

## 2. The full chain, end to end

```
resume file
  -> text extraction (pdf-parse / mammoth / txt / OCR)          deterministic
  -> resume-parser agent: structured fields + per-field
     confidence 0.0-1.0                                          LLM-judged
  -> candidate-screener agent: per-requirement findings,
     self-scored 0-100 verdict                                   LLM-judged
  -> recalibration: score recomputed from findings,
     result re-banded against env bars                           deterministic
  -> Screening row persisted; screening.completed published      deterministic
```

FREE-plan tenants stop after parsing: the screening worker plan-gates on
`candidate-screener` and skips quietly without creating a Screening row
(`screening.worker.ts:32-38`).

---

## 3. Scoring dimensions

The score is a holistic LLM judgment guided by explicit prompt rules, then (on the
pipeline path) recomputed deterministically from the per-requirement findings. The
dimensions below are what the prompts instruct the model to weigh. They are prompt
rules, not separate numeric sub-scores: except for the recalibration formula in
section 4, there is no weighted sum of named dimensions in code.

| Dimension | Where it is enforced | Mechanism |
|---|---|---|
| Requirement / skills match | Both screener prompts | Each requisition requirement is checked against resume text and extracted skills. Agentic path verifies each requirement individually via the `find_evidence_in_resume` tool (`packages/ai-engine/src/agents/screener-agentic.ts:123`). |
| Must-have vs nice-to-have | Agentic prompt only | The prompt tells the model to separate must-haves from nice-to-haves in its reasoning and defines `matchPercentage` as must-haves met / total must-haves (`screener-agentic.ts:121,136`). The deterministic 2x must-have weight in recalibration exists but is currently inert (section 4). |
| Experience relevance (recency, depth) | Agentic prompt "EVIDENCE STANDARDS" | "A skill last used 6+ years ago is weaker than current usage"; "used X" < "led/owned X"; quantified impact strengthens, vague claims do not (`screener-agentic.ts:128-132`). LLM-judged, no numeric decay formula. |
| Education fit | Parser output fed to screener | Education is extracted structurally by the resume parser (`packages/ai-engine/src/agents/resume-parser.ts:93`) and is part of the candidate profile the screener sees. There is no dedicated education weight in any prompt or formula; it influences the score only insofar as a requirement mentions it. |
| Keyword / evidence coverage | Deterministic tool | `find_evidence_in_resume` tokenizes the requirement (stopword-filtered, terms longer than 2 chars) and reports `coverage = matched terms / significant terms`; a requirement counts as `found` only when `coverage >= 0.5` (`apps/screening-service/src/lib/screener-tools.ts:24-47,107-133`). The LLM must treat the returned snippet as the proof. |
| Bias exclusions | Both prompts | Name, university prestige, employer prestige, and inferred demographics are explicitly excluded from scoring (`screening.ts:57-60`, `screener-agentic.ts:140-143`). |

---

## 4. Exact formulas and thresholds (cited from code)

### 4.1 Deterministic recalibration (pipeline path, agentic screener only)

`apps/screening-service/src/workers/screening.worker.ts:200-229`. Runs whenever the
agentic screener returned at least one `requirementFindings` entry. It overwrites the
LLM's self-score because the model self-scores conservatively against a fixed bar
(the "everyone below 70" problem noted in the code comment).

```
weight(f) = 2  if /must/i matches f.priority ?? f.importance
          = 1  otherwise

calibrated = round( 100 * sum(weight_i for met findings) / sum(weight_i) )

score = matchPercentage = calibrated

result = PASS    if calibrated >= SCREENING_PASS_BAR    (env, default 65)
         REVIEW  if calibrated >= SCREENING_REVIEW_BAR  (env, default 40)
         FAIL    otherwise
```

**Honest note: the 2x must-have weight cannot fire today.** The
`requirementFindings` schema (`packages/ai-engine/src/agents/screener-agentic.ts:40-48`)
only contains `{ requirement, met, evidence }`; Zod strips unknown keys, so
`f.priority` and `f.importance` are always undefined and every weight is 1. In
practice the formula reduces to `round(met / total * 100)`. Upstream, requisition
requirements are flat strings (`apps/job-service/src/routes/requisitions.ts:34`), and
the `importance` field that exists on requisition `customFields`
(`requisitions.ts:22-26`, values `must | nice | info`) is discarded when
`get_job_requirements` flattens custom fields into `"label: value"` strings
(`apps/screening-service/src/lib/screener-tools.ts:64-68`). The weighting branch is
defensive code awaiting structured priorities; it is not active behavior.

### 4.2 LLM self-score bands (baked into prompts, fixed)

Single-shot screener (`packages/ai-engine/src/agents/screening.ts:46-51`) and agentic
screener (`screener-agentic.ts:134-137`) both instruct:

```
score >= 70   -> PASS
score 40-69   -> REVIEW
score <  40   -> FAIL
matchPercentage = requirements demonstrably met / total * 100
```

The agentic variant narrows `matchPercentage` to must-haves met / total must-haves.
On the pipeline path these bands are superseded by recalibration whenever findings
exist; on the bulk-archive path (section 4.5) they are the final bands.

The agentic prompt also mandates human escalation when the score lands within about 5
points of either bar (`screener-agentic.ts:125`), which fires the
`flag_for_human_review` tool and publishes `screening.review_requested`
(`screener-tools.ts:157-187`).

### 4.3 Stub formulas (no ANTHROPIC_API_KEY: CI / offline)

Single-shot stub (`packages/ai-engine/src/agents/screening.ts:96-119`), pure keyword
matching:

```
matchPercentage = round(matched requirements / total * 100)    (50 if no requirements)
score           = min(100, matchPercentage + 2 * extractedSkillCount)
result          = PASS >= 70, REVIEW >= 40, FAIL < 40
```

Agentic stub (`screener-agentic.ts:174-260`), exercises the real tools:

```
score = min(100, round(met / total * 100))     via find_evidence_in_resume per requirement
borderline (65-74) -> flag_for_human_review, escalatedToHuman = true
```

### 4.4 Resume extraction confidence bands (parser, feeds screening quality)

Every leaf field the parser extracts carries a confidence
(`packages/ai-engine/src/agents/resume-parser.ts:143-147`):

```
0.9-1.0  verbatim from resume, unambiguous
0.6-0.9  lightly inferred (e.g. end date "Present" from "2020-")
0.3-0.6  substantially inferred or ambiguous
0.0-0.3  strong uncertainty, re-verify with candidate
```

These confidences are LLM self-assessments per the prompt rules; they do not enter
the score formula directly, but the agentic screener is instructed to lower its own
`confidence` output when resume evidence is sparse or unverifiable.

### 4.5 Bulk-archive staging score

`POST /internal/screening/score` (`apps/screening-service/src/routes/screening.ts:21-81`)
scores raw resume text against a requisition synchronously with the **single-shot**
`candidate-screener` agent. No Screening row, no recalibration; the returned `score`
is the LLM self-score under the 70/40 prompt bands (or the stub formula in 4.3
without an API key).

---

## 5. How ranking orders candidates

- **Bulk-archive staging list**: when a ZIP is uploaded against a requisition, every
  successfully extracted item is scored via 4.5 and the items endpoint supports
  `?sort=score`, which orders by `score DESC NULLS LAST, id ASC`
  (`apps/resume-service/src/routes/resume.ts:396-403`). Highest score first; the `id`
  tiebreaker keeps cursor pagination stable. Items with no bound requisition, failed
  extraction, or failed scoring keep a `null` score and sink to the bottom: unranked
  rather than fabricated (`apps/resume-service/src/workers/bulk-archive-extract.worker.ts:58-68,142-197`).
  The default sort without `?sort=score` is import order (`createdAt ASC, id ASC`).
- **Screening audit report**: `GET /internal/screening/audit/:requisitionId` orders
  completed screenings by `score DESC` (`apps/screening-service/src/routes/screening.ts:113`).
- **General screening list**: `GET /internal/screening` orders by `createdAt DESC`
  (recency, not score) (`routes/screening.ts:94`).

Separate from the ATS score: candidate-to-job **vector matching**
(`apps/candidate-service/src/lib/matching.ts`) ranks candidates by cosine similarity
of embeddings (a 0-1 similarity, descending). That is a sourcing/search relevance
score, not the screening rubric score, and the two are never mixed.

---

## 6. LLM-judged vs deterministic

| Component | Type |
|---|---|
| Text extraction (pdf-parse / mammoth / txt / OCR) | Deterministic |
| Structured resume parsing + per-field confidence | LLM (stub fallback) |
| Per-requirement met / not met judgment | LLM, anchored by the deterministic `find_evidence_in_resume` coverage check (threshold 0.5) |
| Requirement evidence snippets | Deterministic (substring search + snippet window) |
| Initial 0-100 self-score and reasoning | LLM |
| Recalibrated score `round(met/total*100)` and PASS/REVIEW/FAIL banding | Deterministic |
| Bulk staging rank order (`score DESC NULLS LAST`) | Deterministic |
| Past-screening calibration stats (count, average, pass rate) | Deterministic query, offered to the LLM as context (`screener-tools.ts:136-154`) |
| Human-review escalation decision | LLM decides, per prompt rules; the flag itself is a real published event |

---

## 7. What is configurable today, and at what scope

Being precise here matters: **no scoring knob is per-tenant today.**

### Per deployment (environment variables, apply to all tenants)

| Variable | Default | Effect |
|---|---|---|
| `SCREENING_PASS_BAR` | 65 | Recalibrated PASS threshold (`screening.worker.ts:210`); also reported to the agent by `lookup_past_screenings` (`screener-tools.ts:143,152`) |
| `SCREENING_REVIEW_BAR` | 40 | Recalibrated REVIEW threshold (`screening.worker.ts:211`) |
| `AGENTIC_SCREENER` | on | Set to `0` to fall back to the single-shot screener (no recalibration then, since there are no findings) (`screening.worker.ts:122-124`) |
| `SCREENING_CONCURRENCY`, `SCREENING_RATE_MAX` | 6, 30/min | Throughput only, no effect on scores (`screening.worker.ts:275-278`) |

### Per requisition (tenant-authored content, shapes what gets scored)

- `requirements`: flat array of strings (`apps/job-service/src/routes/requisitions.ts:34`).
  These are the criteria the screener checks. No per-requirement weight or priority is
  accepted in this array today.
- `customFields`: `{ label, value, importance: must|nice|info }`
  (`requisitions.ts:22-26`). Label and value are appended to the requirements the
  screener assesses (`screener-tools.ts:64-68`); the `importance` value is stored but
  **not used by scoring** (it is dropped during flattening, which is also why the 2x
  weight in section 4.1 is inert).

### Per tenant (plan level, gates access rather than tuning scores)

- The `candidate-screener` agent is plan-gated: FREE tenants get resume parsing but
  no AI screening and therefore no score (`screening.worker.ts:32-38`).

### Fixed (code constants, not configurable anywhere)

- The 70/40 bands inside both LLM prompts (`screening.ts:46-50`, `screener-agentic.ts:34,135`).
- The 2x must-have weight constant (`screening.worker.ts:215`).
- The 0.5 evidence-coverage threshold and the stopword list (`screener-tools.ts:24-27,127`).
- The stub bonus of +2 per extracted skill (`screening.ts:107`).
- The parser confidence band definitions (`resume-parser.ts:143-147`).
- Model IDs (`claude-sonnet-4-20250514`) and per-run cost caps (0.15 single-shot,
  0.25 agentic, 0.20 parser) (`screening.ts:89-92`, `screener-agentic.ts:164-167`,
  `resume-parser.ts:193-196`).

A per-tenant `ScreeningConfig` (bars, weights) does not exist yet. The parametric
rubric `matchPct = sum(met * weight) / sum(weight)` with live weights is described in
`docs/JOB_INTAKE_AI_SCREENING_PLAN.md` as a plan; only the unweighted form runs today.

---

## 8. Source file map

| Concern | File |
|---|---|
| Pipeline screening worker + recalibration | `apps/screening-service/src/workers/screening.worker.ts` |
| Single-shot screener agent + stub | `packages/ai-engine/src/agents/screening.ts` |
| Agentic (ReAct) screener agent + stub | `packages/ai-engine/src/agents/screener-agentic.ts` |
| Screener tool implementations (evidence search, past-run memory, human flag) | `apps/screening-service/src/lib/screener-tools.ts` |
| Sync candidate-less scoring + audit + list routes | `apps/screening-service/src/routes/screening.ts` |
| Resume parser agent (confidence bands, structured schema) | `packages/ai-engine/src/agents/resume-parser.ts` |
| Bulk-archive extract + per-item scoring | `apps/resume-service/src/workers/bulk-archive-extract.worker.ts` |
| Staging items ranked listing (`?sort=score`) | `apps/resume-service/src/routes/resume.ts` |
| Requisition requirements + customFields schema | `apps/job-service/src/routes/requisitions.ts` |
| Vector matching (separate similarity score, not this rubric) | `apps/candidate-service/src/lib/matching.ts` |
