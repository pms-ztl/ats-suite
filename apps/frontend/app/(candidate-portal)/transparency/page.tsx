"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "@/components/shared/confidence-meter";
import { Brain, Shield, Eye, Scale, FileText, Users } from "lucide-react";

const aiUsage = [
  { stage: "Resume Screening", model: "Resume Scorer v3.2", confidence: 0.91, decision: "Advanced", explanation: "Your resume matched 5 of 6 required skills. Experience level exceeds minimum requirements." },
  { stage: "Skills Assessment", model: "Skills Matcher v2.8", confidence: 0.87, decision: "Strong Match", explanation: "Technical skills in React, TypeScript, and Node.js align closely with role requirements." },
  { stage: "Interview Scheduling", model: "Scheduler v1.5", confidence: 0.95, decision: "Optimal Slot Found", explanation: "Matched your availability preferences with interviewer calendars." },
];

export default function CandidateTransparencyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Transparency</h1>
        <p className="text-sm text-muted-foreground mt-1">Understand how AI is used in your application process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-info-tint flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-ai" />
            </div>
            <div>
              <p className="text-sm font-medium">AI-Assisted</p>
              <p className="text-2xs text-muted-foreground">AI helps screen and match, but humans make all final decisions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-ok-tint flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-ok" />
            </div>
            <div>
              <p className="text-sm font-medium">Bias-Monitored</p>
              <p className="text-2xs text-muted-foreground">All AI models are continuously audited for fairness</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-warn-tint flex items-center justify-center shrink-0">
              <Scale className="h-4 w-4 text-warn" />
            </div>
            <div>
              <p className="text-sm font-medium">Your Rights</p>
              <p className="text-2xs text-muted-foreground">You can appeal any AI decision and request human review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Usage in Your Application</CardTitle>
          <CardDescription>Each stage where AI was used to assist decision-making</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiUsage.map((usage, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="info">{usage.stage}</Badge>
                  <span className="text-2xs text-muted-foreground font-mono">{usage.model}</span>
                </div>
                <Badge variant="success">{usage.decision}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs text-muted-foreground">AI Confidence:</span>
                <ConfidenceMeter value={usage.confidence} size="sm" className="w-32" />
              </div>
              <div className="bg-muted/50 rounded p-3">
                <p className="text-2xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Why this decision:
                </p>
                <p className="text-sm">{usage.explanation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Data Usage & Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">What data is used</p>
              <p className="text-2xs text-muted-foreground">Resume content, skills, experience level, and assessment responses. Demographic data is segregated and never used in AI decisions.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Human oversight</p>
              <p className="text-2xs text-muted-foreground">All consequential decisions (rejection, advancement) are reviewed by a human recruiter before being finalized.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
