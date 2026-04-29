import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ok } from '../lib/response';
import { requireAuth, getTenantId } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../utils/prisma';

const SCIMCreateUserSchema = z.object({
  userName: z.string().email(),
  name: z.object({
    givenName: z.string().min(1),
    familyName: z.string().min(1),
  }),
  emails: z.array(z.object({
    value: z.string().email(),
    primary: z.boolean().optional(),
  })).min(1).optional(),
  active: z.boolean().optional(),
  roles: z.array(z.object({ value: z.string() })).optional(),
});

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// GET /api/auth/sso/providers — list available SSO providers
router.get('/providers', (_req: Request, res: Response) => {
  const providers: Array<{ id: string; name: string; enabled: boolean; authUrl: string }> = [];

  if (process.env.GOOGLE_CLIENT_ID) {
    providers.push({
      id: 'google',
      name: 'Google Workspace',
      enabled: true,
      authUrl: '/api/auth/sso/google',
    });
  }

  if (process.env.MICROSOFT_CLIENT_ID) {
    providers.push({
      id: 'microsoft',
      name: 'Microsoft Entra ID',
      enabled: true,
      authUrl: '/api/auth/sso/microsoft',
    });
  }

  return ok(res, { providers });
});

// Lazy-load passport routes only if configured
router.get('/google', (req: Request, res: Response) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ success: false, error: { code: 'NOT_CONFIGURED', message: 'Google SSO not configured' } });
  }
  return res.redirect('/api/auth/sso/google/start');
});

router.get('/microsoft', (req: Request, res: Response) => {
  if (!process.env.MICROSOFT_CLIENT_ID) {
    return res.status(501).json({ success: false, error: { code: 'NOT_CONFIGURED', message: 'Microsoft SSO not configured' } });
  }
  return res.redirect('/api/auth/sso/microsoft/start');
});

// SCIM — /api/auth/scim/v2/*
router.get('/scim/v2/Users', requireAuth, async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const users = await prisma.user.findMany({
    where: { tenantId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true },
  });

  return res.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: users.length,
    startIndex: 1,
    itemsPerPage: users.length,
    Resources: users.map((u: { id: string; email: string; firstName: string; lastName: string; role: string; isActive: boolean }) => ({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      id: u.id,
      userName: u.email,
      name: { givenName: u.firstName, familyName: u.lastName },
      emails: [{ value: u.email, primary: true }],
      active: u.isActive,
      roles: [{ value: u.role }],
    })),
  });
});

router.post('/scim/v2/Users', requireAuth, async (req: Request, res: Response) => {
  const tenantId = getTenantId(req);
  const parsed = SCIMCreateUserSchema.parse(req.body);

  // Create user via SCIM provisioning
  const user = await prisma.user.create({
    data: {
      email: parsed.userName || parsed.emails?.[0]?.value || parsed.userName,
      firstName: parsed.name.givenName,
      lastName: parsed.name.familyName,
      passwordHash: 'scim-provisioned-no-password',
      role: 'RECRUITER',
      tenantId,
    },
  });

  return res.status(201).json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    id: user.id,
    userName: user.email,
    name: { givenName: user.firstName, familyName: user.lastName },
    emails: [{ value: user.email, primary: true }],
    active: user.isActive,
    meta: { resourceType: 'User', created: user.createdAt.toISOString() },
  });
});

// GET /api/auth/sso/status — check which SSO providers are configured and connected
router.get('/status', (_req: Request, res: Response) => {
  return ok(res, {
    google: {
      configured: !!process.env.GOOGLE_CLIENT_ID,
      authUrl: process.env.GOOGLE_CLIENT_ID ? '/api/auth/sso/google' : null,
    },
    microsoft: {
      configured: !!process.env.MICROSOFT_CLIENT_ID,
      authUrl: process.env.MICROSOFT_CLIENT_ID ? '/api/auth/sso/microsoft' : null,
    },
    scim: {
      enabled: true,
      endpoint: '/api/auth/sso/scim/v2',
    },
  });
});

// SSO config management (admin)
router.get('/config', requireAuth, async (req: Request, res: Response) => {
  return ok(res, {
    providers: {
      google: { configured: !!process.env.GOOGLE_CLIENT_ID, enabled: !!process.env.GOOGLE_CLIENT_ID },
      microsoft: { configured: !!process.env.MICROSOFT_CLIENT_ID, enabled: !!process.env.MICROSOFT_CLIENT_ID },
      saml: { configured: false, enabled: false },
    },
    scim: { enabled: true, endpoint: '/api/auth/scim/v2' },
  });
});

export default router;
