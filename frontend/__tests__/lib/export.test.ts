import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV } from '@/lib/export';

describe('exportToCSV', () => {
  let clickSpy: ReturnType<typeof vi.fn>;
  let anchorEl: Partial<HTMLAnchorElement>;
  let createdBlob: Blob | undefined;

  beforeEach(() => {
    clickSpy = vi.fn();
    anchorEl = { href: '', download: '', click: clickSpy as any, remove: vi.fn() };

    vi.spyOn(document, 'createElement').mockReturnValue(anchorEl as any);
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: any) => {
      createdBlob = blob;
      return 'blob:mock-url';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  it('generates CSV content and triggers download', async () => {
    exportToCSV('report.csv', ['Name', 'Age'], [['Alice', 30], ['Bob', 25]]);

    expect(anchorEl.download).toBe('report.csv');
    expect(anchorEl.href).toBe('blob:mock-url');
    expect(clickSpy).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    const text = await createdBlob!.text();
    expect(text).toBe('Name,Age\nAlice,30\nBob,25');
  });

  it('escapes commas and quotes in values', async () => {
    exportToCSV('test.csv', ['Field'], [['hello, world'], ['say "hi"']]);

    const text = await createdBlob!.text();
    expect(text).toContain('"hello, world"');
    expect(text).toContain('"say ""hi"""');
  });

  it('handles empty data rows', async () => {
    exportToCSV('empty.csv', ['A', 'B'], []);

    const text = await createdBlob!.text();
    expect(text).toBe('A,B');
    expect(clickSpy).toHaveBeenCalledOnce();
  });
});
