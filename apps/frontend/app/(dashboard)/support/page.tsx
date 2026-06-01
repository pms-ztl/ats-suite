"use client";

/**
 * Phase 32b, tenant-side support page.
 *
 * Tenants open and track tickets here. Clicking a ticket opens an inline
 * thread view; the FE-side state stays simple (no separate route per
 * ticket, easier to keep the wider conversation list in view).
 *
 * Customer rules:
 *   - Can open new tickets
 *   - Can view their tenant's tickets (filtered server-side)
 *   - Can reply but not flag messages as internal-only
 *   - Cannot change status/priority (those are super-admin only)
 */
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LifeBuoy, MessageSquare, Plus, Send } from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface Ticket {
  id: string;
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
  OPEN: "bg-info/15 text-info dark:text-info",
  AWAITING_CUSTOMER: "bg-warn/15 text-warn dark:text-warn",
  RESOLVED: "bg-ok/15 text-ok dark:text-ok",
};

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openTicketId, setOpenTicketId] = useState<string | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/support/tickets`, { credentials: "include", headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      setTickets(body.data ?? body);
    } catch { toast.error("Couldn't load tickets"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Support</h1>
            <p className="text-muted-foreground text-sm">
              Open a ticket and we'll get back to you. Typical response: within 1 business day.
            </p>
          </div>
        </div>
        <Button onClick={() => setNewTicketOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> New ticket
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Your tickets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No tickets yet. Click <strong>New ticket</strong> if you need help.
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {tickets.map((t) => (
                <li key={t.id} className="hover:bg-muted/30">
                  <button
                    onClick={() => setOpenTicketId(t.id)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        Opened {new Date(t.createdAt).toLocaleDateString()} · Last update {new Date(t.updatedAt).toLocaleString()}
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

      {newTicketOpen && (
        <NewTicketDialog
          onClose={() => setNewTicketOpen(false)}
          onCreated={() => { setNewTicketOpen(false); fetchList(); }}
        />
      )}

      {openTicketId && (
        <TicketThreadDialog
          ticketId={openTicketId}
          onClose={() => setOpenTicketId(null)}
          onUpdated={() => fetchList()}
        />
      )}
    </div>
  );
}

// ─── New ticket dialog ─────────────────────────────────────────────────────
function NewTicketDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (subject.length < 3) { toast.error("Subject is too short"); return; }
    if (body.length < 10)   { toast.error("Please add a bit more detail"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/support/tickets`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ subject, body, priority, category: category || undefined }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Ticket opened, we'll be in touch.");
      onCreated();
    } catch { toast.error("Couldn't open ticket"); }
    finally { setSubmitting(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open a support ticket</DialogTitle>
          <DialogDescription>One of our team will reply by email when there's an update.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-subject">Subject</Label>
            <Input id="t-subject" placeholder="Short summary" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="t-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-category">Category (optional)</Label>
              <Input id="t-category" placeholder="billing / bug / question" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-body">Describe the issue</Label>
            <Textarea id="t-body" rows={6} value={body} onChange={(e) => setBody(e.target.value)}
              placeholder="What happened? What were you trying to do? Steps to reproduce, error messages, etc." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button onClick={submit} disabled={submitting} className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> {submitting ? "Sending…" : "Open ticket"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Ticket thread dialog ─────────────────────────────────────────────────
function TicketThreadDialog({ ticketId, onClose, onUpdated }: {
  ticketId: string; onClose: () => void; onUpdated: () => void;
}) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
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

  const submit = async () => {
    if (reply.length < 1) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/support/tickets/${ticketId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ body: reply, isInternal: false }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setReply("");
      await fetchTicket();
      onUpdated();
    } catch { toast.error("Couldn't send reply"); }
    finally { setSending(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        {!ticket ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {ticket.subject}
                <Badge variant="outline" className={`text-2xs ${STATUS_COLOR[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Opened {new Date(ticket.createdAt).toLocaleString()} by {ticket.openedByEmail}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {ticket.messages?.map((m) => (
                <div key={m.id} className={`rounded-lg border p-3 text-sm ${
                  m.authorRole === "SUPPORT" ? "bg-primary/5 border-primary/30" : "bg-muted/30"
                }`}>
                  <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                    <span><strong className="text-foreground">{m.authorEmail}</strong> · {m.authorRole}</span>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>

            {ticket.status !== "RESOLVED" && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="reply" className="text-xs">Reply</Label>
                <Textarea id="reply" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" />
                <div className="flex justify-end">
                  <Button onClick={submit} disabled={sending || reply.length < 1} size="sm" className="gap-1.5">
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
