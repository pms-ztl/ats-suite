import { type UserRole } from "@/lib/constants";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  permissions: string[];
}

export interface Session {
  user: AuthUser;
  accessToken: string;
  expiresAt: string;
}
