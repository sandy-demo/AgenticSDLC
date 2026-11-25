import express from 'express';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createDatabase } from './db.js';
import { log } from './logger.js';
import { approvalsRouter } from './routes/approvals.js';
import { claimsRouter } from './routes/claims.js';
import { reportsRouter } from './routes/reports.js';
import { InputError } from './services/validation.js';

export function createApp({ clock = () => new Date(), logger = log, db = createDatabase(clock()) } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.locals.db = db;
  app.use((_req, res, next) => {
    res.set('Content-Security-Policy', "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'");
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));
  app.use(express.json({ limit: '8kb' }));
  const selectDemoUser = (req, _res, next) => {
    const key = req.get('x-demo-user');
    if (!/^[1-6]$/.test(key ?? '') || !(req.demoUser = db.getUser(Number(key)))) {
      throw new InputError('DEMO_USER_REQUIRED', 'Pilih pengguna demo yang valid.', 401);
    }
    next();
  };
  app.use('/claims', selectDemoUser, claimsRouter(db, clock, logger));
  app.use('/approvals', selectDemoUser, approvalsRouter(db, clock, logger));
  app.use('/reports', selectDemoUser, reportsRouter(db, logger));
  app.use((_req, _res, next) => next(new InputError('NOT_FOUND', 'Halaman atau endpoint tidak ditemukan.', 404)));
  app.use((error, req, res, _next) => {
    const response = error instanceof InputError ? error
      : error.type === 'entity.parse.failed' ? new InputError('INVALID_JSON', 'Format JSON tidak valid.')
      : error.type === 'entity.too.large' ? new InputError('BODY_LIMIT', 'Ukuran permintaan terlalu besar.', 413)
      : new InputError('INTERNAL_ERROR', 'Terjadi kesalahan pada aplikasi demo.', 500);
    logger(response.status >= 500 ? 'error' : 'warn', 'request.failed', {
      code: response.code, method: req.method,
    });
    res.status(response.status).json({ code: response.code, message: response.message });
  });
  return app;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT tidak valid.');
  const app = createApp();
  const server = app.listen(port, '127.0.0.1', () => log('info', 'server.ready', { port: server.address().port }));
  const stop = () => server.close(() => app.locals.db.close());
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}
