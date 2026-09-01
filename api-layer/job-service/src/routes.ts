import { Router } from 'express';
import { submitJob, listJobs, streamJobLogs, getWorkerCount, getJobStats } from './controllers.js';

export const router = Router();

// Endpoint for listing jobs
router.get('/', listJobs);

// Endpoint for submitting jobs via API Key or JWT
router.post('/', submitJob);

router.get('/stats', getJobStats);
router.get('/workers', getWorkerCount);
router.get('/:id/logs', streamJobLogs);
