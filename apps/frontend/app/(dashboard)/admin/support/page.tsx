"use client";

/**
 * Phase 32b — super-admin support ticket triage.
 *
 * Lists every open ticket across all tenants, plus a filter for RESOLVED.
 * Clicking a ticket opens the thread view with the same reply UI as the
 * tenant side — but super-admins can also flag messages as internal-only
 * (visible only to other SUPER_ADMINs) and change status/priority.
 */
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LifeBuoy, MessageSquare, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Ticket {
  id: string;
  tenantId: string;
  subject: string;
  status: "OPEN" | "AWAITING_CUSTOMER" | "RESOLVED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  category: string | null;
  openedByEmail: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  authorRole: "CUSTOMER" | "SUPPORT";
  authorEmail: string;
  body: string;
  isInternal: boolean;
  createdAt: string;
}

const STATUS_COLOR: Record<Ticket["status"], string> = {
  OPEN: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  AWAITING_CUSTOMER: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  RESOLVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};
const PRIORITY_COLOR: Record<Ticket["priority"], string> = {
  LOW: "text-muted-foreground",
  NORMAL: "",
  HIGH: "text-amber-600 dark:text-amber-400",
  URGENT: "text-rose-600 dark:text-rose-400 font-bold",
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminSupportPage() {
  const { isSuperAdmin } = usePermissions();
  if (!isSuperAdmin) return <AccessDenied />;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter && statusFilter !== "all"
        ? `${API_BASE}/super-admin/support/tickets?status=${statusFilter}`
        : `${API_BASE}/super-admin/support/tickets`;
      const res = await fetch(url, { credentials: "include", headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      setTickets(body.data ?? body);
    } catch { toast.error("Couldn't load tickets"); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
            <p className="text-muted-foreground text-sm">
              All open customer tickets across every tenant.
            </p>
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="AWAITING_CUSTOMER">Awaiting customer</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            {loading ? "Loading…" : `${tickets.length} tickets`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tickets.length === 0 && !loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No tickets.</div>
          ) : (
            <ul className="divide-y divide-border/40">
              {tickets.map((t) => (
                <li key={t.id} className="hover:bg-muted/30">
                  <button onClick={() => setOpenTicketId(t.id)} className="w-full text-left px-4 py-3 flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`font-medium truncate ${PRIORITY_COLOR[t.priority]}`}>{t.subject}</p>
                        {t.priority !== "NORMAL" && (
                          <Badge variant="outline" className={`text-2xs ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Tenant <span className="font-mono">{t.tenantId.slice(0, 8)}</span> · {t.openedByEmail} · Updated {new Date(t.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-2xs ${STATUS_COLOR[t.status]}`}>
                      {t.status.replace("_", " ")}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {openTicketId && (
        <AdminTicketDialog
          ticketId={openTicketId}
          onClose={() => setOpenTicketId(null)}
          onUpdated={() => fetchList()}
        />
      )}
    </div>
  );
}

// ─── Super-admin ticket dialog (with internal-note + status controls) ────
function AdminTicketDialog({ ticketId, onClose, onUpdated }: {
  ticketId: string; onClose: () => void; onUpdated: () => void;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/support/tickets/${ticketId}`, { credentials: "include", headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      setTicket(body.data ?? body);
    } catch { toast.error("Couldn't load ticket"); onClose(); }
  }, [ticketId, onClose]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const sendReply = async () => {
    if (reply.length < 1) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ body: reply, isInternal: internal }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setReply(""); setInternal(false);
      await fetchTicket(); onUpdated();
    } catch { toast.error("Couldn't send"); }
    finally { setSending(false); }
  };

  const updateStatus = async (status: string) => {
    try {
      const res = await fetch(`${API_BASE}/super-admin/support/tickets/${ticketId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await fetchTicket(); onUpdated();
      toast.success(`Marked ${status.replace("_", " ").toLowerCase()}`);
    } catch { toast.error("Couldn't update"); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        {!ticket ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 flex-wrap">
                {ticket.subject}
                <Badge variant="outline" className={`text-2xs ${STATUS_COLOR[ticket.status]}`}>{ticket.status.replace("_", " ")}</Badge>
                <Badge variant="outline" className={`text-2xs ${PRIORITY_COLOR[ticket.priority]}`}>{ticket.priority}</Badge>
              </DialogTitle>
              <DialogDescription>
                Tenant <span className="font-mono">{ticket.tenantId}</span> · Opened by {ticket.openedByEmail} · {new Date(ticket.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {ticket.messages?.map((m) => (
                <div key={m.id} className={`rounded-lg border p-3 text-sm ${
                  m.isInternal ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30" :
                  m.authorRole === "SUPPORT" ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                }`}>
                  <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <strong className="text-foreground">{m.authorEmail}</strong> · {m.authorRole}
                      {m.isInternal && <Badge variant="outline" className="text-2xs ml-1 gap-1"><Lock className="h-2.5 w-2.5" /> internal</Badge>}
                    </span>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>

            {ticket.status !== "RESOLVED" && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reply" className="text-xs">Reply</Label>
                  <label className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="h-3 w-3" />
                    Internal note (customer won't see)
                  </label>
                </div>
                <Textarea id="reply" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" />
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus("RESOLVED")} className="text-xs">Mark resolved</Button>
                    {ticket.status === "OPEN" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus("AWAITING_CUSTOMER")} className="text-xs">Awaiting customer</Button>
                    )}
                  </div>
                  <Button onClick={sendReply} disabled={sending || reply.length < 1} size="sm" className="gap-1.5">
                    <Send className="h-3.5 w-3.5" /> {sending ? "Sending…" : "Send"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
