import { describe, expect, it } from 'vitest';
import { dateKey, shiftDay, validateClaim, validateMonth } from '../../src/services/validation.js';

const now = new Date('2026-10-14T17:00:00Z');
const valid = { title: 'Taksi bandara', category: 'Travel', amount: 250_000, claimDate: '2026-10-15' };

describe('tanggal bisnis Jakarta', () => {
  it('menggunakan tanggal Jakarta untuk instan yang sama pada fixture S05', () => {
    expect(dateKey(new Date('2026-10-15T01:00:00Z'))).toBe('2026-10-15');
  });
  it('beralih tanggal pada tengah malam Jakarta, bukan tengah malam UTC', () => {
    expect(dateKey(new Date('2026-10-14T16:59:59Z'))).toBe('2026-10-14');
    expect(dateKey(now)).toBe('2026-10-15');
  });
  it('menggeser hari kalender dari tanggal Jakarta', () => {
    expect(dateKey(shiftDay(now, -90))).toBe('2026-07-17');
  });
});

describe('validasi klaim', () => {
  it('menerima hari ini dan merapikan judul', () => {
    expect(validateClaim({ ...valid, title: '  Taksi bandara  ' }, now)).toMatchObject(valid);
  });
  it('menerima tepat 90 hari ke belakang', () => {
    const claimDate = '2026-07-17';
    expect(validateClaim({ ...valid, claimDate }, now).claimDate).toBe(claimDate);
  });
  it.each([
    [{ title: '  ' }, 'CLAIM_TITLE'],
    [{ category: 'Unsupported' }, 'CLAIM_CATEGORY'],
    [{ amount: 0 }, 'CLAIM_AMOUNT'],
    [{ amount: 50_000_001 }, 'CLAIM_AMOUNT'],
    [{ amount: 2.5 }, 'CLAIM_AMOUNT'],
    [{ claimDate: '2026-02-31' }, 'CLAIM_DATE_INVALID'],
    [{ claimDate: '2026-07-16' }, 'CLAIM_DATE_OLD'],
    [{ attachment: 'folder/receipt.pdf' }, 'CLAIM_ATTACHMENT'],
  ])('menolak payload %j dengan %s', (changes, code) => {
    expect(() => validateClaim({ ...valid, ...changes }, now)).toThrow(expect.objectContaining({ code }));
  });
  it('menolak periode laporan yang tidak valid', () => {
    expect(() => validateMonth('2026-13')).toThrow(expect.objectContaining({ code: 'REPORT_MONTH' }));
  });
});
