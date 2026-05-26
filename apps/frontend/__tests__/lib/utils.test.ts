import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn() utility', () => {
  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('resolves Tailwind conflicts with last-wins', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('ignores undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('returns empty string when called with no arguments', () => {
    expect(cn()).toBe('');
  });
});
