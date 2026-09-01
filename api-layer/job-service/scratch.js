import { connect, DeliverPolicy } from 'nats';
async function test() {
  const nc = await connect({ servers: 'nats://localhost:4222' });
  const js = nc.jetstream();
  console.log("Getting consumer...");
  try {
    const consumer = await js.consumers.get('LOGS', { 
      filterSubjects: ["logs.job.642ce85d-526a-43a7-b357-285ea0d1b8df"],
      deliver_policy: DeliverPolicy.All
    });
    console.log("Got consumer");
    const msgs = await consumer.consume();
    for await (const m of msgs) {
      console.log(new TextDecoder().decode(m.data));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
