import { Router } from 'express';
import { requireRole } from '../services/claims.js';
import { validateMonth } from '../services/validation.js';

export function reportsRouter(db) {
  const router = Router();
  router.get('/', (req, res) => {
    requireRole(req.demoUser, 'finance');
    const month = validateMonth(req.query.month);
    res.json({ month, rows: db.report(month) });
  });
  return router;
}
