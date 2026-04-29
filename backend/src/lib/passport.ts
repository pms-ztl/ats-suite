import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';
import prisma from '../utils/prisma';
import { generateToken } from '../middleware/auth';
import logger from './logger';

// Configure Google OIDC
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use('google-oidc', new OpenIDConnectStrategy(
    {
      issuer: 'https://accounts.google.com',
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/sso/google/callback`,
      scope: ['openid', 'profile', 'email'],
    },
    async (issuer: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error('No email in profile'));

        let user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
          // Auto-provision: find a tenant by domain or use default
          const domain = email.split('@')[1];
          const tenant = await prisma.tenant.findFirst({
            where: { OR: [{ slug: domain }, { name: { contains: domain } }] },
          });

          if (!tenant) return done(new Error('No tenant found for domain: ' + domain));

          user = await prisma.user.create({
            data: {
              email,
              firstName: profile.displayName?.split(' ')[0] || email.split('@')[0],
              lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
              passwordHash: '',
              role: 'RECRUITER',
              tenantId: tenant.id,
              isActive: true,
            },
          });
          logger.info({ userId: user.id, email }, 'SSO user auto-provisioned');
        }

        const token = generateToken({
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        });

        return done(null, { user, token });
      } catch (err) {
        return done(err);
      }
    }
  ));
}

// Configure Microsoft OIDC
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
  passport.use('microsoft-oidc', new OpenIDConnectStrategy(
    {
      issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
      authorizationURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
      tokenURL: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      userInfoURL: 'https://graph.microsoft.com/oidc/userinfo',
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${process.env.APP_URL || 'http://localhost:4000'}/api/auth/sso/microsoft/callback`,
      scope: ['openid', 'profile', 'email'],
    },
    async (issuer: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase() || profile._json?.email?.toLowerCase();
        if (!email) return done(new Error('No email in Microsoft profile'));

        let user = await prisma.user.findFirst({ where: { email } });
        if (!user) return done(new Error('User not found — contact your administrator'));

        const token = generateToken({
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        });

        return done(null, { user, token });
      } catch (err) {
        return done(err);
      }
    }
  ));
}

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export default passport;
