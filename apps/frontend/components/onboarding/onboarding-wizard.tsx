"use client";

/**
 * Phase 29, first-run onboarding wizard.
 *
 * Lives mounted inside DashboardLayout. Pops automatically the first time a
 * tenant-admin lands on the dashboard, walks them through 5 quick setup
 * steps, then never auto-pops again. State lives on Tenant (per-tenant, not
 * per-user), once any admin completes/dismisses, others don't see it.
 *
 * Steps:
 *   1. Brand color (one click, pick a hex)
 *   2. Invite a teammate (email + role)
 *   3. Create first requisition (title + dept + location)
 *   4. Add one interview round (name + type)
 *   5. Copy the public job link
 *
 * Each step has a "skip this step" link that doesn't dismiss the wizard -
 * it just moves on. "Skip onboarding" in the header dismisses for good.
 *
 * Why a single inline wizard rather than separate routes:
 * keeps the user in their dashboard context (so they can see what they
 * just unlocked), state is local + ephemeral (no router state to manage),
 * and the dialog stays mounted across step transitions so an in-flight
 * API call doesn't get cancelled mid-step.
 */
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Copy, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type StepId = "branding" | "team" | "requisition" | "rounds" | "share";

interface OnboardingState {
  steps: Record<StepId, string | null>;
  stepIds: StepId[];
  completedCount: number;
  totalSteps: number;
  nextStep: StepId | null;
  dismissedAt: string | null;
  completedAt: string | null;
  shouldShow: boolean;
}

// 8 hand-picked color presets the user can apply in one click without
// having to think about hex codes. First is the default platform color.
const COLOR_PRESETS = [
  { name: "Default",  hex: "#3b82f6" }, // blue-500
  { name: "Indigo",   hex: "#6366f1" },
  { name: "Violet",   hex: "#8b5cf6" },
  { name: "Pink",     hex: "#ec4899" },
  { name: "Rose",     hex: "#f43f5e" },
  { name: "Emerald",  hex: "#10b981" },
  { name: "Amber",    hex: "#f59e0b" },
  { name: "Slate",    hex: "#475569" },
];

const ROLE_CHOICES = [
  { value: "RECRUITER",      label: "Recruiter" },
  { value: "HIRING_MANAGER", label: "Hiring Manager" },
  { value: "INTERVIEWER",    label: "Interviewer" },
  { value: "ADMIN",          label: "Admin" },
];

const INTERVIEW_TYPES = [
  { value: "PHONE_SCREEN", label: "Phone Screen" },
  { value: "TECHNICAL",    label: "Technical" },
  { value: "BEHAVIORAL",   label: "Behavioral" },
  { value: "PANEL",        label: "Panel" },
  { value: "FINAL",        label: "Final Round" },
];

/** Fetch helper that throws on non-2xx so the caller can show a toast. */
async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include", ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    throw new Error(body?.error?.message ?? body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

