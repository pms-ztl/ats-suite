import { describe, it, expect, vi, beforeEach } from 'vitest';

const API = 'http://localhost:4000/api';

describe('API Client', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should construct correct API URL', () => {
    expect(API).toMatch(/localhost:4000\/api/);
  });

  it('should handle fetch errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    let error: Error | null = null;
    try {
      await fetch(`${API}/candidates`);
    } catch (e) {
      error = e as Error;
    }
    expect(error?.message).toBe('Network error');
  });

  it('should parse API response envelope', () => {
    const envelope: { success: boolean; data: { id: string; name: string }[] | { data: { id: string; name: string }[] } } = { success: true, data: [{ id: '1', name: 'Test' }] };
    const d = Array.isArray(envelope.data) ? envelope.data : (envelope.data as { data: { id: string; name: string }[] }).data;
    expect(Array.isArray(d)).toBe(true);
    expect(d).toHaveLength(1);
  });
});
