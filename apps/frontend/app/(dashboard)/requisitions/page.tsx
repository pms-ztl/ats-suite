"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Users, DollarSign, Calendar, Plus, Briefcase, Download } from "lucide-react";
import Link from "next/link";
import { FilterBar } from "@/components/shared/filter-bar";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { PageError } from "@/components/shared/page-error";
import { formatDate } from "@/lib/format-date";

interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  priority: number;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  headcount: number;
  targetStartDate: string;
  createdAt: string;
  recruiter?: { firstName: string; lastName: string };
}

const statusColors: Record<string, string> = {
  open: "bg-brand-tint text-brand-ink",
  OPEN: "bg-brand-tint text-brand-ink",
  draft: "bg-surface-3 text-ink-3",
  DRAFT: "bg-surface-3 text-ink-3",
  closed: "bg-danger-tint text-danger",
  CLOSED: "bg-danger-tint text-danger",
  cancelled: "bg-danger-tint text-danger",
  CANCELLED: "bg-danger-tint text-danger",
  on_hold: "bg-warn-tint text-warn",
  ON_HOLD: "bg-warn-tint text-warn",
  filled: "bg-info-tint text-info",
  FILLED: "bg-info-tint text-info",
  in_progress: "bg-ok-tint text-ok",
  IN_PROGRESS: "bg-ok-tint text-ok",
};

function formatSalary(min: number | undefined, max: number | undefined, currency: string | undefined) {
  if (!min && !max) return "-";
  const curr = currency ?? "USD";
  const fmt = (n: number) => `${curr} ${(n / 1000).toFixed(0)}k`;
  if (!min) return `Up to ${fmt(max!)}`;
  if (!max) return `From ${fmt(min)}`;
  return `${fmt(min)} to ${fmt(max)}`;
}

function fetchRequisitions(
  setRequisitions: (r: Requisition[]) => void,
  setLoading: (v: boolean) => void,
  setError: (e: string) => void,
) {
  setLoading(true);
  setError("");
  api.platform.getRequisitions()
    .then((d: any) => {
      const rows = d?.data ?? d ?? [];
      setRequisitions(Array.isArray(rows) ? rows : []);
    })
    .catch(() => setError("Could not load requisitions."))
    .finally(() => setLoading(false));
}

interface NewRequisitionForm {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  remote: boolean;
  description: string;
  requirements: string; // one per line, tunes AI screening
  skills: string;        // comma-separated, seeds AI generation
  customFields: { label: string; value: string }[]; // Phase 3, admin criteria -> screener
}

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "HR", "Finance", "Legal", "Operations",
];

const EMPLOYMENT_TYPES = [
  "Full-time", "Part-time", "Contract", "Internship",
];

