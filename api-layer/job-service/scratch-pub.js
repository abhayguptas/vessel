import { connect } from 'nats';
async function test() {
  const nc = await connect({ servers: 'nats://localhost:4222' });
  nc.publish('logs.job.test1234', new TextEncoder().encode(JSON.stringify({ Message: 'test msg' })));
  await nc.flush();
  
  const jsm = await nc.jetstreamManager();
  const info = await jsm.streams.info('LOGS');
  console.log("Stream stats after publish:", info.state);
  process.exit(0);
}
test();
