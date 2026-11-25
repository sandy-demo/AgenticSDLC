import { strictEqual } from 'node:assert';
import { test } from 'node:test';
import { dateKey } from '../../src/services/validation.js';

test('fixture lab: jam mesin tidak boleh diasumsikan sama dengan Jakarta', () => {
  strictEqual(dateKey(new Date('2026-10-15T01:00:00Z')), '2026-10-15');
});
