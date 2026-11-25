import { expect, test } from '@playwright/test';

for (const { category, label, selectCategory } of [
  { category: 'Travel', label: 'Perjalanan', selectCategory: true },
  { category: 'Other', label: 'Lainnya', selectCategory: false },
]) {
  test(`karyawan mengajukan kategori ${category} dan melihat status`, async ({ page }) => {
    await page.goto('/');
    const categorySelect = page.getByLabel('Kategori');
    await expect(categorySelect).toHaveValue('Other');
    await expect(categorySelect.locator('option')).toHaveText(['Perjalanan', 'Makan', 'Peralatan', 'Lainnya']);
    expect(await categorySelect.locator('option').evaluateAll((options) => options.map((option) => option.value)))
      .toEqual(['Travel', 'Meals', 'Equipment', 'Other']);
    if (selectCategory) await categorySelect.selectOption(category);
    const title = `Taksi bandara · Tes ${category}`;
    await page.getByLabel('Judul klaim').fill(title);
    await page.getByLabel('Jumlah (IDR)').fill('250000');
    const created = page.waitForResponse((response) =>
      response.url().endsWith('/claims') && response.request().method() === 'POST');
    await page.locator('#submit').click();
    const response = await created;
    expect(response.status()).toBe(201);
    expect(response.request().postDataJSON().category).toBe(category);
    const { claim } = await response.json();
    expect(claim).toMatchObject({ category, status: 'pending' });
    const saved = await page.request.get(`/claims/${claim.id}`, { headers: { 'x-demo-user': '1' } });
    expect(saved.ok()).toBe(true);
    expect((await saved.json()).claim.category).toBe(category);
    await expect(page.locator('#feedback')).toContainText('tersimpan');
    await expect(categorySelect).toHaveValue('Other');
    await page.reload();
    const item = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await expect(item).toContainText(label);
    await expect(item).toContainText('Menunggu Manager');
  });
}

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
