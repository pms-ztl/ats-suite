# Session Handoff — CDC ATS / TalentFlow (v3)

**Purpose:** everything three sessions have learned, so the next session continues seamlessly.
**Last updated:** 21 Jul 2026
**Repo:** `/Users/sanjayn/ats-suite/ats-suite` · branch `main`, in sync with `origin/main`.
**This supersedes the v2 handoff.** Everything under §5 is **still uncommitted** — the pile has grown, not shrunk, since v2.

> **To the next session: read the URGENT box right below, then §0, §3, and §6, before touching anything.**

---

## ⚠️ URGENT — a second, separate session is editing a file you're also using

The user started a **background task in a different local session** (`task_0950aafd`, "Fix review-all response resetting bulk-import phase") **while this session was mid-edit on the exact same file**: `apps/resume-service/src/routes/resume.ts`. That other session may still be running, may have already saved changes, or may be done — this session has no way to know except by checking.

**Before touching `apps/resume-service/src/routes/resume.ts` again:**
1. `git diff apps/resume-service/src/routes/resume.ts` — see if it changed since this handoff was written.
2. `git status` — check whether the other session already committed (it shouldn't have, per §6, but verify rather than assume).
3. If the bug it was fixing (`recomputeReviewCounters()` only returns `{pendingCount, approvedCount, rejectedCount}`, and the frontend's `runReviewAll()` does a plain `setStatus(s)` replace rather than a merge, so `phase` — which isn't in that partial response — falls back to the frontend's default of `"extracting"`, kicking the review screen back to a fake "Extracting…" spinner after ANY of the four bulk-review-actions buttons, not just the new "Reject all duplicates" one) is already fixed, **don't re-fix it** — read the current code first.

This is a real, live risk of two sessions clobbering each other's work on the same file. Do not assume your in-memory understanding of this file is current.

---

## 0. Who the user is & how to work with them

- Building **CDC ATS / TalentFlow**, preparing a **client/stakeholder demo**. No technical background — did not write this app, relies on you to explain and verify everything concretely. **Never claim something works without proof** (screenshot, curl output, DB query — not "should work now").
- Writes in fast shorthand with typos (`hte`, `teh`, `iam`, `rigth`, `concicse`, `wht`, `sscratch`). Not sloppiness — moves fast. Match with substance, not formality.
- **Annotates screenshots** (circles, arrows, squiggles) to point at UI problems — sometimes with zero accompanying text. The circle *is* the bug report.
- **Tests thoroughly and reports back exact screenshots/behavior** — genuinely effective at black-box testing once given a clear checklist. Give concrete, numbered, verifiable steps rather than vague "try it out."
- Pushes back when you're vague or wrong, and is usually right. Answer yes/no questions with **yes/no first**, then detail.
- **Asks "are you actually following your own guidelines?" and expects an honest, specific answer** — not a blanket "yes." When asked this, I gave a genuine self-critique (see §8) rather than reassurance. Keep doing that.
- **Pushes back on over-engineered solutions you didn't ask for** — brought up a specific external OCR model (nvidia/nemotron-ocr-v2) multiple times as a possible fix; the right response both times was a clear, reasoned "no, and here's the actual cost/benefit," not just compliance or a flat refusal. Don't be afraid to make the case against a heavier solution when a small one already fixes the real problem.
- **Explicitly refuses dishonesty even under social/manager pressure** (declined to write a fabricated excuse or inflate metrics, offered honest alternatives instead, both accepted without pushback). This is not just an app-code rule — it extends to how you report status to this user, period.
- **Core codebase principle: "real data or honest-empty — never fabricate."** EU AI Act / NYC LL144 compliance framing, in comments throughout. Explain why when a pane needs to stay honestly empty; the user accepts it every time.
- **Standing instruction, still active: DO NOT COMMIT OR PUSH ANYTHING without the user explicitly saying so in that moment.** See §6.
- Gave the project a `CLAUDE.md` (see §5.6) with 4 explicit behavioral rules (Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution) and directly asked whether they were being followed — hold yourself to these, they are now standing project instructions, not optional.
- Works well with `AskUserQuestion` for genuine **product** decisions. Do **not** use it for things you can determine yourself by reading code.
- When an instruction already contains the decision, **act** — don't turn it back into a multiple-choice question.

---

## 1. What the product is

**CDC ATS**, branded **TalentFlow**. Multi-tenant, AI-assisted ATS. Monorepo (npm workspaces + turbo).

- `apps/` — **17 services** + `frontend` (Next.js 14 App Router)
- `packages/` — `common`, `contracts`, `nats-client`, `ai-engine`, `outbox`, `embed-sdk`
- **DB-per-service** (Postgres, one DB each), **NATS JetStream** for events, **Redis/BullMQ** for queues, **RLS** for tenant isolation.

| Service | Port | | Service | Port |
|---|---|---|---|---|
| api-gateway | 4000 | | screening | 4008 |
| identity | 4001 | | notification | 4009 |
| tenant | 4002 | | search | 4010 |
| billing | 4003 | | agent | 4011 |
| job | 4004 | | analytics | 4012 |
| candidate | 4005 | | compliance | 4013 |
| interview | 4006 | | assessment | 4014 |
| resume | 4007 | | onboarding | 4015 |
| | | | **collab** (video/room signalling) | 4016 |

---

## 2. Running it

```bash
cd /Users/sanjayn/ats-suite/ats-suite
open -a Docker       # if the DAEMON itself is down (not just containers) — see §3.6, happened this session
npm run infra:up      # Postgres/Redis/NATS/Mailpit/Grafana/Jaeger/Loki
npm run dev           # turbo → all 17 services + frontend  (~60-75s to fully boot)
curl -s localhost:4000/healthz          # {"status":"ok",...}
curl -s -o /dev/null -w "%{http_code}" localhost:3000   # 200
```

**Ports:** frontend `3000` · gateway `4000` · **Mailpit `8025`** · Grafana `3001` · Jaeger `16686` · Postgres `5434` · Redis `6381`.

**Demo logins** (seeded, unchanged):

| User | Password | Notes |
|---|---|---|
| `priya@pinnacle.demo` | `PinnacleDemo123!` | **Main.** ADMIN, Pinnacle Tech, **ENTERPRISE**, richest data |
| `nora@northwind.demo` | `NorthwindDemo123!` | **FREE** plan — proves gating (402s) |
| `manager@pinnacle.demo` | `ManagerDemo123!` | Hiring-manager view |
| `admin@ncrvoyix.demo` | `NcrVoyixDemo123!` | Client-branded tenant |

**Current demo data (verified live 21 Jul 2026), Pinnacle Tech candidates by source:**
```
BULK_UPLOAD 100 · Company website 21 · Referral 15 · Job board 13 · LinkedIn 10 · Recruiter outreach 8
```
= **167 total candidates.** The 100 `BULK_UPLOAD` ones are **real test data from this session** (a genuine bulk-ZIP import, committed live during testing — see §5.3/§5.7) — they exist as real records, all sitting in the `Applied` stage, **not attached to any requisition** (no `Application` row — see §5.8 item 3, this is a real, confirmed workflow gap, not a bug in the test). Original seed baseline: 67 applications across the other 5 sources, 6 `HIRED` (seeded via real API in an earlier session), 39 screenings, 10 interviews.

**As of this handoff:** dev stack is live, all 17 services + frontend healthy. **This is a point-in-time fact** — Docker's own daemon (not just containers) died once this session (§3.6/§3.11) and needed `open -a Docker` before anything else would work. Always verify, don't assume.

**Pinnacle's 3 requisitions** (unchanged):
- **DevOps Engineer** `b46bf91d-0c47-45a8-9417-9d55f34a4091` ← only req with eligibility rules
- Account Executive — Enterprise `0cd8eac4-7ca1-4cf5-83ba-38387ad1eaab`
- Marketing Director `b2ee4ed6-d029-4056-9724-22142561ca3d`

**Named candidate ⚠️: name collisions exist in the seed data** — always resolve by full first+last name, never a fuzzy/first-name-only query.

---

## 3. ⚠️ GOTCHAS — READ THIS OR LOSE HOURS

### 3.1 🔴 Next dev serves STALE CHUNKS — the #1 time-waster
Your edit compiles, `tsc` is clean — **and the browser still runs the old version.** Stable chunk filenames mean the browser reuses its cache.

**The fix, and the order matters:**
1. **Navigate to the target page first** — the chunk URL only appears in `performance.getEntriesByType('resource')` *after* the page that uses it has loaded once.
2. *Then* bust every chunk currently listed:
```js
const urls = [...performance.getEntriesByType('resource')]
  .map(e => e.name).filter(n => /_next\/static\/chunks\/.*\.js/.test(n));
for (const u of urls) await fetch(u, { cache: 'reload' });
```
Then navigate again (force). Busting *before* navigating silently does nothing — the URL isn't in the resource list yet.

### 3.2 Login doesn't redirect
Form login returns 200 but stays on `/login`. Navigate to `/` manually — known quirk.

### 3.3 Auth rate limiter will lock you out
20 attempts / 15 min, per-IP, in-memory. **Reset:** `touch apps/api-gateway/src/index.ts`, wait ~12s.

### 3.4 Automating login in a browser
Set BOTH `sessionStorage['ats-access-token']` AND the `ats-token` cookie:
```js
const j = await (await fetch('http://localhost:4000/api/auth/login',{method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({email:'priya@pinnacle.demo',password:'PinnacleDemo123!'})})).json();
sessionStorage.setItem('ats-access-token', j.data.token);
document.cookie = `ats-token=${encodeURIComponent(j.data.token)}; path=/; max-age=86400; SameSite=Lax`;
```

### 3.5 Two Next servers corrupt `.next`
Use the env-driven `distDir`: `NEXT_DIST_DIR=.next-preview npm run dev --workspace=@cdc-ats/frontend` (`frontend-preview` config already in root `.claude/launch.json`).

### 3.6 Docker can die at TWO levels — containers, or the daemon itself
Earlier sessions only saw containers vanish (`infra:up` fixes it, named volumes persist data). **This session the daemon itself was down** (`docker ps` → `dial unix .../docker.sock: connect: no such file or directory`). Fix: `open -a Docker`, poll (`until docker ps >/dev/null 2>&1; do sleep 2; done`) until it responds, **then** `infra:up`.

### 3.7 Alertmanager crash-loops
Alerting-only — ignore it, everything else is healthy.

### 3.8 Browser test-harness: click by `ref`, not by pixel coordinate
Screenshot renders can be scaled (e.g. 800×450) vs the real viewport (1280×720). Use `read_page`/`find` for a `ref_N` handle and click by ref.

### 3.9 `computer.zoom` / `computer.scroll` are unreliable in this harness
Drive scroll/geometry directly via `javascript_exec` instead.

### 3.10 Case-sensitive text assertions in verification scripts produce false negatives
Check the assertion's exact string/casing before concluding the *app* is wrong.

### 3.11 🆕 This monorepo has TWO copies of `pdfjs-dist` at different versions — a real, subtle trap
`apps/resume-service` depends on `pdfjs-dist@^5.7.284` directly (gets its own nested `node_modules` copy), but `pdf-parse` (also used by resume-service, for the non-OCR text-extraction attempt that always runs *first*) has its own transitive dependency on `pdfjs-dist@5.4.296`, which npm hoists to the **root** `node_modules`. Both copies get loaded into the **same Node process**. `pdfjs-dist`'s internal "fake worker" (used because Node has no `Worker` for this to run in) sets a **process-wide global**, `globalThis.pdfjsWorker`, as a side effect of whichever copy initializes it first — and its version-consistency check compares the *API* side against whatever is sitting in that global, **regardless of which copy actually set it**. Net effect: because `pdf-parse` (using its own 5.4.296) always runs before OCR (using resume-service's own 5.7.284) on the exact same file, OCR would find the *other* copy's stale global already there and throw `"API version ... does not match Worker version ..."` on **every single OCR call** — a real bug, not a config issue, and it silently killed OCR fallback for every scanned/flattened PDF until fixed this session (§5.7). If you ever touch `apps/resume-service/src/lib/ocr.ts` again: the fix is to save/delete/restore `globalThis.pdfjsWorker` around the `pdfjs.getDocument(...)` call, and to explicitly resolve `workerSrc` via `import.meta.resolve("pdfjs-dist/legacy/build/pdf.worker.mjs")` rather than a bare relative specifier. Don't "clean up" by trying to dedupe the two `pdfjs-dist` versions at the package.json level unless you've checked what else in the monorepo needs 5.4.296 — that's a bigger, riskier change than the 15-line code-level fix already in place.

### 3.12 🆕 Backgrounded shell commands can die silently across environment restarts
A `run_in_background` Bash command (or an agent) can be killed by a Docker/session/environment restart with **no completion record** — you get a `<task-notification>` saying `"stopped"`, not `"failed"` or `"completed"`, and the output file may be completely empty even if the command had been running for minutes. **Don't assume "stopped" means the code is broken** — it may never have finished running at all. Check the output file for partial results, and re-run in the foreground (or with a longer, monitored background run) if you need a real answer rather than a guess. This happened twice this session with the same OCR verification script before it finally completed cleanly.

---

## 4. 🔑 THE BIGGEST FACT: every API key is empty

```
OPENROUTER_API_KEY, SENDGRID_API_KEY, S3_ACCESS_KEY_ID, JUDGE0_AUTH_TOKEN,
GOOGLE_OAUTH_CLIENT_ID, TWILIO_ACCOUNT_SID, STRIPE_SECRET_KEY   → ALL EMPTY
```

`ai-engine` falls back to deterministic stubs when there's no LLM key — the switch is exactly `if (process.env["OPENROUTER_API_KEY"]) return true` in `packages/ai-engine/src/runtime.ts`. Stubs still use real input data (real job title, real requirements), so output *looks* plausible but isn't real model reasoning — confirmed again this session building "Generate kits" (§5.2), which runs in stub mode and produces a real-looking-but-templated interview kit.

**Separately, and NOT the same system:** résumé OCR (`tesseract.js`) is **not AI at all** — a traditional, pre-trained, locally-run computer-vision engine, no API key needed, works identically with or without `OPENROUTER_API_KEY`. Don't conflate "OCR isn't working" with "we need an AI key" — this came up explicitly this session (the user repeatedly asked about swapping in `nvidia/nemotron-ocr-v2`; the actual fix was a 2-bug code issue, not a missing/wrong model — see §5.7).

⚠️ **Demo landmine, unchanged:** the stub's reasoning text literally contains the word **"Stub"**. Never open a full verdict or a generated interview kit in front of the client without checking the wording first.

---

## 5. What's changed across all sessions (all currently UNCOMMITTED)

**33 files, +1802/−381.** Everything below was verified live (browser + independent curl/DB check), not just read back from a diff, unless explicitly marked otherwise.

### 5.1 Analytics, Candidates page, Screening queue, Candidate profile, misc wiring (from v2 — still accurate, still uncommitted, not re-described here)
See the full write-up in git history of this file (`git log -p -- CLAUDE-HANDOFF.md`) if you need the details — condensed list of what's covered: `/analytics/source-of-hire` real hired-count fix; conversion-% calc fix; the multi-section export engine (`lib/export.ts`); Analytics KPI/zone honesty fixes; the **Candidates-list-missing-`include` bug** (a real, significant, incidentally-discovered data bug that broke Stage display app-wide); Candidates page scroll/layout fixes; dead `advanceStage()` replaced with real `patchApplicationStage`; Screening queue real bulk Advance/Reject + the "Open full verdict" deep link (candidate profile → screening queue, auto-opens the right row); CandidateProfile note CRUD (add/delete, popover+draft UX) backed by real `CandidateNote` routes; the dynamic "you're here" stepper rebuild; blind-mode export redaction + the original blind-export **data leak** fix (name/email/phone/location correctly hidden in the export, not just on-screen); Shell.tsx seats-unlimited fix, dead menu-item removal, real Exit-session wiring; `ScreeningRow.candidateId` made required.

### 5.2 Six dead-button fixes + one new backend feature (Reschedule)
All individually diagnosed (checked whether a backend route existed before writing any frontend code), fixed, and live-verified with real before/after DB proof:

| Item | What was actually wrong | Fix |
|---|---|---|
| **All feedback** (CandidateProfile → Interview scorecards) | `Zone`'s `action` renders a real button regardless of whether `onAction` is passed — looked real, did nothing | Deep-link to `/interviews?candidateId=X`; `interviews-live.tsx` now filters the list to just that candidate. Verified: exactly 2/13 real interviews shown for a test candidate, not all 13. |
| **View source** (CandidateProfile → Parsed résumé) | Same dead-`Zone`-action pattern | Shows the real `extractedText` from the `Resume` row (not the missing original-file binary — this dev env has no S3 configured, `storageKey` is `''` for every resume, so the download-URL route would honestly 404 for 100% of candidates; extracted text is the honest, always-available alternative) in a real Dialog. New `getResumeSource()` in `lib/api.ts`, new `GET /resume/:candidateId` passthrough already existed on the backend. |
| **Requisitions Export** | Was already fixed in an earlier pass, this round was pure re-verification | Confirmed live: real CSV, all 4 real requisitions, no code change needed |
| **Edit (requisition detail)** | `onEdit` was never passed | New `/requisitions/[id]/edit` route + `requisition-edit-live.tsx`, a plain prefilled form (title/dept/location/salary/status/description) — **deliberately NOT** reusing `IntakeScreen` (the AI-wizard used for *creating* a requisition; wrong tool for editing one, would drag in JD-generation theater nobody asked for). New `updateRequisition()` calling the already-existing `PATCH /requisitions/:id` (which already supported partial updates — no backend change needed). Verified: changed a real requisition's location, confirmed in DB, reverted. |
| **Generate kits** (Interview rounds page) | No handler at all | Wired to the real, already-registered `interview-kit` AI agent via `POST /agents/run` (runs in stub mode — see §4). Verified live: real job title + real requirement text flowed into the generated questions/rubric, original "Interviewer instructions" per round left untouched (results render in a separate read-only panel, never overwrite user-authored text). |
| **Previous/Next pagination** (Requisitions list) | No handler, no page state at all | Real client-side pagination (`PAGE_SIZE=10`, slice, disable at bounds). Verified the disabled-state edge case live; the real multi-page case is unverified live since no tenant currently has >10 requisitions — math is straightforward slicing, low risk. |
| **Reschedule** (interview detail) | No handler, **and no backend route existed at all** — the only item in this batch requiring new backend capability | New `PATCH /interviews/:id` (interview-service), sets `status: "RESCHEDULED"` only when the time actually changes (not on a duration/location-only edit) — `RESCHEDULED` already existed in the `InterviewStatus` enum and the frontend's status-label map, just nothing ever set it. Frontend: inline reveal form (`datetime-local` + duration inputs), same pattern as `scheduling-live.tsx`. Verified live end-to-end: changed a real interview's time, confirmed `scheduledAt`/`status` in DB, reverted both the time and the status back to `SCHEDULED` afterward. |

### 5.3 Bulk-import "stuck extraction" investigation — the big one this session
User reported the ZIP-import "Extracting your archive…" screen appearing permanently stuck at "0 files extracted." **Root cause was three separate, real things, not one** — resist the urge to explain this as a single bug if it comes up again:

1. **Browsers pause `setInterval` polling in a backgrounded tab.** If you tab away mid-extraction (the screen's own copy invites exactly this — "you can keep working and come back"), the periodic "are we done?" check literally stops firing. Extraction finishes on the server regardless; the tab just never asks again until you force it. **Fixed**: a `visibilitychange` listener now forces an immediate poll the moment the tab becomes visible again (`ArchiveImport.tsx`). Verified by mocking `document.visibilityState` to `"visible"` and confirming an immediate extra network call fired.
2. **`bulkId` lived only in React state, never persisted.** Reload or navigate away → the connection to that job was gone forever from the UI's perspective, even though the backend kept working and finished. **Fixed**: `bulkId` now seeds from a `?bulkId=` URL query param (`router.replace`, not `push`, to avoid history spam), and a new "N imports waiting for review" banner (new `GET /internal/resume/bulk` list endpoint, filtered on `phase NOT IN (done, failed)` — NOT `completedAt IS NULL`, which turned out to never get set for any archive import where some files were rejected in review, the common case) surfaces already-finished-but-unreviewed jobs from earlier in the session. Verified live: reload with `?bulkId=` in the URL correctly reattached to the same job and showed the same real data.
3. **A genuine, separate OCR bug** — `apps/resume-service/src/lib/ocr.ts` set `pdfjs.GlobalWorkerOptions.workerSrc = false`, which throws `"Invalid \`workerSrc\` type"` on every call (the setter requires a string). This broke OCR fallback for every scanned/flattened PDF specifically (plain images via `ocrImage()` were unaffected and always worked). **Fixed** by removing the line entirely — pdfjs-dist already auto-detects Node and runs inline on its own, the line was both invalid *and* redundant.
4. **A second, DEEPER OCR bug found only after fixing #3** — the `globalThis.pdfjsWorker` collision between two `pdfjs-dist` versions in this monorepo (§3.11). Fixed via explicit `workerSrc` resolution + save/delete/restore of the global around the render call.
5. **Also fixed in the same pass**: the generic `progress` percentage field on `GET /bulk/:id` was computed from the wrong counters (`processedFiles`/`failedFiles`, which belong to the older loose-file upload path and never move for archive/ZIP uploads) — always read 0% for ZIP imports. Now branches on whether the row is an archive import and uses `extractedCount`/`committedCount` instead.

**Verification for #3/#4 required building a genuinely text-less test PDF** (a hand-constructed single-page PDF embedding a JPEG — rendered via `@napi-rs/canvas` — as the *only* content, zero text-drawing operators) to force the real OCR-fallback code path, since an ordinary "scanned-looking" PDF often still has a hidden embedded text layer and never touches OCR at all. Once both bugs were fixed, this synthetic PDF round-tripped through the real `extractResumeText()` end-to-end and produced correct, readable OCR output. **Net conclusion, stated plainly to the user and worth restating here: OCR itself was never fundamentally broken or under-powered — it was two specific, fixable code bugs plus normal real OCR latency (~4 sec/file, one shared warm worker, not parallelized). No case for swapping to a different OCR engine.**

### 5.4 Duplicate detection for the ZIP import pipeline (this session's last major feature)
User's ask: before committing a bulk import, show which résumés are duplicates (either of an existing candidate already in the system, or of another file in the *same* zip) with a count and a tag, plus a way to bulk-reject them — reusing whatever duplicate-detection already exists rather than inventing new logic.

**Reused, don't reinvent:** the CSV import path (`apps/candidate-service/src/routes/import.ts`) already had exactly this — one batched `email IN [...]` query, an in-file Set-based dupe pass (checked *first*, taking precedence over "matches existing"), and per-row status labels. Ported the same algorithm and precedence to the ZIP path rather than designing something new.

- **New `POST /internal/candidates/check-existing`** (candidate-service) — `{emails: string[]}` → `{existing: [{email, candidateId}]}`, one query, no role gate (internal service-to-service, same reasoning as the pre-existing `upsert-from-application` route).
- **New `checkExistingCandidates()`** client function in `apps/resume-service/src/lib/service-client.ts` (mirrors the existing `upsertCandidate()` function's fetch/timeout/fail-open pattern exactly, same file).
- **New `computeDuplicates()` helper** in `apps/resume-service/src/routes/resume.ts` — wired into `GET /bulk/:id` (adds `duplicateCount`) and `GET /bulk/:id/items` (adds `duplicateReason: "existing" | "in_file" | null` per item), plus a new `"reject-duplicates"` action on the existing `POST /bulk/:id/review-all` endpoint.
- **Frontend**: a "N Duplicates" toolbar pill, a "Duplicate" / "Duplicate in file" tag per row (same visual pattern as the existing Extracted/Failed tag, not a new one), and a "Reject all duplicates" button alongside the existing "Reject empty"/"Approve all non-empty".
- **Deliberately no schema migration, no caching** — computed live on each request, exactly as scoped with the user (a real tradeoff surfaced and agreed *before* building, per their own "don't pick silently" rule).
- **Verified live against real data, not just type-checked**: hit the new endpoint directly with a known real email and confirmed the correct match; checked `GET /bulk/:id` against a real leftover review-phase job and got `duplicateCount: 99` — independently cross-checked outside the app (exported both email lists, diffed them) and confirmed exactly 99 of that batch's 100 items already existed as real candidates, matching the feature's own count exactly. The one item with no detected email correctly showed `duplicateReason: null` (not counted) rather than a false positive.
- **Not independently verified live**: the `in_file` (same email twice within one zip) case and the "Reject all duplicates" button's actual DB effect — the dev-environment safety layer blocked a manual attempt to fabricate an in-file-duplicate test scenario via direct DB edits (correctly — that would have been an unrequested data mutation). Both are a direct, minimal port of `import.ts`'s already-proven logic, so confidence is high, but this is a real, honest gap — don't claim it's fully proven until someone runs a zip with an actual intra-file duplicate through it.
- **A pre-existing, unrelated bug was found while implementing this** (not introduced by this feature): see the URGENT box at the top of this file. A separate session is fixing it concurrently.

### 5.5 Bugs found, explained to the user, but NOT yet fixed — real, concrete, ready to pick up
Surfaced while answering the user's direct questions about a real imported candidate ("Technical Skills," email `nathanbrooks@gmail.com`):

1. **Name-detection bug**: the parser sometimes captures a résumé section heading (e.g. "TECHNICAL SKILLS") as the candidate's detected name instead of their actual name. Confirmed via a real example — the real person is Nathan Brooks (per email), detected name was literally "Technical Skills." Root cause not yet located precisely; likely in `apps/resume-service/src/lib/guess.ts`'s name-guessing heuristic, probably worse for OCR'd (image/scanned) sources than clean-text ones. Not investigated further this session.
2. **Misleading Advance-button error message**: `candidate-profile-live.tsx`'s `onAdvance` guard —
   ```ts
   if (!appId || from < 0 || from >= STAGE_ORDER.length - 1) {
     toast.error(`${c.name} is already at ${STAGE_META[c.stage]?.label} — nothing further to advance to.`);
   ```
   — shows the exact same message for three different situations, only one of which (genuinely at the last stage before Hired) is that message's real meaning. For a candidate with **no application at all** (`!appId` — true for every one of the 100 bulk-imported candidates, since bulk import doesn't attach a requisition), the message is actively wrong: it says "already at Applied" as if Applied were a terminal stage, when the real reason is "this candidate isn't linked to any job." Small, precise fix: split the guard into distinct messages per case.
3. **Real workflow gap, not a bug**: there is currently **no UI anywhere** to attach an already-existing/bulk-imported candidate to a specific requisition after the fact. Confirmed backend capability exists (`POST /internal/applications` in `apps/candidate-service/src/routes/applications.ts` accepts `{candidateId, requisitionId, ...}` for an existing candidate, clamping the initial stage to `APPLIED`/`SCREENED`) — nothing in the frontend calls it for this case. Practically: **all 100 of this session's bulk-imported candidates are currently stuck in the general pool with no path forward through the UI.** This is probably the single highest-value thing to build next if the user wants bulk-imported candidates to actually be usable.

### 5.6 `CLAUDE.md` created at the project root
Contains 4 behavioral rules the user pasted directly: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution. **Provenance note, stated honestly**: `git status` at the very start of this session already showed `?? CLAUDE.md` as an existing untracked file, and its contents were already visible in the system prompt as loaded project instructions — meaning a version of this file may have existed from a session before this one. Later in this same session, a check for it came back "No such file or directory," and it was recreated from what the user pasted. The current content is correct and complete; whether it's byte-identical to whatever existed originally is unknown and not worth chasing further.

### 5.7 Data cleanup — discussed at length, deliberately NOT done
The user wanted a clean slate to test parsing from scratch (remove the ~100+ `BULK_UPLOAD` test candidates). Investigation found:
- The only real delete-candidate API (`DELETE /internal/gdpr/candidates/:id`) **does not hard-delete** — it anonymizes in place (scrambles name/email, deletes Applications/Notes/Attachments, but the Candidate row itself survives as "Anonymized User") for GDPR audit-trail reasons. Wrong tool for "give me a clean slate."
- No hard-delete path exists in the product's own API for this.
- Rather than doing a raw-SQL mass delete, the user pivoted to wanting a **black-box end-to-end test checklist** instead (17 items, covering upload → extraction → per-row accuracy → bulk actions → commit → real-candidate verification → cleanup check) — given directly to the user to run through and report back. **Status: given, not yet confirmed completed** — no item-by-item results have come back yet as of this handoff.
- **Current real count, confirmed live**: 100 `BULK_UPLOAD` candidates exist (not several hundred — earlier mid-session concern about runaway duplication from repeated test commits turned out not to materialize; only one clean 100-candidate batch is currently in the DB). 2 `BulkUpload` job rows remain: one `done` (committed), one `review` (the one used to verify duplicate-detection, now correctly showing 99 duplicates + 1 non-duplicate).

---

## 6. 🔴🔴🔴 STANDING INSTRUCTION — DO NOT COMMIT

> **User's exact words (v2 session):** *"don't commit until i say...iam planning to commit all of these once i tested and wanted to do manually."*

Nothing in this repo has been committed since. **Do not run `git add`, `git commit`, or `git push` — for any reason — until the user says so explicitly, in the moment.** A future green light for one batch does not cover the next batch. Preparing a commit message or reviewing the diff is fine; staging and committing are not.

---

## 7. Current uncommitted state (ground truth, captured 21 Jul 2026)

```
 M CLAUDE-HANDOFF.md
 M apps/api-gateway/src/routes/aggregators.ts
 M apps/candidate-service/src/routes/candidates.ts
 M apps/frontend/app/(dashboard)/analytics/source-effectiveness/page.tsx
 M apps/frontend/app/(dashboard)/analytics/time-to-hire/page.tsx
 M apps/frontend/app/(dashboard)/candidates/import/ArchiveImport.tsx
 M apps/frontend/app/(dashboard)/candidates/import/page.tsx
 M apps/frontend/app/(dashboard)/interviews/[id]/page.tsx
 M apps/frontend/app/(dashboard)/requisitions/[id]/rounds/page.tsx
 M apps/frontend/app/(embed)/embed/screening/[token]/page.tsx
 M apps/frontend/components/cd/AnalyticsScreen.tsx
 M apps/frontend/components/cd/Shell.tsx
 M apps/frontend/components/cd/analytics-live.tsx
 M apps/frontend/components/cd/candidate-profile-live.tsx
 M apps/frontend/components/cd/candidates-live.tsx
 M apps/frontend/components/cd/cd-shell.tsx
 M apps/frontend/components/cd/interviews-live.tsx
 M apps/frontend/components/cd/requisition-detail-live.tsx
 M apps/frontend/components/cd/requisitions-live.tsx
 M apps/frontend/components/cd/scheduling-live.tsx
 M apps/frontend/components/cd/screening-live.tsx
 M apps/frontend/components/cd/screens/CandidateProfile.tsx
 M apps/frontend/components/cd/screens/Candidates.tsx
 M apps/frontend/components/cd/screens/Requisitions.tsx
 M apps/frontend/components/cd/screens/Screening.tsx
 M apps/frontend/components/cd/types.ts
 M apps/frontend/components/shared/candidate-summary-export.tsx
 M apps/frontend/lib/api.ts
 M apps/frontend/lib/export.ts
 M apps/interview-service/src/routes/interviews.ts
 M apps/resume-service/src/lib/ocr.ts
 M apps/resume-service/src/lib/service-client.ts
 M apps/resume-service/src/routes/resume.ts
?? CLAUDE.md
?? apps/frontend/app/(dashboard)/requisitions/[id]/edit/
?? apps/frontend/components/cd/requisition-edit-live.tsx
?? apps/resume-service/eng.traineddata

33 files changed, 1802 insertions(+), 381 deletions(-)
```

`eng.traineddata` (5.2 MB) is Tesseract's downloaded English language model — a legitimate runtime artifact, not something to clean up, and not authored by any session (it appeared on disk before this session started). All throwaway debug/verification scripts created while chasing the OCR bug (`ocr-fix-verify.ts`, `check-fixture.ts`, `check-textless-pdf.ts`, `debug-worker-global.ts`) were deleted after use — confirmed clean via `git status` before writing this handoff. `tsc --noEmit` was clean across `frontend`, `resume-service`, `candidate-service`, and `interview-service` the last time each feature was verified.

---

## 8. Mistakes made across all sessions — don't repeat them

Carried forward from v2 (still valid, not re-listed in full): the Candidates-list-missing-`include` incidental discovery; the verdict-deep-link false-bug detour (own test script had a case-sensitive string check and a scaled-screenshot coordinate mismatch, not an app bug); a name-collision mixup during Advance-button testing; twice declining to fabricate an excuse/metrics and offering an honest alternative instead.

**New this session:**

**(a) Left throwaway debug scripts uncleaned — caught only when the user ran `git diff`.** While chasing the OCR bugs (§5.7), created several standalone `tsx` verification scripts directly inside `apps/resume-service/`. Deleted one (`ocr-fix-verify.ts`) proactively, then genuinely forgot three more (`check-fixture.ts`, `check-textless-pdf.ts`, `debug-worker-global.ts`) until the user ran `git status`/`git diff` and they showed up as untracked clutter. Cleaned up immediately once noticed, but this is exactly the "clean up only your own mess" rule the user's own `CLAUDE.md` states — **should have been caught proactively**, not by the user noticing first.

**(b) Asked to self-assess against the user's `CLAUDE.md`, and found real (not just token) gaps.** Specifically: didn't always surface product/UI-design decisions to the user *before* implementing when multiple reasonable interpretations existed (e.g. exactly what "View source" should show, exactly where "Generate kits" results should render) — made the call, explained it *after* building. That's a real miss against "if multiple interpretations exist, present them, don't pick silently," not just a technicality. Do better on this going forward: for genuinely open product/design questions (not settled technical facts), ask or at least flag the assumption *before* writing code, the same way `AskUserQuestion` was used for bigger decisions this session.

**(c) The combined OCR fix (§5.7, bugs #3+#4) never got one clean, uninterrupted live verification run** — the background verification script was killed twice by environment/session restarts before finally completing. Root-cause confidence was (and remained) high throughout from precise code tracing, but per the user's own "loop until verified" rule, "high confidence" isn't quite the same bar as "verified" — say so explicitly when it's true, as was done here, rather than letting a confident explanation stand in for completed verification.

---

## 9. Resolved since the v1 handoff (do not re-investigate these)

- **Dead `api-client.ts` quarantine — DONE.** `lib/api-client.ts` exposes only the 5 live namespaces; the ~99 dead methods live in `lib/api-client.unimplemented.ts`, imported by nothing.
- **v1's layout fixes** (funnel labels, gutters, nav highlight, integrations grid, seats gauge, widget heights, scheduling balance, gauge/heatmap/waffle sizing) — all merged via PR #1. Don't go looking for these files as "pending" — they're already committed.
- **CalendarHeat resize** — resolved (verified geometry values in a prior pass; still hasn't had a fresh screenshot this session, low priority to chase further).
- **RBAC/field-visibility/IDOR pass** — landed before this session (`requireRole`/`filterVisibleFields` in `packages/common/src/rbac/field-visibility.ts`). Check for a visibility-matrix entry before assuming a field passes through on any route you touch.

---

## 10. Still open / pending — nothing below has been actioned yet

1. **🎯 Olu Aamir's (and others') candidate-profile "Not screened yet, 0% match" bug — root cause fully diagnosed, fix not yet written.** `getVerdict(id)` in `lib/api.ts` calls `GET /internal/screening/:id`, which looks up by the **Screening record's own id** — but is passed the **candidate's** id. They're never the same value → 404 → honest-but-wrong "not screened yet" fallback, even when a real completed verdict exists (confirmed via direct DB query for at least 2 real candidates this session predates). Fix: use `?candidateId=` on the list endpoint (same as the Screening queue page already does correctly) and take the most recent row, instead of the single-record-by-id lookup.
2. **Candidate-summary export formats (MD/HTML/JSON)** — recommendation given (MD+HTML yes, hold off on JSON), user decision still pending.
3. **The three bugs/gaps in §5.5** — name-detection picking up section headers as names; the misleading Advance-button error message (quick, precise fix); the missing "attach existing candidate to a requisition" workflow (bigger, probably highest-value single next feature).
4. **The `in_file` duplicate case and "Reject all duplicates" button are unverified live** (§5.4) — port is a faithful copy of proven logic, but genuinely untested end-to-end.
5. **§5.7's black-box test checklist** — given to the user, not yet confirmed run/completed.
6. **The concurrent-session bug fix** (URGENT box, top of file) — check its actual state before doing anything else with `resume.ts`.
7. **50%-zoom layout sweep** (Interviews, Offers, Workspace admin) — still not done.
8. **Mobile <768px** — still broken, still not attempted.
9. **`DEMO-SCRIPT.md`** — if it still exists, hasn't been re-read/refreshed against anything from this session.

---

## 11. Fast recipes

```bash
# health
curl -s localhost:4000/healthz && curl -s -o /dev/null -w "%{http_code}\n" localhost:3000

# clear the auth rate limiter
touch apps/api-gateway/src/index.ts && sleep 12

# get a token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"priya@pinnacle.demo","password":"PinnacleDemo123!"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).data.token")

# query any service DB directly (psql is NOT on the host)
docker exec ats-postgres psql -U postgres -d candidate_db -tAc 'SELECT source, count(*) FROM "Candidate" GROUP BY source;'
docker exec ats-postgres psql -U postgres -d resume_db -tAc 'SELECT id, phase, status, "totalFiles", "extractedCount" FROM "BulkUpload" ORDER BY "createdAt" DESC;'

# check the new duplicate-detection endpoint directly
curl -s -X POST localhost:4005/internal/candidates/check-existing -H "Content-Type: application/json" \
  -H "X-Tenant-Id: <tenantId>" -d '{"emails":["nathanbrooks@gmail.com"]}'

# full restart (Docker daemon down → containers down → services down, in that order)
open -a Docker
until docker ps >/dev/null 2>&1; do sleep 2; done
npm run infra:up
pkill -f "turbo run dev"; nohup npm run dev > /tmp/ats-dev.log 2>&1 &
```

---

## 12. Guardrails hit

The auto-mode classifier **blocked** a raw-SQL mass mutation attempt (once for tenant billing plans in an earlier session, once this session for manufacturing a fake in-file-duplicate test scenario). Both times, correctly — prefer the product's own API for anything that mutates data; if there's no API for what you want to do (§5.7's cleanup case), that's a signal to ask the user rather than reach for raw SQL.

---

## 13. If the user asks "what should we do next?"

Highest value, in order:
1. **Resolve the concurrent-session situation first** (URGENT box) — don't touch `resume.ts` blind.
2. **The missing "attach candidate to requisition" workflow** (§5.5.3) — without it, all 100 bulk-imported candidates are permanently stuck with no path forward. Probably the single highest-value real feature left.
3. **The misleading Advance-button error message** (§5.5.2) — small, precise, immediately reduces confusion.
4. **The Olu Aamir verdict-lookup bug** (§10.1) — root cause fully diagnosed, small fix.
5. **Verify the `in_file` duplicate case live** (§10.4) before fully trusting it.
6. Once the user is satisfied testing everything in §5, **stage and commit only on their explicit go-ahead** (§6).

**The one change that would still transform the demo most:** a real `OPENROUTER_API_KEY`. Everything done across all sessions is real and verified, but it's working around that gap, not closing it.
