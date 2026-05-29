# Job-Intake → AI-Screening Workflow — Architecture & Implementation Plan (v2)

> Goal: a tenant admin defines a job — type a **title** → **AI-autogenerates** an editable JD, **or** paste/type a full JD with role, description, required + nice-to-have skills, and **arbitrary custom labeled fields**. The complete spec — **including custom field labels** — tunes the AI résumé screener, which ranks and surfaces the **top candidates**.

> **v2 provenance:** upgraded with a multi-agent deep-research + codebase-audit workflow (10 agents). All file:line references are verified against the repo. Full research with web citations is saved at the workflow output (`tasks/w33t8b7z4.output`); key citations are inlined in the Appendix. The agents' final auto-synthesis hit the Claude session cap (resets 15:00 Asia/Calcutta); this document is the human-authored synthesis of their findings.

---

## 1. Executive summary

The pieces exist but are **disconnected**, and three concrete bugs make screening meaningless on an empty spec (the cause of the real 41 FAIL / 9 REVIEW / 0 PASS run). Specifically: a capable `jd-author` agent already generates a full JD + bias self-audit **and already persists `description`+`requirements` to a requisition** — but **no UI ever calls it**, and its `niceToHave`/`biasFlags` are silently dropped (no columns). The screener can't see candidate skills (a data-shape bug) and is handed flat, unweighted, often-empty requirements. The plan: (1) fix the 3 bugs; (2) upgrade the data model to a structured, weighted **JobSpec** with custom labeled fields (no Prisma *type* migration needed — `requirements` is already `Json`); (3) build a **Job Intake** form (title→autogen *and* manual/paste) that wires the existing agent; (4) compile the full spec — custom labels included — into the screener and make scoring **weighted, calibrated, and pool-normalized** with a **top-N shortlist**; (5) bake in fairness/compliance using assets we already have. Phase 1 alone makes screening real.

---

## 2. Current-state assessment — "Is there already a place?"

**Partially — building blocks exist; the workflow does not.** Verified:

| Capability | State | Evidence |
|---|---|---|
| Job creation UI | ⚠️ minimal **modal** | `apps/frontend/app/(dashboard)/requisitions/page.tsx:311-400` — only 6 fields: title (req), department, location, employmentType, remote, description |
| Job **edit** UI | ❌ none | `requisitions/[id]/page.tsx` is **read-only**, no edit route |
| `requirements` in any form | ❌ never exposed | backend accepts it (`requisitions.ts:21`) but no UI sends it |
| `description` | ⚠️ free-text, optional | textarea only; no structure, no AI button |
| `jd-author` agent | ✅ **strong** | `packages/ai-engine/src/agents/jd-author.ts` → `{description, requirements[], niceToHave[], biasFlags[], inclusivityScore}` from `{title, department, skills, level, location}` |
| jd-author **persists to req** | ✅ but lossy | `apps/job-service/src/routes/jd-author.ts:101-114` saves `description`+`requirements` if `requisitionId` given — **discards `niceToHave` + `biasFlags`** (no columns) |
| jd-author wired to UI | ❌ never called | no `generateJD`/`/api/jd-author` call in `apps/frontend/lib/api-client.ts` or pages |
| Custom fields | ⚠️ wrong scope | `form-builder.tsx` + `ApplicationFormSchema` are **candidate-application** fields, not job-spec criteria — but a **reusable dynamic-field pattern** (`components/forms/form-builder.tsx`, `form-types.ts`, `FormFieldSchema` in `packages/contracts/src/dtos/requisition.ts:45-60`) |
| Screener consumes spec | ⚠️ broken | `screener-tools.ts:56-67` returns flat/empty `requirements`; worker defaults to `["general experience"]` (`screening.worker.ts:50-52`) |
| Candidate skills → screener | ❌ bug | `get_candidate_profile` (`screener-tools.ts:69-82`) reads `parsed.skills` but `parsedData` is nested `{raw, enriched}` and skills are `[{raw,confidence}]` → returns `[]`/garbage |
| Reusable AI endpoints | ✅ | api-client already has `generateBiasReport`, `automatedIntake`, `searchSkills` |
| Fairness assets | ✅ | jd-author biasFlags/inclusivityScore; `bias-auditor` agent; `toFairnessView`/`parsedSummaryFair`; super-admin audit log |

