"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Bell, Shield, Globe, Palette, Key, Loader2, ShieldAlert, Users, Mail, ToggleLeft, Webhook, Trash2, Sparkles, Download, Inbox, FolderSync, MessageSquare, Puzzle } from "lucide-react";
import Link from "next/link";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

// --- Validation helpers ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,}$/;

// --- Types ---
interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsAlerts: boolean;
  inAppNotifications: boolean;
  weeklyDigest: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
}

interface PasswordChangeFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface TenantSettings {
  organizationName: string;
  contactEmail: string;
  defaultLanguage: string;
  dateFormat: string;
}

interface AppearanceSettings {
  theme: string;
  density: string;
}

// Error maps keyed by field name
type ProfileErrors = Partial<Record<"firstName" | "lastName" | "email" | "phone", string>>;
type SecurityErrors = Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;
type TenantErrors = Partial<Record<"organizationName" | "contactEmail", string>>;

// --- API call ---
async function saveSettings(section: string, payload: Record<string, unknown>): Promise<void> {
  if (USE_MOCKS) {
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    return;
  }

  const token = typeof document !== "undefined"
    ? (document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/) ?? [])[1]
    : null;

  const res = await fetch(`/api/users/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
    },
    body: JSON.stringify({ section, ...payload }),
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

// --- Main component ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  // Phase 29 — restart-onboarding modal opener
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  // Phase 31c — tenant data export.
  const [exporting, setExporting] = useState(false);

  const downloadTenantExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      const token = (() => {
        try { return window.sessionStorage.getItem("ats-access-token"); } catch { return null; }
      })();
      const res = await fetch(`${apiBase}/gdpr/tenant/export`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as any));
        throw new Error(body?.error?.message ?? body?.message ?? `${res.status}`);
      }
      // Stream → blob → object URL → trigger a download by clicking a hidden link.
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Extract the filename from Content-Disposition if the server set one.
      const cd = res.headers.get("Content-Disposition") ?? "";
      const m = /filename="([^"]+)"/.exec(cd);
      a.download = m?.[1] ?? `cdc-ats-tenant-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Export failed");
    } finally {
      setExporting(false);
    }
  };

  // Profile
  const [profile, setProfile] = useState<ProfileSettings>({
    firstName: "Admin",
    lastName: "User",
    email: "admin@company.com",
    phone: "",
    timezone: "UTC-5",
  });
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});

  // Notifications
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsAlerts: false,
    inAppNotifications: true,
    weeklyDigest: true,
  });

  // Security
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    sessionTimeout: "8h",
  });
  const [passwordFields, setPasswordFields] = useState<PasswordChangeFields>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [securityErrors, setSecurityErrors] = useState<SecurityErrors>({});

  // Tenant
  const [tenant, setTenant] = useState<TenantSettings>({
    organizationName: "Acme Corp",
    contactEmail: "",
    defaultLanguage: "en-US",
    dateFormat: "MM/DD/YYYY",
  });
  const [tenantErrors, setTenantErrors] = useState<TenantErrors>({});

  // Appearance
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "light",
    density: "comfortable",
  });

  // --- Per-tab validation ---
  function validateProfile(): boolean {
    const errs: ProfileErrors = {};
    if (!profile.firstName.trim()) errs.firstName = "First name is required.";
    if (!profile.lastName.trim()) errs.lastName = "Last name is required.";
    if (!profile.email) {
      errs.email = "Email is required.";
    } else if (!EMAIL_RE.test(profile.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (profile.phone && !PHONE_RE.test(profile.phone)) {
      errs.phone = "Please enter a valid phone number.";
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateSecurity(): boolean {
    // Only validate password section if the user has filled in any password field
    const anyFilled = passwordFields.currentPassword || passwordFields.newPassword || passwordFields.confirmPassword;
    if (!anyFilled) return true;

    const errs: SecurityErrors = {};
    if (!passwordFields.currentPassword) errs.currentPassword = "Current password is required.";
    if (!passwordFields.newPassword) {
      errs.newPassword = "New password is required.";
    } else if (passwordFields.newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(passwordFields.newPassword)) {
      errs.newPassword = "Password must contain at least one uppercase letter.";
    } else if (!/[0-9]/.test(passwordFields.newPassword)) {
      errs.newPassword = "Password must contain at least one number.";
    }
    if (!passwordFields.confirmPassword) {
      errs.confirmPassword = "Please confirm your new password.";
    } else if (passwordFields.confirmPassword !== passwordFields.newPassword) {
      errs.confirmPassword = "Passwords do not match.";
    }
    setSecurityErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateTenant(): boolean {
    const errs: TenantErrors = {};
    if (!tenant.organizationName.trim()) errs.organizationName = "Organization name is required.";
    if (tenant.contactEmail && !EMAIL_RE.test(tenant.contactEmail)) {
      errs.contactEmail = "Please enter a valid email address.";
    }
    setTenantErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    // Run validation for current tab
    let valid = true;
    if (activeTab === "profile") valid = validateProfile();
    else if (activeTab === "security") valid = validateSecurity();
    else if (activeTab === "tenant") valid = validateTenant();

    if (!valid) return;

    setSaving(true);
    try {
      const payloads: Record<string, Record<string, unknown>> = {
        profile: profile as unknown as Record<string, unknown>,
        notifications: notifications as unknown as Record<string, unknown>,
        security: {
          ...(security as unknown as Record<string, unknown>),
          ...(passwordFields.currentPassword ? { passwordChange: passwordFields } : {}),
        },
        tenant: tenant as unknown as Record<string, unknown>,
        appearance: appearance as unknown as Record<string, unknown>,
      };

      const currentPayload = payloads[activeTab] ?? {};
      await saveSettings(activeTab, currentPayload);
      toast.success("Settings saved.");

      // Clear password fields after a successful security save
      if (activeTab === "security") {
        setPasswordFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const TABS = [
    { id: "profile",       icon: <User className="h-4 w-4" />,    label: "Profile" },
    { id: "notifications", icon: <Bell className="h-4 w-4" />,    label: "Notifications" },
    { id: "security",      icon: <Shield className="h-4 w-4" />,  label: "Security" },
    { id: "tenant",        icon: <Globe className="h-4 w-4" />,   label: "Tenant" },
    { id: "appearance",    icon: <Palette className="h-4 w-4" />, label: "Appearance" },
    { id: "apikeys",       icon: <Key className="h-4 w-4" />,     label: "API Keys" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, organization, and system preferences"
        breadcrumbs={[{ label: "Settings" }]}
        actions={
          activeTab !== "apikeys" ? (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-1" />
                  Save changes
                </>
              )}
            </Button>
          ) : undefined
        }
      />

      {/* Quick-access cards for sub-pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/settings/team" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Team Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Invite team members, assign roles, and manage access permissions
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/email-templates" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Customize email templates for candidate communication
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/features" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ToggleLeft className="h-4 w-4" /> Feature Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Enable or disable AI agents, integrations, and platform features
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/integrations" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Webhook className="h-4 w-4" /> Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Wire up Slack and email so your team gets notified outside the app
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/security" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Change your password and manage two-factor authentication
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/branding" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" /> Brand & Career Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Logo, colors, tagline, and the public-facing career portal candidates see
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/retention" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Data retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                How long candidate data is kept after their last activity before automated anonymization
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/sso" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" /> Single Sign-On (SAML / OIDC)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Route users through your IdP (Okta, Google Workspace, Azure AD). Required for enterprise customers.
              </p>
            </CardContent>
          </Card>
        </Link>
        <button onClick={() => setOnboardingOpen(true)} className="block text-left">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Restart Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Re-open the 5-step setup wizard — useful when walking a new admin through the basics.
              </p>
            </CardContent>
          </Card>
        </button>
        <button onClick={downloadTenantExport} disabled={exporting} className="block text-left">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Download className="h-4 w-4" /> Export tenant data
                {exporting && <Loader2 className="h-3.5 w-3.5 animate-spin ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Download everything we have for your tenant as JSON (GDPR Article 20). Includes
                users, requisitions, candidates, interviews, audit log.
              </p>
            </CardContent>
          </Card>
        </button>

        {/* Phase 34g — discovery for the 4 newer candidate-input methods */}
        <Link href="/settings/api-keys" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" /> API keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Bearer tokens for the public ingest API. Use for job-board webhooks + the Chrome extension.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/inbound-email" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Inbox className="h-4 w-4" /> Email-to-apply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Forward a resume to your team's inbound address — we parse the sender + attach the resume + create the candidate.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/cloud-sync" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderSync className="h-4 w-4" /> Cloud folder sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Watch a Google Drive or Dropbox folder. Every new PDF/DOC dropped in becomes a candidate.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/sms" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> SMS &amp; WhatsApp apply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Twilio. Candidates text your number; bot collects name + email + resume link; candidate created.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/chrome-extension" className="block">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Puzzle className="h-4 w-4" /> LinkedIn Chrome extension
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                One-click "+ Add to CDC ATS" on every LinkedIn profile your recruiters visit.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Phase 29 — manually re-openable wizard via Settings. forceOpen ignores
          the dismissed/completed flags so admins can re-walk the steps. */}
      {onboardingOpen && (
        <OnboardingWizard forceOpen onClose={() => setOnboardingOpen(false)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left
                ${activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <ProfilePanel
              profile={profile}
              onChange={setProfile}
              errors={profileErrors}
              clearError={(field) => setProfileErrors(prev => ({ ...prev, [field]: undefined }))}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationsPanel notifications={notifications} onChange={setNotifications} />
          )}
          {activeTab === "security" && (
            <SecurityPanel
              security={security}
              onChange={setSecurity}
              passwordFields={passwordFields}
              onPasswordChange={setPasswordFields}
              errors={securityErrors}
              clearError={(field) => setSecurityErrors(prev => ({ ...prev, [field]: undefined }))}
            />
          )}
          {activeTab === "tenant" && (
            <TenantPanel
              tenant={tenant}
              onChange={setTenant}
              errors={tenantErrors}
              clearError={(field) => setTenantErrors(prev => ({ ...prev, [field]: undefined }))}
            />
          )}
          {activeTab === "appearance" && (
            <AppearancePanel appearance={appearance} onChange={setAppearance} />
          )}
          {activeTab === "apikeys" && (
            <ApiKeysPanel />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Section panels ---

interface ProfilePanelProps {
  profile: ProfileSettings;
  onChange: (v: ProfileSettings) => void;
  errors: ProfileErrors;
  clearError: (field: keyof ProfileErrors) => void;
}

function ProfilePanel({ profile, onChange, errors, clearError }: ProfilePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4" /> Profile
        </CardTitle>
        <p className="text-xs text-muted-foreground">Manage your account details and preferences</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={e => {
                onChange({ ...profile, firstName: e.target.value });
                if (errors.firstName) clearError("firstName");
              }}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={e => {
                onChange({ ...profile, lastName: e.target.value });
                if (errors.lastName) clearError("lastName");
              }}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={profile.email}
            onChange={e => {
              onChange({ ...profile, email: e.target.value });
              if (errors.email) clearError("email");
            }}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={profile.phone}
            onChange={e => {
              onChange({ ...profile, phone: e.target.value });
              if (errors.phone) clearError("phone");
            }}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">{errors.phone}</p>
          )}
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <p className="text-sm font-medium">Role</p>
          <Badge variant="secondary">Super Admin</Badge>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={profile.timezone} onValueChange={v => onChange({ ...profile, timezone: v })}>
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC-8">UTC-8 (Pacific)</SelectItem>
              <SelectItem value="UTC-7">UTC-7 (Mountain)</SelectItem>
              <SelectItem value="UTC-6">UTC-6 (Central)</SelectItem>
              <SelectItem value="UTC-5">UTC-5 (Eastern)</SelectItem>
              <SelectItem value="UTC+0">UTC+0 (GMT)</SelectItem>
              <SelectItem value="UTC+1">UTC+1 (CET)</SelectItem>
              <SelectItem value="UTC+5:30">UTC+5:30 (IST)</SelectItem>
              <SelectItem value="UTC+8">UTC+8 (CST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function NotificationsPanel({ notifications, onChange }: { notifications: NotificationSettings; onChange: (v: NotificationSettings) => void }) {
  const items: { key: keyof NotificationSettings; label: string; description: string }[] = [
    { key: "emailNotifications", label: "Email notifications", description: "Receive updates and alerts via email" },
    { key: "smsAlerts",          label: "SMS alerts",          description: "Receive urgent alerts via SMS" },
    { key: "inAppNotifications", label: "In-app notifications", description: "Show notifications inside the app" },
    { key: "weeklyDigest",       label: "Weekly digest",       description: "Summary email every Monday morning" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="h-4 w-4" /> Notifications
        </CardTitle>
        <p className="text-xs text-muted-foreground">Control when and how you receive alerts</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <Switch
              checked={notifications[item.key]}
              onCheckedChange={v => onChange({ ...notifications, [item.key]: v })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface SecurityPanelProps {
  security: SecuritySettings;
  onChange: (v: SecuritySettings) => void;
  passwordFields: PasswordChangeFields;
  onPasswordChange: (v: PasswordChangeFields) => void;
  errors: SecurityErrors;
  clearError: (field: keyof SecurityErrors) => void;
}

function SecurityPanel({ security, onChange, passwordFields, onPasswordChange, errors, clearError }: SecurityPanelProps) {
  const [disableMfaDialogOpen, setDisableMfaDialogOpen] = useState(false);

  const handleMfaToggle = () => {
    if (security.twoFactorEnabled) {
      setDisableMfaDialogOpen(true);
    } else {
      onChange({ ...security, twoFactorEnabled: true });
      toast.info("Scan the QR code in your authenticator app to enable 2FA.");
    }
  };

  const handleMfaDisableConfirm = () => {
    onChange({ ...security, twoFactorEnabled: false });
    setDisableMfaDialogOpen(false);
    toast.success("Two-factor authentication disabled.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" /> Security
        </CardTitle>
        <p className="text-xs text-muted-foreground">Password, 2FA, and access management</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Disable 2FA confirmation dialog */}
        <Dialog open={disableMfaDialogOpen} onOpenChange={setDisableMfaDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Disable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                This will reduce your account security. Anyone who gains access to your password will be able to sign in without a second factor.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              This action cannot be undone without re-enabling 2FA.
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisableMfaDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleMfaDisableConfirm}>
                Yes, disable 2FA
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Two-Factor Authentication row */}
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <div>
            <p className="text-sm font-medium">Two-factor authentication</p>
            <p className="text-xs text-muted-foreground">Add a second layer of security to your account</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={security.twoFactorEnabled ? "default" : "outline"}>
              {security.twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMfaToggle}>
              {security.twoFactorEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>

        {/* Session timeout */}
        <div className="space-y-1.5">
          <Label htmlFor="sessionTimeout">Session timeout</Label>
          <Select value={security.sessionTimeout} onValueChange={v => onChange({ ...security, sessionTimeout: v })}>
            <SelectTrigger id="sessionTimeout">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="4h">4 hours</SelectItem>
              <SelectItem value="8h">8 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Change password section */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <p className="text-sm font-medium">Change password</p>
          <p className="text-xs text-muted-foreground">Leave blank if you don&apos;t want to change your password.</p>

          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">
              Current password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={passwordFields.currentPassword}
              onChange={e => {
                onPasswordChange({ ...passwordFields, currentPassword: e.target.value });
                if (errors.currentPassword) clearError("currentPassword");
              }}
              className={errors.currentPassword ? "border-destructive" : ""}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">
              New password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
              value={passwordFields.newPassword}
              onChange={e => {
                onPasswordChange({ ...passwordFields, newPassword: e.target.value });
                if (errors.newPassword) clearError("newPassword");
              }}
              className={errors.newPassword ? "border-destructive" : ""}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive mt-1">{errors.newPassword}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">
              Confirm new password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={passwordFields.confirmPassword}
              onChange={e => {
                onPasswordChange({ ...passwordFields, confirmPassword: e.target.value });
                if (errors.confirmPassword) clearError("confirmPassword");
              }}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-border/50">
          <p className="text-sm font-medium">Last password change</p>
          <span className="text-sm text-muted-foreground">14 days ago</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <p className="text-sm font-medium">Active sessions</p>
          <span className="text-sm text-muted-foreground">2 devices</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface TenantPanelProps {
  tenant: TenantSettings;
  onChange: (v: TenantSettings) => void;
  errors: TenantErrors;
  clearError: (field: keyof TenantErrors) => void;
}

function TenantPanel({ tenant, onChange, errors, clearError }: TenantPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4" /> Tenant
        </CardTitle>
        <p className="text-xs text-muted-foreground">Organization-wide configuration</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="orgName">
            Organization name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="orgName"
            value={tenant.organizationName}
            onChange={e => {
              onChange({ ...tenant, organizationName: e.target.value });
              if (errors.organizationName) clearError("organizationName");
            }}
            className={errors.organizationName ? "border-destructive" : ""}
          />
          {errors.organizationName && (
            <p className="text-xs text-destructive mt-1">{errors.organizationName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="contact@company.com"
            value={tenant.contactEmail}
            onChange={e => {
              onChange({ ...tenant, contactEmail: e.target.value });
              if (errors.contactEmail) clearError("contactEmail");
            }}
            className={errors.contactEmail ? "border-destructive" : ""}
          />
          {errors.contactEmail && (
            <p className="text-xs text-destructive mt-1">{errors.contactEmail}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">Default language</Label>
          <Select value={tenant.defaultLanguage} onValueChange={v => onChange({ ...tenant, defaultLanguage: v })}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dateFormat">Date format</Label>
          <Select value={tenant.dateFormat} onValueChange={v => onChange({ ...tenant, dateFormat: v })}>
            <SelectTrigger id="dateFormat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-border/50">
          <p className="text-sm font-medium">Tenant ID</p>
          <span className="text-sm font-mono text-muted-foreground">tenant_abc123</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AppearancePanel({ appearance, onChange }: { appearance: AppearanceSettings; onChange: (v: AppearanceSettings) => void }) {
  const [isDark, setIsDark] = useState(false);

  // On mount: restore saved theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
      onChange({ ...appearance, theme: "dark" });
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
      onChange({ ...appearance, theme: "light" });
    } else {
      // No saved preference — read current state from classList
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleThemeToggle = (checked: boolean) => {
    if (checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      onChange({ ...appearance, theme: "dark" });
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      onChange({ ...appearance, theme: "light" });
    }
    setIsDark(checked);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4" /> Appearance
        </CardTitle>
        <p className="text-xs text-muted-foreground">Theme and display preferences</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={handleThemeToggle}
            aria-label="Toggle dark mode"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="density">Density</Label>
          <Select value={appearance.density} onValueChange={v => onChange({ ...appearance, density: v })}>
            <SelectTrigger id="density">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function ApiKeysPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Key className="h-4 w-4" /> API Keys
        </CardTitle>
        <p className="text-xs text-muted-foreground">Manage API access tokens</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <p className="text-sm font-medium">Production key</p>
          <span className="text-sm font-mono text-muted-foreground">ats_prod_••••••••••••3f2a</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-border/50">
          <p className="text-sm font-medium">Sandbox key</p>
          <span className="text-sm font-mono text-muted-foreground">ats_sand_••••••••••••7b1c</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <p className="text-sm font-medium">Webhooks</p>
          <span className="text-sm text-muted-foreground">3 configured</span>
        </div>
      </CardContent>
    </Card>
  );
}
