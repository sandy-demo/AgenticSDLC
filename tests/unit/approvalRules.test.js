import { expect, it } from 'vitest';
import { requiresFinance } from '../../src/services/approvalRules.js';

it.each([[999_999, false], [1_000_000, true], [1_000_001, true]])(
  'menentukan kebutuhan persetujuan Finance untuk Rp%s',
  (amount, expected) => expect(requiresFinance(amount)).toBe(expected),
);
