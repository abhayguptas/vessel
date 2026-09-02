import { Request, Response } from 'express';
import { z } from 'zod';
import { db, jobs, apiKeys } from '@vessel/db-client';
import { logger } from '@vessel/logger';
import { eq, desc, sql } from 'drizzle-orm';
import { hashApiKey, verifyAccessToken } from '@vessel/auth';
import { Redis } from 'ioredis';
import { getNatsConnection, sc } from './nats.js';
import { DeliverPolicy, AckPolicy } from 'nats';

// Redis client for job queue
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

redis.on('error', (err: Error) => {
  logger.error({ err }, 'Redis connection error');
});

// Priority score mapping — must match Go scheduler's getPriorityScore
function getPriorityScore(priority: string): number {
  switch (priority) {
    case 'high': return 100;
    case 'normal': return 50;
    case 'low': return 10;
    default: return 50;
  }
}

const QUEUE_KEY = 'vessel:queue:jobs';

interface QueuePayload {
  id: string;
  organization_id: string;
  type: string;
  priority: string;
  payload: Record<string, any>;
}

async function enqueueJob(payload: QueuePayload): Promise<void> {
  const score = getPriorityScore(payload.priority);
  const data = JSON.stringify(payload);
  await redis.zadd(QUEUE_KEY, score, data);
}

export function startReconciliationLoop() {
  setInterval(async () => {
    try {
      const pendingJobs = await db.select().from(jobs).where(eq(jobs.status, 'pending')).limit(50);
      if (pendingJobs.length > 0) {
        logger.info(`Reconciler found ${pendingJobs.length} pending jobs`);
        for (const job of pendingJobs) {
          try {
            await enqueueJob({
              id: job.id,
              organization_id: job.organizationId,
              type: job.type,
              priority: job.priority,
              payload: job.payload as Record<string, any>,
            });
            await db.update(jobs).set({ status: 'queued', updatedAt: new Date() }).where(eq(jobs.id, job.id));
            logger.info({ jobId: job.id }, 'Job recovered and enqueued to Redis');
          } catch (e: any) {
            logger.error({ jobId: job.id, err: e.message }, 'Reconciler failed to enqueue job');
          }
        }
      }

    } catch (e: any) {
      logger.error({ err: e.message }, 'Reconciler DB fetch error');
    }

    // Demo Mode Cleanup: delete completed/failed jobs older than 1 hour
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = await db.execute(
        sql`DELETE FROM ${jobs} WHERE status IN ('completed', 'failed') AND updated_at < ${oneHourAgo}`
      );
      logger.info('Cleaned up old demo jobs');
    } catch (e: any) {
      logger.error({ err: e }, 'Cleanup loop error');
    }
  }, 10000); // run every 10 seconds
}

const jobSubmitSchema = z.object({
  type: z.string().min(1),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  workloadId: z.enum(['hello-vessel', 'processing-demo', 'failure-demo']),
});

const ALLOWED_WORKLOADS: Record<string, { image: string; cmd: string[] }> = {
  'hello-vessel': {
    image: 'alpine:latest',
    cmd: ['sh', '-c', 'echo "Hello from Vessel!" && sleep 2'],
  },
  'processing-demo': {
    image: 'alpine:latest',
    cmd: ['sh', '-c', 'echo "Starting processing..." && sleep 2 && echo "Processing stage 1 complete." && sleep 3 && echo "Processing stage 2 complete." && sleep 1 && echo "Done."'],
  },
  'failure-demo': {
    image: 'alpine:latest',
    cmd: ['sh', '-c', 'echo "Attempting dangerous operation..." && sleep 2 && echo "ERROR: Simulated failure occurred!" >&2 && exit 1'],
  },
};

