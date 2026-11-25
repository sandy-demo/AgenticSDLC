import { describe, expect, it, vi } from 'vitest';
import { csvExport } from '../../src/legacy/csvExport.js';

describe('adapter ekspor CSV', () => {
  it('mengembalikan CSV untuk respons 200', async () => {
    const csv = 'name,amount\nTravel,100\n';
    const readCsv = vi.fn((endpoint, callback) => callback(null, { statusCode: 200 }, csv));

    await expect(csvExport(readCsv, '/export')).resolves.toBe(csv);
    expect(readCsv).toHaveBeenCalledOnce();
    expect(readCsv).toHaveBeenCalledWith('/export', expect.any(Function));
  });

  it('meneruskan error transport', async () => {
    const error = new Error('Transport gagal');
    const readCsv = (endpoint, callback) => callback(error);

    await expect(csvExport(readCsv, '/export')).rejects.toBe(error);
  });

  it('menolak respons non-200', async () => {
    const readCsv = (endpoint, callback) => callback(null, { statusCode: 503 }, 'CSV');

    await expect(csvExport(readCsv, '/export')).rejects.toThrow('Ekspor CSV gagal.');
  });
});
