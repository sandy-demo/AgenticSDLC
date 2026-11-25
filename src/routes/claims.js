import { Router } from 'express';
import { createClaim, readAccessibleClaim, requireRole } from '../services/claims.js';
import { createComment } from '../services/comments.js';

export function claimsRouter(db, clock, logger) {
  const router = Router();
  router.get('/', (req, res) => {
    requireRole(req.demoUser, 'employee');
    res.json({ claims: db.listOwn(req.demoUser.id) });
  });
  router.post('/', (req, res) => {
    const claim = createClaim(db, req.demoUser, req.body, clock());
    logger('info', 'claim.created', { claimId: claim.id });
    res.status(201).json({ claim });
  });
  router.post('/:id/comments', (req, res) => {
    const comment = createComment(db, req.demoUser, req.params.id, req.body);
    logger('info', 'claim.comment.created', { claimId: comment.claimId, commentId: comment.id });
    res.status(201).json({ comment });
  });
  router.get('/:id', (req, res) => res.json({ claim: readAccessibleClaim(db, req.demoUser, req.params.id) }));
  return router;
}
