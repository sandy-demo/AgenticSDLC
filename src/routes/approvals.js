import { Router } from 'express';
import { decideClaim, requireRole } from '../services/claims.js';

export function approvalsRouter(db, clock, logger) {
  const router = Router();
  router.get('/', (req, res) => {
    requireRole(req.demoUser, 'manager', 'finance');
    res.json({ claims: db.approvalQueue(req.demoUser) });
  });
  router.post('/:id', (req, res) => {
    const claim = decideClaim(db, req.demoUser, req.params.id, req.body?.action, clock());
    logger('info', 'claim.status_changed', { claimId: claim.id, status: claim.status });
    res.json({ claim });
  });
  return router;
}
