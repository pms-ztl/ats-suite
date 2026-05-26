import { describe, it, expect } from 'vitest';

function apiToken() {
  if (typeof document === 'undefined') return '';
  return document.cookie.match(/ats-token=([^;]+)/)?.[1] ?? '';
}

describe('Auth utilities', () => {
  it('returns empty string when no cookie set', () => {
    expect(apiToken()).toBe('');
  });

  it('extracts token from cookie string', () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'ats-token=test-jwt-token; other=value',
    });
    expect(apiToken()).toBe('test-jwt-token');
  });
});
