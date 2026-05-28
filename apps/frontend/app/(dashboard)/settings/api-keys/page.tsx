"use client";

/**
 * Phase 34b — Tenant API keys management.
 *
 * Tenants generate API keys here and hand them to:
 *   - The LinkedIn Chrome extension (Phase 34f)
 *   - Job-board webhooks (Indeed, ZipRecruiter, Workday)
 *   - Their own scripts that POST candidates via /api/v1/candidates
 *
 * Plaintext key is shown ONCE at creation time in a dialog. If they lose
 * it, they must revoke + recreate — same model as GitHub PATs and Stripe.
 */
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Key, Plus, Trash2, Copy, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdByUserId: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" };
}

export default function ApiKeysPage() {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <AccessDenied />;

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [plaintext, setPlaintext] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api-keys`, { credentials: "include", headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      setKeys(body.data ?? body);
    } catch { toast.error("Couldn't load keys"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const create = async () => {
    if (newKeyName.length < 1) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_BASE}/api-keys`, {
        method: "POST", credentials: "include", headers: authHeaders(),
        body: JSON.stringify({ name: newKeyName, scopes: ["candidates:write"] }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const body = await res.json();
      const data = body.data ?? body;
      setPlaintext(data.plaintext);
      setNewKeyName("");
      fetchKeys();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string, name: string) => {
    if (!confirm(`Revoke key "${name}"? Any system using it will stop working immediately.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api-keys/${id}`, {
        method: "DELETE", credentials: "include", headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Revoked");
      fetchKeys();
    } catch { toast.error("Failed to revoke"); }
  };

  const copyPlaintext = async () => {
    if (!plaintext) return;
    try {
      await navigator.clipboard.writeText(plaintext);
      toast.success("Copied — store this somewhere safe");
    } catch { toast.error("Copy failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/settings" className="mt-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API keys</h1>
            <p className="text-muted-foreground text-sm">
              Use these to call our public ingest API or authenticate the LinkedIn Chrome extension.
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Create key
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4" /> Active keys</CardTitle>
          <CardDescription className="text-xs">
            Bearer-token auth for <code className="text-foreground">POST /api/v1/candidates</code>. Rate limited to 60 req/min per key.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No keys yet. Create one to start.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Name</th>
                  <th className="text-left px-4 py-2 font-medium">Key</th>
                  <th className="text-left px-4 py-2 font-medium">Scopes</th>
                  <th className="text-left px-4 py-2 font-medium">Created</th>
                  <th className="text-left px-4 py-2 font-medium">Last used</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{k.name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{k.keyPrefix}…</td>
                    <td className="px-4 py-2">
                      {k.scopes.map((s) => <Badge key={s} variant="outline" className="text-2xs mr-1">{s}</Badge>)}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "never"}</td>
                    <td className="px-4 py-2">
                      {k.revokedAt
                        ? <Badge variant="outline" className="text-2xs bg-destructive/15 text-destructive">Revoked</Badge>
                        : <Badge variant="outline" className="text-2xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">Active</Badge>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {!k.revokedAt && (
                        <button onClick={() => revoke(k.id, k.name)} title="Revoke" className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!o) { setCreateOpen(false); setPlaintext(null); } else { setCreateOpen(true); } }}>
        <DialogContent className="sm:max-w-md">
          {!plaintext ? (
            <>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>The plaintext will be shown once. Store it somewhere safe.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="k-name">Label</Label>
                  <Input id="k-name" placeholder="e.g. LinkedIn extension, Indeed webhook" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} autoFocus />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
                <Button onClick={create} disabled={creating || newKeyName.length < 1}>{creating ? "Creating…" : "Create"}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Save this key now</DialogTitle>
                <DialogDescription>It will not be shown again. Revoke + recreate if you lose it.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="rounded-md border bg-muted/40 p-3 font-mono text-xs break-all">{plaintext}</div>
                <Button onClick={copyPlaintext} variant="outline" size="sm" className="w-full gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Copy to clipboard
                </Button>
              </div>
              <DialogFooter>
                <Button onClick={() => { setCreateOpen(false); setPlaintext(null); }}>I saved it</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
