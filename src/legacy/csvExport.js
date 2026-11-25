/** @deprecated Ganti adapter callback ini setelah kontraknya punya characterization test. */
export function csvExport(readCsv, endpoint) {
  return new Promise((resolve, reject) => {
    readCsv(endpoint, (error, response, body) => {
      if (error) return reject(error);
      if (response?.statusCode !== 200 || typeof body !== 'string') {
        return reject(new Error('Ekspor CSV gagal.'));
      }
      resolve(body);
    });
  });
}
