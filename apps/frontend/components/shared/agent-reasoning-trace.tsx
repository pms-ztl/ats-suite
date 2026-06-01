"use client";

/**
 * AgentReasoningTrace, renders an agent's ReAct step trace so recruiters can
 * see HOW the AI reached its verdict: each thought, tool call, observation, and
 * the final answer, as a vertical timeline. Collapsed by default.
 *
 * Consumes the AgentStep[] produced by the agentic runtime
 * (packages/ai-engine/src/agentic.ts) and persisted on e.g. Screening.agentTrace.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Wrench, Eye, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronRight, Sparkles,
} from "lucide-react";

export interface AgentStep {
  index: number;
  kind: "reasoning" | "tool_call" | "observation" | "answer" | "error";
  text?: string;
  toolName?: string;
  args?: unknown;
  observation?: string;
  ok?: boolean;
}

const KIND_META: Record<
  AgentStep["kind"],
  { icon: typeof Brain; label: string; color: string; dot: string }
> = {
  reasoning:   { icon: Brain,        label: "Thought",     color: "text-ai-ink", dot: "bg-ai" },
  tool_call:   { icon: Wrench,       label: "Action",      color: "text-info",   dot: "bg-info" },
  observation: { icon: Eye,          label: "Observation", color: "text-ink-3",  dot: "bg-line-strong" },
  answer:      { icon: CheckCircle2, label: "Verdict",     color: "text-ok",     dot: "bg-ok" },
  error:       { icon: AlertTriangle,label: "Error",       color: "text-danger", dot: "bg-danger" },
};

function compact(value: unknown, max = 160): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "string" ? value : (() => { try { return JSON.stringify(value); } catch { return String(value); } })();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function AgentReasoningTrace({
  steps,
  toolsUsed,
  defaultOpen = false,
}: {
  steps: AgentStep[];
  toolsUsed?: string[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!Array.isArray(steps) || steps.length === 0) return null;

  const toolCalls = steps.filter((s) => s.kind === "tool_call").length;

  return (
    <Card className="border-ai/25">
      <CardHeader className="pb-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 text-left"
          aria-expanded={open}
        >
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai" />
            How the AI reached this decision
            <Badge variant="outline" className="text-2xs font-normal">
              {steps.length} steps · {toolCalls} tool calls
            </Badge>
          </CardTitle>
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        </button>
        {!open && toolsUsed && toolsUsed.length > 0 && (
          <p className="text-2xs text-muted-foreground pl-6">
            Tools used: {toolsUsed.join(", ")}
          </p>
        )}
      </CardHeader>

      {open && (
        <CardContent>
          <ol className="relative space-y-3 border-l border-border/60 pl-5">
            {steps.map((step, i) => {
              const meta = KIND_META[step.kind] ?? KIND_META.reasoning;
              const Icon = meta.icon;
              const failed = step.kind === "observation" && step.ok === false;
              return (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[1.42rem] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                      failed ? "bg-danger" : meta.dot
                    }`}
                  />
                  <div className="flex items-start gap-2">
                    <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${failed ? "text-danger" : meta.color}`} />
                    <div className="min-w-0 flex-1">
                      <span className={`text-2xs font-semibold uppercase tracking-wide ${failed ? "text-danger" : meta.color}`}>
                        {failed ? "Observation (failed)" : meta.label}
                      </span>
                      {step.kind === "tool_call" && (
                        <p className="text-xs font-mono break-words">
                          {step.toolName}
                          <span className="text-muted-foreground">({compact(step.args, 120)})</span>
                        </p>
                      )}
                      {step.kind === "observation" && (
                        <p className={`text-xs break-words ${failed ? "text-danger" : "text-muted-foreground"}`}>
                          {compact(step.observation, 220)}
                        </p>
                      )}
                      {(step.kind === "reasoning" || step.kind === "answer" || step.kind === "error") && step.text && (
                        <p className="text-xs break-words whitespace-pre-wrap">{step.text}</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      )}
    </Card>
  );
}
