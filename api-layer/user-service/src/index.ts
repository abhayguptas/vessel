import express from 'express';
import cors from 'cors';
import { logger } from '@vessel/logger';
import { router as userRoutes } from './routes.js';
import { db } from '@vessel/db-client';
import { sql } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use(cors());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all requests

// Routes
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', service: 'user-service', db: 'connected' });
  } catch (e: any) {
    res.status(500).json({ status: 'error', service: 'user-service', db: 'disconnected' });
  }
});

const server = app.listen(PORT, () => {
  logger.info(`User service is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down user-service...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