export default function RequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reqSearch, setReqSearch] = useState("");
  const [reqFilters, setReqFilters] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState<NewRequisitionForm>({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    remote: false,
    description: "",
    requirements: "",
    skills: "",
    customFields: [],
  });

  function resetForm() {
    setForm({ title: "", department: "", location: "", employmentType: "", remote: false, description: "", requirements: "", skills: "", customFields: [] });
  }

  function handleOpenDialog() {
    resetForm();
    setDialogOpen(true);
  }

  function handleCloseDialog() {
    setDialogOpen(false);
    resetForm();
  }

  async function handleGenerateJd() {
    if (!form.title.trim()) {
      toast.error("Enter a Job Title first, then generate.");
      return;
    }
    setGenerating(true);
    try {
      const skills = form.skills.split(",").map((s) => s.trim()).filter(Boolean);
      const res: any = await api.platform.generateJd({
        title: form.title,
        department: form.department || "General",
        skills: skills.length ? skills : ["relevant skills"],
        level: form.employmentType || "mid",
        location: form.location || "Remote",
      });
      const out = res?.data ?? res ?? {};
      setForm((f) => ({
        ...f,
        description: out.description ?? f.description,
        requirements: Array.isArray(out.requirements) ? out.requirements.join("\n") : f.requirements,
        skills: f.skills || (Array.isArray(out.niceToHave) ? out.niceToHave.join(", ") : f.skills),
      }));
      const score = typeof out.inclusivityScore === "number" ? ` · inclusivity ${out.inclusivityScore}/100` : "";
      toast.success(`AI draft generated${score}. Review & edit before saving.`);
    } catch {
      toast.error("Could not generate a description. Write it manually or try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreateRequisition() {
    if (!form.title.trim()) {
      toast.error("Job Title is required.");
      return;
    }
    setSubmitting(true);
    try {
      const resp: any = await api.platform.createRequisition({
        title: form.title,
        department: form.department,
        location: form.location,
        employmentType: form.employmentType,
        remote: form.remote,
        description: form.description,
        requirements: form.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
        customFields: form.customFields
          .filter((c) => c.label.trim())
          .map((c) => ({ label: c.label.trim(), value: c.value.trim() })),
      });
      toast.success("Requisition created, pending approval.");
      const warnings: string[] = resp?.data?.complianceWarnings ?? resp?.complianceWarnings ?? [];
      if (warnings.length) toast.warning(warnings[0]);
      setDialogOpen(false);
      resetForm();
      fetchRequisitions(setRequisitions, setLoading, setError);
    } catch {
      toast.error("Failed to create requisition. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    fetchRequisitions(setRequisitions, setLoading, setError);
  }, []);

  const handleExport = () => {
    const headers = ["ID", "Title", "Department", "Location", "Status", "Priority", "Salary Min", "Salary Max", "Currency", "Headcount", "Target Start Date", "Created At", "Recruiter"];
    const rows = requisitions.map(req => [
      req.id,
      req.title,
      req.department,
      req.location,
      req.status,
      req.priority,
      req.salaryMin,
      req.salaryMax,
      req.salaryCurrency,
      req.headcount,
      req.targetStartDate ?? "",
      req.createdAt,
      req.recruiter ? `${req.recruiter.firstName} ${req.recruiter.lastName}` : "",
    ]);
    exportToCSV(`requisitions-export-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${requisitions.length} requisitions to CSV`);
  };

  if (loading) return <PageSkeleton />;
  if (error) return (
    <PageError
      message={error}
      onRetry={() => fetchRequisitions(setRequisitions, setLoading, setError)}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requisitions"
        description="Manage open positions, approvals, and job postings"
        breadcrumbs={[{ label: "Requisitions" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={requisitions.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-1" />
              New Requisition
            </Button>
          </div>
        }
      />

      <FilterBar
        searchPlaceholder="Search requisitions…"
        searchValue={reqSearch}
        onSearchChange={setReqSearch}
        filters={[
          {
            label: "Status",
            value: "status",
            options: [
              { label: "Open", value: "OPEN" },
              { label: "Draft", value: "DRAFT" },
              { label: "On Hold", value: "ON_HOLD" },
              { label: "Filled", value: "FILLED" },
              { label: "Cancelled", value: "CANCELLED" },
            ],
          },
        ]}
        activeFilters={reqFilters}
        onFilterChange={(key, value) =>
          setReqFilters((prev) => ({ ...prev, [key]: value }))
        }
        onClearFilters={() => setReqFilters({})}
        className="mb-4"
      />

      {(() => {
        const q = reqSearch.toLowerCase();
        const statusFilter = reqFilters["status"];
        const filteredRequisitions = requisitions.filter((req) => {
          if (q && !req.title?.toLowerCase().includes(q) && !req.department?.toLowerCase().includes(q) && !req.location?.toLowerCase().includes(q)) return false;
          if (statusFilter && statusFilter !== "all" && req.status !== statusFilter) return false;
          return true;
        });

        if (filteredRequisitions.length === 0) return (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{requisitions.length === 0 ? "No requisitions found." : "No requisitions match the current filters."}</p>
          </div>
        );

        return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequisitions.map((req) => (
            <Link key={req.id} href={`/requisitions/${req.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{req.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{req.department}</p>
                  </div>
                  <span className={`text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColors[req.status] ?? "bg-muted text-muted-foreground"}`}>
                    {req.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{req.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3 w-3 shrink-0" />
                    <span>{formatSalary(req.salaryMin, req.salaryMax, req.salaryCurrency)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3 shrink-0" />
                    <span>{req.headcount} headcount{req.headcount > 1 ? "s" : ""}</span>
                    {req.recruiter && (
                      <span className="ml-auto">· {req.recruiter.firstName} {req.recruiter.lastName}</span>
                    )}
                  </div>
                  {req.targetStartDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>Target: {formatDate(req.targetStartDate)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
        );
      })()}

      {/* New Requisition Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Requisition</DialogTitle>
            <DialogDescription>
              Create a new job requisition. Fill in the details below and click Save to submit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="req-title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="req-title"
                placeholder="e.g. Senior Software Engineer"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-skills">Key skills <span className="text-muted-foreground text-xs">(comma-separated, seeds AI + tunes screening)</span></Label>
              <div className="flex items-center gap-2">
                <Input
                  id="req-skills"
                  placeholder="e.g. Python, PyTorch, REST APIs"
                  value={form.skills}
                  onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleGenerateJd} loading={generating} disabled={!form.title.trim()} className="shrink-0 border-ai/40 bg-ai/10 text-ai-ink hover:bg-ai/15 hover:text-ai-ink">
                  ✨ Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-department">Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}
              >
                <SelectTrigger id="req-department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-location">Location</Label>
              <Input
                id="req-location"
                placeholder="e.g. New York, NY or Remote"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-type">Employment Type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) => setForm((f) => ({ ...f, employmentType: v }))}
              >
                <SelectTrigger id="req-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="req-remote">Remote-friendly</Label>
              <Switch
                id="req-remote"
                checked={form.remote}
                onCheckedChange={(v) => setForm((f) => ({ ...f, remote: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-description">Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                id="req-description"
                placeholder="Brief description of the role and requirements..."
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="req-requirements">Requirements <span className="text-muted-foreground text-xs">(one per line, tunes AI screening)</span></Label>
              <Textarea
                id="req-requirements"
                placeholder={"3+ years Python\nREST API design\nCloud (AWS/GCP)"}
                rows={4}
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Custom fields <span className="text-muted-foreground text-xs">(your own labeled criteria, sent to the AI screener)</span></Label>
              {form.customFields.map((cf, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Label (e.g. Open to relocation?)"
                    value={cf.label}
                    onChange={(e) => setForm((f) => { const c = [...f.customFields]; c[i] = { ...c[i], label: e.target.value }; return { ...f, customFields: c }; })}
                  />
                  <Input
                    placeholder="Value (e.g. Yes, Bangalore)"
                    value={cf.value}
                    onChange={(e) => setForm((f) => { const c = [...f.customFields]; c[i] = { ...c[i], value: e.target.value }; return { ...f, customFields: c }; })}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, customFields: f.customFields.filter((_, j) => j !== i) }))}>✕</Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, customFields: [...f.customFields, { label: "", value: "" }] }))}>
                + Add custom field
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequisition} loading={submitting}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
