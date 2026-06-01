"use client";

/**
 * Phase 20, tenant-whitelabeled apply page.
 *
 * URL: /c/{slug}/jobs/{id}/apply
 *
 * Renders the job detail + application form inside the tenant-branded
 * shell. Uses the public custom form schema (Batch 4) if one exists, else
 * a minimal default form (name/email/phone/resume/cover letter).
 *
 * Submission goes to /api/public/jobs/{slug}/apply-custom, which validates
 * against the tenant's form schema (if any) and creates a Candidate +
 * Application + uploads any file attachments.
 */
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrandedShell } from "@/components/careers/branded-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Briefcase, MapPin, Loader2, CheckCircle2, Upload, DollarSign } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface PublicJob {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string[];
  requisition: {
    department: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
  };
}

interface FormSchemaField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  fileTypes?: string[];
  maxSizeMb?: number;
  helpText?: string;
  order?: number;
}

interface FormSchema {
  id: string;
  name: string;
  fields: FormSchemaField[];
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (min == null && max == null) return null;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${fmt(min)} to ${fmt(max)}`;
  return fmt(min ?? max!);
}

export default function TenantApplyPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<PublicJob | null>(null);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Default form fields when no custom schema exists.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // Custom form state, keyed by fieldId
  const [customValues, setCustomValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!slug || !id) return;
    void (async () => {
      try {
        const [jobRes, schemaRes] = await Promise.all([
          fetch(`${API_BASE}/public/jobs/${encodeURIComponent(id)}`),
          // Schema is optional, 404 is fine, default form below
          fetch(`${API_BASE}/public/jobs/${encodeURIComponent(id)}/form`).catch(() => null),
        ]);
        if (jobRes.ok) {
          const body = await jobRes.json();
          setJob(body.data ?? body);
        }
        if (schemaRes && schemaRes.ok) {
          const body = await schemaRes.json();
          const s: FormSchema = body.data ?? body;
          if (s && Array.isArray(s.fields)) setSchema(s);
        }
      } catch (err) {
        console.error("Job fetch failed", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (schema) {
        for (const field of schema.fields) {
          const v = customValues[field.id];
          if (v == null) continue;
          if (field.type === "file" || field.type === "image") {
            if (v instanceof File) formData.append(field.id, v, v.name);
          } else {
            formData.append(field.id, String(v));
          }
        }
      } else {
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("email", email);
        formData.append("phone", phone);
        if (coverLetter) formData.append("coverLetter", coverLetter);
        if (resumeFile) formData.append("resume", resumeFile, resumeFile.name);
      }

      const res = await fetch(`${API_BASE}/public/jobs/${encodeURIComponent(id)}/apply-custom`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `Submission failed (HTTP ${res.status})`);
      }
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (err: any) {
      toast.error(err.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <BrandedShell slug={slug as string} hero={false}>
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </BrandedShell>
    );
  }

  if (!job) {
    return (
      <BrandedShell slug={slug as string} hero={false}>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 mx-auto text-muted-foreground" />
            <p className="font-medium">This role isn&apos;t accepting applications</p>
            <p className="text-sm text-muted-foreground">It may have been removed or closed.</p>
            <Link href={`/c/${slug}/jobs`} className="text-primary text-sm underline inline-block">
              See other open roles
            </Link>
          </CardContent>
        </Card>
      </BrandedShell>
    );
  }

  if (submitted) {
    return (
      <BrandedShell slug={slug as string} hero={false}>
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-ok" />
            <h2 className="text-xl font-semibold">Application received</h2>
            <p className="text-sm text-muted-foreground">
              Thanks for applying to <strong>{job.title}</strong>. Our team will review your application
              and reach out via email if there&apos;s a match.
            </p>
            <Link href={`/c/${slug}/jobs`}>
              <Button variant="outline" className="mt-4">
                Browse other roles
              </Button>
            </Link>
          </CardContent>
        </Card>
      </BrandedShell>
    );
  }

  const salary = formatSalary(job.requisition.salaryMin, job.requisition.salaryMax, job.requisition.salaryCurrency);

  return (
    <BrandedShell slug={slug as string} hero={false}>
      <div className="space-y-6">
        <Link href={`/c/${slug}/jobs`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" /> All roles
        </Link>

        {/* Role detail card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.requisition.department}
                  </span>
                  {job.requisition.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.requisition.location}
                    </span>
                  )}
                  {salary && (
                    <Badge variant="outline" className="font-normal">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {salary}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {job.description}
              </div>
            )}
            {job.requirements?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">What we&apos;re looking for</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {job.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application form */}
        <Card>
          <CardHeader>
            <CardTitle>Apply</CardTitle>
            <CardDescription>
              {schema
                ? "Fill in the application form below. Fields marked with * are required."
                : "Tell us about yourself. We'll get back to you soon."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {schema ? (
                schema.fields
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .map((field) => (
                    <CustomFieldRow
                      key={field.id}
                      field={field}
                      value={customValues[field.id]}
                      onChange={(v) => setCustomValues((cv) => ({ ...cv, [field.id]: v }))}
                    />
                  ))
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First name *</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last name *</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="resume">Resume *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT. Max 10MB.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="coverLetter">Cover letter</Label>
                    <Textarea
                      id="coverLetter"
                      rows={5}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Why are you a great fit for this role?"
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Submit application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </BrandedShell>
  );
}

// ─── Custom field renderer ─────────────────────────────────────────────────

function CustomFieldRow({
  field,
  value,
  onChange,
}: {
  field: FormSchemaField;
  value: any;
  onChange: (v: any) => void;
}) {
  const label = (
    <Label htmlFor={field.id}>
      {field.label} {field.required && "*"}
    </Label>
  );
  const help = field.helpText ? <p className="text-xs text-muted-foreground">{field.helpText}</p> : null;

  switch (field.type) {
    case "textarea":
      return (
        <div className="space-y-1.5">
          {label}
          <Textarea
            id={field.id}
            rows={4}
            placeholder={field.placeholder}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
          {help}
        </div>
      );
    case "select":
    case "radio":
      return (
        <div className="space-y-1.5">
          {label}
          <select
            id={field.id}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
          >
            <option value="">Select…</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {help}
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-start gap-2">
          <input
            id={field.id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            required={field.required}
            className="mt-1"
          />
          <div className="space-y-1">
            <label htmlFor={field.id} className="text-sm">
              {field.label} {field.required && "*"}
            </label>
            {help}
          </div>
        </div>
      );
    case "file":
    case "image":
      return (
        <div className="space-y-1.5">
          {label}
          <Input
            id={field.id}
            type="file"
            accept={field.fileTypes?.join(",")}
            onChange={(e) => onChange(e.target.files?.[0])}
            required={field.required}
          />
          {help ?? (
            <p className="text-xs text-muted-foreground">
              {field.fileTypes?.length ? `Allowed: ${field.fileTypes.join(", ")}` : "Any file type"}
              {field.maxSizeMb ? ` · Max ${field.maxSizeMb}MB` : ""}
            </p>
          )}
        </div>
      );
    case "date":
      return (
        <div className="space-y-1.5">
          {label}
          <Input
            id={field.id}
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
          />
          {help}
        </div>
      );
    case "number":
      return (
        <div className="space-y-1.5">
          {label}
          <Input
            id={field.id}
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
          {help}
        </div>
      );
    default:
      return (
        <div className="space-y-1.5">
          {label}
          <Input
            id={field.id}
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : "text"}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
          {help}
        </div>
      );
  }
}
