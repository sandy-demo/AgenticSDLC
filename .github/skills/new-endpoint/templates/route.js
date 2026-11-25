import { Router } from 'express';
import { findOwnClaim } from './service.js';

export function newRouter(db, logger) {
  const router = Router();
  router.get('/:id', (req, res) => {
    const claim = findOwnClaim(db, req.demoUser, req.params.id);
    logger('info', 'claim.read', { claimId: claim.id });
    res.json({ claim });
  });
  return router;
}
