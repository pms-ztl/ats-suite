# Build_spec.json vs Frontend Cross-Reference Report

## Executive Summary

This report provides a detailed analysis of feature coverage between build_spec.json and frontend pages in the (dashboard) directory.

**Key Metrics:**
- Total features in build_spec.json: 372
- Total pages in frontend: 939
- Exact matches: 349 (93.8%)
- Missing from frontend: 23
- Slug mismatches: 17
- Extra pages not in spec: 590

## 1. EXACT MATCHES - 349 Pages Found

All these ui_routes have corresponding page.tsx files in frontend/app/(dashboard).

## 2. MISSING FROM FRONTEND - 23 Features

### A. Completely Missing (8 features)

1. /security/api-level-data-residency-and-tenant-isolation
2. /security/fine-grained-access-and-just-in-time-review
3. /security/fraud-and-deepfake-detection-orchestrator
4. /security/retention-and-deletion-orchestrator
5. /security/usp:-confidential-search-masking
6. /candidates/why-was-i-rejected?-candidate-report
7. /integrations/usp:-api-first-agent-integration
8. /platform/unified-ats-+-crm-+-scheduling-+-analytics-on-a-single-data-

### B. Slug Mismatches (15 features)

#### Nested Path Collapsed Issues:
- /compliance/dei/bias-audit-agent → /compliance/bias-audit-agent
- /compliance/real-time-diversity/bias-monitoring → /compliance/bias-monitoring
- /compliance/automated-compliance-documentation-for-ofccp/eeo-audits → /compliance/eeo-audits
- /compliance/automated-eeoc/title-vii-audit-extractor → /compliance/title-vii-audit-extractor
- /compliance/sensitive-modality-governance-video/voice/psychometrics → /compliance/psychometrics
- /integrations/multi-system-it/hr-provisioning-agent → /integrations/hr-provisioning-agent
- /security/pii/phi-real-time-masking-layer → /security/phi-real-time-masking-layer
- /security/data-privacy-anonymization-and-purge-agent-gdpr/ccpa → /security/data-privacy-anonymization-and-purge-agent-gdpr-ccpa

#### Special Character Issues:
- /candidates/usp:-24/7-concierge-agent → /candidates/usp-247-concierge-agent (colon+slash handling)
- /security/usp:-gdpr/ccpa-erasure-agent → /security/usp-gdprccpa-erasure-agent (colon+slash handling)

#### Slash in Feature Name:
- /screening/technical-/-work-sample-evaluator → /screening/technical-work-sample-evaluator

#### Numeric Patterns:
- /screening/24/7-autonomous-candidate-screening-agent → /screening/7-autonomous-candidate-screening-agent

#### Truncated Slugs:
- /security/enterprise-grade-security-architecture-with-zero-trust-desig (appears truncated)
- /screening/usp:-ai-powered-intake-orchestrator (no close match)

## 3. ROOT CAUSES

### Problem 1: Forward Slash Normalization
- Nested paths are collapsed: /dei/bias → deibias or just bias
- Inconsistent: sometimes preserved, sometimes flattened
- Impact: 9 features affected

### Problem 2: Special Character Handling
- Colon (:) - "usp:-" becomes "usp-" or removed
- Forward slash - "/work-sample" becomes "-work-sample" or "work-sample"  
- Numeric slash - "24/7" becomes "247"
- Question mark - Cannot be in filesystem paths
- Plus signs - "+ crm+" not handling consistency
- Impact: 6 features affected

### Problem 3: Incomplete Slugs in Spec
- /ai/explainable-ai-with-transparent-reasoning-chains-for-every-r (truncated)
- /ai/real-time-explainability-dashboard-agentic-flow-visualizatio (missing "n")
- /platform/unified-ats-+-crm-+-scheduling-+-analytics-on-a-single-data- (ends with dash)
- Impact: 3 features affected

## 4. EXTRA PAGES IN FRONTEND - 590 Pages

The frontend contains 590 pages NOT in build_spec.json:
- /ai (dashboard root)
- /ai/agentic-candidate-relationship-management-crm-with-opt-out-*
- /ai/agentic-decision-rationale-engine
- /ai/ai-coaching-for-recruiter-decisions-*
- ... and 585 more

Possible explanations:
1. Recently added to frontend but not in spec yet
2. Deprecated pages not yet removed
3. Auto-generated from another source
4. Multiple variants of same feature
5. build_spec.json may not be current source of truth

## 5. RECOMMENDATIONS

### Immediate (Priority 1)
1. Fix path encoding in slug generation
   - Standardize special character handling
   - Decide: preserve nested paths or flatten?
   - Validate against filesystem constraints

2. Verify truncated slugs
   - Are they intentional or incomplete?

3. Handle invalid characters
   - /candidates/why-was-i-rejected?-candidate-report (question mark issue)

4. Create missing pages (8 features)
   - Security pages (4): api-level residency, fine-grained access, fraud detection, retention
   - Integration page (1): usp:-api-first
   - Screening page (1): usp:-ai-powered
   - Security pages (2): usp:-confidential-search
   - Platform page (1): unified-ats-+-crm-+-scheduling

### Medium (Priority 2)
5. Audit 590 extra frontend pages
   - Legitimate new features?
   - Duplicate variants?
   - Legacy pages?

6. Establish source of truth
   - Is build_spec.json authoritative?
   - Implement sync mechanism

7. Add validation checks
   - All spec routes must have pages
   - No invalid filesystem characters
   - Consistent slug generation

---

## Summary

Match Rate: 93.8% (349 of 372 routes matched)
- Missing implementations: 23
- Extra frontend pages: 590
- Primary issue: Path encoding and special character handling

