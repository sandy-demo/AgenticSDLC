import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server.js';
import { decideClaim } from '../../src/services/claims.js';
import { validateIdempotencyKey } from '../../src/services/validation.js';

const now = new Date(2026, 9, 15, 12);
const input = {
  title: 'Klaim fiktif privat', category: 'Travel', amount: 1_000_000,
  claimDate: '2026-10-15', attachment: 'bukti-fiktif.pdf', notes: 'Catatan fiktif privat',
};
let app;
let db;
let logger;

beforeEach(() => {
  logger = vi.fn();
  app = createApp({ clock: () => now, logger });
  db = app.locals.db;
});
afterEach(() => db.close());

function addClaim(amount = input.amount) {
  return db.insertClaim(1, { ...input, amount }, now.toISOString());
}

function decide(id, { user = 4, action = 'approve', key } = {}) {
  const call = request(app).post(`/approvals/${id}`).set('x-demo-user', String(user));
  if (key !== undefined) call.set('Idempotency-Key', key);
  return call.send({ action });
}

describe('S11 reference prototype draft — bukan approval handoff resmi', () => {
  it.each(['approve', 'reject'])('replay %s persis sekali untuk audit dan log', async (action) => {
    const claim = addClaim(999_999);
    const key = 'S11.private_key-01';
    const first = await decide(claim.id, { action, key }).expect(200);
    const replay = await decide(claim.id, { action, key }).expect(200);
    expect(replay.body).toEqual(first.body);
    expect(db.history(claim.id)).toEqual([
      { actorId: 1, at: now.toISOString(), fromStatus: null, toStatus: 'pending' },
      { actorId: 4, at: now.toISOString(), fromStatus: 'pending', toStatus: first.body.claim.status },
    ]);
    expect(logger.mock.calls).toEqual([
      ['info', 'claim.status_changed', { claimId: claim.id, status: first.body.claim.status }],
    ]);
    const logs = JSON.stringify(logger.mock.calls);
    for (const secret of [key, input.title, input.notes, input.attachment]) expect(logs).not.toContain(secret);
    expect(db.getApprovalOutcome(4, claim.id, key)).toEqual({ action, status: first.body.claim.status });
  });

  it.each(['approve', 'reject'])('mengembalikan hasil Manager semula setelah Finance %s', async (action) => {
    const claim = addClaim();
    const manager = await decide(claim.id, { key: 'shared' }).expect(200);
    expect(manager.body.claim.status).toBe('finance_review');
    const finance = await decide(claim.id, { user: 6, key: 'shared', action }).expect(200);
    expect(finance.body.claim.status).toBe(action === 'approve' ? 'approved' : 'rejected');
    const replay = await decide(claim.id, { key: 'shared' }).expect(200);
    expect(replay.body).toEqual(manager.body);
    const financeReplay = await decide(claim.id, { user: 6, key: 'shared', action }).expect(200);
    expect(financeReplay.body).toEqual(finance.body);
    expect(db.getClaim(claim.id)).toEqual(finance.body.claim);
    expect(db.history(claim.id)).toHaveLength(3);
    expect(logger).toHaveBeenCalledTimes(2);
  });

  it('menolak action berbeda tanpa event, outcome atau log sukses baru', async () => {
    const claim = addClaim();
    await decide(claim.id, { key: 'one' }).expect(200);
    await decide(claim.id, { key: 'one', action: 'reject' }).expect(409)
      .expect(({ body }) => expect(body.code).toBe('IDEMPOTENCY_CONFLICT'));
    expect(db.getApprovalOutcome(4, claim.id, 'one')).toEqual({ action: 'approve', status: 'finance_review' });
    expect(db.history(claim.id)).toHaveLength(2);
    expect(logger.mock.calls).toEqual([
      ['info', 'claim.status_changed', { claimId: claim.id, status: 'finance_review' }],
      ['warn', 'request.failed', { code: 'IDEMPOTENCY_CONFLICT', method: 'POST' }],
    ]);
  });

  it('mempertahankan repeat lama dan memeriksa tahap untuk key baru', async () => {
    const claim = addClaim();
    await decide(claim.id).expect(200);
    for (const key of [undefined, 'fresh']) {
      await decide(claim.id, { key }).expect(409)
        .expect(({ body }) => expect(body.code).toBe('CLAIM_STATUS'));
    }
    expect(db.getApprovalOutcome(4, claim.id, 'fresh')).toBeUndefined();
    expect(db.history(claim.id)).toHaveLength(2);
  });

  it('key baru tidak melewati tahap setelah approval dengan key', async () => {
    const claim = addClaim();
    await decide(claim.id, { key: 'first' }).expect(200);
    await decide(claim.id, { key: 'second' }).expect(409)
      .expect(({ body }) => expect(body.code).toBe('CLAIM_STATUS'));
    expect(db.getApprovalOutcome(4, claim.id, 'second')).toBeUndefined();
    expect(db.history(claim.id)).toHaveLength(2);
  });

  it.each(['a', 'Z'.repeat(128), 'Az09._-'])('menerima token ASCII valid %s', async (key) => {
    await decide(addClaim().id, { key }).expect(200);
  });

  it.each(['', 'a'.repeat(129), 'a b', 'é', 'a,b', 'a/b'])('menolak token invalid %s tanpa mutasi', async (key) => {
    const claim = addClaim();
    await decide(claim.id, { key }).expect(400)
      .expect(({ body }) => expect(body.code).toBe('IDEMPOTENCY_KEY'));
    expect(db.getClaim(claim.id).status).toBe('pending');
    expect(db.history(claim.id)).toHaveLength(1);
    expect(db.getApprovalOutcome(4, claim.id, key)).toBeUndefined();
    expect(logger.mock.calls).toEqual([
      ['warn', 'request.failed', { code: 'IDEMPOTENCY_KEY', method: 'POST' }],
    ]);
  });

  it.each(['key\n', 'key\r', '\t', null, 123, ['key']])('menolak nilai non-token pada validasi service: %j', (key) => {
    expect(() => validateIdempotencyKey(key)).toThrow(expect.objectContaining({ code: 'IDEMPOTENCY_KEY' }));
  });

  it('mengotorisasi peran, departemen dan pemilik sebelum lookup replay', async () => {
    const claim = addClaim();
    await decide(claim.id, { key: 'owned' }).expect(200);
    const lookup = vi.spyOn(db, 'getApprovalOutcome');
    await decide(claim.id, { user: 1, key: 'owned' }).expect(403);
    await decide(claim.id, { user: 5, key: 'owned' }).expect(404);
    const owner = { ...db.getUser(4), id: 1 };
    expect(() => decideClaim(db, owner, claim.id, 'approve', now, 'owned'))
      .toThrow(expect.objectContaining({ code: 'SELF_APPROVAL', status: 403 }));
    expect(lookup).not.toHaveBeenCalled();
    expect(db.history(claim.id)).toHaveLength(2);
  });

  it('tahap gagal tidak menyimpan key; key yang sama bisa dipakai saat tahap sesuai', async () => {
    const claim = addClaim();
    await decide(claim.id, { user: 6, key: 'early' }).expect(409);
    expect(db.getApprovalOutcome(6, claim.id, 'early')).toBeUndefined();
    await decide(claim.id, { key: 'manager' }).expect(200);
    await decide(claim.id, { user: 6, key: 'early' }).expect(200);
    expect(db.history(claim.id)).toHaveLength(3);
  });

  it('scope key terpisah per klaim dan input lain tetap divalidasi', async () => {
    for (const claim of [addClaim(), addClaim()]) {
      await decide(claim.id, { key: 'same' }).expect(200);
      await decide(claim.id, { key: 'same', action: 'invalid' }).expect(400)
        .expect(({ body }) => expect(body.code).toBe('APPROVAL_ACTION'));
      expect(db.history(claim.id)).toHaveLength(2);
    }
    await decide('invalid', { key: 'same' }).expect(400);
    await decide(99999, { key: 'same' }).expect(404);
  });

  it('outcome hilang ketika database lab ditutup dan dibuat ulang', async () => {
    await decide(1, { key: 'temporary' }).expect(200);
    db.close();
    app = createApp({ clock: () => now, logger });
    db = app.locals.db;
    expect(db.getApprovalOutcome(4, 1, 'temporary')).toBeUndefined();
    await decide(1, { key: 'temporary' }).expect(200);
  });

  it('rollback status dan audit jika penyimpanan outcome gagal', () => {
    const claim = addClaim();
    db.transitionClaim(claim, 4, 'finance_review', now.toISOString(), { key: 'unique', action: 'approve' });
    const current = db.getClaim(claim.id);
    const history = db.history(claim.id);
    expect(() => db.transitionClaim(current, 4, 'rejected', now.toISOString(), { key: 'unique', action: 'reject' }))
      .toThrow();
    expect(db.getClaim(claim.id)).toEqual(current);
    expect(db.history(claim.id)).toEqual(history);
    expect(db.getApprovalOutcome(4, claim.id, 'unique')).toEqual({ action: 'approve', status: 'finance_review' });
    expect(db.transitionClaim(current, 4, 'rejected', now.toISOString(), { key: 'retry', action: 'reject' }).status)
      .toBe('rejected');
  });

  it('rollback status jika audit gagal, tanpa menyimpan outcome', () => {
    const claim = addClaim();
    const outcome = { key: 'retry', action: 'approve' };
    expect(() => db.transitionClaim(claim, 99999, 'approved', now.toISOString(), outcome)).toThrow();
    expect(db.getClaim(claim.id)).toEqual(claim);
    expect(db.history(claim.id)).toHaveLength(1);
    expect(db.getApprovalOutcome(99999, claim.id, outcome.key)).toBeUndefined();
    db.transitionClaim(claim, 4, 'finance_review', now.toISOString(), outcome);
    expect(db.transitionClaim(claim, 6, 'approved', now.toISOString(), outcome)).toBeNull();
    expect(db.getApprovalOutcome(6, claim.id, outcome.key)).toBeUndefined();
    expect(db.history(claim.id)).toHaveLength(2);
  });
});
