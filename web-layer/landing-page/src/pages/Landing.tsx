import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VesselLogo } from '../Logo';
import { 
  Activity, Box, Zap, 
  CheckCircle, ArrowRight
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
        <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Pricing</a>
        <Link to="/docs" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500 }}>Docs</Link>
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
        <div className="scroll-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--bg-sand)', padding: '6px 16px', borderRadius: '24px', border: '1px solid var(--border-light)', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
          <Activity size={16} color="var(--accent-primary)" /> Optimize Execution by 10x
        </div>
        
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

      {/* Hero Visual: Dashboard Mockup */}
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
          {/* A mock UI resembling the dashboard */}
          <div style={{ width: '100%', height: '500px', background: 'var(--bg-sand)', borderRadius: '16px', display: 'flex' }}>
            <div style={{ width: '240px', background: 'white', borderRight: '1px solid var(--border-light)', padding: '2rem 1rem' }}>
              <div style={{ height: '32px', width: '120px', background: '#e2e8f0', borderRadius: '6px', marginBottom: '3rem' }}></div>
              <div style={{ height: '24px', width: '80%', background: 'var(--accent-light)', borderRadius: '6px', marginBottom: '1rem' }}></div>
              <div style={{ height: '24px', width: '70%', background: '#f1f5f9', borderRadius: '6px', marginBottom: '1rem' }}></div>
              <div style={{ height: '24px', width: '90%', background: '#f1f5f9', borderRadius: '6px', marginBottom: '1rem' }}></div>
            </div>
            <div style={{ flex: 1, padding: '2rem' }}>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ flex: 1, background: 'white', height: '120px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '16px', width: '40%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }}></div>
                  <div style={{ height: '32px', width: '60%', background: '#e2e8f0', borderRadius: '4px' }}></div>
                </div>
                <div style={{ flex: 1, background: 'white', height: '120px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '16px', width: '40%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }}></div>
                  <div style={{ height: '32px', width: '60%', background: '#e2e8f0', borderRadius: '4px' }}></div>
                </div>
                <div style={{ flex: 1, background: 'white', height: '120px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ height: '16px', width: '40%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }}></div>
                  <div style={{ height: '32px', width: '60%', background: '#e2e8f0', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div style={{ background: 'white', height: '200px', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: '16px', width: '20%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '2rem' }}></div>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '120px', gap: '1rem' }}>
                  <div style={{ flex: 1, background: 'var(--accent-primary)', height: '60%', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ flex: 1, background: 'var(--accent-primary)', height: '80%', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ flex: 1, background: 'var(--accent-primary)', height: '40%', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ flex: 1, background: 'var(--accent-primary)', height: '100%', borderRadius: '4px 4px 0 0' }}></div>
                  <div style={{ flex: 1, background: 'var(--accent-primary)', height: '70%', borderRadius: '4px 4px 0 0' }}></div>
                </div>
              </div>
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

const Pricing = () => {
  return (
    <section id="pricing" style={{ padding: '8rem 2rem', background: 'var(--bg-main)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 className="scroll-reveal" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem' }}>Flexible Pricing Plans</h2>
          <p className="scroll-reveal delay-1 text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Choose the perfect plan for your infrastructure—whether you're just starting out or managing millions of jobs.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1100px', margin: '0 auto', alignItems: 'center' }}>
          {/* Basic Tier */}
          <div className="scroll-reveal" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '3rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Developer Plan</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Simple execution for hobbyists.</p>
            <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '2rem' }}>$0 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Up to 1,000 jobs/mo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Shared worker pool</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Basic execution insights</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Community support</li>
            </ul>
            <Link to="/register" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '8px' }}>Get Started</Link>
          </div>

          {/* Pro Tier (Highlighted) */}
          <div className="scroll-reveal delay-1" style={{ background: 'var(--bg-main)', border: '2px solid var(--accent-primary)', borderRadius: '24px', padding: '3.5rem 2.5rem', boxShadow: 'var(--shadow-xl)', position: 'relative', transform: 'scale(1.05)' }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>MOST POPULAR</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Pro Plan</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Automation for growing startups.</p>
            <div style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '2rem' }}>$69 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Up to 50,000 jobs/mo</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Priority queuing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Real-time log streaming</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--accent-primary)" /> Priority email support</li>
            </ul>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '8px' }}>Start Free Trial</button>
          </div>

          {/* Enterprise Tier */}
          <div className="scroll-reveal delay-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: '24px', padding: '3rem 2rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Enterprise Plan</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Full control for large teams.</p>
            <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '2rem' }}>$199 <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>/month</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--text-main)" /> Unlimited execution limits</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--text-main)" /> Dedicated worker clusters</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--text-main)" /> VPC Peering</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><CheckCircle size={18} color="var(--text-main)" /> 24/7 dedicated support</li>
            </ul>
            <a href="#" className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '14px', borderRadius: '8px' }}>Contact Sales</a>
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
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Become an Early Adopter</div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Join our Beta Program</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '400px', lineHeight: 1.6 }}>
                Get exclusive access to dedicated clusters and shape the future of distributed execution with us.
              </p>
            </div>
            <div>
              <Link to="/register" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '32px' }}>
                Join the beta <ArrowRight size={18} />
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
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Company</strong>
                <a href="#pricing" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Pricing</a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Contact Us</a>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>Become an Affiliate <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}/></a>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Socials</strong>
                <a href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.95rem' }}>GitHub <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }}/></a>
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
          
          <div style={{ borderTop: '1px solid var(--border-light)', marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <p>© 2026 Vessel Inc. All rights reserved. • Made with Vessel</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>Built in React</span>
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
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
