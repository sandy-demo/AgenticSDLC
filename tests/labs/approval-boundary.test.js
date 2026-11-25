import { afterEach, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server.js';
import { requiresFinance } from '../../src/services/approvalRules.js';

const now = new Date(2026, 9, 15, 12);
let app;

afterEach(() => app?.locals.db.close());

it.each([[999_999, false], [1_000_000, true], [1_000_001, true]])(
  'S08 (#13): aturan bisnis untuk klaim Rp%s',
  (amount, expected) => expect(requiresFinance(amount)).toBe(expected),
);

it('S08 (#13): Manager mengarahkan klaim Rp1.000.000 ke Finance', async () => {
  app = createApp({ clock: () => now, logger: () => {} });
  const { body: { claim } } = await request(app).post('/claims').set('x-demo-user', '1')
    .send({ title: 'Taksi bandara', category: 'Travel', amount: 1_000_000, claimDate: '2026-10-15' })
    .expect(201);

  await request(app).post(`/approvals/${claim.id}`).set('x-demo-user', '4').send({ action: 'approve' })
    .expect(200).expect(({ body }) => expect(body.claim.status).toBe('finance_review'));
});
