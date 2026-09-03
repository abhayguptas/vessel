import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VesselLogo } from '../Logo';
import { 
  Activity, Box, Zap, 
  ArrowRight, Code, LayoutDashboard, Settings, Key, Terminal
} from 'lucide-react';

const MOCK_JOBS = [
  { id: 'job_a1c2', type: 'video-processor', status: 'Running', progress: '65%', color: '#3b82f6' },
  { id: 'job_b4f9', type: 'image-resize', status: 'Completed', progress: '100%', color: '#10b981' },
  { id: 'job_c7e3', type: 'data-sync', status: 'Failed', progress: '32%', color: '#ef4444' },
  { id: 'job_d8f4', type: 'pdf-generator', status: 'Completed', progress: '100%', color: '#10b981' },
  { id: 'job_e9g5', type: 'video-processor', status: 'Running', progress: '88%', color: '#3b82f6' },
  { id: 'job_f0h6', type: 'email-campaign', status: 'Completed', progress: '100%', color: '#10b981' },
  { id: 'job_g1i7', type: 'data-sync', status: 'Running', progress: '15%', color: '#3b82f6' },
  { id: 'job_h2j8', type: 'image-resize', status: 'Completed', progress: '100%', color: '#10b981' }
];

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
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '1rem 2rem',
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Instrument Sans' }}>
        <VesselLogo size={32} />
        Vessel
      </div>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Features</a>
        <a href="#architecture" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Architecture</a>
        <Link to="/docs" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Docs</Link>
        <a href="https://github.com/abhayguptas/vessel/tree/main" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>
          <Code size={18} /> GitHub
        </a>
        <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600 }}>Sign In</Link>
        <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.95rem' }}>Get Started</Link>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8rem 2rem 4rem',
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--bg-main)'
    }}>
      <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '900px' }}>
        <a href="https://github.com/abhayguptas/vessel/tree/main" target="_blank" rel="noopener noreferrer" className="scroll-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-sand)', padding: '6px 16px', borderRadius: '24px', border: '1px solid var(--border-light)', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', boxShadow: 'var(--shadow-sm)', textDecoration: 'none' }}>
          <Code size={16} /> Open Source on GitHub <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
        </a>
        
        <h1 className="scroll-reveal delay-1" style={{ fontSize: 'clamp(3.5rem, 7vw, 5.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          Streamline Workloads <br/>
          with a <span style={{ color: 'var(--accent-primary)' }}>Smart Execution Engine</span>
        </h1>
        
        <p className="scroll-reveal delay-2 text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          Manage isolated containers, track execution, and optimize operations—all from one intuitive distributed platform.
        </p>
        
        <div className="scroll-reveal delay-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px', borderRadius: '8px' }}>Get Started</Link>
          <a href="#features" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '14px 32px', borderRadius: '8px' }}>Explore Features</a>
        </div>
      </div>

      {/* Hero Visual: Dashboard Mockup with Data Animation */}
      <div className="scroll-reveal delay-3" style={{ marginTop: '5rem', zIndex: 1, width: '100%', maxWidth: '1100px', position: 'relative' }}>
        <div style={{
          background: 'var(--bg-main)',
          border: '1px solid var(--border-light)',
          borderRadius: '24px',
          padding: '1rem',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {/* Animated Mock UI */}
          <div style={{ width: '100%', height: '500px', background: 'var(--bg-sand)', borderRadius: '16px', display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ width: '240px', background: 'white', borderRight: '1px solid var(--border-light)', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 700, fontSize: '1.25rem', fontFamily: 'Instrument Sans', marginBottom: '2rem', paddingLeft: '8px' }}>
                <VesselLogo size={24} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: 'var(--accent-light)', color: 'var(--accent-primary)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                <LayoutDashboard size={18} /> Overview
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: 'var(--text-muted)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                <Activity size={18} /> Workloads
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: 'var(--text-muted)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                <Terminal size={18} /> Logs
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: 'var(--text-muted)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                <Key size={18} /> API Keys
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', color: 'var(--text-muted)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                <Settings size={18} /> Settings
              </div>
            </div>
            {/* Main Area */}
            <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Stats Row */}
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1, background: 'white', height: '120px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Active Workers</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    12 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', animation: 'pulseOpacity 2s infinite' }}></div>
                  </div>
                </div>
                <div style={{ flex: 1, background: 'white', height: '120px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Jobs Processed</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>4,892</div>
                </div>
                <div style={{ flex: 1, background: 'white', height: '120px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Success Rate</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>99.9%</div>
                </div>
              </div>

              {/* Live Jobs Stream */}
              <div style={{ background: 'white', flex: 1, borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Live Execution Stream</div>
                <div style={{ position: 'absolute', width: 'calc(100% - 3rem)', height: '100%', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'scrollUp 25s linear infinite' }}>
                    {/* Double the list for seamless marquee loop */}
                    {[...MOCK_JOBS, ...MOCK_JOBS].map((job, i) => (
                      <div key={i} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{job.id} <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px', fontFamily: 'Inter' }}>{job.type}</span></span>
                          <span style={{ color: job.color, fontWeight: 500 }}>{job.status}</span>
                        </div>
                        <div style={{ width: '100%', background: '#e2e8f0', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: job.progress, 
                            background: job.color, 
                            height: '100%', 
                            animation: job.status === 'Running' ? 'progress 2s ease-out infinite' : 'none' 
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const TechnicalDepth = () => {
  return (
    <section id="architecture" className="dark-section" style={{ padding: '8rem 2rem', background: 'var(--bg-dark)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="scroll-reveal" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>Enterprise-Grade Architecture</h2>
          <p className="scroll-reveal delay-1" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', color: 'var(--text-muted-inverse)' }}>
            Vessel is built on serious infrastructure. A decoupled, distributed pipeline designed for maximum resilience and scale.
          </p>
        </div>

        <div className="scroll-reveal delay-2" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-dark)',
          borderRadius: '24px',
          padding: '4rem',
          position: 'relative'
        }}>
          {/* SVG Diagram with Animations */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto', height: '400px' }}>
            
            {/* Connection Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
              <path 
                d="M 150 100 L 400 100 L 400 200 L 650 200" 
                fill="none" 
                stroke="var(--border-dark)" 
                strokeWidth="2" 
              />
              <path 
                d="M 150 100 L 400 100 L 400 200 L 650 200" 
                fill="none" 
                stroke="var(--accent-primary)" 
                strokeWidth="2" 
                strokeDasharray="100"
                style={{ animation: 'dash 3s linear infinite' }}
              />

              <path 
                d="M 150 300 L 400 300 L 400 200" 
                fill="none" 
                stroke="var(--border-dark)" 
                strokeWidth="2" 
              />
              <path 
                d="M 150 300 L 400 300 L 400 200" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2" 
                strokeDasharray="100"
                style={{ animation: 'dash 3s linear infinite 1.5s' }}
              />
            </svg>

            {/* Nodes */}
            <div style={{ position: 'absolute', top: '50px', left: '0', width: '150px', background: 'var(--bg-glass-dark)', border: '1px solid var(--border-dark)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', zIndex: 1, backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-inverse)', marginBottom: '0.5rem', fontWeight: 600 }}>Durable State</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>PostgreSQL</div>
            </div>

            <div style={{ position: 'absolute', top: '250px', left: '0', width: '150px', background: 'var(--bg-glass-dark)', border: '1px solid var(--border-dark)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', zIndex: 1, backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-inverse)', marginBottom: '0.5rem', fontWeight: 600 }}>Priority Queue</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Redis ZSETs</div>
            </div>

            <div style={{ position: 'absolute', top: '150px', left: '325px', width: '150px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--accent-primary)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', zIndex: 1, backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-inverse)', marginBottom: '0.5rem', fontWeight: 600 }}>Orchestrator</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Go Scheduler</div>
            </div>

            <div style={{ position: 'absolute', top: '150px', left: '650px', width: '150px', background: 'var(--bg-glass-dark)', border: '1px solid var(--border-dark)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', zIndex: 1, backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted-inverse)', marginBottom: '0.5rem', fontWeight: 600 }}>Execution</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Docker Agents</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  return (
    <section style={{ padding: '6rem 2rem', background: 'var(--bg-main)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container scroll-reveal">
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '3rem', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>+50%</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Faster Execution</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>99.9%</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Uptime Reliability</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>1M+</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Jobs Processed</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>10ms</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Average Latency</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  return (
    <section id="features" style={{ padding: '8rem 2rem', background: 'var(--bg-sand)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="scroll-reveal" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>The Vessel Advantage</h2>
          <p className="scroll-reveal delay-1 text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            A complete suite of tools designed to simplify distributed execution and elevate developer experience.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <div className="scroll-reveal" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--accent-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Box size={24} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>Isolated Execution</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Every workload runs in its own ephemeral Docker container, ensuring complete isolation and precise resource control.</p>
          </div>
          
          <div className="scroll-reveal delay-1" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--accent-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Zap size={24} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>Priority Queuing</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Sort critical workloads into high-priority lanes automatically using Redis-backed sorted sets for millisecond latency.</p>
          </div>

          <div className="scroll-reveal delay-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ background: 'var(--accent-light)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Activity size={24} color="var(--accent-primary)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>Data-Driven Insights</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>Track execution status, worker heartbeats, and real-time logs streaming seamlessly from the runtime environment.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer style={{ padding: '4rem 2rem 2rem', background: 'var(--bg-sand)' }}>
      <div className="container">
        <div style={{ 
          background: 'var(--bg-main)', 
          borderRadius: '32px', 
          padding: '4rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-light)'
        }}>
          
          {/* Top Callout */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', marginBottom: '4rem', paddingBottom: '4rem', borderBottom: '1px solid var(--border-light)' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Open Source Engine</div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Ready to deploy?</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
                Self-host the execution engine or try the managed platform.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="https://github.com/abhayguptas/vessel/tree/main" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '32px' }}>
                <Code size={18} /> View on GitHub
              </a>
              <Link to="/register" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '32px' }}>
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Links & Newsletter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '4rem' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.5rem', fontFamily: 'Instrument Sans', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                <VesselLogo size={32} />
                Vessel
              </div>
              <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '280px' }}>
                The most powerful execution engine & design system for developers.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Project</strong>
                <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Features</a>
                <a href="#architecture" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Architecture</a>
                <Link to="/docs" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Documentation</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Socials</strong>
                <a href="https://github.com/abhayguptas/vessel/tree/main" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>GitHub <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}/></a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Twitter/X <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}/></a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Discord <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}/></a>
              </div>
            </div>

            <div style={{ width: '300px' }}>
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'block', marginBottom: '1rem' }}>Newsletter</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Receive product updates, news, exclusive discounts and early access.
              </p>
              <div style={{ display: 'flex', background: 'var(--bg-sand)', borderRadius: '32px', padding: '4px', border: '1px solid var(--border-light)' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email..." 
                  style={{ flex: 1, background: 'transparent', border: 'none', padding: '0 16px', outline: 'none', fontSize: '0.95rem', color: 'var(--text-main)' }} 
                />
                <button style={{ background: 'var(--text-main)', color: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '1rem' }}>
            <p>© 2026 Vessel Inc. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <a href="https://abhayakg.me" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}>Built by Abhay Gupta</a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  useScrollReveal();

  return (
    <div style={{ background: 'var(--bg-main)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <main>
        <Hero />
        <StatsSection />
        <TechnicalDepth />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
