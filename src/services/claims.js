import { InputError, validateClaim, validateId, validateIdempotencyKey } from './validation.js';
import { requiresFinance } from './approvalRules.js';

export function requireRole(user, ...roles) {
  if (!roles.includes(user.role)) {
    throw new InputError('ROLE_REQUIRED', 'Peran demo ini tidak punya izin untuk tindakan tersebut.', 403);
  }
}

export function readAccessibleClaim(db, user, rawId) {
  const claim = db.getClaim(validateId(rawId));
  const visible = claim && (
    (user.role === 'employee' && claim.employeeId === user.id) ||
    (user.role === 'manager' && claim.department === user.department) ||
    user.role === 'finance'
  );
  if (!visible) throw new InputError('CLAIM_NOT_FOUND', 'Klaim tidak ditemukan.', 404);
  return claim;
}

export function createClaim(db, user, input, timestamp) {
  requireRole(user, 'employee');
  return db.insertClaim(user.id, validateClaim(input, timestamp), timestamp.toISOString());
}

export function decideClaim(db, user, id, action, timestamp, rawKey) {
  requireRole(user, 'manager', 'finance');
  if (!['approve', 'reject'].includes(action)) {
    throw new InputError('APPROVAL_ACTION', 'Pilih setuju atau tolak.');
  }
  const claim = readAccessibleClaim(db, user, id);
  if (user.id === claim.employeeId) throw new InputError('SELF_APPROVAL', 'Pengaju tidak boleh menyetujui klaim sendiri.', 403);
  const key = validateIdempotencyKey(rawKey);
  if (key !== undefined) {
    const outcome = db.getApprovalOutcome(user.id, claim.id, key);
    if (outcome) {
      if (outcome.action !== action) {
        throw new InputError('IDEMPOTENCY_CONFLICT', 'Kunci idempotensi sudah digunakan untuk tindakan berbeda.', 409);
      }
      return { claim: { ...claim, status: outcome.status }, replayed: true };
    }
  }
  const requiredStatus = user.role === 'manager' ? 'pending' : 'finance_review';
  const conflict = () => new InputError('CLAIM_STATUS', 'Klaim tidak menunggu keputusan peran ini.', 409);
  if (claim.status !== requiredStatus) throw conflict();
  const nextStatus = action === 'reject' ? 'rejected'
    : user.role === 'manager' && requiresFinance(claim.amount) ? 'finance_review' : 'approved';
  const updated = db.transitionClaim(claim, user.id, nextStatus, timestamp.toISOString(),
    key === undefined ? undefined : { key, action });
  if (!updated) throw conflict();
  return { claim: updated, replayed: false };
}
