import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/server.js';

const now = new Date(2026, 9, 15, 12);
const taxi = { title: 'Taksi bandara', category: 'Travel', amount: 250_000, claimDate: '2026-10-15' };
let app;
let log;
beforeEach(() => {
  log = vi.fn();
  app = createApp({ clock: () => now, logger: log });
});
afterEach(() => app.locals.db.close());

it('mengembalikan seed milik satu karyawan saja', async () => {
  const { body } = await request(app).get('/claims').set('x-demo-user', '1').expect(200);
  expect(body.claims).toHaveLength(7);
  expect(body.claims.every(({ employeeId }) => employeeId === 1)).toBe(true);
});
it('menyimpan klaim dan status awal; log tidak berisi judul atau catatan', async () => {
  const { body } = await request(app).post('/claims').set('x-demo-user', '1').send(taxi).expect(201);
  expect(body.claim).toMatchObject({ ...taxi, status: 'pending', employeeId: 1 });
  expect(app.locals.db.history(body.claim.id)[0]).toMatchObject({ fromStatus: null, toStatus: 'pending' });
  expect(log).toHaveBeenCalledWith('info', 'claim.created', { claimId: body.claim.id });
});
it.each(['Travel', 'Meals', 'Equipment', 'Other', undefined])('menyimpan kategori %s dan mengembalikannya lewat GET', async (category) => {
  const expectedCategory = category ?? 'Other';
  const { body: { claim } } = await request(app).post('/claims').set('x-demo-user', '1')
    .send({ ...taxi, category }).expect(201);
  expect(claim.category).toBe(expectedCategory);
  await request(app).get(`/claims/${claim.id}`).set('x-demo-user', '1').expect(200)
    .expect(({ body }) => expect(body.claim.category).toBe(expectedCategory));
  await request(app).get('/claims').set('x-demo-user', '1').expect(200)
    .expect(({ body }) => expect(body.claims.find(({ id }) => id === claim.id).category).toBe(expectedCategory));
});
it('menolak permintaan tanpa pengguna demo', async () => {
  await request(app).get('/claims').expect(401).expect(({ body }) => expect(body.code).toBe('DEMO_USER_REQUIRED'));
});
it('menolak akses karyawan lain ke detail klaim', async () => {
  await request(app).get('/claims/1').set('x-demo-user', '2').expect(404);
});
it('menolak approval dari Manager departemen lain', async () => {
  await request(app).post('/approvals/1').set('x-demo-user', '5').send({ action: 'approve' }).expect(404);
});
it('mencegah approval ganda dan mencatat transisi pertama', async () => {
  const decide = () => request(app).post('/approvals/1').set('x-demo-user', '4').send({ action: 'approve' });
  await decide().expect(200).expect(({ body }) => expect(body.claim.status).toBe('approved'));
  await decide().expect(409);
  expect(app.locals.db.history(1).map(({ toStatus }) => toStatus)).toEqual(['pending', 'approved']);
});
it('mengalihkan klaim besar ke Finance dan menyimpan keputusan akhir', async () => {
  const { body: { claim } } = await request(app).post('/claims').set('x-demo-user', '1')
    .send({ ...taxi, amount: 1_250_000 }).expect(201);
  const decide = (user) => request(app).post(`/approvals/${claim.id}`).set('x-demo-user', user).send({ action: 'approve' });
  await decide('6').expect(409);
  await decide('4').expect(200).expect(({ body }) => expect(body.claim.status).toBe('finance_review'));
  await decide('6').expect(200).expect(({ body }) => expect(body.claim.status).toBe('approved'));
});
it('mengizinkan laporan Finance saja dan tidak mencampur bulan', async () => {
  await request(app).get('/reports?month=2026-09').set('x-demo-user', '4').expect(403);
  const { body } = await request(app).get('/reports?month=2026-09').set('x-demo-user', '6').expect(200);
  expect(body.rows.reduce((total, row) => total + row.count, 0)).toBe(8);
  await request(app).get('/reports?month=2026-08').set('x-demo-user', '6').expect(200, { month: '2026-08', rows: [] });
});
it('mengembalikan error JSON yang bisa dipakai UI', async () => {
  await request(app).post('/claims').set('x-demo-user', '1').set('content-type', 'application/json')
    .send('{').expect(400, { code: 'INVALID_JSON', message: 'Format JSON tidak valid.' });
});
