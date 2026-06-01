"use client";

/**
 * Phase 37k, Interview Questions tab for the candidate detail page.
 *
 * Flow:
 *   1. Recruiter picks a requisition from the candidate's applications
 *      OR pastes a JD directly
 *   2. Optional focus areas + desired count
 *   3. "Generate" → POST /api/candidates/:id/interview-questions
 *   4. Render question cards with type / difficulty badges + citation +
 *      expectedSignal
 *
 * Costs ~$0.05-0.15 per generation. Each question carries its citation
 * back to the resume so the recruiter can verify in real-time during the
 * interview.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Quote, Clock, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const TYPE_COLOR: Record<string, string> = {
  verify_claim:      "bg-warn/15 text-warn dark:text-warn border-warn/40/30",
  probe_gap:         "bg-danger/15 text-danger dark:text-danger border-danger/40/30",
  elicit_narrative:  "bg-ai/15 text-ai-ink dark:text-ai-ink border-ai/40/30",
  behavioural:       "bg-info/15 text-info dark:text-info border-info/40/30",
  technical:         "bg-ok/15 text-ok dark:text-ok border-ok/40/30",
};

const TYPE_LABEL: Record<string, string> = {
  verify_claim:      "Verify",
  probe_gap:         "Probe gap",
  elicit_narrative:  "Narrative",
  behavioural:       "Behavioural",
  technical:         "Technical",
};

interface Question {
  question: string;
  type: keyof typeof TYPE_COLOR;
  citation: string;
  expectedSignal: string;
  difficulty: "entry" | "mid" | "senior" | "staff";
  estimatedTimeMin: number;
}

interface Props {
  candidateId: string;
  // List of {id, title} for the requisitions the candidate has applied to
  applications: Array<{ id: string; requisitionId?: string; requisition?: { id: string; title: string } | null }>;
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" };
}

export function InterviewQuestionsTab({ candidateId, applications }: Props) {
  const [requisitionId, setRequisitionId] = useState<string>("");
  const [jdText, setJdText] = useState("");
  const [desiredCount, setDesiredCount] = useState(7);
  const [focusInput, setFocusInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [coverageNotes, setCoverageNotes] = useState<string>("");

  // Deduped list of requisitions from the candidate's applications
  const requisitions = Array.from(
    new Map(
      applications
        .filter((a) => a.requisition)
        .map((a) => [a.requisition!.id, a.requisition!])
    ).values()
  );

  const generate = async () => {
    if (!requisitionId && jdText.trim().length < 50) {
      toast.error("Pick a requisition or paste a JD (50+ characters)");
      return;
    }
    setLoading(true);
    try {
      const focusAreas = focusInput.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5);
      const body: Record<string, unknown> = { desiredCount };
      if (requisitionId) body.requisitionId = requisitionId;
      if (jdText.trim()) body.jobDescriptionText = jdText.trim();
      if (focusAreas.length > 0) body.focusAreas = focusAreas;

      const res = await fetch(`${API_BASE}/candidates/${candidateId}/interview-questions`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error?.message ?? payload?.message ?? `${res.status}`);
      const data = payload.data ?? payload;
      setQuestions(data.questions);
      setCoverageNotes(data.coverageNotes ?? "");
      toast.success(`Generated ${data.questions.length} questions${data.costUsd ? ` ($${data.costUsd.toFixed(3)})` : ""}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Generator card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai" /> Generate personalized questions
          </CardTitle>
          <CardDescription className="text-xs">
            We'll write 5-10 questions targeting this candidate's claims + your job's requirements, each with a citation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requisitions.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Requisition (from this candidate's applications)</Label>
              <Select value={requisitionId} onValueChange={setRequisitionId}>
                <SelectTrigger><SelectValue placeholder="Pick a requisition…" /></SelectTrigger>
                <SelectContent>
                  {requisitions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-2xs text-muted-foreground">- or -</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="jd-text" className="text-xs">Paste JD directly</Label>
            <Textarea
              id="jd-text"
              rows={4}
              placeholder="Paste the job description here…"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="count" className="text-xs">How many?</Label>
              <Input id="count" type="number" min={5} max={10}
                value={desiredCount}
                onChange={(e) => setDesiredCount(Math.max(5, Math.min(10, Number(e.target.value) || 7)))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="focus" className="text-xs">Focus areas (optional, comma-sep)</Label>
              <Input id="focus" placeholder="system design, leadership"
                value={focusInput} onChange={(e) => setFocusInput(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={generate} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating…" : "Generate"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coverage notes */}
      {coverageNotes && (
        <p className="text-xs text-muted-foreground italic px-1">
          <Quote className="h-3 w-3 inline mr-1" /> {coverageNotes}
        </p>
      )}

      {/* Questions */}
      {questions && questions.length > 0 && (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-2xs ${TYPE_COLOR[q.type] ?? ""}`}>
                    {TYPE_LABEL[q.type] ?? q.type}
                  </Badge>
                  <Badge variant="outline" className="text-2xs">{q.difficulty}</Badge>
                  <Badge variant="outline" className="text-2xs gap-1">
                    <Clock className="h-2.5 w-2.5" /> {q.estimatedTimeMin} min
                  </Badge>
                </div>
                <p className="text-sm font-medium leading-snug">
                  <MessageSquare className="h-4 w-4 inline mr-2 text-muted-foreground" />
                  {q.question}
                </p>
                <div className="text-2xs text-muted-foreground pl-6 space-y-1">
                  <p>
                    <strong className="text-foreground">Cite:</strong> {q.citation}
                  </p>
                  <p>
                    <strong className="text-foreground">Look for:</strong> {q.expectedSignal}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {questions && questions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground text-sm">
            No questions returned. Try a more detailed JD.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
