"use client";

/**
 * Recruiter Copilot — a chat surface over the agentic /api/copilot endpoint.
 * The agent decides what to retrieve (candidates / requisitions / metrics),
 * answers grounded in what it pulled, and exposes its full ReAct reasoning
 * trace under each answer.
 */
import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Loader2, User, FileText, Briefcase, BarChart3 } from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { AgentReasoningTrace, type AgentStep } from "@/components/shared/agent-reasoning-trace";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Source { type: string; id: string; snippet: string }
interface Turn {
  query: string;
  loading: boolean;
  answer?: string;
  sources?: Source[];
  suggestedActions?: Array<{ label: string; type: string }>;
  followUpQuestions?: string[];
  confidence?: number;
  agentTrace?: AgentStep[];
  toolsUsed?: string[];
  error?: string;
}

const SOURCE_ICON: Record<string, typeof FileText> = {
  candidate: User,
  requisition: Briefcase,
  metric: BarChart3,
  interview: FileText,
  policy: FileText,
};

export default function CopilotPage() {
  const { can } = usePermissions();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns]);

  if (!can("analytics") && !can("candidates")) return <AccessDenied />;

  async function send(q: string) {
    const query = q.trim();
    if (!query || busy) return;
    setInput("");
    setBusy(true);
    const idx = turns.length;
    setTurns((t) => [...t, { query, loading: true }]);
    try {
      const token = document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "";
      const res = await fetch(`${API}/copilot`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const d = json.data ?? json;
      setTurns((t) => t.map((turn, i) => i === idx ? {
        ...turn, loading: false,
        answer: d.answer, sources: d.sources, suggestedActions: d.suggestedActions,
        followUpQuestions: d.followUpQuestions, confidence: d.confidence,
        agentTrace: d.agentTrace, toolsUsed: d.toolsUsed,
      } : turn));
    } catch {
      setTurns((t) => t.map((turn, i) => i === idx ? { ...turn, loading: false, error: "The copilot couldn't answer that. Try rephrasing." } : turn));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Recruiter Copilot"
        description="Ask about candidates, requisitions, or pipeline metrics — the agent retrieves the answer and shows its reasoning."
        breadcrumbs={[{ label: "Copilot" }]}
      />

      {turns.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {["Which candidates know React?", "How many AI runs have we done in total?", "What roles are open right now?"].map((ex) => (
                <button key={ex} onClick={() => send(ex)} className="rounded-full border px-3 py-1 text-xs hover:bg-muted transition-colors">{ex}</button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {turns.map((t, i) => (
          <div key={i} className="space-y-2">
            {/* user query */}
            <div className="flex justify-end">
              <div className="rounded-2xl bg-primary text-primary-foreground px-4 py-2 text-sm max-w-[80%]">{t.query}</div>
            </div>
            {/* assistant */}
            <Card>
              <CardContent className="p-4 space-y-3">
                {t.loading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> The copilot is retrieving…
                  </div>
                ) : t.error ? (
                  <p className="text-sm text-rose-600">{t.error}</p>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{t.answer}</p>
                    {typeof t.confidence === "number" && (
                      <p className="text-2xs text-muted-foreground">Confidence: {(t.confidence * 100).toFixed(0)}%</p>
                    )}
                    {t.sources && t.sources.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Sources</p>
                        {t.sources.map((s, j) => {
                          const Icon = SOURCE_ICON[s.type] ?? FileText;
                          return (
                            <div key={j} className="flex items-start gap-2 text-xs">
                              <Icon className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                              <span className="text-muted-foreground"><span className="font-medium text-foreground">{s.type}</span> · {s.snippet}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {t.suggestedActions && t.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {t.suggestedActions.map((a, j) => (
                          <Badge key={j} variant="outline" className="text-2xs">{a.label}</Badge>
                        ))}
                      </div>
                    )}
                    {t.followUpQuestions && t.followUpQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {t.followUpQuestions.map((fq, j) => (
                          <button key={j} onClick={() => send(fq)} className="rounded-full border px-3 py-1 text-xs hover:bg-muted transition-colors">{fq}</button>
                        ))}
                      </div>
                    )}
                    {t.agentTrace && t.agentTrace.length > 0 && (
                      <AgentReasoningTrace steps={t.agentTrace} toolsUsed={t.toolsUsed} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* input bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="sticky bottom-4 flex items-center gap-2 rounded-xl border bg-background p-2 shadow-sm"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the copilot about candidates, roles, or metrics…"
          className="border-0 focus-visible:ring-0 shadow-none"
        />
        <Button type="submit" size="sm" disabled={busy || !input.trim()} className="gap-1.5">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Ask
        </Button>
      </form>
    </div>
  );
}
