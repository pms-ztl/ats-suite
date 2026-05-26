"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Building2, User, CheckCircle2, Rocket, Zap, Crown, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

// ── Plan metadata ───────────────────────────────────────────────────────────
const PLANS = {
  FREE: {
    label: "Free",
    price: "$0/mo",
    description: "Up to 3 jobs · 1 seat · Basic AI",
    icon: Rocket,
    color: "border-border bg-card",
    badge: null,
  },
  STARTER: {
    label: "Starter",
    price: "$149/mo",
    description: "Up to 20 jobs · 5 seats · Full AI screening",
    icon: Zap,
    color: "border-blue-500/50 bg-blue-500/5",
    badge: "Most popular",
  },
  PROFESSIONAL: {
    label: "Professional",
    price: "$399/mo",
    description: "Unlimited · 15 seats · All 12 agents",
    icon: Crown,
    color: "border-primary/50 bg-primary/5",
    badge: "Recommended",
  },
} as const;

type PlanKey = keyof typeof PLANS;

// ── Step components ─────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[
        { n: 1, label: "Your company" },
        { n: 2, label: "Your account" },
        { n: 3, label: "Done" },
      ].map(({ n, label }, i, arr) => (
        <div key={n} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                step > n
                  ? "bg-emerald-500 text-white"
                  : step === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {step > n ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span className={cn(
              "text-2xs whitespace-nowrap",
              step === n ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {label}
            </span>
          </div>
          {i < arr.length - 1 && (
            <div className={cn(
              "h-px w-12 mb-4 transition-colors",
              step > n ? "bg-emerald-500" : "bg-border"
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

function GetStartedForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = (searchParams.get("plan") as PlanKey) || "FREE";

  const [step, setStep]             = useState(1);
  const [plan, setPlan]             = useState<PlanKey>(initialPlan);
  const [orgName, setOrgName]       = useState("");
  const [industry, setIndustry]     = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite]       = useState("");
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [newTenant, setNewTenant]   = useState<any>(null);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) { setError("Company name is required."); return; }
    setError("");
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/register-company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          industry:    industry || undefined,
          companySize: companySize || undefined,
          website:     website || undefined,
          plan,
          firstName,
          lastName,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");

      // Store tokens
      const token = data.data?.token;
      if (token) {
        try { window.sessionStorage.setItem("ats-access-token", token); } catch {}
        document.cookie = `ats-token=${token}; path=/; max-age=86400; SameSite=Strict`;
      }
      setNewTenant(data.data?.tenant);
      setStep(3);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: success ─────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You&apos;re all set!</h2>
        <p className="text-muted-foreground text-sm mb-1">
          <span className="font-semibold text-foreground">{newTenant?.name}</span> workspace is ready.
        </p>
        {newTenant?.trialEndsAt && (
          <Badge variant="secondary" className="mb-6 mt-2">
            14-day trial · no credit card required
          </Badge>
        )}
        <div className="space-y-3 mt-6">
          <Button
            className="w-full glow-primary"
            onClick={() => router.push("/")}
          >
            Go to your dashboard <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Invite your team from <strong>Settings → Team</strong> after you log in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator step={step} />

      {/* ── Step 1: Company info ── */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Tell us about your company</h2>
            <p className="text-sm text-muted-foreground">This creates your isolated ATS workspace.</p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="orgName">Company name <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="orgName"
                placeholder="Acme Corp"
                className="pl-9"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {[
                    "Technology", "Healthcare", "Finance", "Retail",
                    "Manufacturing", "Education", "Consulting", "Media", "Other"
                  ].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Company size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger id="size"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {["1-10", "11-50", "51-200", "201-500", "500+"].map(s => (
                    <SelectItem key={s} value={s}>{s} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://company.com"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>

          {/* Plan selection */}
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => {
                const Icon = p.icon;
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => setPlan(key)}
                    className={cn(
                      "relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all",
                      plan === key ? p.color + " ring-2 ring-primary/40" : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    {p.badge && (
                      <span className="absolute -top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        {p.badge}
                      </span>
                    )}
                    <Icon className={cn("h-4 w-4", plan === key ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-xs font-semibold">{p.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{p.description}</span>
                    <span className="text-xs font-bold mt-1">{p.price}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Paid plans start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <Button type="submit" className="w-full glow-primary">
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </form>
      )}

      {/* ── Step 2: Admin account ── */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-1">Create your admin account</h2>
            <p className="text-sm text-muted-foreground">
              This will be the owner account for <strong>{orgName}</strong>.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="firstName" placeholder="Jane" className="pl-9" value={firstName} onChange={e => setFirstName(e.target.value)} required autoFocus />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name <span className="text-destructive">*</span></Label>
              <Input id="lastName" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email <span className="text-destructive">*</span></Label>
            <Input id="email" type="email" placeholder="jane@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
            <Input id="password" type="password" placeholder="8+ characters" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
            {password && password.length < 8 && (
              <p className="text-xs text-destructive">At least 8 characters required.</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => { setStep(1); setError(""); }} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1 glow-primary" disabled={loading}>
              {loading ? "Creating workspace…" : "Create workspace"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            By signing up you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      )}
    </div>
  );
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-primary glow-primary flex items-center justify-center">
              <span className="text-base font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-bold">CDC ATS</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>

        <Card className="glass-surface border-border/60 shadow-xl">
          <CardContent className="pt-6">
            <Suspense>
              <GetStartedForm />
            </Suspense>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} CDC ATS · Enterprise AI Hiring Platform
        </p>
      </div>
    </div>
  );
}
