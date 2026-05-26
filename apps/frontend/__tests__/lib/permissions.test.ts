import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

import { usePermissions } from '@/lib/use-permissions';
import { getCurrentUser } from '@/lib/auth';

const mockedGetCurrentUser = vi.mocked(getCurrentUser);

describe('usePermissions', () => {
  it('admin has access to all sections', () => {
    mockedGetCurrentUser.mockReturnValue({
      id: 'u1', name: 'Admin', email: 'a@test.com', role: 'admin', department: 'Eng', permissions: ['*'],
    });
    const perms = usePermissions();
    expect(perms.can('platform')).toBe(true);
    expect(perms.can('compliance')).toBe(true);
    expect(perms.can('anything')).toBe(true);
    expect(perms.isAdmin).toBe(true);
    expect(perms.isCandidate).toBe(false);
  });

  it('recruiter has limited access', () => {
    mockedGetCurrentUser.mockReturnValue({
      id: 'u2', name: 'Recruiter', email: 'r@test.com', role: 'recruiter', department: 'TA', permissions: [],
    });
    const perms = usePermissions();
    expect(perms.can('sourcing')).toBe(true);
    expect(perms.can('screening')).toBe(true);
    expect(perms.can('compliance')).toBe(false);
    expect(perms.can('security')).toBe(false);
    expect(perms.isAdmin).toBe(false);
  });

  it('candidate has no section access', () => {
    mockedGetCurrentUser.mockReturnValue({
      id: 'u3', name: 'Candidate', email: 'c@test.com', role: 'candidate', department: '', permissions: [],
    });
    const perms = usePermissions();
    expect(perms.can('platform')).toBe(false);
    expect(perms.can('sourcing')).toBe(false);
    expect(perms.isCandidate).toBe(true);
    expect(perms.isAdmin).toBe(false);
  });

  it('returns correct boolean flags', () => {
    mockedGetCurrentUser.mockReturnValue({
      id: 'u4', name: 'HM', email: 'h@test.com', role: 'hiring_manager', department: 'Eng', permissions: [],
    });
    const perms = usePermissions();
    expect(perms.isAdmin).toBe(false);
    expect(perms.isCandidate).toBe(false);
    expect(perms.role).toBe('hiring_manager');
  });
});
