import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRouter from './routes/extract.js';
import digestRouter from './routes/digest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();

export const PORT = process.env.PORT || 3001;
app.set('port', PORT);

// ── Security middleware ───────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  })
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.', code: 'RATE_LIMITED' },
});
app.use('/api', apiLimiter);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/extract', extractRouter);
app.use('/api/digest', digestRouter);

// ── Static Files (Vite Production Build) ──────────────────────────────────────
app.use(express.static(distPath));

// ── SPA Fallback: send index.html for any non-/api route ──────────────────────
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── 404 handler for unmatched /api routes ─────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

export default app;
