import { readAccessibleClaim, requireRole } from '../../../../src/services/claims.js';

export function findOwnClaim(db, user, id) {
  requireRole(user, 'employee');
  return readAccessibleClaim(db, user, id);
}
