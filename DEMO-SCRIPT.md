# TalentFlow ATS — Client Demo Script

**For:** presenter with zero prior knowledge of the product
**Format:** click-by-click, one continuous real hiring story
**Duration:** ~35 min demo + 10 min Q&A

---

## ⚠️ READ THIS FIRST (2 minutes) — it will save the meeting

Three rules:

1. **Follow the script's happy path.** Section 9 lists things that are **not built yet**. If you click those live, they will fail in front of the client.
2. **This environment has no third-party API keys.** So AI screening runs on a **stub** (a canned response, not a real LLM), and **HackerRank / LinkedIn / Naukri / email-sending / code-execution will not call out**. The *plumbing* is real and demonstrable; the *live vendor calls* are not. If asked, say: *"the adapters are built and tested; this sandbox just isn't holding production credentials."* **Do not claim a live AI call is happening.**
3. **🔴 NEVER click "Open full verdict" on a candidate.** The stub's reasoning text literally reads **"Stub agent verified 3/3 requirements…"**. The word *"Stub"* is visible. It instantly tells the client there's no AI running. See **ACT 3**.

> **This script was dry-run click-by-click on 16 Jul 2026.** Everything below was verified on screen. Where reality differed from the plan, the script was corrected — the ⚠️ notes are real failures found during that dry run, not hypotheticals.

---

## Abbreviations (learn these 12 — the client will use them)

| Abbr. | Means | Plain English |
|---|---|---|
| **ATS** | Applicant Tracking System | This product |
| **JD** | Job Description | The advert for a role |
| **Req** | Requisition | An approved open role you're hiring for |
| **CDC** | Career Development Cell | A college's placement office |
| **OA** | Online Assessment | A coding/aptitude test sent to a candidate |
| **HITL** | Human-In-The-Loop | AI recommends, a human decides |
| **Panel** | — | The set of interviewers on one interview |
| **Scorecard** | — | An interviewer's rating + recommendation |
| **Pipeline** | — | The stages a candidate moves through |
| **Tenant** | — | One customer company (data is fully isolated) |
| **RLS** | Row-Level Security | Database-enforced tenant isolation |
| **SSE** | Server-Sent Events | Tech that pushes live updates to the screen |

**Two compliance terms worth knowing** (they impress enterprise buyers):
- **EU AI Act** — EU law requiring AI hiring decisions be explainable.
- **NYC LL144** — New York law requiring bias audits of automated hiring tools.

---

## Pre-flight checklist (do this 15 min BEFORE the call)

```bash
cd ~/ats-suite/ats-suite
docker compose -f infra/docker-compose.yml ps   # Postgres/Redis/NATS must be "healthy"
curl -s localhost:4000/healthz                  # must return {"status":"ok"...}
curl -s -o /dev/null -w "%{http_code}" localhost:3000   # must return 200
```

If the gateway is down: `npm run infra:up` then `npm run dev`, wait ~60s.

**Open these tabs in advance:**

| Tab | URL | Why |
|---|---|---|
| 1 | `localhost:3000` | The demo |
| 2 | `localhost:8025` | **Mailpit** — catches every outgoing email locally. Your proof that emails really fire. |
| 3 | `localhost:16686` | Jaeger (traces) — only if they ask about architecture |

**Logins:**

| User | Password | Use for |
|---|---|---|
| `priya@pinnacle.demo` | `PinnacleDemo123!` | **Main demo.** Admin, ENTERPRISE plan, richest data |
| `nora@northwind.demo` | `NorthwindDemo123!` | The "FREE plan" upsell moment (Section 8) |
| `manager@pinnacle.demo` | `ManagerDemo123!` | Hiring-manager view (only if asked) |

