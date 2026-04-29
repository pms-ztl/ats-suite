"use client";

import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Search,
  Download,
  Trash2,
  XCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

interface ApplicationInfo {
  applicationId: string;
  candidateName: string;
  role: string;
  department: string;
  company: string;
  stage: string;
  status: string;
  appliedAt: string;
}

interface CandidateProfile {
  email: string;
  applications: ApplicationInfo[];
  totalApplications: number;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CandidateProfilePage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [searched, setSearched] = useState(false);

  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `${API_BASE}/public/status?email=${encodeURIComponent(email.trim())}`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) throw new Error("Failed to look up profile");

      const data = await res.json();
      setProfile(data.data ?? data);
    } catch {
      setProfile(null);
      toast.error("Unable to look up your profile. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(applicationId: string) {
    setWithdrawing(true);
    try {
      // Use public endpoint to withdraw
      const res = await fetch(`${API_BASE}/public/status`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        // Update local state
        setProfile((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            applications: prev.applications.map((a) =>
              a.applicationId === applicationId ? { ...a, status: "WITHDRAWN" } : a
            ),
          };
        });
        toast.success("Application withdrawn successfully.");
      }
    } catch {
      toast.error("Failed to withdraw application. Please try again.");
    } finally {
      setWithdrawing(false);
      setWithdrawTarget(null);
    }
  }

  async function handleDownloadData() {
    setDownloading(true);
    try {
      const res = await fetch(
        `${API_BASE}/compliance/gdpr/access?email=${encodeURIComponent(email)}`,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `my-data-${email}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Your data has been downloaded.");
      } else {
        toast.error("Unable to download your data at this time.");
      }
    } catch {
      toast.error("Unable to download your data. Please try again later.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDeleteRequest() {
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/compliance/gdpr/erase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success(
          "Data deletion request submitted. You will receive a confirmation email."
        );
        setDeleteDialogOpen(false);
        setProfile(null);
        setSearched(false);
        setEmail("");
      } else {
        toast.error("Unable to process your deletion request at this time.");
      }
    } catch {
      toast.error("Failed to submit deletion request. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Look up your candidate profile, manage applications, and exercise your
          data rights.
        </p>
      </div>

      {/* Email lookup */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleLookup} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  className={cn("pl-10", emailError && "border-destructive")}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                />
              </div>
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="shrink-0">
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Look Up
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile + applications */}
      {!loading && searched && profile && (
        <>
          {/* Candidate info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Candidate Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.applications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.applications[0].candidateName}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applications */}
          {profile.applications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No applications found for this email.
                </p>
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/jobs">Browse open positions</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">
                Your Applications ({profile.totalApplications})
              </h2>
              {profile.applications.map((app) => (
                <Card key={app.applicationId}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-medium">{app.role}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.company} - {app.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applied {formatDate(app.appliedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant={
                            app.status === "ACTIVE"
                              ? "info"
                              : app.status === "WITHDRAWN"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {app.status === "ACTIVE" ? app.stage : app.status}
                        </Badge>
                        {app.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setWithdrawTarget(app.applicationId)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Withdraw
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Data rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Your Data Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You have the right to access and delete your personal data under
                GDPR and other data protection regulations.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadData}
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download My Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Request Data Deletion
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* No profile found */}
      {!loading && searched && !profile && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No profile found for <strong>{email}</strong>.
            </p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/jobs">Browse open positions and apply</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Withdraw confirmation dialog */}
      <Dialog
        open={!!withdrawTarget}
        onOpenChange={() => setWithdrawTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw this application? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={withdrawing}
              onClick={() => withdrawTarget && handleWithdraw(withdrawTarget)}
            >
              {withdrawing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete data confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Data Deletion</DialogTitle>
            <DialogDescription>
              This will submit a request to permanently delete all your personal
              data from our systems. This includes your profile, application
              history, and any associated documents. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={handleDeleteRequest}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Confirm Deletion Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