**Conclusion:** there is **no** single place to author a structured, screener-tuning job spec (title→autogen *or* manual, with required/nice skills + custom labeled fields). We build it, reusing `jd-author` and the form-builder dynamic-field pattern.

---

## 3. Gap analysis (3 root-cause bugs + structural gaps)

1. **Empty requirements (the 0-PASS cause).** `CreateReqSchema` makes `description`/`requirements` `.optional()`; handler stores `requirements: (body.requirements ?? []) as any` (`requisitions.ts:21,98`); the UI never sends them. → screener gets `[]` → invents a senior bar → everyone fails.
2. **Candidate skills never reach the screener.** `get_candidate_profile` reads `resume.parsedData?.skills` directly, but the shape is nested `{raw:{…}, enriched:{…}}` with `skills:[{raw,confidence}]` (`screener-tools.ts:69-82`; also `screening.worker.ts:49` casts to `string[]` → `["[object Object]"]`).
3. **jd-author output is lossy.** Route discards `niceToHave` + `biasFlags` (no columns) and the agent is never invoked from the UI.

Structural gaps: requirements are **flat strings** (no must/nice, weight, YOE) on both `Requisition` (`Json`) and `JobPosting` (`String[]`); `Skill` has no weight/required/YOE; pass bar is **hardcoded 70** (`screener-tools.ts:130`); scoring rubric is **implicit/black-box**; **two** screener implementations exist (single-shot `screening.ts` + agentic `screener-agentic.ts`) — both need the same upgrades; no custom job-spec fields; no spec→prompt compiler, no weighting, no pool-normalized ranking, no top-N shortlist.

---

## 4. Target end-to-end workflow

1. Admin → **New Job** → enters **title** (optionally dept/level/location/skills seed).
2. **A — Autogenerate:** *"✨ Generate with AI"* → `POST /api/jd-author` (already persists) → returns structured JD + `niceToHave` + `biasFlags` + `inclusivityScore` → fills an **editable** form (field-level edit + per-section regenerate).
   **B — Manual/Paste:** admin pastes a full JD and/or types each section.
3. Structured sections: **Role name · Description · Required skills (must/nice + weight + minYears) · Nice-to-have · Seniority/YOE · Compensation (min/max — pay-transparency) · Custom fields** (admin types a **Label** = "the box title" + **Value** + importance; add unlimited).
4. **Save** → persist a structured **JobSpec** + compile a cached **screeningSpec**. Publish-gate warns on empty spec / missing salary where legally required.
5. Screening (auto on `resume.parsed`, or "Re-screen all"): compiler feeds the full spec — *custom labels included* — to the screener; `get_candidate_profile` now surfaces parsed skills.
6. Screener scores **per requirement, weighted, with cited evidence** → 0–100, calibrated PASS/REVIEW/FAIL, **pool-normalized rank** → **Top-N shortlist**.

---

## 5. Data model changes (`apps/job-service/prisma/schema.prisma`)

`requirements` is already `Json` → **structured objects need no type migration**, only a data backfill. Add columns to `Requisition`:

