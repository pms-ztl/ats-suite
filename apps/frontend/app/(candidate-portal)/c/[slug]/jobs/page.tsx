"use client";

/**
 * Phase 20, tenant-whitelabeled jobs index.
 *
 * URL: /c/{slug}/jobs
 *
 * Lists job postings scoped to the tenant identified by {slug}. Branding
 * (logo, colors, hero, welcome message) comes from the BrandedShell. Job
 * data comes from /api/public/jobs?tenantSlug={slug}.
 *
 * Falls back to "no open roles" if the tenant has nothing published yet.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BrandedShell } from "@/components/careers/branded-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Briefcase, ArrowRight, DollarSign } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface PublicJob {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements: string[];
  publishedAt: string;
  expiresAt: string | null;
  requisition: {
    department: string;
    location: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    tenant: { name: string; slug: string };
  };
}

function formatSalary(min: number | null, max: number | null, currency: string) {
  if (min == null && max == null) return null;
  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (min != null && max != null) return `${fmt(min)} to ${fmt(max)}`;
  return fmt(min ?? max!);
}

export default function TenantJobsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [jobs, setJobs] = useState<PublicJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/public/jobs?tenantSlug=${encodeURIComponent(slug)}&limit=50`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        const list: PublicJob[] = body.data?.jobs ?? body.jobs ?? body.data ?? body ?? [];
        setJobs(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Jobs fetch failed", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const filtered = jobs.filter((j) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      j.title.toLowerCase().includes(q) ||
      j.requisition.department.toLowerCase().includes(q) ||
      j.requisition.location.toLowerCase().includes(q)
    );
  });

  return (
    <BrandedShell slug={slug as string}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Open roles</h2>
            <p className="text-muted-foreground text-sm">
              {loading ? "Loading…" : `${filtered.length} open role${filtered.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, team, or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <Briefcase className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="font-medium">No open roles right now</p>
              <p className="text-sm text-muted-foreground">
                Check back later, we&apos;re always growing.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-3">
          {filtered.map((job) => {
            const salary = formatSalary(job.requisition.salaryMin, job.requisition.salaryMax, job.requisition.salaryCurrency);
            return (
              <Link key={job.id} href={`/c/${slug}/jobs/${job.id}/apply`} className="block group">
                <Card className="hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {job.requisition.department}
                          {job.requisition.location && (
                            <>
                              {" · "}
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.requisition.location}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {job.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      {salary && (
                        <Badge variant="outline" className="font-normal">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {salary}
                        </Badge>
                      )}
                      {job.requirements.slice(0, 3).map((r) => (
                        <Badge key={r} variant="secondary" className="font-normal">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </BrandedShell>
  );
}
