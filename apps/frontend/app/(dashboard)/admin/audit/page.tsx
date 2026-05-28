"use client";

/**
 * Phase 32c — super-admin audit log viewer.
 *
 * Reads from GET /api/super-admin/audit (paginated) with filters for
 * tenant, action, resourceType, date range. CSV export downloads up to
 * 100k rows matching the current filter set.
 *
 * Why a separate page from /admin/platform/audit (which exists already):
 * platform/audit is scoped to platform actions (kill switches + prompt
 * overrides). THIS page is the cross-cutting audit log of every actor
 * action across every tenant — what auditors will ask for in a SOC 2
 * review.
 */
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, RefreshCw, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface AuditRow {
  id: string;
  tenantId: string | null;
  actorUserId: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface PageResult {
  data: AuditRow[];
  total: number;
  page: number;
  pages: number;
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AuditPage() {
  const { isSuperAdmin } = usePermissions();
  if (!isSuperAdmin) return <AccessDenied />;

  // Filter state
  const [tenantId, setTenantId] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // Result + paging
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<PageResult | null>(null);

  const queryString = useCallback(() => {
    const p = new URLSearchParams();
    if (tenantId)     p.set("tenantId", tenantId);
    if (actorUserId)  p.set("actorUserId", actorUserId);
    if (action)       p.set("action", action);
    if (resourceType) p.set("resourceType", resourceType);
    if (from)         p.set("from", new Date(from).toISOString());
    if (to)           p.set("to", new Date(to).toISOString());
    p.set("page", String(page));
    p.set("limit", "50");
    return p.toString();
  }, [tenantId, actorUserId, action, resourceType, from, to, page]);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/audit?${queryString()}`, {
        credentials: "include",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      setResult(body.data ?? body);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load audit");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const reset = () => {
    setTenantId(""); setActorUserId(""); setAction("");
    setResourceType(""); setFrom(""); setTo(""); setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/audit/export.csv?${queryString()}`, {
        credentials: "include",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("Exported");
    } catch (e: any) {
      toast.error(e?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Platform Audit Log</h1>
            <p className="text-muted-foreground text-sm">
              Every actor action across every tenant. Required for SOC 2 Type II evidence.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchPage} disabled={loading} className="gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={exportCsv} disabled={exporting} className="gap-1.5">
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            Filters
            {(tenantId || actorUserId || action || resourceType || from || to) && (
              <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="f-tenant" className="text-xs">Tenant ID</Label>
              <Input id="f-tenant" placeholder="uuid" value={tenantId} onChange={(e) => { setTenantId(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-actor" className="text-xs">Actor user ID</Label>
              <Input id="f-actor" placeholder="uuid" value={actorUserId} onChange={(e) => { setActorUserId(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-action" className="text-xs">Action (contains)</Label>
              <Input id="f-action" placeholder="e.g. USER_INVITED" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-resource" className="text-xs">Resource type</Label>
              <Input id="f-resource" placeholder="e.g. User" value={resourceType} onChange={(e) => { setResourceType(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-from" className="text-xs">From</Label>
              <Input id="f-from" type="datetime-local" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-to" className="text-xs">To</Label>
              <Input id="f-to" type="datetime-local" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">
            {result ? `${result.total.toLocaleString()} events` : "Loading…"}
          </CardTitle>
          {result && result.pages > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <Button size="sm" variant="outline" disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <span>Page {result.page} of {result.pages}</span>
              <Button size="sm" variant="outline" disabled={page >= result.pages || loading}
                onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">When</th>
                  <th className="text-left px-4 py-2 font-medium">Action</th>
                  <th className="text-left px-4 py-2 font-medium">Resource</th>
                  <th className="text-left px-4 py-2 font-medium">Actor</th>
                  <th className="text-left px-4 py-2 font-medium">Tenant</th>
                  <th className="text-left px-4 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {result?.data.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No events match these filters.</td></tr>
                )}
                {result?.data.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-mono text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-2"><Badge variant="outline" className="text-2xs">{r.action}</Badge></td>
                    <td className="px-4 py-2 font-mono text-xs">{r.resourceType}{r.resourceId ? `:${r.resourceId.slice(0, 8)}` : ""}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.actorUserId ? r.actorUserId.slice(0, 8) : "—"}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.tenantId ? r.tenantId.slice(0, 8) : "(platform)"}</td>
                    <td className="px-4 py-2 font-mono text-xs">{r.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
