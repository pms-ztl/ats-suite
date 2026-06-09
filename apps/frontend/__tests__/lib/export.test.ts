import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from '@/lib/export';

// Capture the real Blob ONCE, before any spying, so re-spying across tests
// never wraps a previous spy (which would recurse infinitely).
const RealBlob = global.Blob;

describe('exportToCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let anchorEl: Partial<HTMLAnchorElement>;
  // jsdom's Blob does not implement .text(), so we capture the CSV string from
  // the Blob constructor parts instead of reading the Blob back.
  let blobText: string | undefined;

  beforeEach(() => {
    blobText = undefined;
    clickSpy = vi.fn();
    anchorEl = { href: '', download: '', click: clickSpy as any, remove: vi.fn() };

    vi.spyOn(document, 'createElement').mockReturnValue(anchorEl as any);

    // Must be a real function (not an arrow) so `new Blob(...)` can construct it.
    vi.spyOn(global, 'Blob').mockImplementation(function (parts?: any, opts?: any) {
      blobText = (parts ?? [])
        .map((p: unknown) => (typeof p === 'string' ? p : ''))
        .join('');
      return new RealBlob(parts, opts);
    } as unknown as typeof Blob);

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates CSV content and triggers download', () => {
    exportToCSV('report.csv', ['Name', 'Age'], [['Alice', 30], ['Bob', 25]]);

    expect(anchorEl.download).toBe('report.csv');
    expect(anchorEl.href).toBe('blob:mock-url');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(blobText).toBe('Name,Age\nAlice,30\nBob,25');
  });

  it('escapes commas and quotes in values', () => {
    exportToCSV('test.csv', ['Field'], [['hello, world'], ['say "hi"']]);

    expect(blobText).toContain('"hello, world"');
    expect(blobText).toContain('"say ""hi"""');
  });

  it('handles empty data rows', () => {
    exportToCSV('empty.csv', ['A', 'B'], []);

    expect(blobText).toBe('A,B');
    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
