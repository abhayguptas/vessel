import express from 'express';
import cors from 'cors';
import { logger } from '@vessel/logger';
import { router as jobRoutes } from './routes.js';
import { startReconciliationLoop } from './controllers.js';
import { connectNATS } from './nats.js';

const app = express();
const PORT = process.env.JOB_SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/v1/jobs', jobRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'job-service' });
});

app.listen(PORT, async () => {
  logger.info(`Job service is running on port ${PORT}`);
  startReconciliationLoop();
  await connectNATS();
});
