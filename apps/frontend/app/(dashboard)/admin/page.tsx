"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// PageHeader uses breadcrumbs — use inline header for super-admin
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2, Users, BarChart3, DollarSign, TrendingUp,
  Search, MoreHorizontal, ExternalLink, Ban, CheckCircle2,
  Rocket, Zap, Crown, RefreshCw, AlertTriangle, Power, Brain, FileText, UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";

// ── Types ────────────────────────────────────────────────────────────────────
interface TenantRow {
  id: string;
  name: string;
  slug: string;
  plan: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  status: "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED";
  trialEndsAt: string | null;
  industry: string | null;
  companySize: string | null;
  createdAt: string;
  userCount: number;
  requisitionCount: number;
  candidateCount: number;
  agentRunCount: number;
  costUsd30d: number;
}

interface Stats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  planBreakdown: Record<string, number>;
  totalUsers: number;
  totalCandidates: number;
  totalRequisitions: number;
  totalCostUsd30d: number;
  recentTenants: { id: string; name: string; plan: string; status: string; createdAt: string }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const PLAN_META: Record<string, { icon: React.ReactNode; badge: string; color: string }> = {
  FREE:         { icon: <Rocket className="h-3.5 w-3.5" />, badge: "Free",         color: "bg-muted text-muted-foreground" },
  STARTER:      { icon: <Zap className="h-3.5 w-3.5" />,    badge: "Starter",      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  PROFESSIONAL: { icon: <Crown className="h-3.5 w-3.5" />,  badge: "Professional", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  ENTERPRISE:   { icon: <Building2 className="h-3.5 w-3.5" />, badge: "Enterprise", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

const STATUS_META: Record<string, { badge: string; color: string }> = {
  TRIAL:     { badge: "Trial",     color: "bg-blue-50 text-blue-600 border-blue-200" },
  ACTIVE:    { badge: "Active",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SUSPENDED: { badge: "Suspended", color: "bg-amber-50 text-amber-700 border-amber-200" },
  CANCELLED: { badge: "Cancelled", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
}

function authHeaders() {
  let token: string | null = null;
  try { token = window.sessionStorage.getItem("ats-access-token"); } catch {}
  const secret = process.env.NEXT_PUBLIC_SUPER_ADMIN_SECRET;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (secret) h["X-Super-Admin-Key"] = secret;
  return h;
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KPI({ label, value, icon, sub }: { label: string; value: string | number; icon: React.ReactNode; sub?: string }) {
  return (
    <Card className="glass-hover gradient-card">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SuperAdminPage() {
  const { user } = useCurrentUser();
  const router   = useRouter();

  const [stats, setStats]         = useState<Stats | null>(null);
  const [tenants, setTenants]     = useState<TenantRow[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [planFilter, setPlanFilter]   = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading]     = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Guard: only SUPER_ADMIN or ADMIN may view
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/super-admin/stats`, {
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data ?? data);
      }
    } catch {}
    setStatsLoading(false);
  }, []);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (planFilter !== "ALL") params.set("plan", planFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`${getApiBase()}/super-admin/tenants?${params}`, {
        credentials: "include",
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        const payload = data.data ?? data;
        setTenants(Array.isArray(payload) ? payload : payload.data ?? []);
        setTotal(payload.total ?? 0);
      }
    } catch {}
    setLoading(false);
  }, [page, search, planFilter, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchTenants(); }, [fetchTenants]);

  // Phase 32a — start an impersonation session as the tenant's first ADMIN.
  // Backend signs a 1-hour JWT, sets the cookie, and we hard-nav to / so
  // the auth context re-fetches /auth/me with the new identity.
  const impersonateTenant = async (id: string, name: string) => {
    if (!confirm(`Impersonate ${name}? Every action will be audited and the session expires in 1 hour.`)) return;
    try {
      const res = await fetch(`${getApiBase()}/super-admin/impersonate/${id}/start`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as any));
        throw new Error(body?.error?.message ?? body?.message ?? `${res.status}`);
      }
      toast.success(`Now impersonating ${name} — taking you to their dashboard…`);
      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Couldn't start impersonation");
    }
  };

  const updateTenant = async (id: string, body: Record<string, string>) => {
    try {
      const res = await fetch(`${getApiBase()}/super-admin/tenants/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Tenant updated");
      fetchTenants();
      fetchStats();
    } catch (e: any) {
      toast.error(e.message || "Failed to update tenant");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
            <Badge variant="secondary" className="text-xs">Platform</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Manage all tenants on the CDC ATS platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchTenants(); }} className="gap-2 shrink-0">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* ── KPI Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Total tenants"
          value={statsLoading ? "—" : stats?.totalTenants ?? 0}
          icon={<Building2 className="h-5 w-5" />}
          sub={`${stats?.activeTenants ?? 0} active · ${stats?.trialTenants ?? 0} trial`}
        />
        <KPI
          label="Total users"
          value={statsLoading ? "—" : stats?.totalUsers ?? 0}
          icon={<Users className="h-5 w-5" />}
        />
        <KPI
          label="Total candidates"
          value={statsLoading ? "—" : stats?.totalCandidates ?? 0}
          icon={<BarChart3 className="h-5 w-5" />}
          sub={`${stats?.totalRequisitions ?? 0} requisitions`}
        />
        <KPI
          label="AI spend (30d)"
          value={statsLoading ? "—" : `$${(stats?.totalCostUsd30d ?? 0).toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* ── Platform control plane (Phase 21 + 22) ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/admin/platform/agents" className="block">
          <Card className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Power className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Agent control plane</p>
                <p className="text-xs text-muted-foreground line-clamp-2">Global kill switch — disable any agent for every tenant in 1 click.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/platform/cost" className="block">
          <Card className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Cross-tenant cost</p>
                <p className="text-xs text-muted-foreground line-clamp-2">See AI spend per tenant + per agent across the whole platform.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/platform/prompts" className="block">
          <Card className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Prompt control plane</p>
                <p className="text-xs text-muted-foreground line-clamp-2">Edit agent system prompts + model + temperature with version history.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/platform/audit" className="block">
          <Card className="border-border/60 hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">Audit log</p>
                <p className="text-xs text-muted-foreground line-clamp-2">Every kill switch toggle + prompt change with who/when/why.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Plan breakdown ───────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(PLAN_META).map(([plan, meta]) => (
            <Card key={plan} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", meta.color)}>
                  {meta.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{meta.badge}</p>
                  <p className="text-xl font-bold">{stats.planBreakdown?.[plan] ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, slug, website…"
            className="pl-8 h-9"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={planFilter} onValueChange={v => { setPlanFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All plans" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All plans</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="STARTER">Starter</SelectItem>
            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
            <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="TRIAL">Trial</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{total} tenants</span>
      </div>

      {/* ── Tenant table ─────────────────────────────────────────────────── */}
      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Users</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jobs</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidates</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI cost (30d)</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">Loading tenants…</td></tr>
              ) : tenants.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">No tenants found</td></tr>
              ) : (
                tenants.map((t) => {
                  const plan   = PLAN_META[t.plan] ?? PLAN_META.FREE;
                  const status = STATUS_META[t.status] ?? STATUS_META.ACTIVE;
                  const daysLeft = t.trialEndsAt
                    ? Math.max(0, Math.ceil((new Date(t.trialEndsAt).getTime() - Date.now()) / 86400000))
                    : null;

                  return (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[160px]">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", plan.color)}>
                          {plan.icon}{plan.badge}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit", status.color)}>
                            {status.badge}
                          </span>
                          {daysLeft !== null && (
                            <span className={cn("text-xs", daysLeft <= 3 ? "text-rose-500" : "text-muted-foreground")}>
                              {daysLeft}d left
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.userCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.requisitionCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{t.candidateCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium">
                        ${t.costUsd30d.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateTenant(t.id, { plan: "STARTER" })}>
                              <Zap className="h-4 w-4 mr-2 text-blue-500" /> Upgrade → Starter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTenant(t.id, { plan: "PROFESSIONAL" })}>
                              <Crown className="h-4 w-4 mr-2 text-primary" /> Upgrade → Professional
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTenant(t.id, { plan: "ENTERPRISE" })}>
                              <Building2 className="h-4 w-4 mr-2 text-amber-500" /> Upgrade → Enterprise
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTenant(t.id, { status: "ACTIVE" })}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTenant(t.id, { status: "SUSPENDED" })}>
                              <Ban className="h-4 w-4 mr-2 text-amber-500" /> Suspend
                            </DropdownMenuItem>
                            {/* Phase 32a — impersonate this tenant's admin for support debugging. */}
                            <DropdownMenuItem onClick={() => impersonateTenant(t.id, t.name)}>
                              <UserCog className="h-4 w-4 mr-2 text-rose-500" /> Impersonate admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
