"use client";

/**
 * Super-admin plan-change request queue (Batch 3).
 */
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  Crown, Building2, CheckCircle2, XCircle, ChevronLeft,
  Sparkles, RefreshCw, Inbox, Rocket, Zap,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface PCR {
  id: string;
  tenantId: string;
  fromPlan: string;
  toPlan: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason: string | null;
  requestedAt: string;
  decisionNote: string | null;
  tenant?: { id: string; name: string; slug: string; plan: string; status: string };
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  FREE:         <Rocket className="h-3.5 w-3.5" />,
  STARTER:      <Zap className="h-3.5 w-3.5" />,
  PROFESSIONAL: <Crown className="h-3.5 w-3.5" />,
  ENTERPRISE:   <Building2 className="h-3.5 w-3.5" />,
};

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const t = window.sessionStorage.getItem("ats-access-token");
    if (t) h["Authorization"] = `Bearer ${t}`;
  } catch {}
  const sec = process.env.NEXT_PUBLIC_SUPER_ADMIN_SECRET;
  if (sec) h["X-Super-Admin-Key"] = sec;
  return h;
}

export default function PlanRequestsPage() {
  const { user } = useCurrentUser();
  const router = useRouter();

  const [requests, setRequests] = useState<PCR[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "CANCELLED">("PENDING");
  const [actioning, setActioning] = useState<PCR | null>(null);
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") router.replace("/");
  }, [user, router]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/plan-change-requests?status=${statusFilter}`, {
        headers: authHeaders(),
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data ?? data ?? []);
      }
    } catch {}
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const submitDecision = async () => {
    if (!actioning || !action) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/plan-change-requests/${actioning.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        credentials: "include",
        body: JSON.stringify({ action, note: note || undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message ?? err?.message ?? "Failed");
      }
      toast.success(action === "APPROVE" ? "Plan upgraded ✓" : "Request rejected");
      setActioning(null);
      setAction(null);
      setNote("");
      fetchRequests();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to submit decision");
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2">
          <ChevronLeft className="h-3 w-3" /> Back to platform admin
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Plan Change Requests</h1>
            <p className="text-sm text-muted-foreground">Approve or reject tenant upgrade requests</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
              statusFilter === s
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="text-center py-10 text-sm text-muted-foreground">Loading…</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-2 text-muted-foreground">
          <Inbox className="h-10 w-10 opacity-50" />
          <p className="text-sm">No {statusFilter.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id} className="glass-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: tenant + plan change */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/admin?tenant=${r.tenantId}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {r.tenant?.name ?? r.tenantId}
                      </Link>
                      <Badge variant="outline" className="text-2xs">{r.tenant?.slug}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                        {PLAN_ICONS[r.fromPlan]} {r.fromPlan}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-primary/10 text-primary font-semibold">
                        {PLAN_ICONS[r.toPlan]} {r.toPlan}
                      </span>
                    </div>
                    {r.reason && (
                      <p className="text-xs text-muted-foreground italic mt-1">&quot;{r.reason}&quot;</p>
                    )}
                    {r.decisionNote && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Decision note:</strong> {r.decisionNote}
                      </p>
                    )}
                    <p className="text-2xs text-muted-foreground mt-2">
                      Requested {new Date(r.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Right: actions */}
                  {r.status === "PENDING" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="glow-primary gap-1.5"
                        onClick={() => { setActioning(r); setAction("APPROVE"); }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setActioning(r); setAction("REJECT"); }}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                  {r.status !== "PENDING" && (
                    <Badge
                      variant={r.status === "APPROVED" ? "default" : "secondary"}
                      className={cn(
                        r.status === "APPROVED" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                        r.status === "REJECTED" && "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {r.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Decision dialog */}
      <Dialog open={!!actioning} onOpenChange={(o) => !o && setActioning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === "APPROVE"
                ? <><Sparkles className="h-5 w-5 text-emerald-500" /> Approve plan change</>
                : <><XCircle className="h-5 w-5 text-amber-500" /> Reject plan change</>}
            </DialogTitle>
            <DialogDescription>
              {actioning && action === "APPROVE" && (
                <>
                  Upgrade <strong>{actioning.tenant?.name}</strong> from <strong>{actioning.fromPlan}</strong>{" "}
                  to <strong>{actioning.toPlan}</strong>. They will be immediately notified.
                </>
              )}
              {actioning && action === "REJECT" && (
                <>
                  Reject the upgrade request from <strong>{actioning.tenant?.name}</strong>.
                  Please add a brief note so they know why.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={action === "APPROVE" ? "Optional note (e.g. 'Welcome!')" : "Reason for rejection…"}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActioning(null)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={submitDecision}
              disabled={submitting || (action === "REJECT" && !note.trim())}
              className={action === "APPROVE" ? "glow-primary" : ""}
              variant={action === "APPROVE" ? "default" : "destructive"}
            >
              {submitting ? "Submitting…" : action === "APPROVE" ? "Confirm upgrade" : "Confirm rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
