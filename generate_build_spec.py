import json
from datetime import datetime

# Read master list
with open(r"D:\CDC\ATS\USPs\unique_usps_master_list.json", "r", encoding="utf-8") as f:
    master = json.load(f)

# Filter P0 and P1
p0_p1 = [u for u in master["usps"] if u["priority"] in ("P0-Critical", "P1-High")]

# ── Engine + Endpoint Mapping ──────────────────────────────────────────────
# Map each feature to a core engine, API endpoints, and UI route based on
# category + feature name pattern analysis.

ENGINE_DEFS = {
    "platform-core": {
        "name": "Platform Core Engine",
        "base_path": "/api/platform",
        "description": "Unified data model, requisitions, tenants, skills ontology",
        "endpoints": [
            {"method": "GET",    "path": "/api/platform/health",                  "desc": "System health check"},
            {"method": "GET",    "path": "/api/requisitions",                     "desc": "List all requisitions"},
            {"method": "POST",   "path": "/api/requisitions",                     "desc": "Create requisition"},
            {"method": "GET",    "path": "/api/requisitions/:id",                 "desc": "Get requisition details"},
            {"method": "PUT",    "path": "/api/requisitions/:id",                 "desc": "Update requisition"},
            {"method": "DELETE", "path": "/api/requisitions/:id",                 "desc": "Archive requisition"},
            {"method": "GET",    "path": "/api/requisitions/:id/snapshots",       "desc": "Get versioned snapshots"},
            {"method": "POST",   "path": "/api/requisitions/:id/orchestrate",     "desc": "Trigger end-to-end orchestration"},
            {"method": "GET",    "path": "/api/requisitions/:id/status",          "desc": "Get orchestration status"},
            {"method": "GET",    "path": "/api/requisitions/duplicates",          "desc": "Detect duplicate requisitions"},
            {"method": "POST",   "path": "/api/requisitions/:id/consolidate",     "desc": "Consolidate duplicate requisitions"},
            {"method": "GET",    "path": "/api/tenants",                          "desc": "List tenants"},
            {"method": "POST",   "path": "/api/tenants",                          "desc": "Create tenant"},
            {"method": "GET",    "path": "/api/tenants/:id",                      "desc": "Get tenant config"},
            {"method": "PUT",    "path": "/api/tenants/:id/isolation",            "desc": "Configure tenant isolation"},
            {"method": "GET",    "path": "/api/skills/ontology",                  "desc": "Get skills ontology"},
            {"method": "POST",   "path": "/api/skills/ontology",                  "desc": "Update skills ontology"},
            {"method": "GET",    "path": "/api/skills/ontology/search",           "desc": "Search skills"},
            {"method": "POST",   "path": "/api/requisitions/:id/intake",          "desc": "Automated intake and calibration"},
            {"method": "GET",    "path": "/api/platform/localization",            "desc": "Get localization config"},
            {"method": "POST",   "path": "/api/platform/localization/translate",  "desc": "Translate content"},
        ]
    },
    "security-framework": {
        "name": "Security & Privacy Framework",
        "base_path": "/api/security",
        "description": "Zero-trust security, data residency, access control, encryption, prompt injection defense",
        "endpoints": [
            {"method": "POST",   "path": "/api/security/tool-router/validate",         "desc": "Validate and route tool calls securely"},
            {"method": "GET",    "path": "/api/security/tool-router/audit",             "desc": "Get tool routing audit log"},
            {"method": "POST",   "path": "/api/security/consent",                       "desc": "Record candidate consent"},
            {"method": "GET",    "path": "/api/security/consent/:candidateId",           "desc": "Get consent status"},
            {"method": "PUT",    "path": "/api/security/consent/:candidateId",           "desc": "Update consent preferences"},
            {"method": "DELETE", "path": "/api/security/consent/:candidateId",           "desc": "Revoke consent"},
            {"method": "GET",    "path": "/api/security/consent/:candidateId/history",   "desc": "Consent version history"},
            {"method": "GET",    "path": "/api/security/data-residency/config",          "desc": "Get data residency rules"},
            {"method": "PUT",    "path": "/api/security/data-residency/config",          "desc": "Update residency rules"},
            {"method": "POST",   "path": "/api/security/data-residency/route",           "desc": "Route data to correct region"},
            {"method": "GET",    "path": "/api/security/data-residency/audit",           "desc": "Data residency audit log"},
            {"method": "GET",    "path": "/api/security/vault",                          "desc": "List vault entries (metadata only)"},
            {"method": "POST",   "path": "/api/security/vault",                          "desc": "Store sensitive data in vault"},
            {"method": "GET",    "path": "/api/security/vault/:id",                      "desc": "Retrieve from vault (JIT access)"},
            {"method": "DELETE", "path": "/api/security/vault/:id",                      "desc": "Purge vault entry"},
            {"method": "POST",   "path": "/api/security/retention/evaluate",             "desc": "Evaluate retention policies"},
            {"method": "POST",   "path": "/api/security/retention/purge",                "desc": "Execute retention purge"},
            {"method": "GET",    "path": "/api/security/retention/schedule",             "desc": "Get retention schedule"},
            {"method": "PUT",    "path": "/api/security/retention/schedule",             "desc": "Update retention schedule"},
            {"method": "GET",    "path": "/api/security/access/config",                  "desc": "Get access control config"},
            {"method": "POST",   "path": "/api/security/access/jit-review",              "desc": "Request JIT access review"},
            {"method": "GET",    "path": "/api/security/access/audit",                   "desc": "Access audit trail"},
            {"method": "PUT",    "path": "/api/security/access/roles",                   "desc": "Update RBAC roles"},
            {"method": "POST",   "path": "/api/security/prompt-firewall/scan",           "desc": "Scan for prompt injection"},
            {"method": "GET",    "path": "/api/security/prompt-firewall/log",            "desc": "Prompt firewall log"},
            {"method": "PUT",    "path": "/api/security/prompt-firewall/rules",          "desc": "Update firewall rules"},
            {"method": "GET",    "path": "/api/security/zero-trust/status",              "desc": "Zero-trust validation status"},
            {"method": "POST",   "path": "/api/security/zero-trust/verify",              "desc": "Verify zero-trust chain"},
            {"method": "POST",   "path": "/api/security/erasure/request",                "desc": "GDPR/CCPA erasure request"},
            {"method": "GET",    "path": "/api/security/erasure/:requestId",             "desc": "Erasure request status"},
            {"method": "POST",   "path": "/api/security/erasure/:requestId/execute",     "desc": "Execute erasure cascade"},
            {"method": "POST",   "path": "/api/security/pii/mask",                       "desc": "Real-time PII masking"},
            {"method": "POST",   "path": "/api/security/pii/redact",                     "desc": "Redact PII from content"},
            {"method": "GET",    "path": "/api/security/data-minimization/config",       "desc": "Data minimization config"},
            {"method": "POST",   "path": "/api/security/data-minimization/evaluate",     "desc": "Evaluate data minimization"},
            {"method": "POST",   "path": "/api/security/dsar",                           "desc": "Submit data subject request"},
            {"method": "GET",    "path": "/api/security/dsar/:id",                       "desc": "DSAR status"},
            {"method": "POST",   "path": "/api/security/dsar/:id/fulfill",               "desc": "Fulfill DSAR"},
            {"method": "POST",   "path": "/api/security/fraud/detect",                   "desc": "Detect identity fraud"},
            {"method": "POST",   "path": "/api/security/fraud/deepfake",                 "desc": "Deepfake detection"},
            {"method": "GET",    "path": "/api/security/fraud/log",                      "desc": "Fraud detection log"},
            {"method": "GET",    "path": "/api/security/credentials/:candidateId",       "desc": "Get candidate credential packet"},
            {"method": "POST",   "path": "/api/security/credentials/:candidateId",       "desc": "Upload credential packet"},
            {"method": "POST",   "path": "/api/security/data-correction",                "desc": "Submit data correction request"},
            {"method": "GET",    "path": "/api/security/data-portability/:candidateId",  "desc": "Export candidate data"},
        ]
    },
    "bias-fairness-engine": {
        "name": "Bias & Fairness Engine",
        "base_path": "/api/bias",
        "description": "Bias detection, fairness monitoring, adverse impact analysis, proxy detection, drift monitoring",
        "endpoints": [
            {"method": "POST",   "path": "/api/bias/proxy-detect",                      "desc": "Detect protected-trait proxies"},
            {"method": "GET",    "path": "/api/bias/proxy-detect/log",                   "desc": "Proxy detection log"},
            {"method": "POST",   "path": "/api/bias/adverse-impact/analyze",             "desc": "Run adverse impact analysis"},
            {"method": "GET",    "path": "/api/bias/adverse-impact/by-stage",            "desc": "Adverse impact by pipeline stage"},
            {"method": "GET",    "path": "/api/bias/adverse-impact/realtime",            "desc": "Real-time adverse impact monitor"},
            {"method": "GET",    "path": "/api/bias/adverse-impact/four-fifths",         "desc": "Four-fifths rule report"},
            {"method": "POST",   "path": "/api/bias/drift/check",                        "desc": "Check for bias drift"},
            {"method": "GET",    "path": "/api/bias/drift/history",                      "desc": "Drift history over time"},
            {"method": "GET",    "path": "/api/bias/drift/alerts",                       "desc": "Active drift alerts"},
            {"method": "GET",    "path": "/api/bias/fairness/metrics",                   "desc": "Current fairness metrics"},
            {"method": "GET",    "path": "/api/bias/fairness/by-role",                   "desc": "Fairness metrics per role"},
            {"method": "POST",   "path": "/api/bias/fairness/simulate",                  "desc": "Simulate fairness impact"},
            {"method": "GET",    "path": "/api/bias/fairness/benchmarks",                "desc": "Fairness benchmarks"},
            {"method": "PUT",    "path": "/api/bias/fairness/objectives",                "desc": "Set fairness objectives"},
            {"method": "GET",    "path": "/api/bias/monitor/dashboard",                  "desc": "Real-time bias dashboard"},
            {"method": "GET",    "path": "/api/bias/monitor/diversity",                  "desc": "Diversity pipeline analytics"},
            {"method": "GET",    "path": "/api/bias/monitor/intersectional",             "desc": "Intersectional bias analysis"},
            {"method": "POST",   "path": "/api/bias/audit/run",                          "desc": "Run bias audit"},
            {"method": "GET",    "path": "/api/bias/audit/results",                      "desc": "Get audit results"},
            {"method": "GET",    "path": "/api/bias/audit/schedule",                     "desc": "Audit schedule"},
            {"method": "POST",   "path": "/api/bias/audit/schedule",                     "desc": "Schedule bias audit"},
            {"method": "POST",   "path": "/api/bias/pre-deployment/test",                "desc": "Pre-deployment bias test"},
            {"method": "GET",    "path": "/api/bias/pre-deployment/gate",                "desc": "Pre-go-live fairness gate status"},
            {"method": "POST",   "path": "/api/bias/remediation/trigger",                "desc": "Trigger bias remediation"},
            {"method": "GET",    "path": "/api/bias/remediation/workflows",              "desc": "Active remediation workflows"},
            {"method": "POST",   "path": "/api/bias/knockout-filter/simulate",           "desc": "Simulate knockout filter impact"},
            {"method": "POST",   "path": "/api/bias/jd-screener/scan",                   "desc": "Scan job description for bias"},
            {"method": "GET",    "path": "/api/bias/interviewer-calibration/:userId",    "desc": "Interviewer calibration score"},
            {"method": "GET",    "path": "/api/bias/interviewer-calibration/drift",      "desc": "Interviewer drift monitoring"},
            {"method": "GET",    "path": "/api/bias/manager-calibration/:userId",        "desc": "Manager calibration & drift"},
            {"method": "POST",   "path": "/api/bias/demographic/segregate",              "desc": "Segregate demographic data"},
            {"method": "GET",    "path": "/api/bias/diversity/tracker",                  "desc": "Diversity & inclusion tracker"},
            {"method": "GET",    "path": "/api/bias/diversity/slate/:reqId",             "desc": "Diversity slate for requisition"},
            {"method": "POST",   "path": "/api/bias/diversity/generate-slate",           "desc": "Generate diverse candidate slate"},
        ]
    },
    "compliance-governance-engine": {
        "name": "Compliance & Governance Engine",
        "base_path": "/api/compliance",
        "description": "Audit trails, evidence packages, jurisdiction rules, policy enforcement, regulatory reporting",
        "endpoints": [
            {"method": "GET",    "path": "/api/compliance/audit-trail",                       "desc": "Query audit trail"},
            {"method": "GET",    "path": "/api/compliance/audit-trail/:decisionId",            "desc": "Decision audit detail"},
            {"method": "GET",    "path": "/api/compliance/audit-trail/replay/:decisionId",     "desc": "Replay decision as it happened"},
            {"method": "GET",    "path": "/api/compliance/audit-trail/timeline/:candidateId",  "desc": "Immutable decision timeline"},
            {"method": "GET",    "path": "/api/compliance/audit-trail/chain-of-custody/:id",   "desc": "Decision chain of custody"},
            {"method": "POST",   "path": "/api/compliance/evidence/generate",                  "desc": "Generate evidence pack"},
            {"method": "GET",    "path": "/api/compliance/evidence/:packId",                   "desc": "Get evidence package"},
            {"method": "POST",   "path": "/api/compliance/evidence/export",                    "desc": "Export for counsel/procurement"},
            {"method": "GET",    "path": "/api/compliance/evidence/vault",                     "desc": "Evidence vault contents"},
            {"method": "POST",   "path": "/api/compliance/legal-hold",                         "desc": "Apply litigation hold"},
            {"method": "GET",    "path": "/api/compliance/legal-hold/active",                  "desc": "Active legal holds"},
            {"method": "DELETE", "path": "/api/compliance/legal-hold/:id",                     "desc": "Release legal hold"},
            {"method": "GET",    "path": "/api/compliance/policies",                           "desc": "List active policies"},
            {"method": "POST",   "path": "/api/compliance/policies",                           "desc": "Create policy-as-code rule"},
            {"method": "PUT",    "path": "/api/compliance/policies/:id",                       "desc": "Update policy"},
            {"method": "POST",   "path": "/api/compliance/policies/evaluate",                  "desc": "Evaluate policy against action"},
            {"method": "GET",    "path": "/api/compliance/policies/impact-diff",               "desc": "AI change impact diff"},
            {"method": "GET",    "path": "/api/compliance/jurisdiction/rules",                 "desc": "Jurisdiction-specific rules"},
            {"method": "PUT",    "path": "/api/compliance/jurisdiction/rules",                 "desc": "Update jurisdiction rules"},
            {"method": "GET",    "path": "/api/compliance/jurisdiction/:country",              "desc": "Rules for specific jurisdiction"},
            {"method": "POST",   "path": "/api/compliance/jurisdiction/adapt",                 "desc": "Adapt workflow for jurisdiction"},
            {"method": "GET",    "path": "/api/compliance/regulations/templates",              "desc": "Regulation template library"},
            {"method": "POST",   "path": "/api/compliance/regulations/change-alert",           "desc": "Check for regulation changes"},
            {"method": "POST",   "path": "/api/compliance/regulations/simulate",               "desc": "Simulate regulation change impact"},
            {"method": "GET",    "path": "/api/compliance/human-review/queue",                 "desc": "Human review queue"},
            {"method": "POST",   "path": "/api/compliance/human-review/submit",                "desc": "Submit human review decision"},
            {"method": "GET",    "path": "/api/compliance/human-review/gates",                 "desc": "Configured review gates"},
            {"method": "PUT",    "path": "/api/compliance/human-review/gates",                 "desc": "Configure review gates"},
            {"method": "POST",   "path": "/api/compliance/human-review/escalate",              "desc": "Escalate for senior review"},
            {"method": "GET",    "path": "/api/compliance/overrides",                          "desc": "List decision overrides"},
            {"method": "POST",   "path": "/api/compliance/overrides",                          "desc": "Record override with justification"},
            {"method": "GET",    "path": "/api/compliance/overrides/patterns",                 "desc": "Override pattern analysis"},
            {"method": "POST",   "path": "/api/compliance/reports/eeoc",                       "desc": "Generate EEOC report"},
            {"method": "POST",   "path": "/api/compliance/reports/ofccp",                      "desc": "Generate OFCCP report"},
            {"method": "POST",   "path": "/api/compliance/reports/eeo1",                       "desc": "Generate EEO-1 report"},
            {"method": "POST",   "path": "/api/compliance/reports/eu-ai-act",                  "desc": "EU AI Act conformity report"},
            {"method": "GET",    "path": "/api/compliance/reports/audit-readiness",             "desc": "Audit readiness scorecard"},
            {"method": "GET",    "path": "/api/compliance/reports/regulatory-readiness",        "desc": "Regulatory readiness score"},
            {"method": "POST",   "path": "/api/compliance/reports/custom-export",               "desc": "Custom audit export"},
            {"method": "POST",   "path": "/api/compliance/dpia/generate",                      "desc": "Generate DPIA assessment"},
            {"method": "GET",    "path": "/api/compliance/dpia/:id",                           "desc": "Get DPIA result"},
            {"method": "POST",   "path": "/api/compliance/dpia/export",                        "desc": "Export pre-filled DPIA"},
            {"method": "GET",    "path": "/api/compliance/eu-ai-act/risk-tier",                "desc": "EU AI Act risk classification"},
            {"method": "POST",   "path": "/api/compliance/eu-ai-act/conformity",               "desc": "Run conformity assessment"},
            {"method": "GET",    "path": "/api/compliance/eu-ai-act/annex-iii",                "desc": "Annex III risk classification"},
            {"method": "GET",    "path": "/api/compliance/nyc-ll144/status",                   "desc": "NYC LL144 compliance status"},
            {"method": "POST",   "path": "/api/compliance/nyc-ll144/audit",                    "desc": "Run NYC LL144 bias audit"},
            {"method": "GET",    "path": "/api/compliance/gdpr/article22/:candidateId",        "desc": "GDPR Art 22 flagging"},
            {"method": "POST",   "path": "/api/compliance/gdpr/significant-decision",          "desc": "Flag significant decision"},
            {"method": "POST",   "path": "/api/compliance/works-council/package",              "desc": "Generate works council package"},
            {"method": "GET",    "path": "/api/compliance/works-council/status",               "desc": "Works council consultation status"},
            {"method": "GET",    "path": "/api/compliance/ai-notices/:candidateId",            "desc": "AI use notices for candidate"},
            {"method": "POST",   "path": "/api/compliance/ai-notices/generate",                "desc": "Generate jurisdiction-aware AI notice"},
            {"method": "GET",    "path": "/api/compliance/pay-transparency/:reqId",            "desc": "Pay transparency requirements"},
            {"method": "POST",   "path": "/api/compliance/pay-transparency/validate",          "desc": "Validate pay transparency compliance"},
            {"method": "POST",   "path": "/api/compliance/accommodation/request",              "desc": "Route accommodation request"},
            {"method": "GET",    "path": "/api/compliance/accommodation/:id",                  "desc": "Accommodation request status"},
            {"method": "GET",    "path": "/api/compliance/consent/ai-features/:candidateId",   "desc": "AI feature consent status"},
            {"method": "PUT",    "path": "/api/compliance/consent/ai-features/:candidateId",   "desc": "Update AI feature consent"},
            {"method": "POST",   "path": "/api/compliance/opt-out/:candidateId",               "desc": "Opt candidate out of AI"},
            {"method": "GET",    "path": "/api/compliance/opt-out/:candidateId",               "desc": "Opt-out status"},
            {"method": "GET",    "path": "/api/compliance/criteria-library",                   "desc": "Aligned criteria library"},
            {"method": "POST",   "path": "/api/compliance/criteria-library/validate",          "desc": "Validate criteria job-relatedness"},
            {"method": "GET",    "path": "/api/compliance/retention/archive",                  "desc": "Six-year compliance archive"},
            {"method": "GET",    "path": "/api/compliance/retention/policies",                 "desc": "Retention policies"},
            {"method": "PUT",    "path": "/api/compliance/retention/policies",                 "desc": "Update retention policies"},
            {"method": "GET",    "path": "/api/compliance/oversight/workbench",                "desc": "Compliance oversight workbench"},
            {"method": "POST",   "path": "/api/compliance/justification/capture",              "desc": "Capture structured justification"},
            {"method": "GET",    "path": "/api/compliance/justification/:decisionId",          "desc": "Get decision justification"},
            {"method": "POST",   "path": "/api/compliance/inappropriate-question/check",       "desc": "Check for inappropriate questions"},
            {"method": "GET",    "path": "/api/compliance/prohibited-questions/rules",         "desc": "Prohibited question rules"},
        ]
    },
    "explainability-layer": {
        "name": "AI Explainability Layer",
        "base_path": "/api/ai",
        "description": "AI decision explanations, model governance, transparency, confidence scoring",
        "endpoints": [
            {"method": "GET",    "path": "/api/ai/models",                                "desc": "List all registered models"},
            {"method": "POST",   "path": "/api/ai/models",                                "desc": "Register new model"},
            {"method": "GET",    "path": "/api/ai/models/:id",                            "desc": "Get model details"},
            {"method": "PUT",    "path": "/api/ai/models/:id/status",                     "desc": "Update model approval status"},
            {"method": "GET",    "path": "/api/ai/models/:id/card",                       "desc": "Get model card"},
            {"method": "POST",   "path": "/api/ai/models/:id/card/generate",              "desc": "Auto-generate model card"},
            {"method": "GET",    "path": "/api/ai/models/:id/versions",                   "desc": "Model version history"},
            {"method": "POST",   "path": "/api/ai/models/:id/rollback",                   "desc": "Rollback to previous version"},
            {"method": "POST",   "path": "/api/ai/models/:id/freeze",                     "desc": "Emergency freeze model"},
            {"method": "POST",   "path": "/api/ai/models/:id/shadow-eval",                "desc": "Run shadow evaluation"},
            {"method": "GET",    "path": "/api/ai/models/:id/drift",                      "desc": "Model drift metrics"},
            {"method": "GET",    "path": "/api/ai/models/:id/deployment",                 "desc": "Deployment approval status"},
            {"method": "POST",   "path": "/api/ai/models/:id/deployment/approve",         "desc": "Approve model deployment (2-person)"},
            {"method": "GET",    "path": "/api/ai/governance/console",                    "desc": "Governance console overview"},
            {"method": "GET",    "path": "/api/ai/governance/approved-models",             "desc": "List approved models"},
            {"method": "PUT",    "path": "/api/ai/governance/control-plane",               "desc": "Update control plane config"},
            {"method": "GET",    "path": "/api/ai/governance/change-log",                  "desc": "Governance change log"},
            {"method": "POST",   "path": "/api/ai/governance/change-request",              "desc": "Submit model change request"},
            {"method": "GET",    "path": "/api/ai/prompts",                                "desc": "Versioned prompt registry"},
            {"method": "POST",   "path": "/api/ai/prompts",                                "desc": "Register prompt"},
            {"method": "GET",    "path": "/api/ai/prompts/:id/versions",                   "desc": "Prompt version history"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId",                    "desc": "Get decision explanation"},
            {"method": "POST",   "path": "/api/ai/explain/generate",                       "desc": "Generate explanation for decision"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId/human-readable",     "desc": "Human-readable summary"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId/role/:role",         "desc": "Role-adaptive explanation view"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId/trace",              "desc": "Job-criterion trace map"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId/reason-codes",       "desc": "Compiled reason codes"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId/prompt-action",      "desc": "Prompt-to-action transparency"},
            {"method": "GET",    "path": "/api/ai/explain/:decisionId/chain-of-thought",   "desc": "Reasoning chain visualization"},
            {"method": "GET",    "path": "/api/ai/decisions",                               "desc": "List AI decisions"},
            {"method": "GET",    "path": "/api/ai/decisions/:id",                           "desc": "Get decision detail"},
            {"method": "GET",    "path": "/api/ai/decisions/:id/ledger",                    "desc": "Decision explainability ledger entry"},
            {"method": "GET",    "path": "/api/ai/decisions/:id/model-snapshot",            "desc": "Model version snapshot for decision"},
            {"method": "GET",    "path": "/api/ai/confidence/:decisionId",                  "desc": "Confidence score with uncertainty"},
            {"method": "GET",    "path": "/api/ai/confidence/thresholds",                   "desc": "Escalation threshold config"},
            {"method": "PUT",    "path": "/api/ai/confidence/thresholds",                   "desc": "Update escalation thresholds"},
            {"method": "POST",   "path": "/api/ai/override",                                "desc": "Override AI decision (with trail)"},
            {"method": "GET",    "path": "/api/ai/overrides",                               "desc": "List overrides with accountability"},
            {"method": "GET",    "path": "/api/ai/overrides/:id",                           "desc": "Override detail and trail"},
            {"method": "GET",    "path": "/api/ai/escalations",                             "desc": "Edge cases requiring escalation"},
            {"method": "POST",   "path": "/api/ai/escalations/:id/resolve",                "desc": "Resolve escalation"},
            {"method": "GET",    "path": "/api/ai/transparency/dashboard",                  "desc": "Real-time explainability dashboard"},
            {"method": "GET",    "path": "/api/ai/transparency/flow/:workflowId",           "desc": "Agentic flow visualization"},
            {"method": "GET",    "path": "/api/ai/transparency/action-log",                 "desc": "Agentic action transparency log"},
            {"method": "GET",    "path": "/api/ai/transparency/disclosure",                 "desc": "AI use disclosure and mode labeling"},
            {"method": "GET",    "path": "/api/ai/quality/metrics",                         "desc": "Explainability quality metrics"},
            {"method": "GET",    "path": "/api/ai/data-provenance",                         "desc": "Data provenance and training registry"},
            {"method": "GET",    "path": "/api/ai/data-provenance/:modelId",                "desc": "Training data sources for model"},
            {"method": "GET",    "path": "/api/ai/consent/training",                        "desc": "Training data consent records"},
            {"method": "POST",   "path": "/api/ai/counterfactual/:candidateId",             "desc": "Counterfactual rejection analysis"},
            {"method": "POST",   "path": "/api/ai/copilot/assist",                          "desc": "Recruiter co-pilot assistance"},
            {"method": "GET",    "path": "/api/ai/copilot/suggestions/:reqId",              "desc": "Co-pilot suggestions for requisition"},
            {"method": "POST",   "path": "/api/ai/attribute-redaction/process",              "desc": "Redact protected attributes before inference"},
            {"method": "GET",    "path": "/api/ai/human-checkpoints",                        "desc": "Mandatory HITL checkpoint config"},
            {"method": "PUT",    "path": "/api/ai/human-checkpoints",                        "desc": "Update HITL checkpoints"},
            {"method": "GET",    "path": "/api/ai/human-approval/queue",                     "desc": "High-risk agent approval queue"},
            {"method": "POST",   "path": "/api/ai/human-approval/:id/approve",               "desc": "Approve high-risk agent action"},
            {"method": "POST",   "path": "/api/ai/human-approval/:id/reject",                "desc": "Reject high-risk agent action"},
        ]
    },
    "analytics-engine": {
        "name": "Analytics & Reporting Engine",
        "base_path": "/api/analytics",
        "description": "Pipeline health, bottleneck detection, fairness analytics, real-time dashboards",
        "endpoints": [
            {"method": "GET",    "path": "/api/analytics/event-ledger",                    "desc": "Event-sourced hiring ledger"},
            {"method": "GET",    "path": "/api/analytics/event-ledger/:eventId",            "desc": "Get specific event detail"},
            {"method": "GET",    "path": "/api/analytics/dashboard/org-health",             "desc": "Org-wide hiring health dashboard"},
            {"method": "GET",    "path": "/api/analytics/dashboard/pipeline",               "desc": "Real-time pipeline health"},
            {"method": "GET",    "path": "/api/analytics/dashboard/process-telemetry",      "desc": "Real-time process telemetry"},
            {"method": "GET",    "path": "/api/analytics/dashboard/cross-functional",       "desc": "Cross-functional dashboards"},
            {"method": "GET",    "path": "/api/analytics/fairness/benchmarks",              "desc": "Fairness metrics benchmarking"},
            {"method": "GET",    "path": "/api/analytics/fairness/cross-system",            "desc": "Cross-system decision correlation"},
            {"method": "GET",    "path": "/api/analytics/fairness/adverse-impact-by-stage", "desc": "Adverse impact by stage"},
            {"method": "GET",    "path": "/api/analytics/bottlenecks",                      "desc": "Current bottlenecks"},
            {"method": "GET",    "path": "/api/analytics/bottlenecks/velocity",             "desc": "Requisition velocity monitoring"},
            {"method": "GET",    "path": "/api/analytics/bottlenecks/recovery",             "desc": "Dynamic bottleneck recovery"},
            {"method": "GET",    "path": "/api/analytics/requisition-health/:reqId",        "desc": "Requisition health score"},
            {"method": "GET",    "path": "/api/analytics/requisition-health/playbooks",     "desc": "Intervention playbooks"},
            {"method": "GET",    "path": "/api/analytics/audit-logs/immutable",             "desc": "Immutable tamper-evident audit logs"},
            {"method": "GET",    "path": "/api/analytics/bias-audit/schedule",              "desc": "Automated bias audit schedule"},
            {"method": "GET",    "path": "/api/analytics/overrides",                        "desc": "Override and justification log"},
        ]
    },
    "candidate-hub": {
        "name": "Candidate Experience Hub",
        "base_path": "/api/candidates",
        "description": "Candidate communication, concierge, portals, transparency, appeals",
        "endpoints": [
            {"method": "GET",    "path": "/api/candidates",                                     "desc": "List candidates"},
            {"method": "POST",   "path": "/api/candidates",                                     "desc": "Create candidate"},
            {"method": "GET",    "path": "/api/candidates/:id",                                 "desc": "Get candidate profile"},
            {"method": "PUT",    "path": "/api/candidates/:id",                                 "desc": "Update candidate"},
            {"method": "POST",   "path": "/api/candidates/concierge/chat",                      "desc": "Conversational concierge"},
            {"method": "GET",    "path": "/api/candidates/concierge/history/:candidateId",       "desc": "Chat history"},
            {"method": "POST",   "path": "/api/candidates/concierge/multilingual",               "desc": "Multi-lingual concierge"},
            {"method": "GET",    "path": "/api/candidates/:id/status",                           "desc": "Application status tracker"},
            {"method": "GET",    "path": "/api/candidates/:id/timeline",                         "desc": "Timeline with predictions"},
            {"method": "POST",   "path": "/api/candidates/:id/apply",                            "desc": "Adaptive application submission"},
            {"method": "POST",   "path": "/api/candidates/:id/apply/conversational",             "desc": "Conversational application"},
            {"method": "GET",    "path": "/api/candidates/:id/ai-passport",                      "desc": "AI use passport for candidate"},
            {"method": "GET",    "path": "/api/candidates/:id/ai-transparency",                  "desc": "AI transparency notice"},
            {"method": "POST",   "path": "/api/candidates/:id/appeal",                           "desc": "Submit appeal"},
            {"method": "GET",    "path": "/api/candidates/:id/appeal/:appealId",                 "desc": "Appeal status"},
            {"method": "POST",   "path": "/api/candidates/:id/appeal/human-review",              "desc": "One-click appeal to human"},
            {"method": "GET",    "path": "/api/candidates/:id/explanation",                      "desc": "Explanation center"},
            {"method": "GET",    "path": "/api/candidates/:id/rejection-report",                 "desc": "Why was I rejected report"},
            {"method": "GET",    "path": "/api/candidates/:id/rights-portal",                    "desc": "Candidate rights fulfillment"},
            {"method": "GET",    "path": "/api/candidates/:id/data-access",                      "desc": "Data access and correction portal"},
            {"method": "POST",   "path": "/api/candidates/:id/data-correction",                  "desc": "Request data correction"},
            {"method": "GET",    "path": "/api/candidates/:id/data-export",                      "desc": "Export personal data"},
            {"method": "POST",   "path": "/api/candidates/:id/feedback",                         "desc": "Submit feedback on experience"},
            {"method": "GET",    "path": "/api/candidates/:id/transparency/interview",            "desc": "Interview transparency info"},
            {"method": "POST",   "path": "/api/candidates/:id/communication/send",                "desc": "Send candidate communication"},
            {"method": "GET",    "path": "/api/candidates/:id/communication/history",              "desc": "Communication history"},
            {"method": "POST",   "path": "/api/candidates/:id/communication/multi-channel",       "desc": "Multi-channel engagement"},
            {"method": "POST",   "path": "/api/candidates/notifications/requisition-closed",       "desc": "Notify requisition closure"},
            {"method": "POST",   "path": "/api/candidates/:id/right-to-reply",                    "desc": "Submit right-to-reply"},
            {"method": "GET",    "path": "/api/candidates/:id/scheduling/preferences",             "desc": "Candidate scheduling preferences"},
            {"method": "PUT",    "path": "/api/candidates/:id/scheduling/preferences",             "desc": "Update scheduling preferences"},
        ]
    },
    "interview-system": {
        "name": "Interview Management System",
        "base_path": "/api/interviews",
        "description": "Structured interviews, panel coordination, feedback, coaching, scorecards",
        "endpoints": [
            {"method": "GET",    "path": "/api/interviews",                                "desc": "List interviews"},
            {"method": "POST",   "path": "/api/interviews",                                "desc": "Create interview"},
            {"method": "GET",    "path": "/api/interviews/:id",                            "desc": "Get interview detail"},
            {"method": "PUT",    "path": "/api/interviews/:id",                            "desc": "Update interview"},
            {"method": "POST",   "path": "/api/interviews/structured/generate",            "desc": "Generate structured interview + BARS"},
            {"method": "GET",    "path": "/api/interviews/:id/guide",                      "desc": "Get interview guide"},
            {"method": "POST",   "path": "/api/interviews/:id/debrief",                    "desc": "Submit debrief feedback"},
            {"method": "GET",    "path": "/api/interviews/:id/debrief/summary",            "desc": "Panel debrief orchestration summary"},
            {"method": "POST",   "path": "/api/interviews/:id/signals/capture",            "desc": "Capture interview signals"},
            {"method": "GET",    "path": "/api/interviews/:id/signals/summary",            "desc": "Signal capture summary"},
            {"method": "POST",   "path": "/api/interviews/:id/signals/behavioral",         "desc": "Structured behavioral signal extraction"},
            {"method": "GET",    "path": "/api/interviews/:id/scorecard",                  "desc": "Get interview scorecard"},
            {"method": "POST",   "path": "/api/interviews/:id/scorecard",                  "desc": "Submit scorecard"},
            {"method": "POST",   "path": "/api/interviews/panel/auto-coordinate",          "desc": "Auto-coordinate panel"},
            {"method": "GET",    "path": "/api/interviews/panel/:reqId",                   "desc": "Get panel for requisition"},
            {"method": "POST",   "path": "/api/interviews/panel/assemble",                 "desc": "Intelligently assemble panel"},
            {"method": "POST",   "path": "/api/interviews/pack/generate",                  "desc": "Auto-generate interview pack"},
            {"method": "POST",   "path": "/api/interviews/transcript/extract",             "desc": "Extract evidence from transcript"},
            {"method": "POST",   "path": "/api/interviews/recording/transcribe",           "desc": "Record and transcribe interview"},
            {"method": "GET",    "path": "/api/interviews/:id/transcript",                 "desc": "Get interview transcript"},
        ]
    },
    "screening-engine": {
        "name": "Screening & Assessment Engine",
        "base_path": "/api/screening",
        "description": "Resume parsing, skills matching, blind screening, assessments, fraud detection",
        "endpoints": [
            {"method": "POST",   "path": "/api/screening/intake",                         "desc": "AI-powered intake processing"},
            {"method": "POST",   "path": "/api/screening/evaluate/technical",              "desc": "Technical/work-sample evaluation"},
            {"method": "POST",   "path": "/api/screening/match/skills-first",              "desc": "Skills-first matching with bias dampeners"},
            {"method": "POST",   "path": "/api/screening/blind/apply",                     "desc": "Apply blind screening"},
            {"method": "POST",   "path": "/api/screening/anonymize",                       "desc": "Dynamic resume anonymization"},
            {"method": "POST",   "path": "/api/screening/rank/skills-only",                "desc": "Skill-based ranking only"},
            {"method": "POST",   "path": "/api/screening/rubric/enforce",                  "desc": "Real-time rubric enforcement"},
            {"method": "POST",   "path": "/api/screening/redact/demographic-proxy",        "desc": "Demographic proxy redaction"},
            {"method": "POST",   "path": "/api/screening/scorecard/generate",              "desc": "Generate competency scorecard"},
            {"method": "POST",   "path": "/api/screening/blind/automate",                  "desc": "Automated blind screening"},
            {"method": "POST",   "path": "/api/screening/blind/structured-review",         "desc": "Structured blind review"},
            {"method": "POST",   "path": "/api/screening/match/semantic",                  "desc": "Skills matching beyond keywords"},
            {"method": "POST",   "path": "/api/screening/autonomous-screen",               "desc": "24/7 autonomous screening"},
            {"method": "POST",   "path": "/api/screening/background-check/orchestrate",    "desc": "Background check orchestration"},
            {"method": "GET",    "path": "/api/screening/background-check/:id",            "desc": "Background check status"},
        ]
    },
    "sourcing-engine": {
        "name": "Sourcing & Talent Attraction Engine",
        "base_path": "/api/sourcing",
        "description": "Candidate sourcing, Boolean search, talent pools, outreach",
        "endpoints": [
            {"method": "POST",   "path": "/api/sourcing/boolean/generate",                 "desc": "Auto-generate Boolean search queries"},
            {"method": "POST",   "path": "/api/sourcing/shortlist",                        "desc": "Intelligent sourcing and shortlisting"},
            {"method": "GET",    "path": "/api/sourcing/talent-pools",                     "desc": "List talent pools"},
            {"method": "POST",   "path": "/api/sourcing/talent-pools",                     "desc": "Create talent pool"},
            {"method": "POST",   "path": "/api/sourcing/search",                           "desc": "Search for candidates"},
        ]
    },
    "decision-engine": {
        "name": "Decision & Offer Management Engine",
        "base_path": "/api/decisions",
        "description": "Hiring decisions, consensus, offers, compensation, negotiations",
        "endpoints": [
            {"method": "POST",   "path": "/api/decisions/final-review",                    "desc": "Final selection supervisor review"},
            {"method": "POST",   "path": "/api/decisions/synthesize",                      "desc": "Holistic decision synthesis"},
            {"method": "GET",    "path": "/api/decisions/:id",                             "desc": "Get decision detail"},
            {"method": "GET",    "path": "/api/decisions/:reqId/consensus",                "desc": "Consensus analysis"},
            {"method": "POST",   "path": "/api/decisions/:reqId/consensus/build",          "desc": "Build consensus across stakeholders"},
            {"method": "GET",    "path": "/api/decisions/:reqId/comparison",               "desc": "Side-by-side candidate comparison"},
            {"method": "POST",   "path": "/api/decisions/copilot/insights",                "desc": "AI copilot insights for HM"},
            {"method": "POST",   "path": "/api/offers",                                    "desc": "Create offer"},
            {"method": "GET",    "path": "/api/offers/:id",                                "desc": "Get offer details"},
            {"method": "PUT",    "path": "/api/offers/:id",                                "desc": "Update offer"},
            {"method": "POST",   "path": "/api/offers/:id/compliance-check",               "desc": "Offer compliance check"},
            {"method": "GET",    "path": "/api/offers/compensation/benchmark",              "desc": "Market salary benchmark"},
            {"method": "POST",   "path": "/api/offers/compensation/recommend",              "desc": "Compensation recommendation"},
            {"method": "POST",   "path": "/api/offers/:id/retract",                        "desc": "Handle offer retraction"},
            {"method": "POST",   "path": "/api/decisions/reference-check/orchestrate",      "desc": "Orchestrate reference checks"},
            {"method": "GET",    "path": "/api/decisions/reference-check/:id",              "desc": "Reference check results"},
        ]
    },
    "integration-hub": {
        "name": "Integration & Workflow Hub",
        "base_path": "/api/integrations",
        "description": "HRIS sync, approval workflows, SLA enforcement, API integrations",
        "endpoints": [
            {"method": "GET",    "path": "/api/integrations/status",                       "desc": "Integration status overview"},
            {"method": "POST",   "path": "/api/integrations/api/register",                 "desc": "Register API integration"},
            {"method": "GET",    "path": "/api/integrations/api/catalog",                  "desc": "API integration catalog"},
            {"method": "POST",   "path": "/api/integrations/hris/sync",                    "desc": "Bidirectional HRIS sync"},
            {"method": "GET",    "path": "/api/integrations/hris/conflicts",               "desc": "HRIS conflict resolution"},
            {"method": "POST",   "path": "/api/integrations/verification/orchestrate",     "desc": "Automated verification orchestration"},
            {"method": "GET",    "path": "/api/integrations/verification/:id",             "desc": "Verification status"},
            {"method": "GET",    "path": "/api/integrations/workflows/prioritization",     "desc": "Cross-req prioritization"},
            {"method": "POST",   "path": "/api/integrations/copilot/high-volume",          "desc": "High-volume recruiter copilot"},
            {"method": "GET",    "path": "/api/integrations/third-party/attestations",     "desc": "Third-party AI attestation hub"},
            {"method": "POST",   "path": "/api/integrations/third-party/audit-hooks",      "desc": "Third-party audit integration"},
            {"method": "POST",   "path": "/api/integrations/events/publish",               "desc": "Publish hiring event to HR stack"},
            {"method": "GET",    "path": "/api/integrations/events/log",                   "desc": "Event integration log"},
            {"method": "POST",   "path": "/api/integrations/approval/design",              "desc": "Design approval workflow"},
            {"method": "GET",    "path": "/api/integrations/approval/workflows",           "desc": "Active approval workflows"},
            {"method": "POST",   "path": "/api/integrations/approval/:id/submit",          "desc": "Submit for approval"},
            {"method": "GET",    "path": "/api/integrations/explainability-api",            "desc": "Explainability API for auditors"},
            {"method": "GET",    "path": "/api/integrations/fairness-api",                 "desc": "Fairness metrics API"},
            {"method": "GET",    "path": "/api/integrations/escalation/rules",             "desc": "Human review escalation rules"},
            {"method": "POST",   "path": "/api/integrations/escalation/trigger",           "desc": "Trigger escalation"},
            {"method": "POST",   "path": "/api/integrations/hitl/workflow/build",          "desc": "Build HITL workflow"},
            {"method": "GET",    "path": "/api/integrations/pipeline/:reqId",              "desc": "Embedded pipeline visibility"},
            {"method": "POST",   "path": "/api/integrations/requisition/sync",             "desc": "Cross-system requisition sync"},
            {"method": "POST",   "path": "/api/integrations/background-check/multi-vendor","desc": "Multi-vendor background check"},
            {"method": "POST",   "path": "/api/integrations/provisioning/new-hire",        "desc": "Multi-system IT/HR provisioning"},
            {"method": "GET",    "path": "/api/integrations/workload/balance",             "desc": "Recruiter workload balance"},
            {"method": "POST",   "path": "/api/integrations/workload/rebalance",           "desc": "Rebalance recruiter workload"},
        ]
    },
    "scheduling-engine": {
        "name": "Scheduling & Coordination Engine",
        "base_path": "/api/scheduling",
        "description": "Interview scheduling, timezone management, no-show prevention, accessibility",
        "endpoints": [
            {"method": "POST",   "path": "/api/scheduling/auto-schedule",                  "desc": "AI-driven scheduling"},
            {"method": "POST",   "path": "/api/scheduling/reschedule",                     "desc": "Smart rescheduling"},
            {"method": "GET",    "path": "/api/scheduling/availability",                   "desc": "Check availability"},
            {"method": "POST",   "path": "/api/scheduling/accessibility",                  "desc": "Schedule with accessibility options"},
            {"method": "POST",   "path": "/api/scheduling/multi-timezone",                 "desc": "Cross-timezone scheduling"},
            {"method": "POST",   "path": "/api/scheduling/multi-party",                    "desc": "Multi-party interview scheduling"},
            {"method": "GET",    "path": "/api/scheduling/no-show/prevention",             "desc": "No-show prevention status"},
            {"method": "POST",   "path": "/api/scheduling/no-show/remind",                 "desc": "Send reminders"},
        ]
    },
    "mobility-engine": {
        "name": "Internal Mobility & Workforce Planning Engine",
        "base_path": "/api/mobility",
        "description": "Internal mobility, skills matching, career paths, workforce planning",
        "endpoints": [
            {"method": "GET",    "path": "/api/mobility/opportunities",                    "desc": "Internal opportunities"},
            {"method": "POST",   "path": "/api/mobility/match",                            "desc": "Match employee to internal role"},
            {"method": "GET",    "path": "/api/mobility/profiles/:employeeId",             "desc": "Employee mobility profile"},
        ]
    },
    "onboarding-engine": {
        "name": "Onboarding & Post-Hire Engine",
        "base_path": "/api/onboarding",
        "description": "Onboarding handoff, preboarding, context preservation",
        "endpoints": [
            {"method": "POST",   "path": "/api/onboarding/handoff",                       "desc": "Seamless onboarding handoff"},
            {"method": "GET",    "path": "/api/onboarding/handoff/:candidateId",           "desc": "Get handoff context"},
            {"method": "GET",    "path": "/api/onboarding/handoff/:candidateId/context",   "desc": "Full hiring context for onboarding"},
        ]
    },
}

# ── Feature-to-Engine Mapping ───────────────────────────────────────────────
# Map categories to primary engines and assign endpoints

CATEGORY_ENGINE_MAP = {
    "Core Platform & Architecture": ["platform-core"],
    "Security & Privacy": ["security-framework"],
    "Compliance, Bias & Governance": ["compliance-governance-engine", "bias-fairness-engine"],
    "AI/ML Operations & Explainability": ["explainability-layer"],
    "Analytics & Reporting": ["analytics-engine"],
    "Candidate Experience & Communication": ["candidate-hub"],
    "Interview Management": ["interview-system"],
    "Screening & Assessment": ["screening-engine"],
    "Sourcing & Talent Attraction": ["sourcing-engine"],
    "Decision & Offer Management": ["decision-engine"],
    "Internal Mobility & Workforce Planning": ["mobility-engine"],
    "Integration & Workflow": ["integration-hub"],
    "Scheduling & Coordination": ["scheduling-engine"],
    "Onboarding & Post-Hire": ["onboarding-engine"],
}

# Keyword-based endpoint assignment for more precise mapping
KEYWORD_ENDPOINT_MAP = [
    # Security & Privacy
    (["prompt injection", "prompt firewall", "output safety"], "security-framework", ["/api/security/prompt-firewall/scan", "/api/security/prompt-firewall/log"]),
    (["zero-trust", "zero trust"], "security-framework", ["/api/security/zero-trust/verify", "/api/security/zero-trust/status"]),
    (["data residency", "residency router", "data boundary", "cross-border data"], "security-framework", ["/api/security/data-residency/config", "/api/security/data-residency/route"]),
    (["tenant isolation", "api level data"], "security-framework", ["/api/tenants/:id/isolation", "/api/security/data-residency/config"]),
    (["sensitive data", "segregation vault"], "security-framework", ["/api/security/vault", "/api/security/vault/:id"]),
    (["retention", "deletion orchestrator"], "security-framework", ["/api/security/retention/evaluate", "/api/security/retention/purge"]),
    (["fine-grained access", "just-in-time", "rbac", "role-based access", "need-to-know"], "security-framework", ["/api/security/access/config", "/api/security/access/jit-review"]),
    (["consent", "consent first", "data minimization", "purpose-bound"], "security-framework", ["/api/security/consent/:candidateId", "/api/security/data-minimization/evaluate"]),
    (["erasure", "right-to-erasure", "right-to-be-forgotten", "gdpr erasure"], "security-framework", ["/api/security/erasure/request", "/api/security/erasure/:requestId/execute"]),
    (["pii", "masking", "redaction engine", "pseudonymization"], "security-framework", ["/api/security/pii/mask", "/api/security/pii/redact"]),
    (["credential", "identity packet"], "security-framework", ["/api/security/credentials/:candidateId"]),
    (["fraud", "fake detection", "deepfake", "identity verification"], "security-framework", ["/api/security/fraud/detect", "/api/security/fraud/deepfake"]),
    (["dsar", "data subject request"], "security-framework", ["/api/security/dsar", "/api/security/dsar/:id/fulfill"]),
    (["data correction", "data access and correction"], "security-framework", ["/api/security/data-correction", "/api/candidates/:id/data-access"]),
    (["data portability"], "security-framework", ["/api/security/data-portability/:candidateId"]),
    (["soc 2"], "security-framework", ["/api/security/zero-trust/status"]),
    (["confidential search"], "security-framework", ["/api/security/pii/mask"]),
    (["candidate data sovereignty"], "security-framework", ["/api/security/consent/:candidateId", "/api/candidates/:id/data-access"]),
    (["model access token", "scoped permission", "non-human identity"], "security-framework", ["/api/security/access/config"]),
    (["segmented model runtime"], "security-framework", ["/api/security/access/config"]),
    (["quarantine", "auto-quarantine"], "security-framework", ["/api/security/prompt-firewall/scan"]),
    (["zero-trust model pipeline"], "security-framework", ["/api/security/zero-trust/verify"]),
    (["data sharing framework", "secure data sharing"], "security-framework", ["/api/security/data-residency/config"]),
    (["consent & privacy agent", "agentic candidate consent"], "security-framework", ["/api/security/consent/:candidateId"]),
    (["anonymization", "purge agent"], "security-framework", ["/api/security/erasure/request"]),

    # Bias & Fairness
    (["proxy detect", "protected-trait", "protected trait"], "bias-fairness-engine", ["/api/bias/proxy-detect", "/api/bias/proxy-detect/log"]),
    (["adverse impact", "disparate impact"], "bias-fairness-engine", ["/api/bias/adverse-impact/analyze", "/api/bias/adverse-impact/by-stage", "/api/bias/adverse-impact/realtime"]),
    (["bias drift", "drift detect", "drift monitor"], "bias-fairness-engine", ["/api/bias/drift/check", "/api/bias/drift/history"]),
    (["fairness metric", "fairness benchmark", "fairness objective", "configurable fairness"], "bias-fairness-engine", ["/api/bias/fairness/metrics", "/api/bias/fairness/by-role"]),
    (["bias audit", "annual bias", "pre-deployment bias"], "bias-fairness-engine", ["/api/bias/audit/run", "/api/bias/audit/results"]),
    (["four-fifths", "four fifths", "4/5"], "bias-fairness-engine", ["/api/bias/adverse-impact/four-fifths"]),
    (["knockout filter"], "bias-fairness-engine", ["/api/bias/knockout-filter/simulate"]),
    (["job description bias", "jd screener"], "bias-fairness-engine", ["/api/bias/jd-screener/scan"]),
    (["interviewer calibration", "interview consistency"], "bias-fairness-engine", ["/api/bias/interviewer-calibration/:userId"]),
    (["manager calibration"], "bias-fairness-engine", ["/api/bias/manager-calibration/:userId"]),
    (["diversity pipeline", "diversity analytics", "diversity slate", "diversity-slate", "diversity goal", "dei"], "bias-fairness-engine", ["/api/bias/diversity/tracker", "/api/bias/diversity/generate-slate"]),
    (["intersectional"], "bias-fairness-engine", ["/api/bias/monitor/intersectional"]),
    (["bias remediation"], "bias-fairness-engine", ["/api/bias/remediation/trigger"]),
    (["real-time bias", "continuous bias", "continuous fairness", "real-time diversity"], "bias-fairness-engine", ["/api/bias/monitor/dashboard"]),
    (["anonymous shortlist", "blind hiring enforcer"], "bias-fairness-engine", ["/api/screening/blind/apply"]),
    (["bias-audited rubric"], "bias-fairness-engine", ["/api/bias/audit/run"]),
    (["bias-mitigation", "bias mitigation"], "bias-fairness-engine", ["/api/bias/remediation/trigger", "/api/bias/monitor/dashboard"]),
    (["demographic", "candidate demographic"], "bias-fairness-engine", ["/api/bias/demographic/segregate"]),
    (["proxy feature detection"], "bias-fairness-engine", ["/api/bias/proxy-detect"]),

    # Compliance & Governance
    (["human decision gate", "human-final", "mandatory human review", "human review gate"], "compliance-governance-engine", ["/api/compliance/human-review/queue", "/api/compliance/human-review/submit"]),
    (["audit trail", "audit log", "audit pack", "evidence pack", "evidence vault", "evidence export"], "compliance-governance-engine", ["/api/compliance/audit-trail", "/api/compliance/evidence/generate"]),
    (["immutable", "tamper-evident", "tamper-proof", "chain of custody"], "compliance-governance-engine", ["/api/compliance/audit-trail", "/api/compliance/audit-trail/chain-of-custody/:id"]),
    (["policy as code", "policy-as-code", "hiring governance layer"], "compliance-governance-engine", ["/api/compliance/policies", "/api/compliance/policies/evaluate"]),
    (["jurisdiction", "multi-jurisdictional", "global multi entity"], "compliance-governance-engine", ["/api/compliance/jurisdiction/rules", "/api/compliance/jurisdiction/:country"]),
    (["eu ai act", "annex iii"], "compliance-governance-engine", ["/api/compliance/eu-ai-act/conformity", "/api/compliance/eu-ai-act/risk-tier"]),
    (["nyc local law", "nyc ll144"], "compliance-governance-engine", ["/api/compliance/nyc-ll144/audit", "/api/compliance/nyc-ll144/status"]),
    (["gdpr article 22", "significant decision"], "compliance-governance-engine", ["/api/compliance/gdpr/article22/:candidateId"]),
    (["works council", "betriebsrat"], "compliance-governance-engine", ["/api/compliance/works-council/package"]),
    (["eeoc", "eeo-1", "eeo1", "title vii"], "compliance-governance-engine", ["/api/compliance/reports/eeoc", "/api/compliance/reports/eeo1"]),
    (["ofccp"], "compliance-governance-engine", ["/api/compliance/reports/ofccp"]),
    (["dpia", "impact assessment"], "compliance-governance-engine", ["/api/compliance/dpia/generate", "/api/compliance/dpia/export"]),
    (["legal hold", "litigation hold"], "compliance-governance-engine", ["/api/compliance/legal-hold", "/api/compliance/legal-hold/active"]),
    (["override", "override with mandatory", "human override"], "compliance-governance-engine", ["/api/compliance/overrides"]),
    (["escalation", "escalation path", "risk-based approval"], "compliance-governance-engine", ["/api/compliance/human-review/escalate"]),
    (["two-person rule", "two-person review"], "compliance-governance-engine", ["/api/ai/models/:id/deployment/approve"]),
    (["accommodation", "accommodation request"], "compliance-governance-engine", ["/api/compliance/accommodation/request"]),
    (["opt-out", "opt out of ai"], "compliance-governance-engine", ["/api/compliance/opt-out/:candidateId"]),
    (["pay transparency"], "compliance-governance-engine", ["/api/compliance/pay-transparency/validate"]),
    (["ai notice", "ai use notice", "candidate-facing ai"], "compliance-governance-engine", ["/api/compliance/ai-notices/generate"]),
    (["regulation template", "compliance change"], "compliance-governance-engine", ["/api/compliance/regulations/templates", "/api/compliance/regulations/change-alert"]),
    (["criteria health", "criteria library", "aligned-criteria"], "compliance-governance-engine", ["/api/compliance/criteria-library", "/api/compliance/criteria-library/validate"]),
    (["versioned requisition", "requisition snapshot"], "compliance-governance-engine", ["/api/requisitions/:id/snapshots"]),
    (["audit replay", "replay mode"], "compliance-governance-engine", ["/api/compliance/audit-trail/replay/:decisionId"]),
    (["ai change impact", "change impact diff"], "compliance-governance-engine", ["/api/compliance/policies/impact-diff"]),
    (["retention archive", "six-year"], "compliance-governance-engine", ["/api/compliance/retention/archive"]),
    (["consent versioning", "consent tracking"], "compliance-governance-engine", ["/api/security/consent/:candidateId/history"]),
    (["override pattern"], "compliance-governance-engine", ["/api/compliance/overrides/patterns"]),
    (["ai recommendation quarantine"], "compliance-governance-engine", ["/api/compliance/human-review/queue"]),
    (["policy-aware agent", "agent boundaries"], "compliance-governance-engine", ["/api/compliance/policies/evaluate"]),
    (["inappropriate question", "prohibited question"], "compliance-governance-engine", ["/api/compliance/inappropriate-question/check"]),
    (["structured human justification", "forced justification"], "compliance-governance-engine", ["/api/compliance/justification/capture"]),
    (["oversight workbench"], "compliance-governance-engine", ["/api/compliance/oversight/workbench"]),
    (["audit readiness", "regulatory readiness"], "compliance-governance-engine", ["/api/compliance/reports/audit-readiness"]),
    (["compliance document", "automated compliance"], "compliance-governance-engine", ["/api/compliance/reports/custom-export"]),
    (["regulatory reporting"], "compliance-governance-engine", ["/api/compliance/reports/custom-export"]),
    (["cross-border audit"], "compliance-governance-engine", ["/api/compliance/audit-trail"]),
    (["subprocessor", "vendor dpa"], "compliance-governance-engine", ["/api/integrations/third-party/attestations"]),
    (["privacy impact"], "compliance-governance-engine", ["/api/compliance/dpia/generate"]),
    (["data source receipt"], "compliance-governance-engine", ["/api/compliance/ai-notices/generate"]),
    (["transparency portal", "algorithmic transparency"], "compliance-governance-engine", ["/api/compliance/oversight/workbench"]),
    (["geographic posting"], "compliance-governance-engine", ["/api/compliance/jurisdiction/rules"]),
    (["granular ai feature consent", "per-model consent"], "compliance-governance-engine", ["/api/compliance/consent/ai-features/:candidateId"]),
    (["sensitive modality"], "compliance-governance-engine", ["/api/compliance/policies/evaluate"]),
    (["compliance training"], "compliance-governance-engine", ["/api/compliance/reports/audit-readiness"]),
    (["decision version control"], "compliance-governance-engine", ["/api/compliance/audit-trail/:decisionId"]),
    (["eeo report", "eeo-report"], "compliance-governance-engine", ["/api/compliance/reports/eeoc"]),
    (["legal risk flagging"], "compliance-governance-engine", ["/api/compliance/inappropriate-question/check"]),
    (["independent bias audit"], "compliance-governance-engine", ["/api/bias/audit/run"]),
    (["vendor-independent audit"], "compliance-governance-engine", ["/api/compliance/evidence/export"]),
    (["auto-registration", "conformity assessment"], "compliance-governance-engine", ["/api/compliance/eu-ai-act/conformity"]),
    (["adaptive compliance"], "compliance-governance-engine", ["/api/compliance/jurisdiction/adapt"]),
    (["regulatory change", "regulatory adaptation"], "compliance-governance-engine", ["/api/compliance/regulations/change-alert"]),
    (["continuous impact"], "compliance-governance-engine", ["/api/bias/adverse-impact/realtime"]),
    (["collaborative hiring fairness"], "bias-fairness-engine", ["/api/bias/monitor/dashboard"]),
    (["time-bounded decision"], "compliance-governance-engine", ["/api/compliance/policies/evaluate"]),
    (["purpose-limited data"], "compliance-governance-engine", ["/api/compliance/policies/evaluate"]),
    (["agent system of record"], "compliance-governance-engine", ["/api/compliance/audit-trail"]),
    (["pre-certified bias"], "compliance-governance-engine", ["/api/compliance/nyc-ll144/audit", "/api/compliance/eu-ai-act/conformity"]),

    # AI/ML Operations
    (["model registry", "hiring ai model"], "explainability-layer", ["/api/ai/models", "/api/ai/models/:id"]),
    (["model card", "model documentation"], "explainability-layer", ["/api/ai/models/:id/card", "/api/ai/models/:id/card/generate"]),
    (["model version", "model rollback", "audit-ready model"], "explainability-layer", ["/api/ai/models/:id/versions", "/api/ai/models/:id/rollback"]),
    (["model drift", "continuous model drift"], "explainability-layer", ["/api/ai/models/:id/drift"]),
    (["shadow evaluation", "shadow eval"], "explainability-layer", ["/api/ai/models/:id/shadow-eval"]),
    (["approved-model", "control plane"], "explainability-layer", ["/api/ai/governance/approved-models", "/api/ai/governance/control-plane"]),
    (["governance console", "agent and model governance"], "explainability-layer", ["/api/ai/governance/console"]),
    (["explainable", "explainability", "decision explanation", "per-decision"], "explainability-layer", ["/api/ai/explain/:decisionId", "/api/ai/explain/generate"]),
    (["human-readable", "natural language decision", "narrative summar"], "explainability-layer", ["/api/ai/explain/:decisionId/human-readable"]),
    (["role-adaptive"], "explainability-layer", ["/api/ai/explain/:decisionId/role/:role"]),
    (["reason-code", "reason code"], "explainability-layer", ["/api/ai/explain/:decisionId/reason-codes"]),
    (["prompt-to-action"], "explainability-layer", ["/api/ai/explain/:decisionId/prompt-action"]),
    (["trace map", "job-criterion"], "explainability-layer", ["/api/ai/explain/:decisionId/trace"]),
    (["embedded model", "prompt cards"], "explainability-layer", ["/api/ai/prompts"]),
    (["confidence", "uncertainty display", "confidence band"], "explainability-layer", ["/api/ai/confidence/:decisionId"]),
    (["ai override", "override with accountability"], "explainability-layer", ["/api/ai/override", "/api/ai/overrides"]),
    (["escalation-required", "edge case"], "explainability-layer", ["/api/ai/escalations"]),
    (["emergency freeze"], "explainability-layer", ["/api/ai/models/:id/freeze"]),
    (["mandatory human-in-the-loop", "human checkpoint"], "explainability-layer", ["/api/ai/human-checkpoints"]),
    (["consent-based ai model"], "explainability-layer", ["/api/ai/consent/training"]),
    (["prompt registry", "versioned prompt"], "explainability-layer", ["/api/ai/prompts", "/api/ai/prompts/:id/versions"]),
    (["human approval gate", "prompt-level human"], "explainability-layer", ["/api/ai/human-approval/queue", "/api/ai/human-approval/:id/approve"]),
    (["protected-attribute redaction", "attribute redaction"], "explainability-layer", ["/api/ai/attribute-redaction/process"]),
    (["configurable risk-threshold"], "explainability-layer", ["/api/ai/confidence/thresholds"]),
    (["transparency dashboard", "real-time explainability"], "explainability-layer", ["/api/ai/transparency/dashboard"]),
    (["agentic flow", "flow visualization"], "explainability-layer", ["/api/ai/transparency/flow/:workflowId"]),
    (["action transparency", "agentic action"], "explainability-layer", ["/api/ai/transparency/action-log"]),
    (["ai use disclosure", "mode labeling"], "explainability-layer", ["/api/ai/transparency/disclosure"]),
    (["quality metrics dashboard", "explainability quality"], "explainability-layer", ["/api/ai/quality/metrics"]),
    (["data provenance", "training set"], "explainability-layer", ["/api/ai/data-provenance"]),
    (["change management for model"], "explainability-layer", ["/api/ai/governance/change-request"]),
    (["counterfactual"], "explainability-layer", ["/api/ai/counterfactual/:candidateId"]),
    (["recruiter co-pilot", "recruiter agentic", "recruiter copilot"], "explainability-layer", ["/api/ai/copilot/assist"]),
    (["decision surface"], "explainability-layer", ["/api/ai/explain/:decisionId"]),
    (["model behavior disclosure"], "explainability-layer", ["/api/ai/models/:id/card"]),
    (["transparent reasoning", "reasoning chain"], "explainability-layer", ["/api/ai/explain/:decisionId/chain-of-thought"]),

    # Analytics
    (["event sourced", "event-sourced", "hiring ledger"], "analytics-engine", ["/api/analytics/event-ledger"]),
    (["hiring health", "org-wide"], "analytics-engine", ["/api/analytics/dashboard/org-health"]),
    (["pipeline health", "real-time pipeline"], "analytics-engine", ["/api/analytics/dashboard/pipeline"]),
    (["process telemetry"], "analytics-engine", ["/api/analytics/dashboard/process-telemetry"]),
    (["cross-functional analytics", "cross-functional dashboard"], "analytics-engine", ["/api/analytics/dashboard/cross-functional"]),
    (["bottleneck", "velocity monitoring"], "analytics-engine", ["/api/analytics/bottlenecks", "/api/analytics/bottlenecks/velocity"]),
    (["requisition health"], "analytics-engine", ["/api/analytics/requisition-health/:reqId"]),
    (["immutable", "tamper-evident audit"], "analytics-engine", ["/api/analytics/audit-logs/immutable"]),
    (["bias audit schedul"], "analytics-engine", ["/api/analytics/bias-audit/schedule"]),
    (["override and justification log"], "analytics-engine", ["/api/analytics/overrides"]),
    (["fairness benchmark"], "analytics-engine", ["/api/analytics/fairness/benchmarks"]),
    (["cross-system decision"], "analytics-engine", ["/api/analytics/fairness/cross-system"]),
    (["adverse impact by stage"], "analytics-engine", ["/api/analytics/fairness/adverse-impact-by-stage"]),

    # Candidate Experience
    (["concierge", "24/7"], "candidate-hub", ["/api/candidates/concierge/chat"]),
    (["multilingual", "multi-lingual", "multi-language", "region-aware"], "candidate-hub", ["/api/candidates/concierge/multilingual"]),
    (["application experience", "adaptive application"], "candidate-hub", ["/api/candidates/:id/apply"]),
    (["conversational application"], "candidate-hub", ["/api/candidates/:id/apply/conversational"]),
    (["ai passport", "ai use passport"], "candidate-hub", ["/api/candidates/:id/ai-passport"]),
    (["appeal", "explanation and appeal", "right-to-reply"], "candidate-hub", ["/api/candidates/:id/appeal", "/api/candidates/:id/right-to-reply"]),
    (["rejection report", "why was i rejected"], "candidate-hub", ["/api/candidates/:id/rejection-report"]),
    (["application progress", "status track", "transparent status"], "candidate-hub", ["/api/candidates/:id/status", "/api/candidates/:id/timeline"]),
    (["rights portal", "rights fulfillment"], "candidate-hub", ["/api/candidates/:id/rights-portal"]),
    (["data access", "data redress"], "candidate-hub", ["/api/candidates/:id/data-access"]),
    (["ai transparency notice", "ai transparency"], "candidate-hub", ["/api/candidates/:id/ai-transparency"]),
    (["candidate feedback", "feedback channel"], "candidate-hub", ["/api/candidates/:id/feedback"]),
    (["transparency-by-default", "transparency interview"], "candidate-hub", ["/api/candidates/:id/transparency/interview"]),
    (["personalized", "multi-channel", "engagement throughout"], "candidate-hub", ["/api/candidates/:id/communication/multi-channel"]),
    (["requisition-closure", "closure notif"], "candidate-hub", ["/api/candidates/notifications/requisition-closed"]),
    (["candidate-centric scheduling"], "candidate-hub", ["/api/candidates/:id/scheduling/preferences"]),
    (["one-click appeal"], "candidate-hub", ["/api/candidates/:id/appeal/human-review"]),
    (["real-time", "timeline prediction"], "candidate-hub", ["/api/candidates/:id/timeline"]),

    # Interview Management
    (["structured interview", "bars builder"], "interview-system", ["/api/interviews/structured/generate"]),
    (["panel debrief", "debrief orchestrat"], "interview-system", ["/api/interviews/:id/debrief/summary"]),
    (["signal capture", "interview signal"], "interview-system", ["/api/interviews/:id/signals/capture"]),
    (["panel coordination", "panel agent"], "interview-system", ["/api/interviews/panel/auto-coordinate"]),
    (["behavioral signal"], "interview-system", ["/api/interviews/:id/signals/behavioral"]),
    (["interview pack"], "interview-system", ["/api/interviews/pack/generate"]),
    (["transcript", "interview evidence"], "interview-system", ["/api/interviews/transcript/extract"]),
    (["interview recording", "transcription agent"], "interview-system", ["/api/interviews/recording/transcribe"]),
    (["panel assembl", "interview panel"], "interview-system", ["/api/interviews/panel/assemble"]),

    # Screening
    (["intake orchestrat", "ai-powered intake"], "screening-engine", ["/api/screening/intake"]),
    (["technical", "work-sample"], "screening-engine", ["/api/screening/evaluate/technical"]),
    (["skills-first", "skills first"], "screening-engine", ["/api/screening/match/skills-first"]),
    (["blind screening", "blind hiring", "blind review"], "screening-engine", ["/api/screening/blind/apply"]),
    (["resume anonymiz"], "screening-engine", ["/api/screening/anonymize"]),
    (["skill-based ranking", "skill-based candidate"], "screening-engine", ["/api/screening/rank/skills-only"]),
    (["rubric enforc"], "screening-engine", ["/api/screening/rubric/enforce"]),
    (["demographic proxy redact"], "screening-engine", ["/api/screening/redact/demographic-proxy"]),
    (["competency scorecard"], "screening-engine", ["/api/screening/scorecard/generate"]),
    (["skills matching", "skills-based matching", "beyond keywords"], "screening-engine", ["/api/screening/match/semantic"]),
    (["autonomous candidate screening", "24/7 autonomous"], "screening-engine", ["/api/screening/autonomous-screen"]),
    (["background-check", "background check"], "screening-engine", ["/api/screening/background-check/orchestrate"]),

    # Sourcing
    (["boolean", "query synthesizer"], "sourcing-engine", ["/api/sourcing/boolean/generate"]),
    (["intelligent sourcing", "shortlist agent"], "sourcing-engine", ["/api/sourcing/shortlist"]),

    # Decision & Offer
    (["final selection", "final supervisor"], "decision-engine", ["/api/decisions/final-review"]),
    (["holistic decision", "decision synthesis"], "decision-engine", ["/api/decisions/synthesize"]),
    (["offer workflow", "offer compliance"], "decision-engine", ["/api/offers/:id/compliance-check"]),
    (["reference check"], "decision-engine", ["/api/decisions/reference-check/orchestrate"]),
    (["consensus", "collaborative hiring decision"], "decision-engine", ["/api/decisions/:reqId/consensus/build"]),
    (["side-by-side", "candidate comparison"], "decision-engine", ["/api/decisions/:reqId/comparison"]),
    (["copilot", "hiring manager copilot"], "decision-engine", ["/api/decisions/copilot/insights"]),
    (["compensation", "market-salary", "salary benchmark", "market-pricing"], "decision-engine", ["/api/offers/compensation/benchmark", "/api/offers/compensation/recommend"]),
    (["offer-retraction", "offer retract"], "decision-engine", ["/api/offers/:id/retract"]),

    # Integration
    (["api-first", "api first"], "integration-hub", ["/api/integrations/api/register"]),
    (["verification orchestrat", "automated verification"], "integration-hub", ["/api/integrations/verification/orchestrate"]),
    (["cross-requisition", "prioritization engine"], "integration-hub", ["/api/integrations/workflows/prioritization"]),
    (["high-volume", "high volume"], "integration-hub", ["/api/integrations/copilot/high-volume"]),
    (["third-party", "supply chain attestation"], "integration-hub", ["/api/integrations/third-party/attestations"]),
    (["audit integration hook", "third-party audit"], "integration-hub", ["/api/integrations/third-party/audit-hooks"]),
    (["hris", "hr stack", "enterprise hr"], "integration-hub", ["/api/integrations/hris/sync"]),
    (["approval workflow"], "integration-hub", ["/api/integrations/approval/design"]),
    (["explainability api"], "integration-hub", ["/api/integrations/explainability-api"]),
    (["fairness metrics api", "fairness api"], "integration-hub", ["/api/integrations/fairness-api"]),
    (["role-based approval"], "integration-hub", ["/api/integrations/approval/workflows"]),
    (["human review escalation"], "integration-hub", ["/api/integrations/escalation/rules"]),
    (["hitl workflow", "human-in-the-loop workflow"], "integration-hub", ["/api/integrations/hitl/workflow/build"]),
    (["embedded pipeline"], "integration-hub", ["/api/integrations/pipeline/:reqId"]),
    (["bidirectional", "real-time hris"], "integration-hub", ["/api/integrations/hris/sync"]),
    (["requisition sync", "cross-system requisition"], "integration-hub", ["/api/integrations/requisition/sync"]),
    (["multi-vendor", "background check & multi"], "integration-hub", ["/api/integrations/background-check/multi-vendor"]),
    (["provisioning", "it/hr provisioning"], "integration-hub", ["/api/integrations/provisioning/new-hire"]),
    (["workload balanc", "recruiter workload"], "integration-hub", ["/api/integrations/workload/balance"]),

    # Scheduling
    (["scheduling", "rescheduling", "no show", "no-show"], "scheduling-engine", ["/api/scheduling/auto-schedule", "/api/scheduling/reschedule"]),
    (["accessibility first", "accessibility"], "scheduling-engine", ["/api/scheduling/accessibility"]),
    (["ai-driven scheduling"], "scheduling-engine", ["/api/scheduling/auto-schedule"]),
    (["time zone", "timezone"], "scheduling-engine", ["/api/scheduling/multi-timezone"]),
    (["multi-party", "autonomous multi-party"], "scheduling-engine", ["/api/scheduling/multi-party"]),

    # Internal Mobility
    (["internal mobility", "frictionless internal"], "mobility-engine", ["/api/mobility/opportunities", "/api/mobility/match"]),

    # Onboarding
    (["onboarding handoff", "seamless onboarding"], "onboarding-engine", ["/api/onboarding/handoff"]),

    # Core Platform
    (["unified ats", "single data model"], "platform-core", ["/api/platform/health", "/api/requisitions"]),
    (["end-to-end requisition", "requisition orchestration"], "platform-core", ["/api/requisitions/:id/orchestrate"]),
    (["requisition consolidation", "duplication detection"], "platform-core", ["/api/requisitions/duplicates"]),
    (["intelligent requisition", "market-calibrated"], "platform-core", ["/api/requisitions"]),
    (["intake and calibration", "recruiter-manager alignment"], "platform-core", ["/api/requisitions/:id/intake"]),
    (["localization", "translation orchestrat"], "platform-core", ["/api/platform/localization/translate"]),
]


def get_feature_status(feature):
    """Determine if feature is fully_functional or engine_level"""
    name_lower = feature["name"].lower()
    desc_lower = feature["description"].lower()

    # P0 are always fully functional
    if feature["priority"] == "P0-Critical":
        return "fully_functional"

    # Features that are harder to fully implement in 2 days
    hard_keywords = [
        "third-party", "vendor dpa", "subprocessor", "soc 2",
        "works council", "betriebsrat",
        "cross-border", "multi-jurisdictional",
        "deepfake", "video injection",
    ]

    for kw in hard_keywords:
        if kw in name_lower or kw in desc_lower:
            return "engine_level"

    return "fully_functional"


def find_endpoints(feature):
    """Find matching API endpoints for a feature"""
    name_lower = feature["name"].lower()
    desc_lower = feature["description"].lower()
    combined = name_lower + " " + desc_lower

    matched_endpoints = []
    matched_engine = None

    # Try keyword matching first
    for keywords, engine, endpoints in KEYWORD_ENDPOINT_MAP:
        for kw in keywords:
            if kw in combined:
                matched_engine = engine
                matched_endpoints = endpoints
                break
        if matched_engine:
            break

    # Fallback to category mapping
    if not matched_engine:
        engines = CATEGORY_ENGINE_MAP.get(feature["category"], ["platform-core"])
        matched_engine = engines[0]
        if matched_engine in ENGINE_DEFS:
            # Take first 2 endpoints from the engine
            matched_endpoints = [e["path"] for e in ENGINE_DEFS[matched_engine]["endpoints"][:2]]

    return matched_engine, matched_endpoints


def get_ui_route(feature, engine):
    """Generate UI route for feature"""
    category_routes = {
        "Core Platform & Architecture": "/platform",
        "Security & Privacy": "/security",
        "Compliance, Bias & Governance": "/compliance",
        "AI/ML Operations & Explainability": "/ai",
        "Analytics & Reporting": "/analytics",
        "Candidate Experience & Communication": "/candidates",
        "Interview Management": "/interviews",
        "Screening & Assessment": "/screening",
        "Sourcing & Talent Attraction": "/sourcing",
        "Decision & Offer Management": "/decisions",
        "Internal Mobility & Workforce Planning": "/mobility",
        "Integration & Workflow": "/integrations",
        "Scheduling & Coordination": "/scheduling",
        "Onboarding & Post-Hire": "/onboarding",
    }
    base = category_routes.get(feature["category"], "/dashboard")
    slug = feature["name"].lower().replace(" ", "-").replace("(", "").replace(")", "").replace("\"", "").replace("'", "").replace("&", "and")
    # Clean up slug
    slug = slug[:60]  # Limit length
    return f"{base}/{slug}"


# ── Build the spec ──────────────────────────────────────────────────────────

features_spec = []
fully_functional_count = 0
engine_level_count = 0

for feature in p0_p1:
    engine, endpoints = find_endpoints(feature)
    status = get_feature_status(feature)
    ui_route = get_ui_route(feature, engine)

    if status == "fully_functional":
        fully_functional_count += 1
    else:
        engine_level_count += 1

    features_spec.append({
        "feature_id": feature["id"],
        "name": feature["name"],
        "priority": feature["priority"],
        "category": feature["category"],
        "rank": feature["rank"],
        "description": feature["description"],
        "build_status": status,
        "core_engine": engine,
        "api_endpoints": endpoints,
        "ui_route": ui_route,
    })

# Build core engines summary
engines_summary = []
for key, eng in ENGINE_DEFS.items():
    feature_count = sum(1 for f in features_spec if f["core_engine"] == key)
    engines_summary.append({
        "engine_id": key,
        "name": eng["name"],
        "base_path": eng["base_path"],
        "description": eng["description"],
        "total_endpoints": len(eng["endpoints"]),
        "features_powered": feature_count,
        "endpoints": eng["endpoints"],
    })

# Final output
build_spec = {
    "metadata": {
        "project": "CDC ATS - AI-Powered Applicant Tracking System",
        "generated_date": datetime.now().isoformat(),
        "source_file": "D:\\CDC\\ATS\\USPs\\unique_usps_master_list.json",
        "total_features": len(features_spec),
        "fully_functional": fully_functional_count,
        "engine_level": engine_level_count,
        "not_feasible_2day": 0,
        "total_working": fully_functional_count + engine_level_count,
        "core_engines_count": len(engines_summary),
        "total_api_endpoints": sum(e["total_endpoints"] for e in engines_summary),
        "tech_stack": {
            "framework": "Next.js 14 (App Router)",
            "language": "TypeScript",
            "database": "PostgreSQL + Prisma ORM",
            "auth": "NextAuth.js (role-based)",
            "ai_llm": "Claude API (Anthropic)",
            "ui": "shadcn/ui + Tailwind CSS",
            "search": "PostgreSQL full-text search",
            "queue": "BullMQ + Redis",
            "storage": "S3-compatible object storage",
        },
        "build_plan": {
            "day_1": "P0 features (12) + all core engines (15) + high-priority P1 features",
            "day_2": "Remaining P1 features + integration testing + UI polish",
        },
        "usage_instructions": {
            "ui_engineer": "Use 'ui_route' and 'api_endpoints' to build pages. Each feature maps to a route and consumes the listed API endpoints.",
            "backend_engineer": "Build the 'core_engines' first. Each engine defines all endpoints. Features reference these endpoints.",
            "testing_engineer": "Use 'api_endpoints' per feature to write integration tests. 'build_status' indicates expected completeness.",
        }
    },
    "core_engines": engines_summary,
    "features": features_spec,
}

# Write output
output_path = r"D:\CDC\ATS\build_spec.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(build_spec, f, indent=2, ensure_ascii=False)

print(f"Build spec generated: {output_path}")
print(f"Total features: {len(features_spec)}")
print(f"Fully functional: {fully_functional_count}")
print(f"Engine level: {engine_level_count}")
print(f"Core engines: {len(engines_summary)}")
print(f"Total API endpoints: {sum(e['total_endpoints'] for e in engines_summary)}")
