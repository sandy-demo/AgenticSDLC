import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server.js';

const now = new Date('2026-10-15T12:00:00Z');
let app;
let log;
let insertComment;
let getClaim;

beforeEach(() => {
  log = vi.fn();
  app = createApp({ clock: () => now, logger: log });
  insertComment = vi.spyOn(app.locals.db, 'insertComment');
  getClaim = vi.spyOn(app.locals.db, 'getClaim');
});
afterEach(() => app.locals.db.close());

it('menyimpan komentar pemilik yang sudah dirapikan dan hanya mencatat ID', async () => {
  const { body } = await request(app).post('/claims/1/comments').set('x-demo-user', '1')
    .send({ text: '  Komentar contoh  ' }).expect(201);
  expect(body.comment).toEqual({ id: 1, claimId: 1, authorId: 1, text: 'Komentar contoh' });
  expect(app.locals.db.getComment(body.comment.id)).toEqual(body.comment);
  expect(log).toHaveBeenCalledWith('info', 'claim.comment.created', { claimId: 1, commentId: 1 });
  expect(JSON.stringify(log.mock.calls)).not.toContain('Komentar contoh');
});

it('menerima tepat 500 karakter setelah spasi dihapus', async () => {
  const text = 'a'.repeat(500);
  const { body } = await request(app).post('/claims/1/comments').set('x-demo-user', '1')
    .send({ text: ` ${text} ` }).expect(201);
  expect(app.locals.db.getComment(body.comment.id).text).toBe(text);
});

it.each(['0', '-1', 'abc', '1.5', '01', '9007199254740992'])(
  'menolak ID tidak valid %s sebelum penyimpanan', async (id) => {
    await request(app).post(`/claims/${id}/comments`).set('x-demo-user', '1')
      .send({ text: 'Contoh' }).expect(400, { code: 'INVALID_ID', message: 'Nomor klaim tidak valid.' });
    expect(insertComment).not.toHaveBeenCalled();
    expect(getClaim).not.toHaveBeenCalled();
  },
);

it.each([{}, { text: '' }, { text: ' \n ' }, { text: 123 }, { text: null }, { text: 'a'.repeat(501) }])(
  'menolak isi komentar tidak valid %j sebelum penyimpanan', async (input) => {
    await request(app).post('/claims/1/comments').set('x-demo-user', '1')
      .send(input).expect(400, { code: 'COMMENT_TEXT', message: 'Isi komentar (maksimal 500 karakter).' });
    expect(insertComment).not.toHaveBeenCalled();
    expect(getClaim).not.toHaveBeenCalled();
  },
);

it.each([['2', '1'], ['1', '9999']])(
  'menyembunyikan klaim yang tidak dimiliki atau tidak ada', async (user, id) => {
    await request(app).post(`/claims/${id}/comments`).set('x-demo-user', user)
      .send({ text: 'Contoh' }).expect(404, { code: 'CLAIM_NOT_FOUND', message: 'Klaim tidak ditemukan.' });
    expect(insertComment).not.toHaveBeenCalled();
  },
);

it.each(['4', '5', '6'])('menolak komentar dari peran non-karyawan %s', async (user) => {
  await request(app).post('/claims/1/comments').set('x-demo-user', user).send({ text: 'Contoh' })
    .expect(403, { code: 'ROLE_REQUIRED', message: 'Peran demo ini tidak punya izin untuk tindakan tersebut.' });
  expect(insertComment).not.toHaveBeenCalled();
});

it('menolak persona yang tidak valid', async () => {
  await request(app).post('/claims/1/comments').send({ text: 'Contoh' })
    .expect(401, { code: 'DEMO_USER_REQUIRED', message: 'Pilih pengguna demo yang valid.' });
  expect(insertComment).not.toHaveBeenCalled();
});
