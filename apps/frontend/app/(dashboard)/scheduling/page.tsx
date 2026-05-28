"use client";

import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CalendarDays, Plus, Clock, CheckCircle, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";
import { AgentReasoningTrace, type AgentStep } from "@/components/shared/agent-reasoning-trace";

interface ProposedSlot { start: string; end: string; score: number; availableParticipants: string[]; conflicts: string[] }
interface ScheduleSuggestion { proposedSlots?: ProposedSlot[]; agentTrace?: AgentStep[]; toolsUsed?: string[] }

interface ScheduleEvent {
  id: string;
  title?: string;
  type?: string;
  status?: string;
  startAt?: string;
  endAt?: string;
  scheduledAt?: string;
  location?: string;
  attendees?: string[];
  candidate?: { firstName: string; lastName: string };
  durationMinutes?: number;
  format?: string;
}

const TYPE_OPTIONS = ["ALL", "INTERVIEW", "MEETING", "OTHER"] as const;

const statusColor: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-orange-100 text-orange-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken() {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? "";
}

export default function SchedulingPage() {
  const { can } = usePermissions();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);

  // New event form
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("INTERVIEW");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formAttendees, setFormAttendees] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<ScheduleSuggestion | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Load interviews as schedule events
        const result = await api.interviews.listInterviews({ page: 1, pageSize: 100 });
        const list = result?.data ?? [];
        setEvents(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const filtered = useMemo(() => {
    if (typeFilter === "ALL") return events;
    return events.filter((e) => e.type === typeFilter);
  }, [events, typeFilter]);

  async function runAiSuggest() {
    const emails = formAttendees.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) {
      toast.error("Add at least one attendee email first");
      return;
    }
    setSuggesting(true);
    setSuggestion(null);
    try {
      const now = new Date();
      const start = formStart ? new Date(formStart) : now;
      const end = new Date(start.getTime() + 14 * 86400_000);
      const res = await fetch(`${API}/scheduling`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({
          participants: emails.map((email) => ({ email, role: "interviewer", busyWindows: [] })),
          durationMinutes: 60,
          dateRange: { start: start.toISOString(), end: end.toISOString() },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setSuggestion(json.data ?? json);
    } catch {
      toast.error("AI scheduling failed.");
    } finally {
      setSuggesting(false);
    }
  }

  function applySlot(slot: ProposedSlot) {
    // datetime-local wants "YYYY-MM-DDTHH:mm" in local time
    const toLocal = (iso: string) => {
      const d = new Date(iso);
      const off = d.getTimezoneOffset() * 60_000;
      return new Date(d.getTime() - off).toISOString().slice(0, 16);
    };
    setFormStart(toLocal(slot.start));
    setFormEnd(toLocal(slot.end));
    if (!formTitle) setFormTitle("Interview");
    toast.success("Slot applied to the form");
  }

  async function handleCreateEvent() {
    if (!formTitle || !formStart || !formEnd) {
      toast.error("Title, start, and end times are required.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch(`${API}/scheduling`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          title: formTitle,
          type: formType,
          startAt: new Date(formStart).toISOString(),
          endAt: new Date(formEnd).toISOString(),
          location: formLocation || undefined,
          attendees: formAttendees
            ? formAttendees.split(",").map((e) => e.trim())
            : undefined,
        }),
      });
      toast.success("Event scheduled successfully.");
      setDialogOpen(false);
      setFormTitle("");
      setFormType("INTERVIEW");
      setFormStart("");
      setFormEnd("");
      setFormLocation("");
      setFormAttendees("");
      setRetryCount((c) => c + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setSubmitting(false);
    }
  }

  // Stats
  const scheduled = events.filter(
    (e) => e.status === "SCHEDULED" || e.status === "CONFIRMED"
  ).length;
  const completed = events.filter((e) => e.status === "COMPLETED").length;
  const noShow = events.filter(
    (e) => e.status === "NO_SHOW" || e.status === "CANCELLED"
  ).length;

  if (!can("scheduling")) return <AccessDenied />;
  if (loading) return <PageSkeleton />;
  if (error)
    return <PageError message={error} onRetry={() => setRetryCount((c) => c + 1)} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduling"
        description="Interview calendar, slot management, and room booking"
        breadcrumbs={[{ label: "Scheduling" }]}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Schedule New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Interview with..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERVIEW">Interview</SelectItem>
                      <SelectItem value="MEETING">Meeting</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <Input
                      type="datetime-local"
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End</Label>
                    <Input
                      type="datetime-local"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Room / Meeting link"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attendees (comma-separated emails)</Label>
                  <Input
                    value={formAttendees}
                    onChange={(e) => setFormAttendees(e.target.value)}
                    placeholder="user@example.com, user2@example.com"
                  />
                </div>

                {/* AI suggest times */}
                <div className="space-y-2 rounded-md border border-primary/20 p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={runAiSuggest}
                    disabled={suggesting}
                  >
                    {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                    {suggesting ? "Finding times…" : "AI suggest times"}
                  </Button>
                  {suggestion?.proposedSlots && suggestion.proposedSlots.length > 0 && (
                    <div className="space-y-1">
                      {suggestion.proposedSlots.slice(0, 5).map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => applySlot(s)}
                          className="flex w-full items-center justify-between rounded-md border px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors"
                        >
                          <span>{new Date(s.start).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                          <span className={s.conflicts.length === 0 ? "text-emerald-600" : "text-amber-600"}>
                            {s.conflicts.length === 0 ? "all free" : `${s.conflicts.length} conflict${s.conflicts.length > 1 ? "s" : ""}`} · {(s.score * 100).toFixed(0)}%
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestion?.agentTrace && suggestion.agentTrace.length > 0 && (
                    <AgentReasoningTrace steps={suggestion.agentTrace} toolsUsed={suggestion.toolsUsed} />
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleCreateEvent}
                  disabled={submitting}
                >
                  {submitting ? "Scheduling..." : "Create Event"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: events.length, icon: CalendarDays },
          { label: "Upcoming", value: scheduled, icon: Clock },
          { label: "Completed", value: completed, icon: CheckCircle },
          { label: "Cancelled / No-show", value: noShow, icon: AlertCircle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "ALL" ? "All Types" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm font-medium">No events scheduled</p>
              <p className="text-xs mt-1">Click &quot;Schedule New&quot; to create an event.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium">Title</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Start</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                      End
                    </th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((ev) => {
                    const title =
                      ev.title ??
                      (ev.candidate
                        ? `${ev.candidate.firstName} ${ev.candidate.lastName}`
                        : ev.id);
                    const start = ev.startAt ?? ev.scheduledAt;
                    const displayStatus = ev.status ?? "SCHEDULED";
                    return (
                      <tr
                        key={ev.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{title}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {ev.type?.replace(/_/g, " ") ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {start
                            ? new Date(start).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                          {ev.endAt
                            ? new Date(ev.endAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ev.durationMinutes
                              ? `${ev.durationMinutes} min`
                              : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                          {ev.location ?? ev.format ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[displayStatus] ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {displayStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
