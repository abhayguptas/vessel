import express from 'express';
import cors from 'cors';
import { logger } from '@vessel/logger';
import { router as userRoutes } from './routes.js';

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

app.listen(PORT, () => {
  logger.info(`User service is running on port ${PORT}`);
});