interface OnboardingWizardProps {
  /** If true, force the wizard open regardless of dismissed/completed state. */
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingWizard({ forceOpen, onClose }: OnboardingWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("branding");
  const [loading, setLoading] = useState(false);

  // Fetch state on mount. If shouldShow → open the wizard automatically.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const body = await api<{ data?: OnboardingState } | OnboardingState>("/onboarding");
        if (cancelled) return;
        const data = (body as any).data ?? body;
        setState(data);
        const shouldShow = forceOpen ?? data.shouldShow;
        if (shouldShow) {
          setActiveStep(data.nextStep ?? "branding");
          setOpen(true);
        }
      } catch {
        // Silent, onboarding is a nice-to-have; if it fails (e.g. user is
        // not a tenant-admin, the endpoint 403s), we just don't show it.
        if (!cancelled) setState(null);
      }
    })();
    return () => { cancelled = true; };
  }, [forceOpen]);

  function close() {
    setOpen(false);
    onClose?.();
  }

  async function dismiss() {
    setLoading(true);
    try {
      await api("/onboarding/dismiss", { method: "POST" });
      toast.success("You can resume onboarding any time from Settings.");
      close();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to dismiss");
    } finally {
      setLoading(false);
    }
  }

  async function markStepDone(stepId: StepId) {
    try {
      const body = await api<{ data?: OnboardingState } | OnboardingState>(
        `/onboarding/steps/${stepId}/complete`, { method: "POST" }
      );
      const data = (body as any).data ?? body;
      setState((prev) => prev ? { ...prev, ...data } : data);
    } catch {
      // Non-fatal, step still works, just won't be remembered.
    }
  }

  /** Advance to next incomplete step. If none left, finish the wizard. */
  function advance() {
    if (!state) return;
    const all: StepId[] = ["branding", "team", "requisition", "rounds", "share"];
    const idx = all.indexOf(activeStep);
    for (let i = idx + 1; i < all.length; i++) {
      const id = all[i]!;
      if (!state.steps[id]) {
        setActiveStep(id);
        return;
      }
    }
    // All done, refetch state to confirm completedAt was stamped, then close.
    api<{ data?: OnboardingState } | OnboardingState>("/onboarding")
      .then((b: any) => setState(b.data ?? b))
      .catch(() => undefined);
    toast.success("You're all set! 🎉");
    close();
  }

  const progressPct = useMemo(() => {
    if (!state) return 0;
    return Math.round((state.completedCount / state.totalSteps) * 100);
  }, [state]);

  // Don't render until state loaded, avoids a flash of empty dialog.
  if (!state) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); else setOpen(true); }}>
      <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/15 p-2.5">
              <Sparkles className="h-5 w-5 text-ai" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogHeader>
                <DialogTitle className="text-xl">Welcome to your ATS</DialogTitle>
                <DialogDescription>
                  5 quick steps to take you from empty dashboard to your first hire.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-3 flex items-center gap-3">
                <Progress value={progressPct} className="h-2 flex-1" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {state.completedCount} of {state.totalSteps} done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step indicator strip */}
        <div className="flex border-b bg-muted/30">
          {(["branding", "team", "requisition", "rounds", "share"] as StepId[]).map((id, idx) => {
            const done = !!state.steps[id];
            const active = id === activeStep;
            return (
              <button
                key={id}
                onClick={() => setActiveStep(id)}
                className={`flex-1 px-3 py-2.5 text-xs font-medium border-r last:border-r-0 transition-colors ${
                  active ? "bg-background text-foreground" : done ? "text-muted-foreground hover:bg-background/50" : "text-muted-foreground hover:bg-background/50"
                }`}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {done ? (
                    <div className="h-4 w-4 rounded-full bg-ok flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" />
                    </div>
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-current flex items-center justify-center text-[9px] font-bold">
                      {idx + 1}
                    </span>
                  )}
                  <span className="hidden sm:inline">
                    {id === "branding" ? "Brand" : id === "team" ? "Team" : id === "requisition" ? "Job" : id === "rounds" ? "Rounds" : "Share"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 min-h-[280px]">
          {activeStep === "branding"   && <BrandingStep onDone={async () => { await markStepDone("branding"); advance(); }} />}
          {activeStep === "team"        && <TeamStep      onDone={async () => { await markStepDone("team");      advance(); }} />}
          {activeStep === "requisition" && <RequisitionStep onDone={async () => { await markStepDone("requisition"); advance(); }} />}
          {activeStep === "rounds"      && <RoundsStep    onDone={async () => { await markStepDone("rounds");    advance(); }} />}
          {activeStep === "share"       && <ShareStep     onDone={async () => { await markStepDone("share");     advance(); router.refresh(); }} />}
        </div>

        <div className="border-t bg-muted/20 px-6 py-3 flex items-center justify-between">
          <button
            onClick={dismiss}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip onboarding
          </button>
          <button
            onClick={advance}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            Skip this step <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Step 1, Branding ────────────────────────────────────────────────────
function BrandingStep({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!picked) { toast.error("Pick a color to continue"); return; }
    setSaving(true);
    try {
      await api("/branding", {
        method: "PUT",
        body: JSON.stringify({ brandPrimaryColor: picked }),
      });
      toast.success("Brand color saved");
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Pick your brand color</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We'll use this for buttons, links, and accents across your dashboard
          and public career page. You can refine the full palette later in Settings.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c.hex}
            onClick={() => setPicked(c.hex)}
            className={`group relative rounded-lg border p-3 transition-all hover:scale-[1.02] ${
              picked === c.hex ? "border-foreground ring-2 ring-foreground/20" : "border-border"
            }`}
          >
            <div className="h-8 w-full rounded" style={{ backgroundColor: c.hex }} />
            <p className="mt-2 text-xs font-medium">{c.name}</p>
            {picked === c.hex && (
              <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-foreground flex items-center justify-center">
                <Check className="h-3 w-3 text-background" />
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={!picked || saving}>
          {saving ? "Saving…" : "Save & continue"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 2, Invite teammate ─────────────────────────────────────────────
function TeamStep({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("RECRUITER");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function invite() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email"); return;
    }
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Enter a name"); return; }
    // Split on the first space, "Alex Chen" → first="Alex", last="Chen";
    // single-word names become first="Mononym", last="-" since the backend
    // schema requires both fields non-empty.
    const sp = trimmed.indexOf(" ");
    const firstName = sp === -1 ? trimmed : trimmed.slice(0, sp);
    const lastName = sp === -1 ? "-" : trimmed.slice(sp + 1).trim() || "-";
    setSaving(true);
    try {
      await api("/users/invite", {
        method: "POST",
        body: JSON.stringify({ email, role, firstName, lastName }),
      });
      toast.success(`Invite sent to ${email}`);
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send invite");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Invite a teammate</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add one person now, you can invite the rest later from Settings → Team.
          Recruiters and Hiring Managers don't count against your interview-only seats.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="invite-name">Full name</Label>
          <Input id="invite-name" placeholder="Alex Chen" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input id="invite-email" type="email" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="invite-role"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLE_CHOICES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={invite} disabled={saving}>
          {saving ? "Sending…" : "Send invite & continue"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3, First requisition ───────────────────────────────────────────
function RequisitionStep({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!title || !department || !location) {
      toast.error("Fill all three fields"); return;
    }
    setSaving(true);
    try {
      const body = await api<any>("/requisitions", {
        method: "POST",
        body: JSON.stringify({ title, department, location, status: "OPEN" }),
      });
      const reqId = body?.data?.id ?? body?.id;
      // Stash the new req id so the next step can attach rounds to it.
      try { window.sessionStorage.setItem("onboarding-req-id", reqId); } catch {}
      toast.success(`"${title}" created`);
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create requisition");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Create your first job</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start simple, three fields. You can flesh out the description and
          screening questions later from the requisition page.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="req-title">Job title</Label>
          <Input id="req-title" placeholder="Senior Frontend Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="req-dept">Department</Label>
            <Input id="req-dept" placeholder="Engineering" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="req-loc">Location</Label>
            <Input id="req-loc" placeholder="Remote · US" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={create} disabled={saving}>
          {saving ? "Creating…" : "Create job & continue"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4, Interview round ─────────────────────────────────────────────
function RoundsStep({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("Initial Screen");
  const [type, setType] = useState("PHONE_SCREEN");
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name) { toast.error("Name your round"); return; }
    setSaving(true);
    try {
      const reqId = (typeof window !== "undefined" ? window.sessionStorage.getItem("onboarding-req-id") : null);
      await api("/rounds", {
        method: "POST",
        body: JSON.stringify({
          requisitionId: reqId ?? null, // null = global template
          name,
          interviewType: type,
          durationMinutes: duration,
          autoAdvanceOnPass: false,
        }),
      });
      toast.success(`Round "${name}" added`);
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create round");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Configure an interview round</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define the first stage your candidates will go through. You can add
          more rounds (technical, panel, final) later from the requisition page.
        </p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="round-name">Round name</Label>
          <Input id="round-name" placeholder="Initial Screen" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="round-type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="round-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERVIEW_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="round-dur">Duration (min)</Label>
            <Input id="round-dur" type="number" min={15} max={480} value={duration}
                   onChange={(e) => setDuration(Math.max(15, Math.min(480, Number(e.target.value) || 30)))} />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={create} disabled={saving}>
          {saving ? "Adding…" : "Add round & continue"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5, Share career page ───────────────────────────────────────────
function ShareStep({ onDone }: { onDone: () => void }) {
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);

  useEffect(() => {
    api<{ data?: { slug?: string } } | { slug?: string }>("/branding")
      .then((b: any) => setTenantSlug((b.data ?? b)?.slug ?? null))
      .catch(() => setTenantSlug(null));
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = tenantSlug ? `${origin}/careers/${tenantSlug}` : `${origin}/careers`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Copy failed, select the link manually");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Your public career page is live</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Share this link on your website, LinkedIn, or job boards. Candidates
          will see your branding and the job you just created.
        </p>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Input value={url} readOnly className="font-mono text-sm bg-background" />
          <Button variant="outline" size="icon" onClick={copy} title="Copy">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.open(url, "_blank")} title="Open">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: customize the welcome message, logo, and hero image on the public page
          from Settings → Branding.
        </p>
      </div>
      <div className="flex justify-end pt-2">
        <Button onClick={onDone}>
          Finish onboarding
        </Button>
      </div>
    </div>
  );
}
