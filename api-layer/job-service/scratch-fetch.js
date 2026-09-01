import { connect, DeliverPolicy } from 'nats';
async function test() {
  const nc = await connect({ servers: 'nats://localhost:4222' });
  const js = nc.jetstream();
  const consumer = await js.consumers.get('LOGS', { 
    filterSubjects: ["logs.job.38895045-e4f3-46f3-8cdf-fb4b34e6bef9"],
    deliver_policy: DeliverPolicy.All
  });
  const msgs = await consumer.consume({ max_messages: 5, expires: 2000 });
  for await (const m of msgs) {
    console.log(new TextDecoder().decode(m.data));
  }
  process.exit(0);
}
test();
