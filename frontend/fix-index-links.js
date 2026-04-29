const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, 'app', '(dashboard)');

const catMeta = {
  platform: { label: "Core Platform", desc: "Core platform architecture, requisition management, and unified data model", fn: "PlatformIndexPage" },
  security: { label: "Security & Privacy", desc: "Zero-trust security, data privacy, access control, encryption, and consent management", fn: "SecurityIndexPage" },
  compliance: { label: "Compliance & Governance", desc: "Audit trails, bias detection, fairness monitoring, regulatory compliance, and governance controls", fn: "ComplianceIndexPage" },
  ai: { label: "AI/ML Operations", desc: "AI model governance, explainability, transparency, and human-AI collaboration", fn: "AiIndexPage" },
  analytics: { label: "Analytics & Reporting", desc: "Hiring analytics, pipeline metrics, event sourcing, and organizational health dashboards", fn: "AnalyticsIndexPage" },
  candidates: { label: "Candidate Experience", desc: "Candidate communication, concierge services, portals, and experience management", fn: "CandidatesIndexPage" },
  interviews: { label: "Interview Management", desc: "Structured interviews, panel coordination, BARS builder, and debrief management", fn: "InterviewsIndexPage" },
  screening: { label: "Screening & Assessment", desc: "Resume screening, skills assessment, blind review, and candidate evaluation", fn: "ScreeningIndexPage" },
  sourcing: { label: "Sourcing", desc: "Boolean search, talent pool management, and intelligent sourcing agents", fn: "SourcingIndexPage" },
  decisions: { label: "Decision & Offer", desc: "Offer management, compensation benchmarking, consensus building, and final selection", fn: "DecisionsIndexPage" },
  mobility: { label: "Internal Mobility", desc: "Internal mobility programs, talent marketplace, and career pathing", fn: "MobilityIndexPage" },
  integrations: { label: "Integrations", desc: "HRIS sync, API integrations, workflow automation, and third-party connectors", fn: "IntegrationsIndexPage" },
  scheduling: { label: "Scheduling", desc: "Interview scheduling, multi-timezone coordination, and no-show prevention", fn: "SchedulingIndexPage" },
  onboarding: { label: "Onboarding", desc: "Seamless hiring-to-onboarding handoff with full context preservation", fn: "OnboardingIndexPage" },
};

function titleCase(dir) {
  return dir
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bApi\b/g, 'API')
    .replace(/\bUsp\b/g, 'USP')
    .replace(/\bDei\b/g, 'DEI')
    .replace(/\bHris\b/g, 'HRIS')
    .replace(/\bRbac\b/g, 'RBAC')
    .replace(/\bDsar\b/g, 'DSAR')
    .replace(/\bGdpr\b/g, 'GDPR')
    .replace(/\bCcpa\b/g, 'CCPA')
    .replace(/\bPii\b/g, 'PII')
    .replace(/\bPhi\b/g, 'PHI')
    .replace(/\bEeo\b/g, 'EEO')
    .replace(/\bDpia\b/g, 'DPIA')
    .replace(/\bHitl\b/g, 'HITL')
    .replace(/\bMrg\b/g, 'MRG')
    .replace(/\bBars\b/g, 'BARS')
    .replace(/\bEu\b/g, 'EU')
    .replace(/\bNyc\b/g, 'NYC')
    .replace(/\bOfccp\b/g, 'OFCCP')
    .replace(/\bOfccp\b/g, 'OFCCP')
    .replace(/\bLl144\b/g, 'LL144')
    .replace(/\bEeoc\b/g, 'EEOC');
}

let updatedCount = 0;

Object.keys(catMeta).forEach(catKey => {
  const catDir = path.join(BASE, catKey);
  if (!fs.existsSync(catDir)) {
    console.log(`SKIP: ${catKey} - directory not found`);
    return;
  }

  const indexPath = path.join(catDir, 'page.tsx');
  if (!fs.existsSync(indexPath)) {
    console.log(`SKIP: ${catKey} - no page.tsx`);
    return;
  }

  // Read existing index to extract feature metadata (name, priority, rank)
  const existingContent = fs.readFileSync(indexPath, 'utf8');

  // Parse existing features array from the file
  const featuresMatch = existingContent.match(/const features = (\[[\s\S]*?\n\]);/);
  let existingFeatures = [];
  if (featuresMatch) {
    try {
      existingFeatures = JSON.parse(featuresMatch[1]);
    } catch (e) {
      console.log(`WARN: ${catKey} - JSON parse failed, trying eval`);
      try {
        existingFeatures = eval('(' + featuresMatch[1] + ')');
      } catch (e2) {
        console.log(`ERROR: ${catKey} - could not parse features: ${e2.message}`);
        return;
      }
    }
  }

  // Build a map from href slug to feature metadata
  const hrefToFeature = {};
  existingFeatures.forEach(f => {
    const slug = f.href.split('/').pop();
    hrefToFeature[slug] = f;
  });

  // List actual subdirectories that have page.tsx
  let subdirs;
  try {
    subdirs = fs.readdirSync(catDir).filter(d => {
      if (d === 'page.tsx' || d === 'layout.tsx') return false;
      try {
        const stat = fs.statSync(path.join(catDir, d));
        return stat.isDirectory() && fs.existsSync(path.join(catDir, d, 'page.tsx'));
      } catch {
        return false;
      }
    });
  } catch (e) {
    console.log(`ERROR: ${catKey} - could not read directory: ${e.message}`);
    return;
  }

  // Build features array
  const features = subdirs.map(dir => {
    if (hrefToFeature[dir]) {
      return {
        name: hrefToFeature[dir].name,
        href: `/${catKey}/${dir}`,
        priority: hrefToFeature[dir].priority,
        rank: hrefToFeature[dir].rank,
      };
    } else {
      return {
        name: titleCase(dir),
        href: `/${catKey}/${dir}`,
        priority: "P2-Medium",
        rank: 999,
      };
    }
  });

  // Sort by rank
  features.sort((a, b) => a.rank - b.rank);

  const meta = catMeta[catKey];
  const featuresJson = JSON.stringify(features, null, 2);

  const pageContent = `"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const features = ${featuresJson};

export default function ${meta.fn}() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="${meta.label}"
        description="${meta.desc}"
        breadcrumbs={[{ label: "${meta.label}" }]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {features.map((feature, i) => (
          <Link key={i} href={feature.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{feature.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={feature.priority === "P0-Critical" ? "danger" : "secondary"} className="text-2xs">
                        {feature.priority}
                      </Badge>
                      <span className="text-2xs text-muted-foreground">Rank #{feature.rank}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
`;

  // Count differences
  const oldHrefs = new Set(existingFeatures.map(f => f.href));
  const newHrefs = new Set(features.map(f => f.href));
  const removed = [...oldHrefs].filter(h => !newHrefs.has(h));
  const added = [...newHrefs].filter(h => !oldHrefs.has(h));

  if (removed.length === 0 && added.length === 0) {
    console.log(`OK: ${catKey} - ${features.length} features, no changes needed`);
    return;
  }

  fs.writeFileSync(indexPath, pageContent, 'utf8');
  updatedCount++;

  console.log(`UPDATED: ${catKey} - ${features.length} features (was ${existingFeatures.length} in index, ${subdirs.length} dirs on disk)`);
  if (removed.length > 0) {
    console.log(`  Removed ${removed.length} broken links: ${removed.join(', ')}`);
  }
  if (added.length > 0) {
    console.log(`  Added ${added.length} new entries from disk`);
  }
});

console.log(`\nDone! Updated ${updatedCount} category index pages.`);