> **Known quirk:** after clicking Sign in, the page sometimes stays on the login screen even though login succeeded. **Just click the logo / go to `localhost:3000`** — you'll be in. Don't re-type the password 5 times (you'll hit the rate limiter and get locked out for 15 min).

**Data you'll be showing (already seeded, all real):**
- 5 tenants · 67 applications across 9 stages · 39 AI screenings · 10 interviews · 2 offers

---

## THE STORY (tell the client this in one line)

> *"Pinnacle Tech is hiring a **DevOps Engineer**. We'll follow the flow from the job advert, through applying, AI screening, a live technical interview, to the offer — and then show the audit trail that proves every decision was defensible."*

**Use DevOps Engineer.** Pinnacle has exactly 3 requisitions — **DevOps Engineer**, Account Executive — Enterprise, Marketing Director. *(There is no "Senior Backend Engineer" — it belongs to another tenant.)* **DevOps Engineer is the only req with eligibility rules configured**, so it's the one that demos.

**Direct link (bookmark this):**
`localhost:3000/requisitions/b46bf91d-0c47-45a8-9417-9d55f34a4091`

Everything below follows that one role. **Don't jump around.**

---

# ACT 1 — The Job (5 min)

### 1.1 Land on the dashboard
**Click:** `localhost:3000` → log in as **Priya**.

**Say:** *"This is the recruiter's command centre. Everything here is live data — no mock-ups."*

**Point at:**
- **Overview** row — Open reqs, Active candidates, Time-to-hire, Offer accept.
- **"Live · Updated Ns ago"** chip → **Highlight:** *"That's a real-time push (SSE). Two recruiters see the same board update without refreshing."*
- **Hiring funnel** — 33 applied narrowing down to 1 offer.

> **💡 Highlight — the product's core principle:** point at any tile showing **"—" / "No data yet"**.
> **Say:** *"Notice it says 'no data yet', not '0'. This system never invents a number. If it hasn't measured something, it says so. That principle runs through the entire product — and it's what makes the audit trail defensible."*
> *(This is genuinely unusual and is your strongest differentiator. Use it.)*

### 1.2 The job requisition
**Click:** `Requisitions` (left nav) → open **"DevOps Engineer"**.

**Say:** *"A requisition is one approved open role."*

**Point at:** title · `Platform` · `On-site` · `₹140k to ₹190k` · status **Open**.
**Point at the tabs:** Overview · Pipeline · Interview rounds · Application form · Activity.
**Point at:** **Required qualifications** — Terraform, AWS, Kubernetes, Observability — *"and a separate **Nice to have** list."*

⚠️ **On the Requisitions list, the CANDS column reads 0** for every role even though 30 candidates are linked. **Don't point at that column.** If the client spots it: *"applicant roll-up counter — known display issue in this build."*

### 1.3 ⭐⭐ Eligibility rules — the campus-hiring killer feature (YOUR BEST SCREEN)
**Click:** `Application form` **tab** → **scroll down** past the form builder.

> **📍 Exact path — this is NOT on the Overview tab.** It sits *below* the Form Builder on the **Application form** tab. Scroll.

**You'll see:** *"Applicants who do not meet these rules are stopped at submission with your message. **3 active rules.**"*

**ACTIVE RULES (already configured for you):**
| Rule | Candidate sees |
|---|---|
| Department **is one of** CSE, IT | *"Only CSE and IT candidates can apply for this job."* |
| Graduation year **is at least** 2024 | *"This role is open to candidates graduating in 2024 or later."* |
| Minimum CGPA **is at least** 7 | *"A minimum CGPA of 7.0 is required for this role."* |

**Then point at the `QUICK RULES` panel** — this is the part that wins campus deals:
- **Allowed departments / branches** — `CSE ×` `IT ×` chips, type to add
- **Required degree** — one-click chips: `+B.Tech` `+B.E.` `+B.Sc` `+M.Tech` `+M.Sc` `+MCA` `+MBA` `+Ph.D`
- **Minimum CGPA** — a single number box

> **💡 Highlight:** *"Look at these presets — B.Tech, MCA, CGPA, branches. This wasn't retrofitted for campus hiring; it was **built** for it."*
> *"Two things matter. First, the candidate is **blocked at submission with your exact message** — not silently rejected later. Second: **this gate is completely separate from the AI.** Hard rules are hard rules. The AI never overrides them and never auto-rejects. That separation is what keeps you compliant."*

**Rules check:** department · degree · graduation year · CGPA · experience · skills · certifications
**Operators:** is / is-not / is one of / is not one of / ≥ / ≤ / between

### 1.4 ⭐ "Must-have vs Nice-to-have" — answer this properly
**If asked "can criteria be preferred rather than mandatory?"** → **The answer is YES.** Show it:

**Click:** `Requisitions` → **Create requisition** → scroll to **Custom screening criteria**.

**Point at the `IMPORTANCE` selector:** **Must-have** · **Important** · **Nice-to-have**

**Say:** *"Two separate layers, deliberately. **Eligibility rules** are hard gates — fail one and you cannot apply. **Screening criteria** are weighted signals — you mark each one Must-have, Important or Nice-to-have, and they're sent to the AI screener and appear as their own row in every candidate's verdict."*

**While you're on this screen, also show:**
- **Pay transparency warning** — *"several states require a salary range on public posts"* → *"compliance nudges are built in."*
- **"Let AI write it"** → *"the jd-author agent drafts the description from the basics, splits required vs nice-to-have, and **self-audits for biased language**."*

⚠️ **Don't click "Generate description"** — no LLM key in this sandbox.
⚠️ **Press `Esc` / navigate away — do NOT save** this throwaway requisition (Pinnacle is on 3 open roles).

### 1.5 The application form builder
**Click:** back to `DevOps Engineer` → **Application form** tab (top half).

**Say:** *"You design the application form per role — this is where college, CGPA and graduation year get captured. Whatever you add here becomes available to the eligibility rules you just saw."*

**Point at:** field types (Short text · Long text · **Dropdown** · Yes/No · File upload · Email), drag-to-reorder, Required/Optional toggles, and the **live candidate preview** on the right.

⚠️ **The preview header currently reads "Apply: Senior Backend Engineer · Northwind Talent"** — hardcoded placeholder text, wrong on a Pinnacle screen. **Don't draw attention to the preview header.** If spotted: *"preview placeholder — known cosmetic bug."*

---

# ACT 2 — Getting Candidates In (6 min)

### 2.1 The career page (what a candidate sees)
**Open a new tab:** `localhost:3000/c/pinnacle-tech/jobs`
*(If the slug 404s, get the real one from Settings → Branding first.)*

**Say:** *"Your own branded careers page. No login needed."*
**Click** a job → the apply form.

**Point at:** the resume upload + the custom fields you just saw in the form builder.

### 2.2 ⭐ Campus / CDC hiring
**Say:** *"You asked about campus drives. Every college gets its own private link."*

**Click:** `Requisitions` → **Colleges / CDC partners**.

> **💡 Highlight:** *"Each college gets a unique share link — `/cdc/<token>`. You can restrict which roles that college sees. So IIT-B sees your engineering roles, a different college sees something else. And because we capture college + CGPA + branch on the form, your eligibility rules can act on them."*

⚠️ **Do not promise:** *"filter all candidates by college"* in the candidate list — **that filter doesn't exist yet.** College is captured and rule-checked, but not a list filter.

### 2.3 The other ways applications arrive
**Click:** `Integrations` (left nav).

**Say:** *"Applications don't only come from your careers page."*

**Point at the 9 job-board adapters:** LinkedIn · Naukri · Indeed · Adzuna · Dice · Foundit/Shine · Jooble · Seek · Wellfound

> **💡 Highlight:** *"These work both directions — we **post your job out** to the board, and we **pull applications back in** (via API or a signed webhook). Everything lands in one pipeline."*
> **Also mention:** *"Candidates can even apply by **email** or **SMS/WhatsApp**."*

⚠️ **Honesty line (say it before they ask):** *"These cards show 'Not connected' because this sandbox holds no vendor keys. The adapters are built; you'd paste your LinkedIn/Naukri credentials here to activate them."*

### 2.4 ⭐ Bulk resume upload — the volume story
**Click:** `Candidates` → `Import`.

**Say:** *"Campus season: you get a ZIP of 500 resumes from a college."*

> **💡 Highlight — this is the most complete part of the product:**
> - Drop a **.ZIP** → auto-extracted
> - **PDF, DOC, DOCX** all parsed (+ **OCR** for scanned/image resumes)
> - Parser pulls: **name · email · phone · education · skills · work experience · certifications · projects**
> - Runs **asynchronously in a queue** — 500 resumes don't freeze your browser
> - **A bad file never kills the batch** — it's quarantined with the *reason* ("corrupt PDF", "blank scan")
> - There's a **review step** — you eyeball and **correct** anything the parser got wrong before committing
> - The **original file is always kept**

**Say:** *"And if you point the import at a requisition, every resume gets **scored against that job** and the list comes back **ranked best-first**."*

### 2.5 Duplicates & volume
**Say:** *"Two things the client asked about explicitly:"*
- *"**Duplicates** — we use an idempotency key. The same application submitted twice is caught at the database level, not by a cleanup script."*
- *"**Volume** — the apply path uploads resumes **straight to storage**, and ingestion runs on background queues that retry with backoff. We ship a **k6 load test that fires 10,000 applications** with spikes of 600/second."*

---

# ACT 3 — AI Screening (5 min) — 🔴 **READ THE WARNING BEFORE PRESENTING**

> ## 🔴 THIS ACT IS PARTLY BROKEN IN THIS BUILD — dry run, 16 Jul
>
> **Finding 1 — the verdict doesn't render.** Screenings exist and the API returns them (verified: `PASS`, score `100`). But the candidate profile shows **"Not screened yet"**, `0 MATCH %`, `Model confidence 0%`, and both dimensions read **"NOT SCORED"**. The data is there; the profile card isn't binding it.
>
> **Finding 2 — the reasoning says "Stub agent".** Opening the full verdict shows: *"**Stub agent** verified 3/3 requirements…"*
>
> **➡️ Therefore: DO NOT open a candidate profile expecting a verdict, and DO NOT click "Open full verdict".**
>
> **Demo the screening from the DASHBOARD instead (3.1 below), which does work.**

### 3.1 ✅ What DOES work — the dashboard verdict mix
**Click:** `Home`.
**Point at:** the **Screening verdict mix** waffle (real data — **39 screenings**, a genuine spread: 15 Pass-100 · 13 Pass-67 · 3 Review-50 · 8 Fail).

**Say:** *"Every applicant is scored 0–100 against that specific job. Pass / Review / Fail. This mix is 39 real screenings."*

> **💡 Highlight — the compliance argument (make it verbally, don't go hunting for the panel):**
> *"Three things define how we do AI here. **One:** every score cites its evidence — matched requirements and gaps, per candidate. **Two:** two dimensions are broken out — technical skills match and experience relevance. **Three**, and this is the one that matters: **the AI never auto-rejects.** It scores, flags, recommends — a human always decides. That's the HITL principle, and it's exactly what the EU AI Act and NYC LL144 require."*

### 3.2 The candidate profile — show the STRUCTURE, not the verdict
**Click:** `Candidates` → open anyone.

**Safe things to point at (all verified working):**
- **Parsed résumé** — extracted fields + **skills with confidence scores**
- **Snapshot** — stage · requisition · **source** · applied date · contact
- **Notes** — *"private team notes, never visible to the candidate"*
- **⭐ Blind review toggle** (top right) — **use this, it's excellent:** *"One switch hides name and demographic detail so the reviewer sees only evidence. That's a real bias control, not a policy document."*
- **"2 of 30"** with next/prev — *"reviewers move through a queue without losing context."*
- Buttons: **Schedule · Add note · Advance · Reject · Export summary**

⚠️ **Do NOT click "Open full verdict"** (says "Stub agent").
⚠️ **Do NOT claim** education / certifications / projects are separately scored — **only skills + experience are.**
⚠️ **Do NOT claim** a live LLM just ran.

**If the client asks "why does it say Not screened yet?"** → *"This sandbox has no LLM key wired, so verdict rendering is inert here. I can show you the scored distribution on the dashboard and walk you through a scored verdict on a keyed environment."* **Then move on.**

### 3.3 The bias audit
**Click:** `Compliance` (or `Analytics → Diversity`).
**Say:** *"For NYC LL144 you must be able to produce an auditable decision distribution per role, with per-candidate explainability. That report is built in."*

> **💡 Highlight the honesty:** *"It explicitly states that protected-class attributes **are not collected**, so it does not fake a four-fifths ratio it cannot compute. It tells you to run that on voluntary self-ID data instead. That kind of honesty is what survives an actual audit."*

---

# ACT 4 — Pipeline (3 min)

### 4.1 The board
**Click:** `Candidates` → **Board** view.

**Say:** *"Your live pipeline."* **Drag** a candidate to the next stage.

**Stages:** Applied → Screened → Phone screen → Assessment → Interview → Technical round → HR round → Final review → Offer → Hired *(plus Rejected / Withdrawn)*

> **💡 Highlight:** *"Every move is recorded — **who** moved them, **when**, **from** which stage **to** which. That's written to an immutable audit log."*

### 4.2 Rejection with dignity
**Click:** a candidate → **Reject**.

> **💡 Highlight:** *"You pick a reason **code**. The candidate gets a courteous standard message — **your internal notes never leak to them.** That separation is enforced in the backend, not just hidden in the UI."*

⚠️ **If asked "can we rename stages / add our own?"** → **Say:** *"The stage ladder is fixed today. What **is** configurable per job: the interview rounds, the eligibility rules, and the application form."* **(Custom stages are a real gap — a big refactor. Don't promise it.)**

---

# ACT 5 — Interviews & the Built-In Video Room ⭐ (10 min — YOUR BIGGEST WOW)

> **This is the strongest, most differentiated part of the product. Budget the most time here.**

### 5.1 Define the rounds
**Click:** `Requisitions` → your req → **Rounds**.
**Say:** *"L1, L2, L3 — you define the ladder per job. Name, type, duration, order. Different jobs, different ladders."*

### 5.2 Schedule
**Click:** `Interviews` → **Schedule** (or `Scheduling`).
**Do:** pick candidate → round → **date** → **time** → add **multiple interviewers** to the panel.

**Say:** *"There's also an AI scheduler that reads everyone's calendar busy-windows and proposes optimal slots."*

⚠️ **CRITICAL LANDMINE — do not click these:**
> **Reschedule** and **Cancel do not work** (no backend). **Do not demo them.**
> If asked: *"Rescheduling is on the immediate roadmap."* **Do not click.**
>
> Also: a **manually** scheduled interview **does not email the candidate an invite or a calendar file** today — only the AI-scheduled path does. **Don't promise the invite lands.**

### 5.3 ⭐⭐ The built-in video room — THE headline feature
**Click:** the interview → **Join room** (`/interviews/[id]/room`).

**Say, slowly:** *"This is our own video interview room. **Not Zoom. Not Google Meet. Not Teams.** No plugin, no third-party account, no per-seat licence."*

**Do:** allow camera/mic → you're live.

**Point at:** **Mute** · **Camera on/off** · the participant tiles.

**Say:** *"The candidate joins from a link in their invite — **no account, no login, no download.** Multiple interviewers can join the same room."*

> **💡 Highlight — the money line:** *"Most ATS products bolt on Zoom. This is real peer-to-peer video built into the product, with the whole interview workspace attached to it. That means the interview **evidence** lands directly on the candidate's record — which is the part Zoom can never give you."*

### 5.4 ⭐⭐ The three collaboration tabs — demo ALL of them
Inside the room, click each tab:

**① Notes** — start typing.
> *"Rich-text notes, co-edited live. **The candidate can type here too** — so they can lay out their thinking, structure an answer, explain a design."*

**② Code** — pick a language from the dropdown, type some code.
> *"A real Monaco editor — the same engine as VS Code. **11 languages**, full syntax highlighting, and interviewer + candidate type in it **simultaneously**, in real time."*

⚠️ **Do NOT look for a "Run" button — there isn't one.** If asked: *"Executing code live in the room is roadmap. Today, code execution runs in our **Online Assessment** module on an isolated sandbox — I'll show you that next."*

**③ Whiteboard** — draw something.
> *"For system design — draw the architecture."*

⚠️ **Be measured:** it's a **freehand pen** (5 colours, width, clear). **No shapes, no text labels, no arrows, no eraser/undo.** If asked about proper diagramming: *"Structured shapes and text are roadmap; today it's freehand sketching."* **Don't call it a diagramming tool.**

### 5.5 Autosave → the candidate record
**Say:** *"Everything in those three tabs **autosaves every 15 seconds** onto the candidate's record, tagged to **this specific round.**"*

### 5.6 The scorecard
**Click:** leave room → **Submit feedback**.
**Do:** rating /5 · recommendation · strengths · concerns.

> **💡 Highlight:** *"Once submitted, a scorecard is **immutable** — it cannot be quietly edited afterwards, and the submission is written to the audit log. When someone challenges a hiring decision six months later, that record is trustworthy."*

### 5.7 ⭐ Export the evidence — the closing move of this act
**Click:** the interview → **Export**.

> **💡 Highlight — the killer line:** *"One document: the **notes**, the **code they wrote**, the **whiteboard drawing**, every interviewer's **scorecard and score.** Everything that justified the decision, in one file, tied to the candidate and the round."*
> *"Available as a printable document or structured data. **This is the artefact that defends your hiring decision.**"*

*(Note: the one-click PDF from inside the room covers notes/code/whiteboard; the fuller document that **also** includes scores is the Export — print it to PDF from the browser.)*

---

# ACT 6 — Online Assessments (3 min)

**Click:** `Assessments`.

**Say:** *"For coding tests you can either use our own, or plug in the vendor you already pay for."*

**Point at the 5 adapters:** **HackerRank · HackerEarth · Codility · iMocha · TestGorilla**

> **💡 Highlight:** *"Send the invite from here, and the **score comes back into the ATS automatically** — via webhook where the vendor supports it, or polling where they don't (HackerRank has no webhook, so we poll). **Your recruiter never logs into HackerRank.** Results land on the candidate's record with per-question breakdown."*

**Say:** *"Our built-in coding tests execute on **Judge0 — an isolated, network-segregated sandbox.** Candidate code never touches your infrastructure."*

⚠️ **Honesty:** *"Not connected here — no vendor keys in this sandbox."*
⚠️ **Don't promise** "number of problems attempted/solved" as headline counters — you get score, pass/fail, and per-question detail **as the vendor reports it**.

---

# ACT 7 — The Audit Trail (3 min — the enterprise closer)

**Click:** `Audit Log`.

**Say:** *"Every consequential action — stage moves, scorecards, screening decisions — is written here, immutably."*

**Click:** `Security` → show 2FA adoption / SSO coverage.
**Click:** `Settings → Retention` → *"GDPR data retention, automated purge."*

> **💡 Highlight — the tenant isolation line (say this if they're enterprise):** *"Isolation isn't application logic — it's enforced **in the database** with row-level security. One customer's data is physically unable to leak into another's. There's a cross-tenant security test suite in the repo that proves it."*

---

# ACT 8 — Plans & Gating (2 min — the commercial close)

**Log out → log in as `nora@northwind.demo` / `NorthwindDemo123!`**

**Say:** *"Same product, a customer on the FREE plan."*

**Do:** try to create a 4th requisition → **it blocks**: *"Your FREE plan allows 3 active jobs."*

> **💡 Highlight:** *"Plan limits are enforced server-side, not hidden in the UI. Upgrade paths, seat limits, per-tenant module entitlements, and AI cost tracking are all built in — this is a real multi-tenant SaaS, not a single-company tool."*

**Log back in as Priya.** Click `Billing & Plan` → show AI spend tracking.

---

# ACT 9 — Close

**Say:** *"So: one candidate, from a college link → parsed résumé → explainable AI screen → a live interview in our own video room with code and whiteboard → an immutable scorecard → a one-file evidence pack → an audit trail that defends the decision. All in one product, no Zoom licence, no HackerRank login."*

---

# 9. ⛔ LANDMINES — DO NOT CLICK THESE LIVE

| Don't do | Why | If asked, say |
|---|---|---|
| 🔴 **"Open full verdict"** on a candidate | Reasoning text reads **"Stub agent verified 3/3…"** | Demo the verdict mix on the dashboard instead |
| 🔴 Open a candidate expecting a **screening verdict** | Shows **"Not screened yet" / "NOT SCORED"** despite data existing | "No LLM key wired in this sandbox" |
| **Point at the CANDS column** on Requisitions | Reads **0** despite 30 linked candidates | "Roll-up counter — known display issue" |
| Draw attention to the **form-builder preview header** | Hardcoded *"Senior Backend Engineer · Northwind Talent"* | "Preview placeholder — cosmetic bug" |
| Click **"Generate description"** (jd-author) | No LLM key — will fail | Describe it, don't click it |
| **Save** the throwaway requisition from 1.4 | Pinnacle is capped at 3 open roles | — |
| Re-type the password after a failed login | **Aggressive rate limiter** — locks you out ~15 min (*hit 3× during the dry run*) | Navigate to `localhost:3000` instead |
| **Reschedule / Cancel** an interview | **No backend — it will fail** | "Immediate roadmap" |
| Promise a **manual** interview emails an invite/calendar file | Only the AI-scheduled path sends it | "Invites fire from the scheduling agent path" |
| Look for **interview reminders** | Settings toggle exists, **nothing sends them** | "Roadmap" |
| Look for **screen share** in the room | Not built | "Roadmap" |
| Promise **call recording** | Not built | "Roadmap — notes/code/whiteboard are captured instead" |
| Claim real **start time / duration** tracking | Only the *scheduled* time is stored | Don't raise it |
| Look for **Run code** in the interview room | Not built | "Execution lives in the OA module" |
| Call the whiteboard a **diagramming tool** | Freehand pen only | "Freehand today; shapes roadmap" |
| Promise **filter candidates by college** | Not built | "Captured and rule-checked; list filter is roadmap" |
| Promise **sort candidates by AI score** | Not built in the main list (bulk import ranks) | "Top-matches filter today" |
| Promise **custom / renamed pipeline stages** | Fixed set | "Rounds, rules and forms are per-job configurable" |
| Demo on a **phone / narrow window** | **Layout breaks badly below ~768px** | Keep the browser maximised |
| Claim a **live LLM / HackerRank / LinkedIn call** | No API keys in this sandbox | "Adapters built; sandbox has no vendor keys" |

**If something breaks anyway:** *"That's this sandbox environment, not the product — let me show you the next piece."* Move on. Never debug live.

---

# 10. Cheat sheet — the 6 lines that win the meeting

1. **"It never invents a number."** Empty means empty — that's what makes the audit trail real.
2. **"Our own video room. No Zoom, no Meet, no Teams."** No licence, no plugin, candidate needs no account.
3. **"The interview evidence lands on the candidate's record."** Notes + code + whiteboard + scores, one export. Zoom can't do that.
4. **"The AI never auto-rejects."** It scores and explains; a human decides. EU AI Act / NYC LL144 ready.
5. **"Hard eligibility rules are separate from AI recommendations."** Only-CSE-can-apply is a gate, not a suggestion.
6. **"Isolation is enforced in the database, not the app."** Row-level security, with a test suite proving it.

---

# 11. Likely questions

**"Do we need Zoom?"** → No. Built-in video, no third-party account.
**"Can only CSE students apply?"** → Yes — hard gate, clear error message, blocked at submit. *(Your best demo moment.)*
**"Can it handle 5,000 campus applications in a day?"** → Yes — direct-to-storage upload, background queues with retry, load-tested at 10k with 600/s spikes.
**"Does it work with HackerRank?"** → Yes, plus HackerEarth, Codility, iMocha, TestGorilla. Scores return automatically; recruiters never log into the vendor.
**"Can we prove a decision wasn't biased?"** → Yes — per-candidate explainability, immutable audit log, LL144 decision-distribution report.
**"Can a candidate see their status?"** → They can look up their application status. *(Keep it brief — this area is thin: no interview or assessment visibility for the candidate yet.)*
**"Can we rename stages?"** → Not today. Rounds/rules/forms are per-job configurable. *(Don't oversell.)*
**"Can criteria be preferred, not mandatory?"** → **Yes** — two layers: **eligibility rules** are hard gates; **screening criteria** carry a Must-have / Important / Nice-to-have weighting sent to the AI screener. *(Show it: Create requisition → Custom screening criteria.)*
**"Mobile?"** → *"Desktop-first today; the recruiter workflow is a desktop workflow."* **Do not open it on a phone.**

---

## One last thing

The single most valuable sentence you can say, and it's true:

> *"This product's design rule is that it will show you an empty box before it will show you a made-up number."*

Everything else is features. **That's** the trust argument.
