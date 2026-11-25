import { expect, it } from 'vitest';
import { findOwnClaim } from './service.js';

it('menyembunyikan klaim yang bukan milik karyawan', () => {
  const db = { getClaim: () => ({ id: 8, employeeId: 2 }) };
  expect(() => findOwnClaim(db, { id: 1, role: 'employee' }, '8')).toThrow(
    expect.objectContaining({ code: 'CLAIM_NOT_FOUND' }),
  );
});
