import { requireRole } from './claims.js';
import { InputError, validateComment, validateId } from './validation.js';

export function createComment(db, user, rawId, input) {
  requireRole(user, 'employee');
  const claimId = validateId(rawId);
  const text = validateComment(input);
  const claim = db.getClaim(claimId);
  if (!claim || claim.employeeId !== user.id) {
    throw new InputError('CLAIM_NOT_FOUND', 'Klaim tidak ditemukan.', 404);
  }
  return db.insertComment(claimId, user.id, text);
}
