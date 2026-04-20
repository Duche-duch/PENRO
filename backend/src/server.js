import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import recordsRoutes from './routes/records.js';
import usersRoutes from './routes/users.js';

// Force .env values to override stale shell/session variables.
dotenv.config({ override: true });

if (!process.env.JWT_SECRET) {
  console.error('FATAL: Set JWT_SECRET in backend/.env');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: frontendOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/users', usersRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`PENRO API listening on http://localhost:${PORT}`);
});