```prisma
model Requisition {
  // ... existing ...
  description       String?
  requirements      Json   @default("[]")  // → Requirement[] (structured)
  niceToHave        Json   @default("[]")  // Requirement[]  (was being discarded)
  requiredSkills    Json   @default("[]")  // SkillRequirement[]
  preferredSkills   Json   @default("[]")  // SkillRequirement[]
  seniorityLevel    String?                // intern|entry|mid|senior|staff|principal|...
  minYearsExperience Int?
  maxYearsExperience Int?
  customFields      Json   @default("[]")  // CustomField[] {label, value, importance, weight?}
  screeningSpec     Json?                  // compiled, screener-facing spec (cache)
  passBar           Int    @default(60)    // per-req, calibratable (replaces hardcoded 70)
  inclusivityScore  Int?                   // from jd-author (was discarded)
  biasFlags         Json   @default("[]")  // from jd-author (was discarded)
  compensation      Json?                  // {min,max,currency,period} (pay-transparency)
  jdSource          String @default("manual") // manual|ai_generated|ai_edited|pasted
  provenance        Json?                  // per-field {source: ai|human|ai_edited}
}
```

Shared types in `packages/contracts` (extend `requisition.ts`, mirror the research-recommended JD schema — see Appendix):

```ts
type Requirement = { id: string; text: string; category: "skill"|"experience"|"education"|"other";
  importance: "must"|"nice"; weight: number /*0..1*/; knockout?: boolean; minYears?: number };
type SkillRequirement = { name: string; canonical?: string; taxonomyId?: string; // O*NET/ESCO grounding
  category: "technical"|"soft"|"domain"|"tool"|"language"|"certification";
  proficiency?: "familiar"|"proficient"|"advanced"|"expert"; weight: number; mustHave: boolean; minYears?: number };
type CustomField = { label: string; value: string; importance: "must"|"nice"|"info"; weight?: number };
```

**Migration:** wrap each existing `requirements` string → `{ id, text, category:"other", importance:"must", weight:1 }`. (Reuse the same pattern as `f5bd97d`/`a8b14e3` backfills.)

---

## 6. API changes

**job-service**
- `requisitions.ts` — extend `CreateReqSchema`/`PatchReqSchema` to accept `requirements: Requirement[]`, `niceToHave`, `requiredSkills`, `preferredSkills`, `seniorityLevel`, `min/maxYearsExperience`, `customFields`, `compensation`, `jdSource`, `provenance`, `inclusivityScore`, `biasFlags`. On write → `compileScreeningSpec()` → store `screeningSpec`.
- `jd-author.ts:101-114` — also persist `niceToHave`, `biasFlags`, `inclusivityScore` (now that columns exist); accept **title-only** input (default `department:"General"`, `skills:[]`, infer `level` from title).
- **Publish guard** — warn/flag a requisition whose `requirements`+`requiredSkills`+`customFields` are all empty, and (where law requires) missing `compensation`.
- New `POST /internal/requisitions/:id/rescreen` → enqueue screening for all active applications.

**screening-service**
- `service-client.ts` — `RequisitionData` + `fetchRequisition` return the structured `screeningSpec`.
- `screener-tools.ts:56-67` `get_job_requirements` — return structured requirements **+ weights + niceToHave + custom criteria + seniority**.
- **Fix** `get_candidate_profile` (`screener-tools.ts:69-82`): `const p = (resume.parsedData?.enriched ?? resume.parsedData?.raw ?? {}); skills: (p.skills ?? []).map(s => s.raw ?? s); summary: p.summary ?? null;`
- Replace hardcoded `passBar: 70` (`screener-tools.ts:130`) with the requisition's `passBar`.

---

## 7. Frontend UI / components

New **Job Intake** form — promote the modal to a real route `app/(dashboard)/requisitions/new/page.tsx` + add an **edit** route `[id]/edit`:
- **Title** + *"✨ Generate with AI"* → `apiClient.generateJd()` (new) → fills editable fields; show **inclusivity badge** + **bias-flag chips** (click to apply suggestion).
- **Description** rich/large textarea (paste-a-full-JD supported).
- **Requirements editor**: repeatable rows `{text, must|nice, weight slider, minYears}`.
- **Skills**: required vs nice-to-have tag inputs (back by `searchSkills` for taxonomy grounding).
- **Seniority / Min YOE / Compensation (min,max,currency)**.
- **Custom Fields** ("title of the box"): repeatable `{Label, Value, importance}` + *Add field* — **reuse the dynamic-row pattern in** `components/forms/form-builder.tsx`.
- **Preview** + **Save**.
- Detail page (`[id]/page.tsx`): **"Re-screen all"** + **Top-N shortlist** table (rank, name, score, matched/missing must-haves, evidence).
- `lib/api-client.ts` — add `generateJd`, extend `createRequisition`/`updateRequisition`, add `rescreen`, `getShortlist`.

