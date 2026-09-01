import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VesselLogo } from '../Logo';
import { 
  Terminal, Server, Activity, 
  Database, Layers, Box, Cpu, Zap, 
  CheckCircle, ChevronDown, Code
} from 'lucide-react';

/* --- Animations Observer Hook --- */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-up');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* --- Components --- */

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1rem 2rem',
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(10, 17, 40, 0.8)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Instrument Sans' }}>
        <VesselLogo size={32} />
        Vessel
      </div>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <a href="#how-it-works" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Platform</a>
        <a href="#architecture" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Architecture</a>
        <Link to="/docs" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Docs</Link>
        <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Sign In</Link>
        <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Get Started</Link>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="dark-section" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8rem 2rem 4rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.15) 0%, transparent 60%)', zIndex: 0 }}></div>
      
      <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '900px' }}>
        <div className="scroll-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '2rem' }}>
          <Activity size={14} /> v1.0.0 Now in Beta
        </div>
        
        <h1 className="scroll-reveal delay-1" style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 1.05, marginBottom: '1.5rem' }}>
          Ship the workload.<br/>
          <span style={{ color: 'var(--accent-teal)' }}>We handle the execution.</span>
        </h1>
        
        <p className="scroll-reveal delay-2 text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          Submit jobs through a simple API. Vessel handles the scheduling, queueing, and isolated Docker execution at scale.
        </p>
        
        <div className="scroll-reveal delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>Start Building</Link>
          <a href="#architecture" className="btn-secondary" style={{ fontSize: '1.05rem', padding: '12px 28px' }}>View Architecture</a>
        </div>
      </div>

      {/* Hero Visual: Architecture Graph */}
      <div className="scroll-reveal delay-3" style={{ marginTop: '6rem', zIndex: 1, width: '100%', maxWidth: '1000px', position: 'relative' }}>
        <div style={{
          background: 'var(--bg-glass-dark)',
          border: '1px solid var(--border-dark)',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
              <Terminal size={24} color="#EA580C" />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted-inverse)' }}>API Request</div>
          </div>
          
          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #EA580C 0%, transparent 100%)', opacity: 0.5 }}></div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
              <Server size={24} color="#0284C7" />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted-inverse)' }}>Scheduler</div>
          </div>

          <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, #0284C7 0%, transparent 100%)', opacity: 0.5 }}></div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(13, 148, 136, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--accent-teal)' }}>
              <Box size={24} color="#0D9488" />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-dark)', opacity: 0.5 }}>
              <Box size={24} color="var(--text-muted-inverse)" />
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted-inverse)' }}>Workers (Docker)</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProblemSection = () => {
  return (
    <section style={{ padding: '8rem 2rem', background: 'var(--bg-sand)' }}>
      <div className="container scroll-reveal">
        <h2 style={{ fontSize: '2.5rem', maxWidth: '600px', marginBottom: '2rem' }}>
          Running workloads at scale sounds simple: <br/>
          <span style={{ color: 'var(--text-muted)' }}>"Take a job → run it."</span>
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', marginTop: '4rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>But production requires infrastructure.</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              You don't just need a script. You need priority queues, retries, worker management, isolated execution, resource limits, and real-time execution tracking.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Developers shouldn't rebuild it.</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Instead of wiring together Redis, PostgreSQL, NATS, and Kubernetes for the tenth time, Vessel provides the entire distributed execution layer out of the box.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Submit", desc: "Send a job and payload through the REST API." },
    { title: "Queue", desc: "Jobs are durably stored in PostgreSQL and pushed to Redis priority queues." },
    { title: "Schedule", desc: "The Go scheduler assigns the workload via NATS JetStream." },
    { title: "Execute", desc: "A worker node pulls the Docker image and runs it in an isolated container." },
    { title: "Observe", desc: "Receive live execution status and telemetry back through the API." }
  ];

  return (
    <section id="how-it-works" style={{ padding: '8rem 2rem', background: '#fff', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <h2 className="scroll-reveal" style={{ fontSize: '2.5rem', marginBottom: '4rem', textAlign: 'center' }}>How Vessel Works</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          {steps.map((step, i) => (
            <div key={i} className="scroll-reveal" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-sand)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--accent-teal)' }}>
                0{i+1}
              </div>
              <div style={{ paddingBottom: i !== steps.length - 1 ? '2rem' : 0, borderBottom: i !== steps.length - 1 ? '1px solid var(--border-light)' : 'none', flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const InteractiveArchitecture = () => {
  return (
    <section id="architecture" className="dark-section" style={{ padding: '8rem 2rem' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="scroll-reveal" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Built on serious infrastructure.</h2>
          <p className="scroll-reveal delay-1 text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Vessel combines the best tools for the job: PostgreSQL for durable state, Redis for fast priority queues, NATS for event streaming, and Docker for execution.
          </p>
        </div>

        <div className="scroll-reveal delay-2" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-dark)',
          borderRadius: '24px',
          padding: '4rem 2rem',
          position: 'relative'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <Database size={32} color="#0284C7" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>PostgreSQL</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Source of truth for job metadata and tenant isolation.</p>
            </div>
            <div>
              <Layers size={32} color="#EA580C" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Redis</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>High-throughput priority queueing and worker heartbeats.</p>
            </div>
            <div>
              <Activity size={32} color="#0D9488" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>NATS JetStream</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Durable, decoupled event delivery to worker nodes.</p>
            </div>
            <div>
              <Box size={32} color="#F59E0B" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Docker</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Secure, isolated container execution for every workload.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BentoGrid = () => {
  return (
    <section style={{ padding: '8rem 2rem', background: 'var(--bg-sand)' }}>
      <div className="container">
        <h2 className="scroll-reveal" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Core Capabilities</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', gridAutoRows: 'minmax(300px, auto)' }}>
          
          <div className="scroll-reveal" style={{ gridColumn: 'span 8', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Isolated Execution</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Every workload runs in its own ephemeral Docker container, ensuring complete isolation and resource control.</p>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-sand)', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box size={24} color="var(--accent-teal)" /></div>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-sand)', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Box size={24} color="var(--accent-teal)" /></div>
              <div style={{ width: '60px', height: '60px', background: 'var(--bg-sand)', borderRadius: '12px', border: '1px dashed var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}><Box size={24} color="var(--text-muted)" /></div>
            </div>
          </div>
          
          <div className="scroll-reveal delay-1" style={{ gridColumn: 'span 4', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem' }}>
            <Zap size={32} color="var(--accent-orange)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Priority Queues</h3>
            <p style={{ color: 'var(--text-muted)' }}>Sort critical workloads into high-priority lanes automatically using Redis ZSETs.</p>
          </div>

          <div className="scroll-reveal delay-2" style={{ gridColumn: 'span 4', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem' }}>
            <Cpu size={32} color="var(--accent-blue)" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Multi-Tenant</h3>
            <p style={{ color: 'var(--text-muted)' }}>Built-in organization isolation and API key management out of the box.</p>
          </div>

          <div className="scroll-reveal delay-3" style={{ gridColumn: 'span 8', background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Real-time Telemetry</h3>
            <p style={{ color: 'var(--text-muted)' }}>Execution status, worker heartbeats, and logs stream seamlessly from the runtime.</p>
            <div style={{ marginTop: '2rem', background: 'var(--bg-dark)', borderRadius: '8px', padding: '1rem', flex: 1, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: '#10B981' }}>
              &gt; job c825ee78 started<br/>
              &gt; pulling image alpine:latest<br/>
              &gt; execution completed in 1.2s
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const DeveloperExperience = () => {
  return (
    <section style={{ padding: '8rem 2rem', background: '#fff', borderTop: '1px solid var(--border-light)' }}>
      <div className="container scroll-reveal">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Complex infrastructure. Simple interface.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Just POST a JSON payload. We handle the rest.</p>
        </div>
        
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-dark)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-dark)' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }}></div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }}></div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }}></div>
          </div>
          <div style={{ padding: '2rem', overflowX: 'auto' }}>
            <pre style={{ margin: 0, color: '#E2E8F0', fontSize: '0.9rem', lineHeight: 1.5 }}>
<span style={{ color: '#F472B6' }}>curl</span> -X POST https://api.vessel.dev/v1/jobs \<br/>
  -H <span style={{ color: '#FBBF24' }}>"Authorization: Bearer vessel_live_xxx"</span> \<br/>
  -d <span style={{ color: '#FBBF24' }}>'{`'{
  "type": "video-processor",
  "priority": "high",
  "payload": {
    "url": "s3://bucket/raw.mp4"
  }
}'`}</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section style={{ padding: '8rem 2rem', background: 'var(--bg-sand)' }}>
      <div className="container">
        <h2 className="scroll-reveal" style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>Pricing</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
          {/* Developer Tier */}
          <div className="scroll-reveal" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Developer</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>For personal projects and exploration.</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>$0 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--accent-teal)" /> 1,000 jobs per month</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--accent-teal)" /> Shared worker pool</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--accent-teal)" /> Community support</li>
            </ul>
            <Link to="/register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Start Building</Link>
          </div>

          {/* Team Tier */}
          <div className="scroll-reveal delay-1" style={{ background: '#fff', border: '2px solid var(--accent-teal)', borderRadius: '16px', padding: '2.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-teal)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>RECOMMENDED</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Team</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>For production workloads.</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>$49 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--accent-teal)" /> 50,000 jobs per month</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--accent-teal)" /> Priority queuing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--accent-teal)" /> Email support</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: 0.8 }}>Coming Soon</button>
          </div>

          {/* Enterprise Tier */}
          <div className="scroll-reveal delay-2" style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Enterprise</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>For custom infrastructure needs.</p>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' }}>Custom</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--text-muted)" /> Dedicated worker clusters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--text-muted)" /> VPC Peering</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--text-muted)" /> SLA & 24/7 support</li>
            </ul>
            <a href="#" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Talk to us</a>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  return (
    <section style={{ padding: '6rem 2rem', background: '#fff' }}>
      <div className="container scroll-reveal" style={{ maxWidth: '800px' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { q: "What is Vessel?", a: "Vessel is a distributed execution engine. It allows you to submit jobs via an API, which are then queued, scheduled, and executed in isolated Docker containers." },
            { q: "Where does my workload run?", a: "Workloads run on Vessel's worker nodes. Every job executes inside a fresh, ephemeral Docker container to ensure isolation." },
            { q: "How is state managed?", a: "PostgreSQL holds the source of truth for job metadata, while Redis handles fast, in-memory priority queuing. NATS JetStream provides durable event delivery to workers." },
            { q: "Is Vessel open source?", a: "The core orchestration infrastructure is visible in our GitHub repository for evaluation, but managed execution is provided as a SaaS." }
          ].map((faq, i) => (
            <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                {faq.q}
                <ChevronDown size={20} color="var(--text-muted)" />
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => {
  return (
    <section className="dark-section" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
      <div className="container scroll-reveal">
        <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Your infrastructure should disappear.</h2>
        <p className="text-muted" style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>Build the workload. Let Vessel handle the execution.</p>
        <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>Start Building Free</Link>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="dark-section" style={{ padding: '4rem 2rem 2rem', borderTop: '1px solid var(--border-dark)' }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Instrument Sans', marginBottom: '1rem' }}>
              <VesselLogo size={28} />
              Vessel
            </div>
            <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '250px' }}>
              Build what runs. Not what runs it. Distributed execution engine for modern teams.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <strong style={{ fontSize: '0.95rem' }}>Product</strong>
              <a href="#how-it-works" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>How it works</a>
              <a href="#architecture" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Architecture</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <strong style={{ fontSize: '0.95rem' }}>Developers</strong>
              <Link to="/docs" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Documentation</Link>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>API Reference</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Code size={14}/> GitHub</a>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }} className="text-muted">
          <p>© 2026 Vessel Inc. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  useScrollReveal();

  return (
    <div style={{ background: 'var(--bg-sand)', minHeight: '100vh' }}>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <InteractiveArchitecture />
        <BentoGrid />
        <DeveloperExperience />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
