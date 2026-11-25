import { describe, expect, it, vi } from 'vitest';
import { csvExport } from '../../src/legacy/csvExport.js';

describe('adapter ekspor CSV', () => {
  it('mengembalikan CSV untuk respons 200', async () => {
    const csv = 'name,amount\nTravel,100\n';
    const fetcher = vi.fn().mockResolvedValue({ status: 200, text: async () => csv });

    await expect(csvExport('/export', fetcher)).resolves.toBe(csv);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledWith('/export');
  });

  it('meneruskan error transport', async () => {
    const error = new Error('Transport gagal');
    const fetcher = vi.fn().mockRejectedValue(error);

    await expect(csvExport('/export', fetcher)).rejects.toBe(error);
  });

  it('menolak respons non-200', async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: 503, text: async () => 'CSV' });

    await expect(csvExport('/export', fetcher)).rejects.toThrow('Ekspor CSV gagal.');
  });

  it('menolak respons 200 dengan body bukan string', async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: 200, text: async () => null });

    await expect(csvExport('/export', fetcher)).rejects.toThrow('Ekspor CSV gagal.');
  });

  it('menolak status sukses selain 200', async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: 201, text: async () => 'CSV' });

    await expect(csvExport('/export', fetcher)).rejects.toThrow('Ekspor CSV gagal.');
  });

  it('meneruskan error saat membaca body', async () => {
    const error = new Error('Pembacaan gagal');
    const fetcher = vi.fn().mockResolvedValue({ status: 200, text: async () => { throw error; } });

    await expect(csvExport('/export', fetcher)).rejects.toBe(error);
  });

  it('menggunakan fetch bawaan jika fetcher tidak diberikan', async () => {
    const fetcher = vi.fn().mockResolvedValue({ status: 200, text: async () => 'CSV' });
    vi.stubGlobal('fetch', fetcher);

    try {
      await expect(csvExport('/export')).resolves.toBe('CSV');
      expect(fetcher).toHaveBeenCalledWith('/export');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
