"use client";

/**
 * Tenant-configurable interview rounds (Batch 5).
 *
 *  - Drag-to-reorder rounds via native HTML5 drag-drop
 *  - Add round modal with type + duration + auto-advance toggle + instructions
 *  - Edit / delete per round
 *  - PLAN-GATED: STARTER+ only (FREE shows upgrade prompt)
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronLeft, Plus, GripVertical, Trash2, Edit2, Clock,
  Phone, Code2, Heart, Users, Trophy, Sparkles, RefreshCw,
} from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const t = window.sessionStorage.getItem("ats-access-token");
    if (t) h["Authorization"] = `Bearer ${t}`;
  } catch {}
  return h;
}

interface InterviewRound {
  id: string;
  name: string;
  order: number;
  interviewType: string;
  durationMinutes: number;
  instructions: string | null;
  autoAdvanceOnPass: boolean;
  defaultPanelistRole: string | null;
}

const TYPE_META: Record<string, { icon: React.ReactNode; color: string }> = {
  PHONE_SCREEN: { icon: <Phone className="h-3.5 w-3.5" />,   color: "text-info bg-info/10" },
  TECHNICAL:    { icon: <Code2 className="h-3.5 w-3.5" />,   color: "text-ai-ink bg-ai/10" },
  BEHAVIORAL:   { icon: <Heart className="h-3.5 w-3.5" />,   color: "text-danger bg-danger/10" },
  PANEL:        { icon: <Users className="h-3.5 w-3.5" />,   color: "text-warn bg-warn/10" },
  FINAL:        { icon: <Trophy className="h-3.5 w-3.5" />,  color: "text-ok bg-ok/10" },
};

const EMPTY_FORM: Omit<InterviewRound, "id" | "order"> = {
  name: "",
  interviewType: "TECHNICAL",
  durationMinutes: 60,
  instructions: "",
  autoAdvanceOnPass: false,
  defaultPanelistRole: null,
};

export default function InterviewRoundsPage() {
  const params = useParams<{ id: string }>();
  const { isTenantAdmin } = usePermissions();

  const [rounds, setRounds] = useState<InterviewRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [planBlocked, setPlanBlocked] = useState(false);
  const [editing, setEditing] = useState<InterviewRound | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const fetchRounds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/requisitions/${params.id}/rounds`, {
        headers: authHeaders(),
        credentials: "include",
      });
      if (res.status === 402) {
        setPlanBlocked(true);
        setRounds([]);
      } else if (res.ok) {
        const data = await res.json();
        setRounds(data.data ?? data ?? []);
      }
    } catch {}
    setLoading(false);
  }, [params.id]);

  useEffect(() => { if (params.id) fetchRounds(); }, [params.id, fetchRounds]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (r: InterviewRound) => {
    setEditing(r);
    setForm({
      name: r.name,
      interviewType: r.interviewType,
      durationMinutes: r.durationMinutes,
      instructions: r.instructions ?? "",
      autoAdvanceOnPass: r.autoAdvanceOnPass,
      defaultPanelistRole: r.defaultPanelistRole,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Round name is required");
      return;
    }
    setSubmitting(true);
    try {
      const url = editing
        ? `${API_BASE}/rounds/${editing.id}`
        : `${API_BASE}/requisitions/${params.id}/rounds`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          interviewType: form.interviewType,
          durationMinutes: form.durationMinutes,
          instructions: form.instructions || undefined,
          autoAdvanceOnPass: form.autoAdvanceOnPass,
          defaultPanelistRole: form.defaultPanelistRole || undefined,
        }),
      });
      if (res.status === 402) {
        toast.error("Configurable interview rounds require STARTER plan or higher");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? `${res.status}`);
      }
      toast.success(editing ? "Round updated" : "Round added");
      setDialogOpen(false);
      fetchRounds();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save round");
    }
    setSubmitting(false);
  };

  const deleteRound = async (id: string) => {
    if (!confirm("Delete this round? Existing interviews will be detached.")) return;
    try {
      await fetch(`${API_BASE}/rounds/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
        credentials: "include",
      });
      toast.success("Round deleted");
      fetchRounds();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Drag-reorder
  const handleDrop = async (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const reordered = [...rounds];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setRounds(reordered);
    setDraggedIdx(null);
    try {
      await fetch(`${API_BASE}/requisitions/${params.id}/rounds/reorder`, {
        method: "PUT",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ order: reordered.map((r) => r.id) }),
      });
    } catch {
      toast.error("Failed to save order");
      fetchRounds();
    }
  };

  if (!isTenantAdmin) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/requisitions/${params.id}`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-3 w-3" /> Back to requisition
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interview Rounds</h1>
            <p className="text-sm text-muted-foreground">
              Define the interview pipeline for this role. Drag rows to reorder.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRounds} className="gap-1">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button onClick={openAdd} className="glow-primary gap-1.5" disabled={planBlocked}>
              <Plus className="h-4 w-4" /> Add round
            </Button>
          </div>
        </div>
      </div>

      {/* Plan upgrade banner */}
      {planBlocked && (
        <Card className="border-warn/40 bg-warn-tint">
          <CardContent className="p-5 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-ai shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-warn">
                Custom interview rounds require STARTER plan or higher
              </p>
              <p className="text-xs text-warn dark:text-warn mt-1">
                On the FREE plan, all interviews use a single default round. Upgrade to design
                multi-round pipelines unique to each role (e.g. Phone Screen → Coding → HR Loop).
              </p>
              <Link href="/billing" className="inline-block text-xs font-semibold text-warn underline mt-2">
                View pricing →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rounds list */}
      {loading ? (
        <div className="text-center py-10 text-sm text-muted-foreground">Loading…</div>
      ) : rounds.length === 0 && !planBlocked ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No rounds defined yet</p>
            <p className="text-xs mb-4">Add your first round to design the interview pipeline.</p>
            <Button onClick={openAdd} className="glow-primary gap-1.5">
              <Plus className="h-4 w-4" /> Add first round
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rounds.map((r, i) => {
            const meta = TYPE_META[r.interviewType] ?? TYPE_META.PANEL;
            return (
              <div
                key={r.id}
                draggable
                onDragStart={() => setDraggedIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-xl border bg-card transition-all hover:border-primary/30",
                  draggedIdx === i && "opacity-50"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", meta.color)}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-2xs">Round {r.order}</Badge>
                    <span className="font-semibold text-sm truncate">{r.name}</span>
                    {r.autoAdvanceOnPass && (
                      <Badge variant="secondary" className="text-2xs gap-0.5">
                        <Sparkles className="h-2.5 w-2.5" /> Auto-advance
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{r.interviewType.replace(/_/g, " ").toLowerCase()}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.durationMinutes}min</span>
                    {r.defaultPanelistRole && (
                      <span>Default panelist: {r.defaultPanelistRole.replace(/_/g, " ").toLowerCase()}</span>
                    )}
                  </div>
                  {r.instructions && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.instructions}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteRound(r.id)} className="text-danger hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit round" : "Add interview round"}</DialogTitle>
            <DialogDescription>
              Configure a stage in this requisition&apos;s interview pipeline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Coding Test, Technical Deep-Dive"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.interviewType} onValueChange={(v) => setForm({ ...form, interviewType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PHONE_SCREEN">Phone Screen</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                    <SelectItem value="PANEL">Panel</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  min={15}
                  max={480}
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Default panelist role</Label>
              <Select
                value={form.defaultPanelistRole ?? "none"}
                onValueChange={(v) => setForm({ ...form, defaultPanelistRole: v === "none" ? null : v })}
              >
                <SelectTrigger><SelectValue placeholder="No suggestion" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No suggestion</SelectItem>
                  <SelectItem value="RECRUITER">Recruiter</SelectItem>
                  <SelectItem value="HIRING_MANAGER">Hiring Manager</SelectItem>
                  <SelectItem value="INTERVIEWER">Interviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Instructions for interviewers</Label>
              <Textarea
                value={form.instructions ?? ""}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                placeholder="e.g. Focus on system-design fundamentals…"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <Label className="text-sm cursor-pointer" htmlFor="auto-advance">Auto-advance on PASS</Label>
                <p className="text-2xs text-muted-foreground">
                  When feedback recommendation = HIRE, automatically create the next round&apos;s interview.
                </p>
              </div>
              <Switch
                id="auto-advance"
                checked={form.autoAdvanceOnPass}
                onCheckedChange={(c) => setForm({ ...form, autoAdvanceOnPass: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={save} disabled={submitting} className="glow-primary">
              {submitting ? "Saving…" : editing ? "Save changes" : "Add round"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
