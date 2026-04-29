# ATS Admin Guide

## Getting Started

After first login (admin@acme.com), you will see the hiring dashboard with:
- KPI cards showing pipeline metrics
- System health status
- AI review queue (pending HITL checkpoints)
- Pipeline funnel

## Key Workflows

### Creating a Job Requisition
1. Navigate to Requisitions > New Requisition
2. Fill in title, department, location, salary range
3. Optionally: click "AI Draft" to generate an inclusive job description
4. Save -- requisition is in DRAFT status
5. Submit for approval > PENDING_APPROVAL > APPROVED > publish

### Reviewing AI Screening Decisions
1. Check the Review Queue (sidebar badge shows pending count)
2. Click a checkpoint to see the AI's scoring dimensions and rationale
3. APPROVE to advance the candidate, or REJECT to override the AI
4. Rejected candidates are not auto-notified until you confirm

### Managing the Team
1. Settings > Team Management
2. Invite new users with email and role assignment
3. Roles: Admin, Recruiter, Hiring Manager, Interviewer, Compliance Officer
4. Deactivate users who leave the organization

### Configuring AI Agents
1. Settings > Feature Flags
2. Toggle individual agents on/off per tenant
3. Billing > Cost & Usage to monitor per-agent costs
4. Set daily cost ceiling (default $50/day)

### Running Compliance Reports
1. Analytics > Diversity & Compliance
2. View EEOC 4/5ths rule analysis by demographic group
3. Export EEO report as CSV
4. AI Compliance Auditor generates narrative reports (with HITL review)

## 12 AI Agents

| Agent | What It Does | Trigger |
|-------|-------------|---------|
| Resume Parser | Extracts structured data from PDFs | Auto on upload (if Redis configured) |
| Screening Agent | Scores candidates against requisition | Auto after parse (HITL on rejections) |
| JD Author | Generates inclusive job descriptions | Manual: "AI Draft" button |
| Scheduling Agent | Proposes interview time slots | Manual: "Auto-Schedule" button |
| Candidate Chat | Answers candidate questions | Candidate portal chat widget |
| Sourcing Agent | Finds matching candidates | Manual: "AI Source" button |
| Interview Kit | Generates interview questions | Manual: "Generate Kit" button |
| Interview Intelligence | Analyzes interview recordings | Manual: post-interview upload |
| Offer Agent | Drafts compensation packages | Manual: "AI Offer" button |
| Copilot | Recruiter Q&A over pipeline data | Manual: copilot panel |
| Analytics | Generates pipeline insights | Manual: "AI Insights" button |
| Bias Auditor | Computes adverse impact from real data | Manual + weekly cron |
