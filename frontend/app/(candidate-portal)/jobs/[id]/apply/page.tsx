"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  MapPin,
  Building2,
  Upload,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface JobDetail {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  description?: string;
  requirements?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  coverLetter: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  resume?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<JobDetail | null>(null);
  const [jobLoading, setJobLoading] = useState(true);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    coverLetter: "",
  });
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch job details via public API (slug-based lookup)
  useEffect(() => {
    async function fetchJob() {
      // Skip fetching for featured/placeholder IDs
      if (jobId.startsWith("featured")) {
        setJob({
          id: jobId,
          slug: jobId,
          title:
            jobId === "featured-senior-software-engineer"
              ? "Senior Software Engineer"
              : jobId === "featured-product-designer"
                ? "Product Designer"
                : "Data Scientist",
          department:
            jobId === "featured-senior-software-engineer"
              ? "Engineering"
              : jobId === "featured-product-designer"
                ? "Design"
                : "AI & Machine Learning",
          location:
            jobId === "featured-senior-software-engineer"
              ? "San Francisco, CA"
              : jobId === "featured-product-designer"
                ? "Remote"
                : "New York, NY",
          description:
            "We are looking for talented individuals to join our growing team. You will work on cutting-edge technology, collaborating with a diverse group of professionals dedicated to building the future of AI-powered recruitment.",
        });
        setJobLoading(false);
        return;
      }

      try {
        // Use public API — look up by slug (no auth required)
        const res = await fetch(`${API_BASE}/public/jobs/${jobId}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Not found");
        const json = await res.json();
        const posting = json.data ?? json;
        setJob({
          id: posting.id,
          slug: posting.slug,
          title: posting.title,
          department: posting.requisition?.department ?? "",
          location: posting.requisition?.location ?? "",
          description: posting.description ?? posting.requisition?.description,
          salaryMin: posting.requisition?.salaryMin,
          salaryMax: posting.requisition?.salaryMax,
          currency: posting.requisition?.salaryCurrency,
        });
      } catch {
        setJob(null);
      } finally {
        setJobLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!validateEmail(form.email)) errs.email = "Invalid email format";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!resume) errs.resume = "Resume is required";
    return errs;
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      // Use public apply endpoint — no auth required
      const payload = {
        jobPostingId: job?.id ?? jobId,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        linkedinUrl: form.linkedinUrl.trim() || undefined,
        coverLetter: form.coverLetter.trim() || undefined,
        source: "CAREER_PAGE",
      };

      const res = await fetch(`${API_BASE}/public/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error?.message || `Application failed (${res.status})`
        );
      }

      // If resume exists, attempt upload (best-effort)
      const result = await res.json();
      const candidateId = result.data?.candidateId;

      if (resume && candidateId) {
        try {
          const formData = new FormData();
          formData.append("file", resume);
          formData.append("type", "RESUME");

          await fetch(`${API_BASE}/candidates/${candidateId}/documents`, {
            method: "POST",
            body: formData,
          });
        } catch {
          // Resume upload failed but application was created -- not fatal
          console.warn("Resume upload failed, application was still created.");
        }
      }

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  // Success state
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">
              Application Submitted!
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Thank you for applying
              {job ? ` for ${job.title}` : ""}. We will
              review your application and get back to you soon.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="outline" asChild>
                <Link href="/jobs">Browse more jobs</Link>
              </Button>
              <Button asChild>
                <Link href="/status">Track your application</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (jobLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Card>
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="max-w-xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">Position not found</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This job posting may have been removed or is no longer available.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/jobs">Back to job board</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {/* Job header */}
      <div>
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {job.department}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </span>
        </div>
        {job.description && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Application form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Apply for this position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Resume */}
            <div className="space-y-1.5">
              <Label htmlFor="resume">
                Resume <span className="text-destructive">*</span>
              </Label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  errors.resume
                    ? "border-destructive/50 bg-destructive/5"
                    : resume
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-slate-200 hover:border-primary/50"
                }`}
              >
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                {resume ? (
                  <div>
                    <p className="text-sm font-medium text-emerald-700">
                      {resume.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(resume.size / 1024).toFixed(0)} KB
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => {
                        setResume(null);
                        setErrors((prev) => ({ ...prev, resume: undefined }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOC, or DOCX (max 10MB)
                    </p>
                  </div>
                )}
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setResume(file);
                    if (file)
                      setErrors((prev) => ({ ...prev, resume: undefined }));
                  }}
                />
              </div>
              {errors.resume && (
                <p className="text-xs text-destructive">{errors.resume}</p>
              )}
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/janedoe"
                value={form.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
              />
            </div>

            {/* Cover letter */}
            <div className="space-y-1.5">
              <Label htmlFor="coverLetter">Cover Letter (optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                className="min-h-[120px]"
                value={form.coverLetter}
                onChange={(e) => updateField("coverLetter", e.target.value)}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <span className="text-destructive">*</span> Required fields
              </p>
              <Button type="submit" disabled={submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
