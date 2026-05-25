# ATS demo — how to see it in your browser

The app is running right now. Open: **http://localhost:3000**

## What's running

| Service | Where | Status |
|---|---|---|
| Frontend (Next.js) | http://localhost:3000 | up |
| Backend (Express) | http://localhost:4000 | up |
| Postgres | localhost:5432 (your local install) | up, `ats_db` populated |
| Redis | not needed for the demo (inline fallback handles parsing) | — |

Health check anytime: http://localhost:4000/api/health

## Login (recruiter side)

1. Go to **http://localhost:3000** — you'll be redirected to `/login`.
2. Credentials:
   - Email: `admin@acme.com`
   - Password: `Password123!`
3. Click **Sign In** → lands on the dashboard.

Other seeded accounts (same password `Password123!`):
- `recruiter@acme.com` — RECRUITER role
- `hiring.manager@acme.com` — HIRING_MANAGER role
- `compliance@acme.com` — COMPLIANCE_OFFICER

## The end-to-end flow to demo

### Step 1 — Recruiter creates and publishes a requisition

1. From the dashboard, click **Requisitions** in the left sidebar.
2. Click **New Requisition** (top right). Fill in: title, department, location, headcount, description. Submit.
3. Click into the new requisition row.
4. Click **Publish to Job Board** — you'll see a green toast: *"Requisition published to job board"*. The button changes to **Unpublish**.

### Step 2 — Anonymous candidate applies

1. Open a **new tab** (or use an Incognito window so you stay logged out) → http://localhost:3000/jobs
   - This is the public career portal — no login required.
2. You'll see the job you just published. Click it.
3. Fill in: first name, last name, email (use something like `demo@example.com`), phone.
4. Attach any small `.txt`, `.pdf`, or `.docx` file as the resume.
5. Click **Submit Application** → green confirmation: *"Application Submitted!"*

### Step 3 — Recruiter sees the candidate and advances them

1. Switch back to the recruiter tab → click **Candidate Experience** in the sidebar.
2. The new candidate appears at the top of the list with stage `APPLIED`.
3. Click into their row.
4. Click **Advance Stage** (top right) → pick **Move to SCREENED**.
5. Toast confirms; the stage badge updates.
6. Repeat to walk further: SCREENED → PHONE_SCREEN → ASSESSMENT → INTERVIEW → FINAL_REVIEW → OFFER → HIRED.

### Step 4 — Back on the requisition, see the candidate count update

1. Click **Requisitions** in the sidebar → click the same requisition.
2. The **Candidates (N)** card now lists the applicant with their current stage.

### Step 5 — Public job tracking (candidate side)

1. In the anonymous tab → http://localhost:3000/status
2. Enter the candidate email you applied with → see the application status update in real time.

## Other pages worth showing the PM

| Page | What's interesting |
|---|---|
| `/` | Dashboard with funnel, charts, AI tasks pending |
| `/agents` | Agent runs log (will show resume parser, screening, etc. when API keys present) |
| `/hitl` | Human-in-the-loop queue — checkpoints needing human approval |
| `/analytics` | Hiring funnel, time-to-hire, cost reports |
| `/compliance` | EEOC adverse impact, GDPR data subject requests |
| `/bias` | Bias audits across screenings |
| `/scheduling` | Interview scheduler |
| `/offers` | Offer letters + approval chains |
| `/jobs` (anon tab) | Public job board |
| `/status` (anon tab) | Candidate self-service status check |

## If anything dies

```bash
# Backend
cd D:/CDC/ATS/backend && npx tsx src/index.ts

# Frontend (separate terminal)
cd D:/CDC/ATS/frontend && npm run dev
```

Health checks:
- Backend: http://localhost:4000/api/health
- Frontend: http://localhost:3000 (redirects to /login if not signed in)

## What is REAL vs what is STUBBED (honest)

| Real | Stubbed/skipped without API keys |
|---|---|
| Auth, RBAC, JWT, tenants | Real Anthropic/OpenAI LLM calls |
| Requisitions + JobPostings (DB) | Embedding generation (returns null) |
| Public job board + apply | Email sending (logs to console) |
| Resume upload + text extraction | E-sign provider (DocuSign mocked) |
| Application stages, audit trail | Calendar provider sync |
| Offers + approval chain | Background-check vendor |
| Interview scheduling | SCIM provisioning |
| Pipeline analytics | Sentry / Langfuse traces |
| Compliance/GDPR DSR APIs | Production observability stack |

To enable the AI agents end-to-end, set in `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...   # for embeddings
```

…then restart the backend. Resume parsing and screening will then actually call the LLM and surface results in `/agents` and `/hitl`.

## What's NOT yet end-to-end verified through the UI

These work via the API smoke test (`bash scripts/e2e-flow.sh`) but I haven't driven them through the browser yet:

- Interview scheduling form
- Interview feedback submission
- Offer creation/send/accept through the UI form
- HITL approval through the UI

If any of those screens 500 or look wrong during your demo, ping me and I'll fix them the same way (find the bug, fix, push).
