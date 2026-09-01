import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

let connectionString = process.env.DATABASE_URL || 'postgresql://vessel_admin:secret_password@localhost:5432/vessel_db';

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

export * from './schema.js';
