import { Router } from 'express';
import { decideClaim, requireRole } from '../services/claims.js';

export function approvalsRouter(db, clock, logger) {
  const router = Router();
  router.get('/', (req, res) => {
    requireRole(req.demoUser, 'manager', 'finance');
    const claim_rows = db.approvalQueue(req.demoUser);
    res.json({ claims: claim_rows });
  });
  router.post('/:id', (req, res) => {
    const { claim, replayed } = decideClaim(db, req.demoUser, req.params.id, req.body?.action, clock(),
      req.get('Idempotency-Key'));
    if (!replayed) logger('info', 'claim.status_changed', { claimId: claim.id, status: claim.status });
    res.json({ claim });
  });
  return router;
}
