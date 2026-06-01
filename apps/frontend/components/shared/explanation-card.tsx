"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfidenceMeter } from "./confidence-meter";
import { Brain, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExplanationCardProps {
  title: string;
  decision: string;
  confidence: number;
  reasoning: string[];
  reasonCodes?: string[];
  modelName?: string;
  modelVersion?: string;
  onApprove?: () => void;
  onOverride?: () => void;
  className?: string;
}

export function ExplanationCard({ title, decision, confidence, reasoning, reasonCodes, modelName, modelVersion, onApprove, onOverride, className }: ExplanationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn("border-ai/30 bg-ai-tint/40", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-ai-tint flex items-center justify-center">
              <Brain className="h-3.5 w-3.5 text-ai" />
            </div>
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          <Badge className="bg-ai-tint text-ai-ink border-transparent">AI Decision</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{decision}</span>
          <ConfidenceMeter value={confidence} size="sm" className="w-32" />
        </div>
        {reasonCodes && reasonCodes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reasonCodes.map((code, i) => (
              <Badge key={i} variant="outline" className="text-2xs">{code}</Badge>
            ))}
          </div>
        )}
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-2xs text-ai-ink hover:text-ai font-medium">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide" : "Show"} reasoning
        </button>
        {expanded && (
          <div className="space-y-2 text-sm bg-surface rounded-md p-3 border">
            {reasoning.map((r, i) => (
              <p key={i} className="text-muted-foreground">{i + 1}. {r}</p>
            ))}
          </div>
        )}
        {(onApprove || onOverride) && (
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-2xs text-muted-foreground">
              {modelName && <>Powered by {modelName}{modelVersion && ` v${modelVersion}`}</>}
            </div>
            <div className="flex gap-2">
              {onOverride && <Button size="sm" variant="outline" onClick={onOverride} className="h-7 text-2xs"><XCircle className="h-3 w-3 mr-1" />Override</Button>}
              {onApprove && <Button size="sm" variant="success" onClick={onApprove} className="h-7 text-2xs"><CheckCircle2 className="h-3 w-3 mr-1" />Approve</Button>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
