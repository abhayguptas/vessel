import { connect } from 'nats';
async function test() {
  const nc = await connect({ servers: 'nats://localhost:4222' });
  const jsm = await nc.jetstreamManager();
  const info = await jsm.streams.info('LOGS');
  console.log(info.state);
  process.exit(0);
}
test();