export async function submitJob(req: Request, res: Response): Promise<void> {
  let organizationId: string | undefined;

  const apiKeyHeader = req.headers['x-api-key'] as string;
  const authHeader = req.headers['authorization'] as string;

  if (apiKeyHeader) {
    const hashedKey = hashApiKey(apiKeyHeader);
    const validKeys = await db.select().from(apiKeys).where(eq(apiKeys.keyHash, hashedKey));
    if (validKeys.length === 0) {
      res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
      return;
    }
    organizationId = validKeys[0].organizationId;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      organizationId = decoded.org;
    } catch (e) {
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
      return;
    }
  } else {
    res.status(401).json({ error: 'Unauthorized: Missing credentials' });
    return;
  }

  try {
    const data = jobSubmitSchema.parse(req.body);
    const safePayload = ALLOWED_WORKLOADS[data.workloadId];

    const [job] = await db.insert(jobs).values({
      organizationId,
      type: data.type,
      priority: data.priority as 'high' | 'normal' | 'low',
      payload: safePayload,
    }).returning();

    logger.info({ jobId: job.id, orgId: organizationId }, 'Job created in PostgreSQL');

    // Enqueue to Redis priority queue
    try {
      await enqueueJob({
        id: job.id,
        organization_id: job.organizationId,
        type: job.type,
        priority: job.priority,
        payload: job.payload as Record<string, any>,
      });

      // Update status to 'queued' since it's now in the Redis queue
      await db.update(jobs).set({ status: 'queued', updatedAt: new Date() }).where(eq(jobs.id, job.id));
      job.status = 'queued';

      logger.info({ jobId: job.id }, 'Job enqueued to Redis');
    } catch (redisErr: any) {
      // Job exists in PG as 'pending' — not silently lost, but not queued
      logger.error({ jobId: job.id, err: redisErr.message }, 'Failed to enqueue job to Redis — job remains pending');
    }

    res.status(201).json({ message: 'Job submitted', job });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid payload', details: error.errors });
      return;
    }
    logger.error({ err: error.message }, 'Job submission error');
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function listJobs(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers['authorization'] as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const orgId = decoded.org;

    const orgJobs = await db.select().from(jobs)
      .where(eq(jobs.organizationId, orgId))
      .orderBy(desc(jobs.createdAt))
      .limit(50);
      
    res.json({ jobs: orgJobs });
  } catch (error: any) {
    logger.error({ err: error.message }, 'Error listing jobs');
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function streamJobLogs(req: Request, res: Response): Promise<void> {
  const jobId = req.params.id;

  const authHeader = req.headers['authorization'] || req.query.token as string;

  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let token = authHeader;

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  let decoded;

  try {
    decoded = verifyAccessToken(token);
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  try {
    // Verify job exists and belongs to this organization
    const jobRecords = await db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (jobRecords.length === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    if (jobRecords[0].organizationId !== decoded.org) {
      res.status(403).json({
        error: 'Forbidden: Job belongs to another organization',
      });
      return;
    }
  } catch (err) {
    logger.error({ err }, `Failed to verify job ${jobId}`);
    res.status(500).json({
      error: 'Internal server error verifying authorization',
    });
    return;
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const nc = getNatsConnection();
    const js = nc.jetstream();
    const jsm = await nc.jetstreamManager();

    // Create an ephemeral consumer for this specific job's logs.
    const consumerInfo = await jsm.consumers.add('LOGS', {
      filter_subject: `logs.job.${jobId}`,
      deliver_policy: DeliverPolicy.All,
      ack_policy: AckPolicy.None,
    });

    const consumer = await js.consumers.get(
      'LOGS',
      consumerInfo.name
    );

    const messages = await consumer.consume();

    logger.info(`Started SSE log stream for job ${jobId}`);

    // SSE heartbeat keeps proxies/connections alive.
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(': heartbeat\n\n');
      }
    }, 15000);

    (async () => {
      try {
        for await (const m of messages) {
          if (res.writableEnded) {
            break;
          }

          res.write(`data: ${sc.decode(m.data)}\n\n`);
        }
      } catch (err: any) {
        logger.error(
          { err: err.message },
          `Error streaming logs for job ${jobId}`
        );
      }
    })();

    req.on('close', () => {
      clearInterval(heartbeat);
      messages.stop();

      logger.info(`Closed SSE log stream for job ${jobId}`);
    });

  } catch (err: any) {
    logger.error(
      { err: err.message },
      `Failed to stream logs for job ${jobId}`
    );

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to stream logs',
      });
    } else {
      res.write(`event: error\ndata: ${err.message}\n\n`);
      res.end();
    }
  }
}

export async function getWorkerCount(req: Request, res: Response): Promise<void> {
  try {
    const cutoff = Date.now() - 15000; // 15 seconds
    const count = await redis.zcount('vessel:workers:active', cutoff, '+inf');
    res.json({ activeWorkers: count });
  } catch (error: any) {
    logger.error({ err: error.message }, 'Error fetching worker count');
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getJobStats(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers['authorization'] as string;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  let orgId: string;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    orgId = decoded.org;
  } catch (e) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }

  try {
    // Multi-tenancy check: Only count jobs for the authenticated org
    const allJobs = await db.select().from(jobs).where(eq(jobs.organizationId, orgId));
    let total = allJobs.length;
    let completed = 0;
    let failed = 0;
    let running = 0;
    let queued = 0;
    
    allJobs.forEach(j => {
      if (j.status === 'completed') completed++;
      if (j.status === 'failed') failed++;
      if (j.status === 'running') running++;
      if (j.status === 'queued') queued++;
    });

    res.json({
      total,
      completed,
      failed,
      running,
      queued,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error: any) {
    logger.error({ err: error.message }, 'Error fetching job stats');
    res.status(500).json({ error: 'Internal server error' });
  }
}
