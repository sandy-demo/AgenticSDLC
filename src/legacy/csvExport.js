export async function csvExport(endpoint, fetcher = globalThis.fetch) {
  const response = await fetcher(endpoint);
  if (response?.status !== 200) {
    throw new Error('Ekspor CSV gagal.');
  }
  const body = await response.text();
  if (typeof body !== 'string') {
    throw new Error('Ekspor CSV gagal.');
  }
  return body;
}
