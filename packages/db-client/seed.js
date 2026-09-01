import { db } from './dist/index.js';
import { apiKeys, organizations } from './dist/schema.js';
import crypto from 'crypto';

function hashApiKey(key) {
  return crypto.createHash('sha256').update(key).digest('hex');
}

async function run() {
  try {
    const orgs = await db.select().from(organizations);
    if (orgs.length === 0) {
      console.log('No orgs found');
      process.exit(1);
    }
    await db.insert(apiKeys).values({
      organizationId: orgs[0].id,
      name: 'Default Test Key',
      prefix: 'vessel_live_',
      keyType: 'live',
      keyHash: hashApiKey('vessel_live_test123')
    });
    console.log('Inserted API Key vessel_live_test123 for org', orgs[0].id);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
run();
