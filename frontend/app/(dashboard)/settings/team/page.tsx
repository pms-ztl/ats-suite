"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { usePermissions } from "@/lib/use-permissions";
import { AccessDenied } from "@/components/shared/access-denied";
import {
  Users,
  UserPlus,
  ShieldAlert,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

const ROLES = [
  "ADMIN",
  "RECRUITER",
  "HIRING_MANAGER",
  "INTERVIEWER",
  "COMPLIANCE_OFFICER",
] as const;
type Role = (typeof ROLES)[number];

interface TeamUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

const ROLE_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ADMIN: "destructive",
  RECRUITER: "default",
  HIRING_MANAGER: "secondary",
  INTERVIEWER: "outline",
  COMPLIANCE_OFFICER: "secondary",
};

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  return (document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/) ?? [])[1]
    ? decodeURIComponent(
        (document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/) ?? [])[1]
      )
    : null;
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const MOCK_USERS: TeamUser[] = [
  { id: "1", email: "admin@company.com", firstName: "Admin", lastName: "User", role: "ADMIN", isActive: true, createdAt: "2025-01-01T00:00:00Z", lastLoginAt: "2026-04-14T10:00:00Z" },
  { id: "2", email: "recruiter@company.com", firstName: "Jane", lastName: "Doe", role: "RECRUITER", isActive: true, createdAt: "2025-03-15T00:00:00Z", lastLoginAt: "2026-04-13T15:30:00Z" },
  { id: "3", email: "manager@company.com", firstName: "Bob", lastName: "Smith", role: "HIRING_MANAGER", isActive: false, createdAt: "2025-06-01T00:00:00Z", lastLoginAt: null },
];

export default function TeamManagementPage() {
  const { isAdmin } = usePermissions();
  if (!isAdmin) return <AccessDenied />;

  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<TeamUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("RECRUITER");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 500));
        setUsers(MOCK_USERS);
        return;
      }
      const res = await fetch("/api/users", { headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleInvite() {
    if (!inviteEmail || !inviteFirstName || !inviteLastName) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 600));
        const newUser: TeamUser = {
          id: String(Date.now()),
          email: inviteEmail,
          firstName: inviteFirstName,
          lastName: inviteLastName,
          role: inviteRole,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: null,
        };
        setUsers((prev) => [newUser, ...prev]);
      } else {
        const res = await fetch("/api/users/invite", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            email: inviteEmail,
            firstName: inviteFirstName,
            lastName: inviteLastName,
            role: inviteRole,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `${res.status}`);
        }
        await fetchUsers();
      }
      toast.success("Team member invited successfully");
      setInviteOpen(false);
      setInviteEmail("");
      setInviteFirstName("");
      setInviteLastName("");
      setInviteRole("RECRUITER");
    } catch (err: any) {
      toast.error(err?.message || "Failed to invite user");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    try {
      if (USE_MOCKS) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        const res = await fetch(`/api/users/${userId}/role`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ role: newRole }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        await fetchUsers();
      }
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    setSubmitting(true);
    try {
      if (USE_MOCKS) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === deactivateTarget.id ? { ...u, isActive: false } : u
          )
        );
      } else {
        const res = await fetch(`/api/users/${deactivateTarget.id}/deactivate`, {
          method: "PATCH",
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        await fetchUsers();
      }
      toast.success("User deactivated");
      setDeactivateTarget(null);
    } catch {
      toast.error("Failed to deactivate user");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        description="Invite team members, assign roles, and manage access"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Team" },
        ]}
        actions={
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-4 w-4 mr-1" />
            Invite Member
          </Button>
        }
      />

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="inv-first">First Name</Label>
                <Input
                  id="inv-first"
                  value={inviteFirstName}
                  onChange={(e) => setInviteFirstName(e.target.value)}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-last">Last Name</Label>
                <Input
                  id="inv-last"
                  value={inviteLastName}
                  onChange={(e) => setInviteLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">Email</Label>
              <Input
                id="inv-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Inviting...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirmation */}
      <Dialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Deactivate User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate{" "}
              <strong>
                {deactivateTarget?.firstName} {deactivateTarget?.lastName}
              </strong>
              ? They will no longer be able to sign in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deactivating...
                </>
              ) : (
                "Deactivate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" /> Team Members ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No team members found. Invite someone to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Role</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Last Login</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        {user.firstName} {user.lastName}
                      </td>
                      <td className="py-3 text-muted-foreground">{user.email}</td>
                      <td className="py-3">
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleRoleChange(user.id, v)}
                        >
                          <SelectTrigger className="h-7 w-[170px] text-xs">
                            <Badge variant={ROLE_COLORS[user.role] || "outline"} className="text-xs">
                              {user.role.replace(/_/g, " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3">
                        <Badge variant={user.isActive ? "default" : "outline"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="py-3 text-right">
                        {user.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive hover:text-destructive"
                            onClick={() => setDeactivateTarget(user)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
