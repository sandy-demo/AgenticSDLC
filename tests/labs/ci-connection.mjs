import { test } from 'node:test';

test('fixture S13: contoh log putus koneksi tanpa akses jaringan', () => {
  throw Object.assign(new Error('ECONNRESET (fixture S13, bukan insiden sungguhan)'), { code: 'ECONNRESET' });
});
