"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Send, CheckCircle2 } from "lucide-react";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export default function CandidateAppealPage() {
  const [submitted, setSubmitted] = useState(false);
  const [decisionType, setDecisionType] = useState("");
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmitAppeal = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      if (USE_MOCKS) {
        setSubmitted(true);
        return;
      }

      // Hit the public backend route — anonymous candidates have no JWT.
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const res = await fetch(`${API_BASE}/public/appeal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionType, reason, additionalInfo }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false || data.error) {
        throw new Error(data.error?.message || data.message || "Failed to submit appeal. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (USE_MOCKS) {
      alert("Draft saved.");
      return;
    }
    // Draft persistence isn't yet implemented server-side; keep client-only.
    try {
      window.localStorage?.setItem(
        "appeal-draft",
        JSON.stringify({ decisionType, reason, additionalInfo, savedAt: new Date().toISOString() }),
      );
      alert("Draft saved locally.");
    } catch {
      alert("Failed to save draft. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Appeal Submitted</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Your appeal has been submitted</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              A human reviewer will examine your case within 5 business days. You&apos;ll receive an email notification when a decision is made.
            </p>
            <div className="mt-4">
              <Badge variant="info">Appeal ID: APL-X8K2M9</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Appeal a Decision</h1>
        <p className="text-sm text-muted-foreground mt-1">Request a human review of an AI-assisted hiring decision</p>
      </div>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Your Rights</p>
            <p className="text-sm text-amber-700 mt-1">Under applicable regulations, you have the right to request that a qualified human reviewer examines any decision that was assisted by artificial intelligence. This review is independent and impartial.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Your Appeal</CardTitle>
          <CardDescription>Provide details about which decision you&apos;d like reviewed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Decision Type <span className="text-destructive">*</span></Label>
            <Select value={decisionType} onValueChange={setDecisionType}>
              <SelectTrigger><SelectValue placeholder="Select the type of decision" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="screening">Screening / Resume Review</SelectItem>
                <SelectItem value="assessment">Assessment Score</SelectItem>
                <SelectItem value="interview">Interview Evaluation</SelectItem>
                <SelectItem value="rejection">Application Rejection</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reason for Appeal <span className="text-destructive">*</span></Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Please describe why you believe the decision should be reviewed. Include any relevant context or information that may not have been considered..." className="min-h-[120px]" />
          </div>
          <div className="space-y-2">
            <Label>Additional Information</Label>
            <Textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Any additional context, achievements, or qualifications you'd like the reviewer to consider..." className="min-h-[80px]" />
          </div>
          {submitError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
            <Button disabled={!decisionType || !reason || submitting} onClick={handleSubmitAppeal}>
              <Send className="h-4 w-4 mr-1" /> {submitting ? "Submitting…" : "Submit Appeal"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
