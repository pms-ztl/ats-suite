"use client";

/**
 * Phase 34g, Google Drive + Dropbox folder-sync configuration page.
 *
 * Flow per provider:
 *   1. If not connected: "Connect" button → OAuth dance → tenant returns
 *      to this page with ?connected=<provider> in the URL
 *   2. If connected: show "Choose folder" dropdown (Drive lists root
 *      folders; Dropbox takes a path string)
 *   3. After folder chosen: shows sync status + "Disconnect"
 *
 * Status: poll worker runs every 5 min in notification-service.
 * lastSyncAt stored in TenantIntegration.config.
 */
import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FolderSync, Link2, Unplug, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface DriveFolder { id: string; name: string }

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = window.sessionStorage.getItem("ats-access-token");
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}), "Content-Type": "application/json" };
}

function CloudSyncInner() {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <AccessDenied />;

  const params = useSearchParams();
  const [driveConnected, setDriveConnected] = useState<boolean | null>(null);
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [driveFolderId, setDriveFolderId] = useState<string>("");
  const [dropboxConnected, setDropboxConnected] = useState<boolean | null>(null);
  const [dropboxPath, setDropboxPath] = useState<string>("");
  const [savingDrive, setSavingDrive] = useState(false);
  const [savingDropbox, setSavingDropbox] = useState(false);

  // Toast on return from OAuth.
  useEffect(() => {
    const connected = params.get("connected");
    if (connected === "google-drive") toast.success("Google Drive connected!");
    if (connected === "dropbox") toast.success("Dropbox connected!");
  }, [params]);

  const fetchStatus = useCallback(async () => {
    // We piggy-back on the integrations list endpoint which returns all kinds.
    // No single "status" endpoint exists, folder GET fails when not connected, which is our signal.
    try {
      const driveRes = await fetch(`${API_BASE}/cloud-sync/google-drive/folders`, { credentials: "include", headers: authHeaders() });
      if (driveRes.ok) {
        const body = await driveRes.json();
        const data = body.data ?? body;
        setDriveConnected(true);
        setDriveFolders(data.folders ?? []);
      } else {
        setDriveConnected(false);
      }
    } catch { setDriveConnected(false); }
    // Dropbox doesn't have a folder-list endpoint (tenant types the path);
    // we use the integration-list pattern instead. For simplicity, attempt a
    // PUT with the current path; 200 means connected, 404 means not.
    try {
      // Use the cloud-sync /connect route in HEAD mode? Simpler: just assume
      // if Drive list works we're admin and show the Dropbox card; status
      // shown after first save.
      const r = await fetch(`${API_BASE}/integrations`, { credentials: "include", headers: authHeaders() });
      if (r.ok) {
        const body = await r.json();
        const list = body.data ?? body;
        const dbx = (Array.isArray(list) ? list : []).find((i: any) => i.kind === "dropbox");
        setDropboxConnected(!!dbx);
        if (dbx?.config?.folderPath) setDropboxPath(dbx.config.folderPath);
      }
    } catch { setDropboxConnected(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const connectDrive = async () => {
    try {
      const res = await fetch(`${API_BASE}/cloud-sync/google-drive/connect`, { credentials: "include", headers: authHeaders() });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `${res.status}`);
      window.location.href = (body.data ?? body).url;
    } catch (e: any) { toast.error(e?.message ?? "Couldn't start OAuth"); }
  };
  const connectDropbox = async () => {
    try {
      const res = await fetch(`${API_BASE}/cloud-sync/dropbox/connect`, { credentials: "include", headers: authHeaders() });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? `${res.status}`);
      window.location.href = (body.data ?? body).url;
    } catch (e: any) { toast.error(e?.message ?? "Couldn't start OAuth"); }
  };

  const saveDriveFolder = async () => {
    if (!driveFolderId) return;
    setSavingDrive(true);
    try {
      const res = await fetch(`${API_BASE}/cloud-sync/google-drive/folder`, {
        method: "PUT", credentials: "include", headers: authHeaders(),
        body: JSON.stringify({ folderId: driveFolderId }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Watching that folder, first scan within 5 minutes.");
    } catch { toast.error("Couldn't save"); }
    finally { setSavingDrive(false); }
  };
  const saveDropboxPath = async () => {
    if (!dropboxPath) return;
    setSavingDropbox(true);
    try {
      const res = await fetch(`${API_BASE}/cloud-sync/dropbox/folder`, {
        method: "PUT", credentials: "include", headers: authHeaders(),
        body: JSON.stringify({ folderPath: dropboxPath }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success("Watching that path, first scan within 5 minutes.");
    } catch { toast.error("Couldn't save"); }
    finally { setSavingDropbox(false); }
  };

  const disconnect = async (provider: "google-drive" | "dropbox") => {
    if (!confirm(`Disconnect ${provider}? Stops sync immediately. Existing imported candidates stay.`)) return;
    try {
      const res = await fetch(`${API_BASE}/cloud-sync/${provider}`, {
        method: "DELETE", credentials: "include", headers: authHeaders(),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      toast.success(`${provider} disconnected`);
      fetchStatus();
    } catch { toast.error("Couldn't disconnect"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/settings" className="mt-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cloud folder sync</h1>
          <p className="text-muted-foreground text-sm">
            Watch a Drive or Dropbox folder. Every new resume file (PDF/DOC/DOCX/TXT) becomes a candidate.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FolderSync className="h-4 w-4" /> Google Drive</CardTitle>
            {driveConnected && <Badge variant="outline" className="bg-ok/15 text-ok dark:text-ok text-2xs"><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</Badge>}
          </div>
          <CardDescription className="text-xs">Polls every 5 minutes. Read-only access, we never modify your Drive.</CardDescription>
        </CardHeader>
        <CardContent>
          {driveConnected === null ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : !driveConnected ? (
            <Button onClick={connectDrive} className="gap-1.5"><Link2 className="h-4 w-4" /> Connect Google Drive</Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Watched folder</Label>
                <Select value={driveFolderId} onValueChange={setDriveFolderId}>
                  <SelectTrigger><SelectValue placeholder="Pick a folder…" /></SelectTrigger>
                  <SelectContent>
                    {driveFolders.length === 0 && <div className="px-2 py-1 text-xs text-muted-foreground">No folders found (Drive is empty?)</div>}
                    {driveFolders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={saveDriveFolder} disabled={!driveFolderId || savingDrive} size="sm">
                  {savingDrive ? "Saving…" : "Watch this folder"}
                </Button>
                <Button onClick={() => fetchStatus()} variant="ghost" size="sm" className="gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>
                <Button onClick={() => disconnect("google-drive")} variant="ghost" size="sm" className="gap-1.5 text-destructive ml-auto"><Unplug className="h-3.5 w-3.5" /> Disconnect</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><FolderSync className="h-4 w-4" /> Dropbox</CardTitle>
            {dropboxConnected && <Badge variant="outline" className="bg-ok/15 text-ok dark:text-ok text-2xs"><CheckCircle2 className="h-3 w-3 mr-1" /> Connected</Badge>}
          </div>
          <CardDescription className="text-xs">Polls every 5 minutes. Read-only access, we never modify your Dropbox.</CardDescription>
        </CardHeader>
        <CardContent>
          {dropboxConnected === null ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : !dropboxConnected ? (
            <Button onClick={connectDropbox} className="gap-1.5"><Link2 className="h-4 w-4" /> Connect Dropbox</Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="dbx-path" className="text-xs">Watched folder path</Label>
                <Input id="dbx-path" placeholder="/CDC ATS Resumes" value={dropboxPath} onChange={(e) => setDropboxPath(e.target.value)} className="font-mono" />
                <p className="text-2xs text-muted-foreground">Leading slash, case-sensitive. Example: <code>/Recruiting/Inbox</code></p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={saveDropboxPath} disabled={!dropboxPath || savingDropbox} size="sm">
                  {savingDropbox ? "Saving…" : "Watch this folder"}
                </Button>
                <Button onClick={() => disconnect("dropbox")} variant="ghost" size="sm" className="gap-1.5 text-destructive ml-auto"><Unplug className="h-3.5 w-3.5" /> Disconnect</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CloudSyncPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <CloudSyncInner />
    </Suspense>
  );
}
