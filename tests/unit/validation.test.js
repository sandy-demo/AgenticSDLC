import { describe, expect, it } from 'vitest';
import { dateKey, shiftDay, validateClaim, validateMonth } from '../../src/services/validation.js';

const now = new Date(2026, 9, 15, 12);
const valid = { title: 'Taksi bandara', category: 'Travel', amount: 250_000, claimDate: dateKey(now) };

describe('validasi klaim', () => {
  it('menerima hari ini dan merapikan judul', () => {
    expect(validateClaim({ ...valid, title: '  Taksi bandara  ' }, now)).toMatchObject(valid);
  });
  it('menerima tepat 90 hari ke belakang', () => {
    const claimDate = dateKey(shiftDay(now, -90));
    expect(validateClaim({ ...valid, claimDate }, now).claimDate).toBe(claimDate);
  });
  it.each([
    [{ title: '  ' }, 'CLAIM_TITLE'],
    [{ category: 'Unsupported' }, 'CLAIM_CATEGORY'],
    [{ amount: 0 }, 'CLAIM_AMOUNT'],
    [{ amount: 50_000_001 }, 'CLAIM_AMOUNT'],
    [{ amount: 2.5 }, 'CLAIM_AMOUNT'],
    [{ claimDate: '2026-02-31' }, 'CLAIM_DATE_INVALID'],
    [{ claimDate: dateKey(shiftDay(now, 1)) }, 'CLAIM_DATE_FUTURE'],
    [{ claimDate: dateKey(shiftDay(now, -91)) }, 'CLAIM_DATE_OLD'],
    [{ attachment: 'folder/receipt.pdf' }, 'CLAIM_ATTACHMENT'],
  ])('menolak payload %j dengan %s', (changes, code) => {
    expect(() => validateClaim({ ...valid, ...changes }, now)).toThrow(expect.objectContaining({ code }));
  });
  it('menolak periode laporan yang tidak valid', () => {
    expect(() => validateMonth('2026-13')).toThrow(expect.objectContaining({ code: 'REPORT_MONTH' }));
  });
});
