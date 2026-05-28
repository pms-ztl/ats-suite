"use client";

/**
 * Admin → Platform → Audit log
 *
 * Append-only history of every super-admin platform action:
 *   - Kill switch toggles (from PlatformKillAudit)
 *   - Prompt overrides + rollbacks (from PromptOverride history)
 *
 * Combined into a single chronological feed so incident response can
 * answer "what happened to the platform between Tuesday and Wednesday?"
 *
 * Both data sources come from the same backend service, joined on the
 * frontend. Pagination is naive (limit=100 per source) — sufficient for
 * months of normal activity. Add infinite scroll later if anyone ever
 * needs >100 events per kind.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Power, Brain, Loader2, Filter, History, User as UserIcon, AlertTriangle } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface KillAuditRow {
  id: string;
  agentType: string;
  disabled: boolean;
  reason: string | null;
  actorUserId: string | null;
  createdAt: string;
}

interface PromptOverrideRow {
  id: string;
  agentType: string;
  systemPrompt: string | null;
  modelName: string | null;
  temperature: number | null;
  version: number;
  isActive: boolean;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
}

type Event =
  | { kind: "kill"; row: KillAuditRow }
  | { kind: "prompt"; row: PromptOverrideRow; agentType: string };

export default function PlatformAuditPage() {
  const [loading, setLoading] = useState(true);
  const [killAudit, setKillAudit] = useState<KillAuditRow[]>([]);
  const [promptHistory, setPromptHistory] = useState<Array<{ agentType: string; rows: PromptOverrideRow[] }>>([]);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "kill" | "prompt">("all");

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      // 1) Kill switch audit — one call, scoped on backend
      const auditRes = await fetch(`${API_BASE}/super-admin/platform/audit?limit=200`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!auditRes.ok) throw new Error(`audit HTTP ${auditRes.status}`);
      const auditBody = await auditRes.json();
      setKillAudit((auditBody.data ?? auditBody).audit ?? []);

      // 2) Prompt history — one call per agent (parallel). We list all
      // agents then fan out to fetch each one's history. Capped at 20
      // calls (we have <20 agents) which is fine for an audit page.
      const promptsRes = await fetch(`${API_BASE}/super-admin/platform/prompts`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const promptsBody = await promptsRes.json();
      const agentTypes: string[] = ((promptsBody.data ?? promptsBody).prompts ?? []).map(
        (p: any) => p.agentType,
      );

      const histories = await Promise.all(
        agentTypes.map(async (agentType) => {
          const res = await fetch(
            `${API_BASE}/super-admin/platform/prompts/${encodeURIComponent(agentType)}`,
            { headers: { Authorization: `Bearer ${getToken()}` } },
          );
          if (!res.ok) return { agentType, rows: [] as PromptOverrideRow[] };
          const body = await res.json();
          const data = body.data ?? body;
          // Active row is also worth showing in the audit feed (its
          // creation was an action). Combine active + history.
          const rows: PromptOverrideRow[] = [
            ...(data.active ? [data.active] : []),
            ...(data.history ?? []),
          ];
          return { agentType, rows };
        }),
      );
      setPromptHistory(histories);
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't load audit log");
    } finally {
      setLoading(false);
    }
  }

  const events: Event[] = useMemo(() => {
    const all: Event[] = [
      ...killAudit.map((row) => ({ kind: "kill" as const, row })),
      ...promptHistory.flatMap(({ agentType, rows }) =>
        rows.map((row) => ({ kind: "prompt" as const, row, agentType })),
      ),
    ];
    all.sort((a, b) => new Date(b.row.createdAt).getTime() - new Date(a.row.createdAt).getTime());
    return all;
  }, [killAudit, promptHistory]);

  const filtered = events.filter((e) => {
    if (kindFilter !== "all" && e.kind !== kindFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    if (e.kind === "kill") {
      return (
        e.row.agentType.toLowerCase().includes(q) ||
        (e.row.reason ?? "").toLowerCase().includes(q) ||
        (e.row.actorUserId ?? "").toLowerCase().includes(q)
      );
    }
    return (
      e.row.agentType.toLowerCase().includes(q) ||
      (e.row.notes ?? "").toLowerCase().includes(q) ||
      (e.row.createdByUserId ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading audit log…
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
      </Link>

      <PageHeader
        title="Platform audit log"
        description="Every super-admin action that mutated the platform — kill switches, prompt overrides, rollbacks. Append-only, sorted newest first."
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by agent, reason, user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {(["all", "kill", "prompt"] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={kindFilter === k ? "default" : "outline"}
              onClick={() => setKindFilter(k)}
            >
              {k === "all" ? "All" : k === "kill" ? "Kill switches" : "Prompts"}
            </Button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4" />
            {filtered.length} events
            {filtered.length !== events.length && (
              <span className="text-muted-foreground font-normal text-sm">(of {events.length})</span>
            )}
          </CardTitle>
          <CardDescription>Most recent first. Click an event to inspect.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No events match.</p>
          ) : (
            <ol className="divide-y">
              {filtered.map((e) => (
                <li key={`${e.kind}-${e.row.id}`} className="p-4 hover:bg-muted/40 transition-colors">
                  {e.kind === "kill" ? <KillEvent row={e.row} /> : <PromptEvent row={e.row} />}
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function KillEvent({ row }: { row: KillAuditRow }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
          row.disabled
            ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        }`}
      >
        <Power className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="font-medium text-sm">
            <span className="font-mono">{row.agentType}</span>{" "}
            <Badge variant={row.disabled ? "destructive" : "default"} className="font-normal ml-1">
              {row.disabled ? "killed" : "re-enabled"}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Date(row.createdAt).toLocaleString()}
          </span>
        </div>
        {row.reason && (
          <div className="text-xs text-amber-700 dark:text-amber-400 inline-flex items-start gap-1">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{row.reason}</span>
          </div>
        )}
        {row.actorUserId && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <UserIcon className="w-3 h-3" />
            <span className="font-mono">{row.actorUserId.slice(0, 8)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function PromptEvent({ row }: { row: PromptOverrideRow }) {
  const fields = [
    row.systemPrompt && "system prompt",
    row.modelName && `model→${row.modelName}`,
    row.temperature != null && `temp→${row.temperature}`,
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
        <Brain className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="font-medium text-sm">
            <span className="font-mono">{row.agentType}</span>{" "}
            <Badge variant="secondary" className="font-normal ml-1">
              v{row.version} {row.isActive && "· active"}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {new Date(row.createdAt).toLocaleString()}
          </span>
        </div>
        {fields.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Overrode: {fields.join(", ")}
          </div>
        )}
        {row.notes && <div className="text-xs">{row.notes}</div>}
        {row.createdByUserId && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <UserIcon className="w-3 h-3" />
            <span className="font-mono">{row.createdByUserId.slice(0, 8)}</span>
            <Link
              href={`/admin/platform/prompts?agent=${row.agentType}`}
              className="ml-2 text-primary hover:underline"
            >
              Open in editor →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
