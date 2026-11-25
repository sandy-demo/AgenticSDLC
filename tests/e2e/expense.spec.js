import { expect, test } from '@playwright/test';

test('karyawan mengajukan klaim dan melihat status', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Judul klaim').fill('Taksi bandara · Tes');
  await page.getByLabel('Kategori').selectOption('Travel');
  await page.getByLabel('Jumlah (IDR)').fill('250000');
  await page.locator('#submit').click();
  await expect(page.locator('#feedback')).toContainText('tersimpan');
  await expect(page.getByRole('heading', { name: 'Taksi bandara · Tes' })).toBeVisible();
});

test('manager menyetujui klaim fiktif di antrean timnya', async ({ page }) => {
  await page.goto('/manager.html');
  const item = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Taksi bandara #1', exact: true }) });
  await item.getByRole('button', { name: 'Setujui' }).click();
  await expect(page.locator('#feedback')).toHaveText('Status klaim #1: Disetujui.');
  await expect(item).toHaveCount(0);
});

test('finance dapat memuat laporan dan melihat kondisi kosong', async ({ page }) => {
  await page.goto('/report.html');
  await page.getByLabel('Bulan').fill('2000-01');
  await page.getByRole('button', { name: 'Tampilkan laporan' }).click();
  await expect(page.locator('#list-status')).toHaveText('Tidak ada klaim disetujui untuk bulan ini.');
});