---

## 8. AI integration

- **Autogen flow** (research §3): *enrich* (title → normalized title/seniority/jobFamily/suggested skills, optionally O*NET/ESCO-grounded) → *draft* structured JD (temp ~0.2–0.4) → *lint* inclusive-language/compliance as metadata. `jd-author` already covers draft+lint; add the enrich step + wire to UI.
- **Spec compiler** `compileScreeningSpec(req)` → `{roleSummary, requirements[{text,importance,weight,minYears}], requiredSkills, niceToHave, seniority, customCriteria[{label,value,importance,weight}]}`.
- **Screener (both modes)** — apply the 6 verified hooks:
  1. `get_job_requirements` returns weighted structured criteria (`screener-tools.ts:56-67`).
  2. `formatPrompt` renders `[MUST]/[NICE]` with weights (`screening.ts:64-79`).
  3. Parametric rubric in system prompt: `matchPct = Σ(met·weight)/Σweight`; floor/scale; custom-field bonuses (`screening.ts:42-62`).
  4. Agentic system prompt: classify must vs nice, demand current evidence for musts (`screener-agentic.ts:118-148`).
  5. Single-shot stub weighted (`screening.ts:96-120`).
  6. Agentic stub weighted (`screener-agentic.ts:204-227`).
- **Guard:** if spec empty → return `NEEDS_SPEC` (never invent a bar). Treat pasted JD/custom values as **data, not instructions** (delimit + ignore embedded directives — prompt-injection defense).
- **Fix** `get_candidate_profile` (skills unwrap) — biggest single accuracy lift.
- **Ranking:** score the pool → percentile-normalize → **Top-N** + REVIEW band; `passBar` calibrated per req (default 60).

---

## 9. Fairness & compliance guardrails (research-grounded)

- **Inclusive JD:** `jd-author` self-audit already flags gender/age/ability/pedigree bias — surface flags + inclusivityScore; warn on high-severity before publish. Evidence: neutral (not feminine) synonyms raise female applicants ~5% (PNAS 2025; Gaucher 2011). Consider Datapeople-style **8 bias categories**.
- **Pay transparency:** store explicit `compensation.min/max` and **gate publish** in CA/CO/CT/IL/MD/MN/NY/WA/etc. ("$X and up" is non-compliant).
- **ADA/EEOC:** separate essential vs marginal functions; quantify physical needs; include EEO + accommodation statements.
- **HITL + provenance:** every AI JD is a `draft` until human-approved; tag each field `source: ai|human|ai_edited` (we add `provenance`).
- **Screening governance:** evidence-cited `requirementFindings` (exists) for explainability; REVIEW tier + `flag_for_human_review` (exists, never auto-reject); persist spec+trace per screening for **NYC LL144** bias audits + **EU AI Act** high-risk logging; run `bias-auditor` over shortlists (four-fifths rule). Vendor bar: Greenhouse is ISO 42001 + monthly third-party (Warden AI) bias audits.
- **Custom-field safety:** validate labels/values against protected-class proxies; warn.

---

## 10. Phased implementation roadmap

