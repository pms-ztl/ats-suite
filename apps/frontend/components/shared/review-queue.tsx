"use client";

import { useState } from "react";
import { SplitPane } from "./split-pane";
import { ExplanationCard } from "./explanation-card";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { cn, formatDateRelative } from "@/lib/utils";
import type { HumanReviewItem } from "@/types/models";

interface ReviewQueueProps {
  items: HumanReviewItem[];
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onEscalate?: (id: string) => void;
  className?: string;
}

export function ReviewQueue({ items, onApprove, onReject, onEscalate, className }: ReviewQueueProps) {
  const [selectedId, setSelectedId] = useState<string | null>(items[0]?.id || null);
  const [rejectReason, setRejectReason] = useState("");
  const selected = items.find(item => item.id === selectedId);

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();

  return (
    <SplitPane
      className={className}
      left={
        <div className="divide-y">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={cn("w-full text-left p-3 hover:bg-accent transition-colors", selectedId === item.id && "bg-primary/10 border-l-2 border-l-primary")}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{item.candidateName}</span>
                {isOverdue(item.slaDeadline) && <AlertTriangle className="h-3.5 w-3.5 text-danger shrink-0" />}
              </div>
              <p className="text-2xs text-muted-foreground truncate mt-0.5">{item.requisitionTitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={item.status} />
                <Badge variant={item.priority === "critical" ? "danger" : item.priority === "high" ? "warning" : "secondary"} className="text-2xs">{item.priority}</Badge>
              </div>
              <div className="flex items-center gap-1 mt-1 text-2xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className={isOverdue(item.slaDeadline) ? "text-danger font-medium" : ""}>{formatDateRelative(item.slaDeadline)}</span>
              </div>
            </button>
          ))}
        </div>
      }
      right={
        selected ? (
          <div className="p-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{selected.candidateName}</h2>
              <p className="text-sm text-muted-foreground">{selected.requisitionTitle}</p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={selected.status} />
                <span className="text-2xs text-muted-foreground font-mono">ID: {selected.id}</span>
              </div>
            </div>
            <ExplanationCard
              title="AI Assessment"
              decision={selected.aiDecision}
              confidence={selected.aiConfidence}
              reasoning={selected.reasoning}
            />
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Review Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Textarea placeholder="Reason for rejection (required if rejecting)..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="text-sm" />
                <div className="flex gap-2">
                  <Button variant="success" onClick={() => onApprove?.(selected.id)} className="flex-1"><CheckCircle2 className="h-4 w-4 mr-1" />Approve</Button>
                  <Button variant="destructive" onClick={() => onReject?.(selected.id, rejectReason)} disabled={!rejectReason} className="flex-1"><XCircle className="h-4 w-4 mr-1" />Reject</Button>
                  <Button variant="outline" onClick={() => onEscalate?.(selected.id)}><AlertTriangle className="h-4 w-4 mr-1" />Escalate</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">Select an item to review</div>
        )
      }
    />
  );
}
