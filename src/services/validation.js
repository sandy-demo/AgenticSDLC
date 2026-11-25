export const categories = ['Travel', 'Meals', 'Equipment', 'Other'];

const businessDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
});

export class InputError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function dateKey(date) {
  const { year, month, day } = Object.fromEntries(
    businessDateFormat.formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${year.padStart(4, '0')}-${month}-${day}`;
}

export function shiftDay(date, days) {
  // Use UTC midnight as a calendar anchor, not as the start of the Jakarta day.
  const shifted = new Date(`${dateKey(date)}T00:00:00Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

function text(value, limit, code, message, optional = false) {
  if (optional && value === undefined) return '';
  if (typeof value !== 'string' || value.trim().length > limit || (!optional && !value.trim())) {
    throw new InputError(code, message);
  }
  return value.trim();
}

export function validateClaim(value, now = new Date()) {
  const { title, category = 'Other', amount, claimDate, attachment, notes } = value ?? {};
  const cleanTitle = text(title, 100, 'CLAIM_TITLE', 'Isi judul klaim (maksimal 100 karakter).');
  if (!categories.includes(category)) throw new InputError('CLAIM_CATEGORY', 'Pilih kategori yang tersedia.');
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 50_000_000) {
    throw new InputError('CLAIM_AMOUNT', 'Jumlah harus berupa rupiah bulat, dari Rp1 sampai Rp50.000.000.');
  }
  const timestamp = typeof claimDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(claimDate)
    ? new Date(`${claimDate}T00:00:00Z`)
    : new Date(NaN);
  if (Number.isNaN(+timestamp) || timestamp.toISOString().slice(0, 10) !== claimDate) {
    throw new InputError('CLAIM_DATE_INVALID', 'Isi tanggal klaim yang valid.');
  }
  if (claimDate < dateKey(shiftDay(now, -90))) {
    throw new InputError('CLAIM_DATE_OLD', 'Tanggal klaim maksimal 90 hari ke belakang.');
  }
  const filename = text(attachment, 100, 'CLAIM_ATTACHMENT', 'Nama lampiran maksimal 100 karakter.', true);
  if (/[\\/\u0000-\u001f]/.test(filename)) {
    throw new InputError('CLAIM_ATTACHMENT', 'Isi nama file saja, bukan lokasinya.');
  }
  return {
    title: cleanTitle, category, amount, claimDate, attachment: filename,
    notes: text(notes, 500, 'CLAIM_NOTES', 'Catatan maksimal 500 karakter.', true),
  };
}

export function validateId(value) {
  if (!/^[1-9]\d*$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) {
    throw new InputError('INVALID_ID', 'Nomor klaim tidak valid.');
  }
  return Number(value);
}

export function validateMonth(value) {
  if (typeof value !== 'string' || !/^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new InputError('REPORT_MONTH', 'Pilih bulan laporan yang valid.');
  }
  return value;
}