| Phase | Scope | Key files | Ships |
|---|---|---|---|
| **1 — Unblock (highest value)** | Capture description+structured requirements at create (UI + remove silent `[]` + publish guard); **fix `get_candidate_profile` skills unwrap**; replace hardcoded passBar with `req.passBar`; must/nice+weight on requirements | `requisitions.ts`, `screener-tools.ts:69-82,130`, `requisitions/page.tsx`, schema | **Screening works on real specs immediately** |
| **2 — AI autogen** | Wire `jd-author` "Generate with AI"; persist `niceToHave`/`biasFlags`/`inclusivityScore`; title-only | `jd-author.ts`, `requisitions.ts`, intake form, `api-client.ts` | Title → editable JD |
| **3 — Custom fields** | `customFields` + dynamic UI (reuse form-builder) + compiler + screener prompt + injection guard | schema, `requisitions.ts`, frontend, `screener-tools.ts` | Admin custom labeled criteria → AI |
| **4 — Scoring engine** | Weighted parametric scoring (6 hooks, both modes), calibrated passBar, pool normalization, **Top-N shortlist UI**, re-screen | `screening.ts`, `screener-agentic.ts`, `screening.worker.ts`, `[id]/page.tsx` | Ranked top candidates |
| **5 — Compliance** | pay-transparency gate, bias-audit on shortlist, LL144 notice/export, adverse-impact view, per-field provenance | contracts, `bias-auditor`, notification/compliance, frontend | Audit-ready |

---

## 11. Risks & open questions

- **Prompt injection** from pasted JDs / custom values → delimit + sanitize (Phase 3).
- **Two screener modes** must be kept in sync (single-shot + agentic).
- **Skill normalization** (O*NET/ESCO synonym expansion) — start with existing semantic-skill matching + `searchSkills`; full taxonomy later.
- **Model quality:** gpt-4o-mini (current `AI_MODEL_OVERRIDE`) is cheap but less nuanced for senior roles → per-role model tier.
- **Pass-bar calibration:** derive from must-have coverage, not a fixed 70.
- **Open:** JobSpec as `Requisition` columns (recommended now) vs a 1:1 `JobSpec` table later.
- **Open:** re-screen cost on large pools — batch + only on material spec change.

---

## Appendix — Deep-research highlights & citations

**Recommended structured JD schema** (autogen + manual; full version in research): identity (title, jobFamily, `seniority`, employmentType) · narrative (summary, responsibilities[], dayToDay[]) · split requirements (`requiredQualifications` vs `preferredQualifications`, `requiredSkills` vs `preferredSkills` as `SkillRequirement` with `taxonomyId`) · `experience{minYears,maxYears}` · `education` with **equivalency paths** · `location{workplaceType,...}` · `compensation{min,max,currency,period}` · ADA `essentialPhysicalRequirements[]` · `eeoStatement`/`accommodationStatement` · governance (`status`, `inclusivityFlags[]`, per-field `provenance`).

**Vendor patterns:** LinkedIn (title + structured inputs + skills insights → editable draft, gender-neutral prompt); Greenhouse (JD+scorecard gen, org toggles, ISO 42001, monthly Warden AI bias audits); Ashby (in-editor refine, keeps context); Datapeople/Textio (real-time bias analytics, 8 bias forms). **Lesson:** title alone → generic; ground in skills taxonomy + structured inputs + HITL.

**Structured-output:** schema-in-prompt + temp 0–0.1 + one few-shot + validate/retry raises adherence ~60%→97%; use provider-native structured output (the agent already uses AI-SDK `generateObject` + repair loop).

**Key sources:** LinkedIn AI JDs · Greenhouse AI (ISO 42001 / Warden) · Datapeople bias guidance · Gaucher Friesen & Kay 2011 · PNAS 2025 (debiasing job ads) · EEOC ADA guidance · pay-transparency by state (SixFifty/GovDocs) · O*NET / ESCO skills taxonomies. *(Full URLs in `tasks/w33t8b7z4.output`; the remaining research findings — requirement/skill modeling, screening scoring calibration, custom-fields→LLM, fairness/legal — are captured there and can be folded into §5/§8/§9 verbatim after the 15:00 session reset.)*
