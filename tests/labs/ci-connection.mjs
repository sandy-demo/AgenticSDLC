import { test } from 'node:test';

test('fixture lab: putus koneksi yang disimulasikan tanpa akses jaringan', () => {
  throw Object.assign(new Error('ECONNRESET (fixture S13, bukan insiden sungguhan)'), { code: 'ECONNRESET' });
});
