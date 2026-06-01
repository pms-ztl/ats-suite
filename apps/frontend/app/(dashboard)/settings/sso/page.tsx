"use client";

/**
 * Settings → SSO (Phase 28)
 *
 * Tenant-admin self-service for SAML 2.0 + OIDC config. Three sections:
 *   1. Protocol selection + status (DRAFT / ENABLED / DISABLED)
 *   2. Protocol-specific config (SAML entry point + cert; OIDC issuer + client)
 *   3. Common: email domains, attribute names, role mapping
 *   4. Audit log of recent SSO login attempts (Phase 22 pattern reused)
 *
 * Backend at /api/sso/config/<tenantId>/sso (proxied to identity-service).
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ArrowLeft, Key, Shield, FileText, Save, Trash2, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface SsoConfig {
  id?: string;
  tenantId: string;
  protocol: "SAML" | "OIDC";
  status: "DRAFT" | "ENABLED" | "DISABLED";
  samlEntryPoint: string | null;
  samlIssuer: string | null;
  samlCertificate: string | null;
  oidcIssuerUrl: string | null;
  oidcClientId: string | null;
  oidcClientSecret: string | null;
  emailDomains: string[];
  attrEmail: string;
  attrFirstName: string;
  attrLastName: string;
  attrGroups: string;
  roleMap: Record<string, string>;
  defaultRole: string;
}

interface AuditRow {
  id: string;
  email: string;
  protocol: "SAML" | "OIDC";
  outcome: string;
  ipAddress: string | null;
  createdAt: string;
}

const DEFAULT_CONFIG: Omit<SsoConfig, "tenantId"> = {
  protocol: "SAML",
  status: "DRAFT",
  samlEntryPoint: null,
  samlIssuer: null,
  samlCertificate: null,
  oidcIssuerUrl: null,
  oidcClientId: null,
  oidcClientSecret: null,
  emailDomains: [],
  attrEmail: "email",
  attrFirstName: "firstName",
  attrLastName: "lastName",
  attrGroups: "groups",
  roleMap: {},
  defaultRole: "RECRUITER",
};

export default function SsoSettingsPage() {
  const { user } = useCurrentUser();
  const tenantId = user?.tenantId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<SsoConfig | null>(null);
  const [domainsInput, setDomainsInput] = useState("");
  const [roleMapInput, setRoleMapInput] = useState("{}");
  const [audit, setAudit] = useState<AuditRow[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  async function load() {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/sso/config/${tenantId}/sso`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const body = await res.json();
        const data: SsoConfig | null = body.data ?? body;
        if (data) {
          setCfg(data);
          setDomainsInput((data.emailDomains ?? []).join(", "));
          setRoleMapInput(JSON.stringify(data.roleMap ?? {}, null, 2));
        } else {
          setCfg({ tenantId, ...DEFAULT_CONFIG });
        }
      } else {
        setCfg({ tenantId, ...DEFAULT_CONFIG });
      }
      // Audit log
      const auditRes = await fetch(`${API_BASE}/sso/config/${tenantId}/sso/audit?limit=50`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (auditRes.ok) {
        const body = await auditRes.json();
        setAudit((body.data?.audit ?? body.audit ?? []) as AuditRow[]);
      }
    } catch (err) {
      toast.error("Couldn't load SSO config");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!cfg || !tenantId) return;
    setSaving(true);
    try {
      const emailDomains = domainsInput
        .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      let roleMap: Record<string, string> = {};
      try { roleMap = JSON.parse(roleMapInput); }
      catch { throw new Error("Role map must be valid JSON"); }

      const payload = {
        ...cfg,
        emailDomains,
        roleMap,
      };
      // Don't send the redacted secret back
      if (payload.oidcClientSecret === "***REDACTED***") delete (payload as any).oidcClientSecret;

      const res = await fetch(`${API_BASE}/sso/config/${tenantId}/sso`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success(`SSO config saved (${cfg.status}). ${cfg.status === "ENABLED" ? "Users on configured domains will be routed to your IdP on next login." : "Flip to ENABLED when ready."}`);
      await load();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function removeConfig() {
    if (!confirm("Remove SSO config? Users will fall back to password+MFA login.")) return;
    if (!tenantId) return;
    try {
      const res = await fetch(`${API_BASE}/sso/config/${tenantId}/sso`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("SSO config removed");
      setCfg({ tenantId, ...DEFAULT_CONFIG });
      setDomainsInput("");
      setRoleMapInput("{}");
    } catch (err: any) {
      toast.error(err.message ?? "Delete failed");
    }
  }

  function downloadSamlMetadata() {
    if (!tenantId) return;
    window.open(`${API_BASE}/sso/config/${tenantId}/sso/metadata?token=${getToken()}`, "_blank");
  }

  const successCount = useMemo(() => audit.filter((a) => a.outcome.startsWith("success")).length, [audit]);
  const failCount = useMemo(() => audit.filter((a) => a.outcome.startsWith("fail")).length, [audit]);

  if (loading || !cfg) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading SSO config…
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/settings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
      </Link>

      <PageHeader
        title="Single Sign-On"
        description="Let your team sign in with your existing identity provider (Okta, Google Workspace, Azure AD, etc.). Falls back to password+MFA when SSO isn't configured."
        actions={
          cfg.id ? (
            <Button variant="ghost" size="sm" onClick={removeConfig} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-1.5" />
              Remove SSO
            </Button>
          ) : null
        }
      />

      {/* Status banner */}
      <Card className={cfg.status === "ENABLED" ? "border-ok/40/50" : cfg.status === "DRAFT" ? "border-warn/40/50" : "border-muted"}>
        <CardContent className="pt-4 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {cfg.status === "ENABLED" ? (
              <CheckCircle2 className="w-5 h-5 text-ok" />
            ) : cfg.status === "DRAFT" ? (
              <AlertTriangle className="w-5 h-5 text-warn" />
            ) : (
              <Shield className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">
                Status: <Badge variant={cfg.status === "ENABLED" ? "default" : "outline"}>{cfg.status}</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                {cfg.status === "DRAFT" && "Test mode, assertions are parsed but no users are provisioned."}
                {cfg.status === "ENABLED" && "Live, users on configured domains route to your IdP."}
                {cfg.status === "DISABLED" && "Off, config retained but SSO rejected."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="status" className="text-xs">Enable</Label>
            <Switch
              id="status"
              checked={cfg.status === "ENABLED"}
              onCheckedChange={(on) => setCfg({ ...cfg, status: on ? "ENABLED" : "DRAFT" })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Protocol + protocol-specific config */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Protocol & IdP credentials
          </CardTitle>
          <CardDescription>Choose SAML 2.0 or OIDC, then paste the values from your IdP admin console.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2">
            <Label className="w-24">Protocol</Label>
            <div className="flex gap-2">
              {(["SAML", "OIDC"] as const).map((p) => (
                <Button key={p} size="sm" variant={cfg.protocol === p ? "default" : "outline"} onClick={() => setCfg({ ...cfg, protocol: p })}>
                  {p}
                </Button>
              ))}
            </div>
          </div>

          {cfg.protocol === "SAML" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="entry">IdP SSO URL (entry point)</Label>
                <Input id="entry" placeholder="https://yourcompany.okta.com/app/.../sso/saml"
                  value={cfg.samlEntryPoint ?? ""}
                  onChange={(e) => setCfg({ ...cfg, samlEntryPoint: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert">IdP signing certificate (PEM)</Label>
                <Textarea id="cert" rows={8} className="font-mono text-xs"
                  placeholder="-----BEGIN CERTIFICATE-----&#10;MIID...&#10;-----END CERTIFICATE-----"
                  value={cfg.samlCertificate ?? ""}
                  onChange={(e) => setCfg({ ...cfg, samlCertificate: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="issuer">SP entity ID (we auto-derive if blank)</Label>
                <Input id="issuer" placeholder="(auto)"
                  value={cfg.samlIssuer ?? ""}
                  onChange={(e) => setCfg({ ...cfg, samlIssuer: e.target.value || null })}
                />
                <Button variant="outline" size="sm" onClick={downloadSamlMetadata} disabled={!cfg.id}>
                  <FileText className="w-4 h-4 mr-1.5" />
                  Download SP metadata XML
                </Button>
                <p className="text-xs text-muted-foreground">Paste this into your IdP&apos;s &quot;upload SP metadata&quot; field, or copy each value manually.</p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="iss">OIDC Issuer URL</Label>
                <Input id="iss" placeholder="https://accounts.google.com"
                  value={cfg.oidcIssuerUrl ?? ""}
                  onChange={(e) => setCfg({ ...cfg, oidcIssuerUrl: e.target.value || null })}
                />
                <p className="text-xs text-muted-foreground">We auto-discover the IdP&apos;s endpoints from /.well-known/openid-configuration on this base URL.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cid">Client ID</Label>
                <Input id="cid"
                  value={cfg.oidcClientId ?? ""}
                  onChange={(e) => setCfg({ ...cfg, oidcClientId: e.target.value || null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="csec">Client Secret</Label>
                <Input id="csec" type="password" placeholder={cfg.oidcClientSecret === "***REDACTED***" ? "Already saved" : ""}
                  value={cfg.oidcClientSecret === "***REDACTED***" ? "" : (cfg.oidcClientSecret ?? "")}
                  onChange={(e) => setCfg({ ...cfg, oidcClientSecret: e.target.value || null })}
                />
                <p className="text-xs text-muted-foreground">Stored encrypted at rest in production (Phase 32). For now: plaintext in DB, rotate regularly.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Domains, attribute mapping, role mapping */}
      <Card>
        <CardHeader>
          <CardTitle>Routing + mapping</CardTitle>
          <CardDescription>Which emails route to your IdP, and how IdP claims map to user roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="domains">Email domains (comma-separated)</Label>
            <Input id="domains" placeholder="hcl.com, hcltech.com"
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Users typing an email on these domains see &quot;Continue with SSO&quot; on the login page.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ae">Email claim name</Label>
              <Input id="ae" value={cfg.attrEmail} onChange={(e) => setCfg({ ...cfg, attrEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ag">Groups claim name</Label>
              <Input id="ag" value={cfg.attrGroups} onChange={(e) => setCfg({ ...cfg, attrGroups: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="afn">First name claim</Label>
              <Input id="afn" value={cfg.attrFirstName} onChange={(e) => setCfg({ ...cfg, attrFirstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aln">Last name claim</Label>
              <Input id="aln" value={cfg.attrLastName} onChange={(e) => setCfg({ ...cfg, attrLastName: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rm">Role mapping (JSON: IdP group → our role)</Label>
            <Textarea id="rm" rows={6} className="font-mono text-xs"
              value={roleMapInput}
              onChange={(e) => setRoleMapInput(e.target.value)}
              placeholder='{ "ats-admins": "ADMIN", "ats-recruiters": "RECRUITER", "ats-interviewers": "INTERVIEWER" }'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dr">Default role (no group match)</Label>
            <select id="dr" className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
              value={cfg.defaultRole}
              onChange={(e) => setCfg({ ...cfg, defaultRole: e.target.value })}
            >
              {["RECRUITER", "INTERVIEWER", "HIRING_MANAGER", "ADMIN", "COMPLIANCE_OFFICER"].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Recent SSO login attempts
          </CardTitle>
          <CardDescription>
            <span className="text-ok dark:text-ok">{successCount} success</span>
            {" / "}
            <span className="text-destructive">{failCount} fail</span>
            {", last 50"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {audit.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No SSO attempts yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-muted-foreground border-b">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">When</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Protocol</th>
                  <th className="text-left px-4 py-2 font-medium">Outcome</th>
                  <th className="text-left px-4 py-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {audit.slice(0, 50).map((a) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-1.5 tabular-nums text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-1.5 font-mono">{a.email}</td>
                    <td className="px-4 py-1.5">{a.protocol}</td>
                    <td className={`px-4 py-1.5 ${a.outcome.startsWith("success") ? "text-ok dark:text-ok" : a.outcome.startsWith("fail") ? "text-destructive" : ""}`}>
                      {a.outcome}
                    </td>
                    <td className="px-4 py-1.5 text-muted-foreground">{a.ipAddress ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur p-4 -mx-4 border-t">
        <Button variant="outline" onClick={load} disabled={saving}>Discard changes</Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save SSO config
        </Button>
      </div>
    </div>
  );
}
