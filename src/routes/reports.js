import { Router } from 'express';
import { requireRole } from '../services/claims.js';
import { validateMonth } from '../services/validation.js';

export function reportsRouter(db, logger) {
  const router = Router();
  router.get('/', (req, res) => {
    requireRole(req.demoUser, 'finance');
    const month = validateMonth(req.query.month);
    const rows = db.report(month);
    logger('info', 'report.read', { groups: rows.length });
    res.json({ month, rows });
  });
  return router;
}
