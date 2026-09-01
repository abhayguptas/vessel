import { connect, NatsConnection, StringCodec } from 'nats';
import { logger } from '@vessel/logger';

let nc: NatsConnection;
export const sc = StringCodec();

export async function connectNATS() {
  const natsUrl = process.env.NATS_URL || 'nats://localhost:4222';
  try {
    nc = await connect({ servers: natsUrl });
    logger.info(`Connected to NATS at ${natsUrl}`);
  } catch (err: any) {
    logger.error({ err: err.message }, 'Failed to connect to NATS');
  }
}

export function getNatsConnection(): NatsConnection {
  if (!nc) {
    throw new Error('NATS connection not established');
  }
  return nc;
}
