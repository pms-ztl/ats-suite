"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, MapPin, Briefcase, UserPlus, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FilterBar } from "@/components/shared/filter-bar";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import { exportToCSV } from "@/lib/export";
import { DataTable } from "@/components/shared/data-table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Candidate {
  id: string;
  // Real API uses firstName/lastName; mock uses name
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  currentTitle?: string;
  location?: string;
  source?: string;
  createdAt?: string;
  appliedDate?: string;
  status?: string;
  stage?: string;
  applications?: { id: string; stage: string; requisition?: { title: string } }[];
}

function candidateName(c: Candidate) {
  if (c.name) return c.name;
  return `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Unknown";
}
function candidateInitials(c: Candidate) {
  const parts = candidateName(c).split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}


const candidateColumns: ColumnDef<Candidate, any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <Link href={`/candidates/${c.id}`} className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">{candidateInitials(c)}</span>
          </div>
          <div>
            <p className="text-sm font-medium leading-none group-hover:underline">{candidateName(c)}</p>
            {c.email && <p className="text-xs text-muted-foreground mt-0.5">{c.email}</p>}
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "currentTitle",
    header: "Title",
    cell: ({ getValue }) => <span className="text-sm">{(getValue() as string) ?? "—"}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ getValue }) => {
      const v = getValue() as string | undefined;
      return v ? (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />{v}
        </span>
      ) : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    id: "requisition",
    header: "Role",
    cell: ({ row }) => {
      const title = row.original.applications?.[0]?.requisition?.title;
      return title ? (
        <span className="flex items-center gap-1 text-sm">
          <Briefcase className="h-3 w-3 text-muted-foreground" />{title}
        </span>
      ) : <span className="text-muted-foreground text-sm">—</span>;
    },
  },
  {
    id: "stage",
    header: "Stage",
    cell: ({ row }) => {
      const stage = row.original.applications?.[0]?.stage ?? row.original.stage;
      if (!stage) return <span className="text-muted-foreground text-sm">—</span>;
      return <StatusBadge status={stage} />;
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ getValue }) => <span className="text-sm text-muted-foreground">{(getValue() as string) ?? "—"}</span>,
  },
];

export default function CandidatesPage() {
  const { can } = usePermissions();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [candidateFilters, setCandidateFilters] = useState<Record<string, string>>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", email: "", phone: "", source: "DIRECT" });
  const [addSubmitting, setAddSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await api.candidates.list({ page: currentPage, pageSize, search: search || undefined });
        // Handle both { data: { data: [...], meta: {...} } } and { data: [...], meta: {...} } shapes
        const list = (result as any)?.data?.data ?? (result as any)?.data ?? [];
        const totalCount =
          (result as any)?.data?.meta?.total ??
          (result as any)?.meta?.total ??
          (result as any)?.data?.total ??
          (result as any)?.total ??
          (Array.isArray(list) ? list.length : 0);
        setCandidates(Array.isArray(list) ? list.map((c: any) => ({
          ...c,
          applications: c.applications ?? c.newApplications ?? [],
        })) : []);
        setTotalItems(typeof totalCount === "number" ? totalCount : undefined);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentPage, pageSize, search]);

  const handleExport = () => {
    const headers = ["ID", "First Name", "Last Name", "Email", "Title", "Location", "Source", "Stage", "Requisition", "Created At"];
    const rows = candidates.map(c => {
      const latestApp = c.applications?.[0];
      return [
        c.id,
        c.firstName ?? (c.name?.split(" ")[0] ?? ""),
        c.lastName ?? (c.name?.split(" ").slice(1).join(" ") ?? ""),
        c.email ?? "",
        c.currentTitle ?? "",
        c.location ?? "",
        c.source ?? "",
        latestApp?.stage ?? "",
        latestApp?.requisition?.title ?? "",
        c.createdAt ?? "",
      ];
    });
    exportToCSV(`candidates-export-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${candidates.length} candidates to CSV`);
  };

  const handleAddCandidate = async () => {
    if (!addForm.firstName || !addForm.lastName || !addForm.email) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setAddSubmitting(true);
    try {
      await api.candidates.create(addForm);
      toast.success(`Candidate ${addForm.firstName} ${addForm.lastName} added successfully.`);
      setShowAddDialog(false);
      setAddForm({ firstName: "", lastName: "", email: "", phone: "", source: "DIRECT" });
      setCurrentPage(1);
      setSearch(""); // trigger reload
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add candidate.");
    } finally {
      setAddSubmitting(false);
    }
  };

  if (!can("candidates")) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Experience"
        description="Manage candidates, applications, and talent pipeline"
        breadcrumbs={[{ label: "Candidate Experience" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} disabled={loading || candidates.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-1" />
              Add Candidate
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              size="md"
              label="Total Candidates"
              value={totalItems ?? candidates.length}
              icon={<Users className="h-4 w-4" />}
            />
            <StatCard
              size="md"
              label="Active Applications"
              value={candidates.filter(c => c.applications?.some(a => !["HIRED", "REJECTED"].includes(a.stage))).length}
              variant="success"
              icon={<Briefcase className="h-4 w-4" />}
            />
            <StatCard
              size="md"
              label="Hired"
              value={candidates.filter(c => c.applications?.some(a => a.stage === "HIRED")).length}
              variant="success"
              icon={<UserPlus className="h-4 w-4" />}
            />
            <StatCard
              size="md"
              label="Sources"
              value={Array.from(new Set(candidates.map(c => c.source).filter(Boolean))).length}
              icon={<MapPin className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      {/* Candidate List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> All Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {/* Search and filter bar */}
          <FilterBar
            searchPlaceholder="Search by name, email, or title…"
            searchValue={searchInput}
            onSearchChange={(v) => {
              setSearchInput(v);
              setCurrentPage(1);
              setSearch(v);
            }}
            filters={[
              {
                label: "Stage",
                value: "stage",
                options: [
                  { label: "Applied", value: "APPLIED" },
                  { label: "Screening", value: "SCREENING" },
                  { label: "Interview", value: "INTERVIEW" },
                  { label: "Offer", value: "OFFER" },
                  { label: "Hired", value: "HIRED" },
                  { label: "Rejected", value: "REJECTED" },
                ],
              },
              {
                label: "Source",
                value: "source",
                options: [
                  { label: "LinkedIn", value: "LINKEDIN" },
                  { label: "Indeed", value: "INDEED" },
                  { label: "Referral", value: "REFERRAL" },
                  { label: "Direct", value: "DIRECT" },
                ],
              },
            ]}
            activeFilters={candidateFilters}
            onFilterChange={(key, value) =>
              setCandidateFilters((prev) => ({ ...prev, [key]: value }))
            }
            onClearFilters={() => setCandidateFilters({})}
            className="mb-4"
          />

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 mb-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && candidates.length === 0 ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-4 w-24 hidden md:block" />
                  <Skeleton className="h-4 w-20 hidden md:block" />
                  <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
                </div>
              ))}
            </div>
          ) : (
          <DataTable
            columns={candidateColumns}
            data={candidates.filter((c) => {
              const stageFilter = candidateFilters["stage"];
              if (stageFilter && stageFilter !== "all") {
                const stage = c.applications?.[0]?.stage ?? c.stage;
                if (stage !== stageFilter) return false;
              }
              const sourceFilter = candidateFilters["source"];
              if (sourceFilter && sourceFilter !== "all") {
                if (c.source !== sourceFilter) return false;
              }
              return true;
            })}
            loading={loading}
            pageSize={pageSize}
            totalItems={totalItems}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
            enableSelection={true}
            bulkActions={[
              { label: "Export Selected", value: "export", variant: "outline" },
              { label: "Archive Selected", value: "archive", variant: "outline" },
              { label: "Reject Selected", value: "reject", variant: "destructive" },
            ]}
            onBulkAction={(action, rows) => {
              if (action === "export") {
                exportToCSV(
                  `candidates-selected-${new Date().toISOString().slice(0, 10)}.csv`,
                  ["ID", "Name", "Email", "Status"],
                  rows.map(r => [r.id, candidateName(r), r.email ?? "", r.applications?.[0]?.stage ?? r.status ?? ""])
                );
                toast.success(`Exported ${rows.length} candidates`);
              } else {
                toast.info(`${action}: ${rows.length} candidates — this will be available soon.`);
              }
            }}
            emptyTitle="No candidates found"
            emptyDescription="Candidates will appear here once applications are submitted."
          />
          )}
        </CardContent>
      </Card>
      {/* Add Candidate Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" placeholder="e.g. Sarah" value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" placeholder="e.g. Chen" value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="sarah.chen@example.com" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+1 (555) 000-0000" value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button loading={addSubmitting} onClick={handleAddCandidate}>Add Candidate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
