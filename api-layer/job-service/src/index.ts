import express from 'express';
import cors from 'cors';
import { logger } from '@vessel/logger';
import { router as jobRoutes } from './routes.js';
import { startReconciliationLoop } from './controllers.js';
import { connectNATS, getNatsConnection } from './nats.js';
import { db } from '@vessel/db-client';
import { sql } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.JOB_SERVICE_PORT || 3002;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.use(cors());
app.use(express.json());
app.use(limiter); // Apply rate limiting to all requests

app.use('/api/v1/jobs', jobRoutes);

app.get('/health', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', service: 'job-service', db: 'connected' });
  } catch (e: any) {
    res.status(500).json({ status: 'error', service: 'job-service', db: 'disconnected' });
  }
});

const server = app.listen(PORT, async () => {
  logger.info(`Job service is running on port ${PORT}`);
  startReconciliationLoop();
  await connectNATS();
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down job-service...');
  const nc = getNatsConnection();
  if (nc) {
    await nc.close();
    logger.info('NATS connection closed.');
  }
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
