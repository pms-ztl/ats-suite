import type { AuthUser } from "@/types/auth";

// Mock auth for frontend development
const MOCK_USERS: Record<string, AuthUser> = {
  admin: {
    id: "usr-001",
    name: "Alex Administrator",
    email: "admin@cdcats.com",
    role: "admin",
    department: "Engineering",
    permissions: ["*"],
  },
  recruiter: {
    id: "usr-002",
    name: "Rachel Recruiter",
    email: "rachel@cdcats.com",
    role: "recruiter",
    department: "Talent Acquisition",
    permissions: ["sourcing", "screening", "candidates", "interviews", "scheduling", "decisions", "analytics"],
  },
  hiring_manager: {
    id: "usr-003",
    name: "Henry Manager",
    email: "henry@cdcats.com",
    role: "hiring_manager",
    department: "Engineering",
    permissions: ["interviews", "decisions", "analytics", "candidates"],
  },
  compliance_officer: {
    id: "usr-004",
    name: "Claire Compliance",
    email: "claire@cdcats.com",
    role: "compliance_officer",
    department: "Legal & Compliance",
    permissions: ["compliance", "security", "ai", "analytics"],
  },
};

export function getCurrentUser(): AuthUser {
  return MOCK_USERS.admin;
}

export function hasPermission(user: AuthUser, category: string): boolean {
  if (user.role === "admin") return true;
  return user.permissions.includes(category) || user.permissions.includes("*");
}
