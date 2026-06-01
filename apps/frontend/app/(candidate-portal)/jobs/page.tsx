"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface JobPosting {
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

// Normalized shape for display
interface DisplayJob {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description?: string;
  createdAt: string;
}

const FEATURED_JOBS: DisplayJob[] = [
  {
    id: "featured-1",
    slug: "featured-senior-software-engineer",
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    salaryMin: 150000,
    salaryMax: 200000,
    currency: "USD",
    description:
      "Join our engineering team to build next-generation AI-powered recruitment tools.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "featured-2",
    slug: "featured-product-designer",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "USD",
    description:
      "Design intuitive user experiences for our applicant tracking platform.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "featured-3",
    slug: "featured-data-scientist",
    title: "Data Scientist",
    department: "AI & Machine Learning",
    location: "New York, NY",
    salaryMin: 140000,
    salaryMax: 190000,
    currency: "USD",
    description:
      "Develop ML models for resume screening, candidate matching, and bias detection.",
    createdAt: new Date().toISOString(),
  },
];

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<DisplayJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [usingFeatured, setUsingFeatured] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

        // Use public API, no auth required
        const res = await fetch(`${apiBase}/public/jobs?pageSize=50`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const json = await res.json();
        const items: JobPosting[] = json.data ?? [];

        if (items.length > 0) {
          // Normalize JobPosting to DisplayJob
          setJobs(
            items.map((p) => ({
              id: p.id,
              slug: p.slug,
              title: p.title,
              department: p.requisition.department,
              location: p.requisition.location,
              salaryMin: p.requisition.salaryMin ?? undefined,
              salaryMax: p.requisition.salaryMax ?? undefined,
              currency: p.requisition.salaryCurrency,
              description: p.description,
              createdAt: p.publishedAt,
            }))
          );
        } else {
          setJobs(FEATURED_JOBS);
          setUsingFeatured(true);
        }
      } catch {
        // API unavailable -- show featured jobs
        setJobs(FEATURED_JOBS);
        setUsingFeatured(true);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    );
  }, [jobs, search]);

  function formatSalary(job: DisplayJob): string | null {
    if (!job.salaryMin && !job.salaryMax) return null;
    const cur = job.currency ?? "USD";
    if (job.salaryMin && job.salaryMax) {
      return `${formatCurrency(job.salaryMin, cur)} - ${formatCurrency(job.salaryMax, cur)}`;
    }
    if (job.salaryMin) return `From ${formatCurrency(job.salaryMin, cur)}`;
    if (job.salaryMax) return `Up to ${formatCurrency(job.salaryMax!, cur)}`;
    return null;
  }

  function postedAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Find Your Next Opportunity
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Browse open positions and apply directly. We use AI to match you with
          the best roles while ensuring a fair and transparent process.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by job title, department, or location..."
          className="pl-10 h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {usingFeatured && (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            Showing featured positions
          </Badge>
        </div>
      )}

      {/* Job Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-lg font-semibold">No positions found</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {search
                ? "Try adjusting your search terms."
                : "Check back soon for new openings."}
            </p>
            {search && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <Link key={job.id} href={`/jobs/${job.slug || job.id}/apply`}>
              <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {job.title}
                    </CardTitle>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {job.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-2">
                    {formatSalary(job) && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        {formatSalary(job)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Clock className="h-3 w-3" />
                      {postedAgo(job.createdAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Job count */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} open position
          {filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
