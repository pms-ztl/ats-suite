/**
 * Internal user routes — called only by api-gateway over the cluster network.
 * Routes ALL require the X-Internal-Service token header to be set (defense
 * in depth — see readAuthHeaders in app.ts).
 */
import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import argon2 from "argon2";
import { ok, created, Errors, getTenantId, requireRole, requireTenantAdmin } from "@cdc-ats/common";
import { CreateUserInputSchema, LoginInputSchema, UserRoleSchema } from "@cdc-ats/contracts";
// prisma = admin (default, used by the auth/saga/super-admin/invite paths).
// prismaRls = RLS-scoped, used ONLY by the pure per-tenant user-management
// handlers below (assignable list, role change, deactivate).
import { prisma, prismaRls } from "../lib/prisma.js";
import { PLAN_LIMITS, canAddSeats, isUnlimited } from "../lib/plan-limits.js";

const router = Router();

// ─── POST /internal/users/verify-credentials ──────────────────────────────
// Called by gateway during /api/auth/login. Returns user record on match,
// 401 on mismatch / inactive.
// NOTE: intentionally NOT requireRole-guarded — this endpoint is what
// CREATES the role context (verifies credentials, returns user info so
// gateway can sign a JWT). No JWT exists at this moment. Trusted via
// network policy (only gateway can reach it).
router.post("/verify-credentials", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginInputSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { email: body.email.toLowerCase() },
    });
    if (!user) throw Errors.unauthorized("Invalid email or password");
    if (!user.isActive) throw Errors.forbidden("Account disabled");

    const valid = await argon2.verify(user.passwordHash, body.password);
    if (!valid) throw Errors.unauthorized("Invalid email or password");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    ok(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /internal/users — create user (called by register-company saga) ─
// NOTE: intentionally NOT requireRole-guarded — saga path runs BEFORE the
// new tenant admin has a JWT. Same trust model as POST /internal/tenants.
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateUserInputSchema.parse(req.body);

    // Body-tenant hardening (master prompt §7 — tenant context is NEVER trusted
    // from a client body field when a verified context exists).
    //
    // This route is DUAL-PURPOSE:
    //   1. Legitimate pre-auth bootstrap: the register-company saga calls it
    //      with NO gateway user headers (req.user undefined) to create the very
    //      first ADMIN of a brand-new tenant. body.tenantId is the only tenant
    //      source here and MUST be honored — this is the new-tenant signup path
    //      and must not break.
    //   2. Exposure to guard: the generic `/api/users` gateway proxy forwards
    //      ANY authenticated POST /api/users to /internal/users, arriving WITH a
    //      verified req.user (X-Tenant-Id from the caller's JWT). Without this
    //      guard an authenticated caller could POST { tenantId: "<victim>" } and
    //      mint a user inside a tenant they do not belong to.
    //
    // So: only when a verified tenant context is present do we require the body
    // tenantId to match it (reject a mismatch with 400 — the verified context
    // always wins, never the body). Pre-auth saga requests (no req.user) keep
    // their existing behavior. Additive + backward-compatible.
    if (req.user?.tenantId && body.tenantId !== req.user.tenantId) {
      throw Errors.validation("tenantId in body does not match the authenticated tenant");
    }

    const existing = await prisma.user.findFirst({
      where: { tenantId: body.tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw Errors.conflict("User with this email already exists in this tenant");

    const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });
    // Phase 35 — optional org-hierarchy link. It is NOT part of the shared
    // CreateUserInputSchema (which strips unknown keys), so read it off the
    // raw body. Used by the seed to attach staff to a manager.
    const managerId =
      typeof (req.body as any)?.managerId === "string" && (req.body as any).managerId
        ? ((req.body as any).managerId as string)
        : null;
    const user = await prisma.user.create({
      data: {
        tenantId: body.tenantId,
        email: body.email.toLowerCase(),
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        isActive: true,
        managerId,
      },
    });

    created(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      managerId: user.managerId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/seats?tenantId=&plan= ────────────────────────────
// Gateway calls this when sidebar needs the current seat count.
// `plan` query param avoids a cross-service call to tenant-service.
router.get("/seats", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.query["tenantId"] as string | undefined;
    const plan = (req.query["plan"] as string | undefined) ?? "FREE";
    if (!tenantId) throw Errors.validation("tenantId query param is required");

    const used = await prisma.user.count({ where: { tenantId, isActive: true } });
    const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS["FREE"]!;
    const limit = limits.seats;
    ok(res, {
      plan,
      used,
      limit,
      unlimited: isUnlimited(limit),
      remaining: isUnlimited(limit) ? null : Math.max(0, limit - used),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/platform-stats — SUPER_ADMIN cross-tenant counts ─
// Returns { total, byTenant } for the super-admin dashboard (KPI total +
// per-tenant userCount enrichment). Declared before /:id so the literal path
// isn't captured as a user id.
router.get("/platform-stats", requireRole("SUPER_ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const grouped = await prisma.user.groupBy({ by: ["tenantId"], _count: { _all: true } });
    const byTenant: Record<string, number> = {};
    let total = 0;
    for (const r of grouped) {
      byTenant[r.tenantId] = r._count._all;
      total += r._count._all;
    }
    ok(res, { total, byTenant });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/platform/operators — SUPER_ADMIN operator roster ─
// Cross-tenant read of every SUPER_ADMIN user (the platform operator team) for
// the super-admin console's Operators & Roles screen. Uses the admin (non-RLS)
// `prisma` client because operators live across tenants and must all be seen.
// Returns { operators: [{ name, email, role, mfa, lastActive, status }] }.
// Declared before /:id so the literal path isn't captured as a user id.
router.get("/platform/operators", requireRole("SUPER_ADMIN"), async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "SUPER_ADMIN" },
      orderBy: [{ lastLoginAt: "desc" }, { createdAt: "asc" }],
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        mfaEnabled: true,
        lastLoginAt: true,
        isActive: true,
      },
      take: 500,
    });
    const operators = users.map((u: typeof users[number]) => ({
      name: `${u.firstName} ${u.lastName}`.trim() || u.email,
      email: u.email,
      role: "Super Admin",
      mfa: u.mfaEnabled,
      lastActive: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      status: u.isActive ? "active" : "inactive",
    }));
    ok(res, { operators });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/platform/security — SUPER_ADMIN security telemetry ─
// Real-derived KPIs (24h active sessions, MFA adoption %) + the active-sessions
// list for the super-admin "Security & Access" screen. Cross-tenant admin read,
// gated to SUPER_ADMIN. Declared before /:id so "platform" isn't read as a user id.
router.get(
  "/platform/security",
  requireRole("SUPER_ADMIN"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [totalUsers, mfaEnabledUsers, activeSessions, recent] = await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: true, mfaEnabled: true } }),
        prisma.user.count({ where: { isActive: true, lastLoginAt: { gte: since24h } } }),
        prisma.user.findMany({
          where: { isActive: true, lastLoginAt: { not: null } },
          orderBy: { lastLoginAt: "desc" },
          take: 25,
          select: {
            id: true,
            tenantId: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            mfaEnabled: true,
            lastLoginAt: true,
          },
        }),
      ]);
      const mfaAdoptionPct = totalUsers > 0 ? Math.round((mfaEnabledUsers / totalUsers) * 100) : 0;
      const sessions = recent.map((u: typeof recent[number]) => ({
        userId: u.id,
        tenantId: u.tenantId,
        name: `${u.firstName} ${u.lastName}`.trim() || u.email,
        email: u.email,
        role: u.role,
        mfaEnabled: u.mfaEnabled,
        lastLoginAt: u.lastLoginAt,
      }));
      ok(res, { activeSessions, totalUsers, mfaEnabledUsers, mfaAdoptionPct, sessions });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /internal/users/assignable — minimal tenant roster for pickers ───
// Powers the interview-panel assignment UI. Accessible to scheduler roles
// (not just ADMIN, unlike the full GET /). Returns a minimal projection — id,
// name, role, NO email/PII — of ACTIVE users in the caller's tenant. Reads
// tenant from the gateway-injected X-Tenant-Id header (getTenantId), so no
// query param is required. Declared before /:id.
router.get(
  "/assignable",
  requireRole("ADMIN", "RECRUITER", "HIRING_MANAGER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = getTenantId(req);
      const users = await prismaRls.user.findMany({
        where: { tenantId, isActive: true },
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        select: { id: true, firstName: true, lastName: true, role: true },
        take: 500,
      });
      ok(res, users);
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /internal/users/invite ─────────────────────────────────────────
// Body: { tenantId, plan, email, firstName, lastName, role, invitedByUserId }
const InviteSchema = z.object({
  tenantId: z.string().uuid(),
  plan: z.string().default("FREE"),
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  role: UserRoleSchema,
  invitedByUserId: z.string().uuid(),
});

// Phase 35 — who can add whom. An inviter may only create users in roles
// strictly beneath their own; this builds the dynamic org tree (ADMIN ->
// HIRING_MANAGER -> RECRUITER -> INTERVIEWER) without letting anyone mint a
// peer or a higher tier. The new user's managerId is set to the inviter below.
const ROLE_HIERARCHY: Record<string, string[]> = {
  // Phase 36: DEPARTMENT_HEAD + EXECUTIVE added additively. SUPER_ADMIN/ADMIN
  // may now also mint these org-leadership roles; a DEPARTMENT_HEAD grows its
  // own department (hiring managers + recruiters + interviewers). Existing rows
  // above the additions are unchanged so no prior invite path regresses.
  SUPER_ADMIN: ["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  ADMIN: ["RECRUITER", "HIRING_MANAGER", "INTERVIEWER", "COMPLIANCE_OFFICER", "DEPARTMENT_HEAD", "EXECUTIVE"],
  EXECUTIVE: ["DEPARTMENT_HEAD", "HIRING_MANAGER", "RECRUITER", "INTERVIEWER"],
  DEPARTMENT_HEAD: ["HIRING_MANAGER", "RECRUITER", "INTERVIEWER"],
  HIRING_MANAGER: ["RECRUITER", "INTERVIEWER"],
  RECRUITER: ["INTERVIEWER"],
  INTERVIEWER: [],
  COMPLIANCE_OFFICER: [],
  CANDIDATE: [],
};

// Phase 27 F-028-micro-P0: only tenant admins can invite users.
// Phase 31a — closes the "invited users can never log in" gap.
//
// Old behaviour (broken): created user with a random tempPassword, returned
// it in the response body, and... never emailed it. User was permanently
// stuck unable to log in.
//
// New behaviour: create user with an UNGUESSABLE placeholder password +
// create an InviteToken (7-day expiry). Gateway emails an /accept-invite
// link via notification-service. User sets their real password through
// the accept flow, which marks the token used and overwrites passwordHash.
router.post("/invite", requireRole("ADMIN", "HIRING_MANAGER", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = InviteSchema.parse(req.body);

    // Body-tenant hardening (master prompt §7 — tenant context is NEVER
    // trusted from a client body field). requireRole above guarantees a
    // gateway-verified req.user (tenant + id derived from the JWT). The gateway
    // ALSO injects body.tenantId/body.invitedByUserId before forwarding, so in
    // the normal path they equal the verified context. We reconcile the two:
    //   - reject a MISMATCH with a 400 (a body tenantId/inviter that disagrees
    //     with the verified one must never silently win — that would let a
    //     caller write into a tenant they are not authorized for), and
    //   - rebind to the verified values so EVERY downstream write below uses
    //     the trusted context, never the body.
    // Backward-compatible: when body and context agree (the gateway path) this
    // is a no-op. Defense in depth for the case where /internal/users/invite is
    // reached via the generic proxy or another internal caller.
    const verifiedTenantId = getTenantId(req);
    const verifiedInviterId = req.user!.id;
    if (body.tenantId !== verifiedTenantId) {
      throw Errors.validation("tenantId in body does not match the authenticated tenant");
    }
    if (body.invitedByUserId !== verifiedInviterId) {
      throw Errors.validation("invitedByUserId in body does not match the authenticated user");
    }
    // Pin to the verified context (identical values here, but this makes the
    // trusted source the one used, not the client-supplied body field).
    body.tenantId = verifiedTenantId;
    body.invitedByUserId = verifiedInviterId;

    // Phase 35 — role-hierarchy gate. An inviter may only add users in roles
    // strictly beneath their own, so a manager can grow their team but cannot
    // mint a peer or a tenant admin. ADMIN keeps full reach (minus SUPER_ADMIN).
    const inviterRole = String(req.user?.role ?? "");
    const allowedSubordinates = ROLE_HIERARCHY[inviterRole] ?? [];
    if (!allowedSubordinates.includes(body.role)) {
      throw Errors.forbidden(`A ${inviterRole || "user"} cannot add a user with the role ${body.role}.`);
    }

    // Seat-limit gate (Phase 1 reads plan from request body; Phase 2 calls billing-service)
    const used = await prisma.user.count({
      where: { tenantId: body.tenantId, isActive: true },
    });
    if (!canAddSeats(body.plan, used, 1)) {
      const limit = PLAN_LIMITS[body.plan]?.seats ?? 0;
      throw Errors.planLimit(
        `Plan ${body.plan} allows max ${limit} seats. You have ${used}. Upgrade to invite more.`
      );
    }

    const existing = await prisma.user.findFirst({
      where: { tenantId: body.tenantId, email: body.email.toLowerCase() },
    });
    if (existing) throw Errors.conflict("User with this email already exists in this tenant");

    // 256 bits of entropy → user cannot guess it, so password-login is
    // effectively disabled until /accept-invite overwrites passwordHash.
    const { randomBytes } = await import("crypto");
    const placeholder = randomBytes(32).toString("base64");
    const passwordHash = await argon2.hash(placeholder, { type: argon2.argon2id });

    // Create user + invite token in a single transaction so a partial
    // failure never leaves a stranded user without a way to accept.
    const { user, invite } = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          tenantId: body.tenantId,
          email: body.email.toLowerCase(),
          firstName: body.firstName,
          lastName: body.lastName,
          role: body.role,
          passwordHash,
          isActive: true,
          // Phase 35 — the inviter becomes this new user's manager, growing
          // the org tree one level beneath whoever issued the invite.
          managerId: body.invitedByUserId,
        },
      });
      const inv = await tx.inviteToken.create({
        data: {
          tenantId: body.tenantId,
          email: u.email,
          role: body.role,
          invitedByUserId: body.invitedByUserId,
          // 7 days — invites sit in inboxes longer than password resets.
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return { user: u, invite: inv };
    });

    await prisma.auditEvent.create({
      data: {
        tenantId: body.tenantId,
        actorUserId: body.invitedByUserId,
        action: "USER_INVITED",
        resourceType: "User",
        resourceId: user.id,
        metadata: { email: body.email, role: body.role },
      },
    }).catch(() => { /* non-fatal */ });

    // Phase 35 — resolve the inviter's own manager (e.g. the tenant admin) so
    // the gateway can fire the "added beneath you" notice up one level too.
    const inviter = await prisma.user.findUnique({
      where: { id: body.invitedByUserId },
      select: { managerId: true },
    });

    created(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      managerId: user.managerId,
      inviterManagerId: inviter?.managerId ?? null,
      // Returned so the gateway can compose the accept-invite URL and
      // hand it to notification-service. Internal-only — never exposed
      // via /api/users/:id GET.
      inviteToken: invite.token,
      inviteExpiresAt: invite.expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/my-team — the caller's org subtree (Phase 35) ────
// Returns the caller plus every user beneath them in the managerId tree
// (direct + indirect reports), scoped to the caller's tenant. Lets a manager
// (or admin) see and manage the people they added without exposing the whole
// tenant roster. Declared before /:id so "my-team" isn't read as a user id.
router.get("/my-team", requireRole("ADMIN", "HIRING_MANAGER", "RECRUITER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const callerId = req.user?.id;
    if (!tenantId || !callerId) throw Errors.validation("tenant and user context required");

    const all = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: "asc" },
      take: 2000,
    });

    // Index children by managerId, then breadth-first down from the caller.
    const childrenOf = new Map<string, typeof all>();
    for (const u of all) {
      const key = u.managerId ?? "";
      const arr = childrenOf.get(key) ?? [];
      arr.push(u);
      childrenOf.set(key, arr);
    }
    const team: typeof all = [];
    const seen = new Set<string>([callerId]);
    const queue: string[] = [callerId];
    while (queue.length) {
      const mid = queue.shift()!;
      for (const child of childrenOf.get(mid) ?? []) {
        if (seen.has(child.id)) continue;
        seen.add(child.id);
        team.push(child);
        queue.push(child.id);
      }
    }
    const self = all.find((u: typeof all[number]) => u.id === callerId);
    const rows = self ? [self, ...team] : team;

    ok(res, rows.map((u: typeof all[number]) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      tenantId: u.tenantId,
      isActive: u.isActive,
      managerId: u.managerId,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      self: u.id === callerId,
    })));
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users/:id ─────────────────────────────────────────────
// This is the me-resolution path the gateway's GET /api/auth/me calls. WF6/F1
// makes it ADDITIVELY return the user's UserUiPrefs (uiPrefs) so the client
// hydrates theme/density/locale in the SAME round-trip — no extra fetch on load.
// The prefs read is best-effort and on the admin client (this row is the
// caller's own; the gateway only ever asks for the authenticated user's id):
// a missing row or a read error leaves uiPrefs null and the client uses its
// seeded defaults, so untouched users are byte-identical to pre-WF6.
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Errors.notFound("User");

    // IDOR guard — this row (email, role, tenantId, isActive) must not leak
    // across tenants. When the request carries an authenticated caller, scope
    // the lookup to that caller's tenant UNLESS: it is the caller's OWN record,
    // the caller is SUPER_ADMIN (cross-tenant /auth/me + impersonation resolve
    // pass a synthetic SUPER_ADMIN role), or an impersonation actor is present.
    // Unauthenticated internal callers (login / register saga use synthetic
    // headers, so req.user is set to SUPER_ADMIN; the pre-auth optional path
    // leaves req.user undefined) are left untouched so those flows keep working.
    if (req.user) {
      const isSelf = req.user.id === id;
      const isSuperAdmin = req.user.role === "SUPER_ADMIN";
      const isImpersonating = Boolean(req.user.actorUserId);
      if (!isSelf && !isSuperAdmin && !isImpersonating && user.tenantId !== req.user.tenantId) {
        throw Errors.notFound("User");
      }
    }

    const prefsRow = await prisma.userUiPrefs
      .findUnique({ where: { userId: id } })
      .catch(() => null);
    const uiPrefs = prefsRow
      ? {
          colorMode: prefsRow.colorMode,
          density: prefsRow.density,
          locale: prefsRow.locale,
          timezone: prefsRow.timezone,
          accentOverride: prefsRow.accentOverride,
          prefs: (prefsRow.prefs ?? {}) as Record<string, unknown>,
          updatedAt: prefsRow.updatedAt.toISOString(),
        }
      : null;

    ok(res, {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      // Phase 31b — exposed via /auth/me so dashboard can show a confirm banner.
      emailVerified: (user as any).emailVerified ?? true,
      emailVerifiedAt: (user as any).emailVerifiedAt ?? null,
      // WF6/F1 — per-user UI preferences (or null → client uses seeded defaults).
      uiPrefs,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /internal/users?tenantId=... OR ?role=SUPER_ADMIN ───────────────
// Either filter is required. `?role=SUPER_ADMIN` returns all super-admins
// across the platform — used by notification-service to fan out platform
// notifications via email/Slack.
// Phase 27 F-028-micro-P0: ADMIN+ only. notification-service calls this
// with synthetic SUPER_ADMIN role; tenant admins call with their tenantId.
// Tier-3 staff have no business listing users.
router.get("/", requireRole("SUPER_ADMIN", "ADMIN"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSuperAdmin = req.user?.role === "SUPER_ADMIN";
    const role = req.query["role"] as string | undefined;
    // Tenant admins are ALWAYS scoped to their own tenant — ignore any
    // tenantId query param so an ADMIN can't enumerate another tenant's users.
    // Super-admins may target any tenant (?tenantId=) or filter by role across
    // the whole platform (?role=). A tenant admin with no params lists their
    // own team (what the Team settings page needs).
    const tenantId = isSuperAdmin
      ? (req.query["tenantId"] as string | undefined)
      : getTenantId(req);
    if (!tenantId && !role) {
      throw Errors.validation("tenantId or role query param is required");
    }

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 1000,
    });
    ok(res, users.map((u: typeof users[number]) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      tenantId: u.tenantId,
      isActive: u.isActive,
      managerId: u.managerId,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /internal/users/:id — saga compensation ───────────────────────
// Called by gateway register-company saga IF tenant-service fails after user
// was already created. Should be very rare; logs prominently for debugging.
// NOTE: intentionally NOT requireRole-guarded — saga path runs during
// register-company rollback when no JWT exists. Trusted via network policy.
// F-027-micro-c (LOW): plain delete-by-id is acceptable here because the
// saga's contract guarantees we're deleting the user we just created in
// this same saga; no cross-tenant scenario exists at this code path.
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params["id"] as string;
    // Body/context-tenant hardening (master prompt §7). DUAL-PURPOSE route:
    //   1. Pre-auth saga compensation: register-company rollback deletes the
    //      just-created user by id with NO gateway headers (req.user undefined).
    //      The saga's contract guarantees it deletes the user it just made in
    //      the same saga, so a plain delete-by-id is safe there and must stay.
    //   2. Exposure to guard: the generic `/api/users` gateway proxy forwards an
    //      authenticated DELETE /api/users/:id here WITH a verified req.user.
    //      An unscoped delete-by-id would let an authenticated caller delete a
    //      user in ANOTHER tenant (cross-tenant IDOR).
    // So when a verified tenant context is present, scope the delete to that
    // tenant (deleteMany with the tenant filter — a cross-tenant id simply
    // matches 0 rows and is a no-op, never a foreign delete). The pre-auth saga
    // path (no req.user) keeps the exact prior delete-by-id behavior. Additive.
    if (req.user?.tenantId) {
      await prisma.user
        .deleteMany({ where: { id, tenantId: req.user.tenantId } })
        .catch(() => { /* already gone */ });
    } else {
      await prisma.user.delete({ where: { id } }).catch(() => { /* already gone */ });
    }
    ok(res, { deleted: id });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /internal/users/:id/role ──────────────────────────────────────
// Change a tenant member's role. Tenant-admin only, tenant-scoped. Cannot
// touch SUPER_ADMIN, and an admin cannot demote themselves (avoid lockout).
const RoleSchema = z.object({
  role: z.enum(["ADMIN", "RECRUITER", "HIRING_MANAGER", "INTERVIEWER"]),
});
router.patch("/:id/role", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorId = req.headers["x-user-id"] as string | undefined;
    const id = req.params["id"] as string;
    const { role } = RoleSchema.parse(req.body);
    if (id === actorId) throw Errors.validation("You cannot change your own role");
    const target = await prismaRls.user.findFirst({ where: { id, tenantId } });
    if (!target) throw Errors.notFound("User");
    if (target.role === "SUPER_ADMIN") throw Errors.forbidden("Cannot change a super-admin's role");
    const updated = await prismaRls.user.update({ where: { id }, data: { role } });
    ok(res, { id: updated.id, role: updated.role });
  } catch (err) { next(err); }
});

// ── PATCH /internal/users/:id/deactivate ────────────────────────────────
// Soft-disable a member (cannot log in). Tenant-admin only, tenant-scoped;
// cannot deactivate yourself or a super-admin. Pass { reactivate: true } to undo.
router.patch("/:id/deactivate", requireTenantAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = getTenantId(req);
    const actorId = req.headers["x-user-id"] as string | undefined;
    const id = req.params["id"] as string;
    if (id === actorId) throw Errors.validation("You cannot deactivate yourself");
    const target = await prismaRls.user.findFirst({ where: { id, tenantId } });
    if (!target) throw Errors.notFound("User");
    if (target.role === "SUPER_ADMIN") throw Errors.forbidden("Cannot deactivate a super-admin");
    const isActive = req.body?.reactivate === true;
    const updated = await prismaRls.user.update({ where: { id }, data: { isActive } });
    ok(res, { id: updated.id, isActive: updated.isActive });
  } catch (err) { next(err); }
});

export default router;
