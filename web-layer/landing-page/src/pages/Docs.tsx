import { Link } from 'react-router-dom';
import { VesselLogo } from '../Logo';

export default function Docs() {
  return (
    <div className="container" style={{ maxWidth: '800px', paddingTop: '2rem' }}>
      <nav style={{ padding: '1rem 0', borderBottom: '1px solid var(--card-border)', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="logo-container" style={{ fontSize: '1.2rem' }}>
            <VesselLogo size={24} />
            Vessel Docs
          </div>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to Home</Link>
        </div>
      </nav>

      <main className="docs-content">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Documentation</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Learn how to integrate your applications with the Vessel orchestration platform.
        </p>

        <section style={{ marginBottom: '4rem' }}>
          <h2>1. Authentication</h2>
          <p>Vessel uses stateless JWT tokens. You can generate a long-lived API key from your dashboard.</p>
          <div className="code-window" style={{ marginTop: '1rem', width: '100%' }}>
            <div className="code-content" style={{ padding: '1rem' }}>
              <pre><code>Authorization: Bearer vessel_live_1234567890abcdef</code></pre>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2>2. Submitting a Workload</h2>
          <p>Submit a background job by sending an HTTP POST request to the API Gateway. The <code>payload</code> array contains the arguments passed directly to your Docker container entrypoint.</p>
          <div className="code-window" style={{ marginTop: '1rem', width: '100%' }}>
            <div className="code-content" style={{ padding: '1rem' }}>
              <pre><code>
<span className="token keyword">curl</span> -X POST https://api.vessel.dev/v1/jobs \
  -H <span className="token string">"Authorization: Bearer vessel_live_xxx"</span> \
  -H <span className="token string">"Content-Type: application/json"</span> \
  -d <span className="token string">{`'{
  "image": "ubuntu:latest",
  "priority": "high",
  "payload": ["echo", "Hello from Vessel Worker!"]
}'`}</span>
              </code></pre>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h2>3. Architecture Overview</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            When you submit a job, the Node.js API Gateway writes the state to PostgreSQL and queues the workload in a Redis priority queue. The Go Scheduler Engine pops jobs based on priority and publishes them to NATS JetStream. Finally, horizontal Go Worker Agents pull these tasks from NATS and instantiate ephemeral Docker containers to execute your code securely.
          </p>
        </section>

      </main>
    </div>
  );
}
