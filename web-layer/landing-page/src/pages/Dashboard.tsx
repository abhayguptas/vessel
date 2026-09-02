import { useState, useEffect, useMemo } from 'react';
import { Layers, Activity, LayoutDashboard, Key, Settings, CheckCircle, XCircle, Plus, TrendingUp, Users, Package, Map, Tag, LogOut as LogOutIcon, X } from 'lucide-react';
import { VesselLogo } from '../Logo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '../AuthContext';
import { USER_SERVICE_URL, JOB_SERVICE_URL, fetchWithAuth } from '../api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [workloadId, setWorkloadId] = useState('hello-vessel');
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerError, setTriggerError] = useState('');

  const [newKey, setNewKey] = useState<string | null>(null);

  const [stats, setStats] = useState({ total: 0, completed: 0, failed: 0, running: 0, queued: 0, successRate: 0 });
  const [activeWorkers, setActiveWorkers] = useState(0);

  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [jobLogs, setJobLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchApiKeys();
    fetchStats();
    fetchWorkers();
    
    // Refresh stats every 5 seconds
    const interval = setInterval(() => {
      fetchJobs();
      fetchStats();
      fetchWorkers();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetchWithAuth(JOB_SERVICE_URL);
      const data = await res.json();
      if (res.ok && data.jobs) {
        setJobs(data.jobs);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await fetchWithAuth(`${USER_SERVICE_URL}/apikeys`);
      const data = await res.json();
      if (res.ok && data.keys) {
        setApiKeys(data.keys);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetchWithAuth(`${JOB_SERVICE_URL}/stats`);
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch {}
  };

  const fetchWorkers = async () => {
    try {
      const res = await fetchWithAuth(`${JOB_SERVICE_URL}/workers`);
      const data = await res.json();
      if (res.ok) setActiveWorkers(data.activeWorkers || 0);
    } catch {}
  };

  const handleSelectJob = (job: any) => {
    setSelectedJob(job);
    setJobLogs([]);

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const eventSource = new EventSource(`${JOB_SERVICE_URL}/${job.id}/logs?token=${token}`);
    
    eventSource.onmessage = (e) => {
      setJobLogs(prev => [...prev, e.data]);
    };

    eventSource.onerror = () => {
      console.log('SSE Error or Stream Closed');
      eventSource.close();
    };

    (window as any).currentLogSource = eventSource;
  };

  const closeJobDetails = () => {
    if ((window as any).currentLogSource) {
      (window as any).currentLogSource.close();
      (window as any).currentLogSource = null;
    }
    setSelectedJob(null);
  };

  const handleGenerateKey = async () => {
    try {
      const res = await fetchWithAuth(`${USER_SERVICE_URL}/apikeys`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Generated via Dashboard' })
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey(data.rawKey);
        fetchApiKeys();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleTriggerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTriggering(true);
    setTriggerError('');
    
    try {
      const res = await fetchWithAuth(JOB_SERVICE_URL, {
        method: 'POST',
        body: JSON.stringify({
          type: workloadId,
          priority: 'normal',
          workloadId: workloadId
        })
      });
      if (res.ok) {
        await fetchJobs();
        setShowTriggerModal(false);
      } else {
        const data = await res.json();
        setTriggerError(data.error || 'Failed to trigger job');
      }
    } catch (e: any) {
      setTriggerError(e.message);
    } finally {
      setIsTriggering(false);
    }
  };

  // Derive chart data from jobs
  const barChartData = useMemo(() => {
    if (jobs.length === 0) {
      // Empty state placeholders
      return [
        { date: '1 Jul', completed: 0, failed: 0 },
        { date: '2 Jul', completed: 0, failed: 0 },
        { date: '3 Jul', completed: 0, failed: 0 },
        { date: '4 Jul', completed: 0, failed: 0 },
        { date: '5 Jul', completed: 0, failed: 0 },
        { date: '6 Jul', completed: 0, failed: 0 },
        { date: '7 Jul', completed: 0, failed: 0 }
      ];
    }
    
    // Simplistic grouping by date for real data
    const grouped: Record<string, { completed: number, failed: number }> = {};
    jobs.forEach(job => {
      const d = new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      if (!grouped[d]) grouped[d] = { completed: 0, failed: 0 };
      if (job.status === 'completed') grouped[d].completed++;
      if (job.status === 'failed') grouped[d].failed++;
    });
    
    return Object.keys(grouped).slice(0, 10).map(key => ({
      date: key,
      completed: grouped[key].completed,
      failed: grouped[key].failed
    })).reverse();
  }, [jobs]);

  const pieChartData = useMemo(() => {
    if (jobs.length === 0) return [];
    const grouped: Record<string, number> = {};
    jobs.forEach(job => {
      const t = job.type || 'unknown';
      grouped[t] = (grouped[t] || 0) + 1;
    });
    return Object.keys(grouped).map(key => ({
      name: key,
      value: grouped[key]
    }));
  }, [jobs]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="light-dashboard">
      
      {/* Primary Sidebar (Icons only) */}
      <aside className="flup-sidebar-primary">
        <div style={{ color: 'var(--flup-accent)', marginBottom: '2rem' }}>
          <Layers size={28} />
        </div>
        <div className={`flup-icon-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><LayoutDashboard size={20} /></div>
        <div className={`flup-icon-btn ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}><Activity size={20} /></div>
        <div className={`flup-icon-btn ${activeTab === 'api-keys' ? 'active' : ''}`} onClick={() => setActiveTab('api-keys')}><Key size={20} /></div>
        <div className={`flup-icon-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><Map size={20} /></div>
        <div className={`flup-icon-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={20} /></div>
        <div className={`flup-icon-btn ${activeTab === 'tags' ? 'active' : ''}`} onClick={() => setActiveTab('tags')}><Tag size={20} /></div>
        
        <div style={{ flex: 1 }} />
        <div className={`flup-icon-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /></div>
        <div className="flup-icon-btn text-red-500" onClick={logout}><LogOutIcon size={20} /></div>
      </aside>

      {/* Secondary Sidebar (Links) */}
      <aside className="flup-sidebar-secondary">
        <div className="flup-logo-area">
          <VesselLogo size={24} /> Vessel
        </div>
        
        <div className="flup-nav-group">
          <div className="flup-nav-label">Platform</div>
          <button className={`flup-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={`flup-nav-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <Activity size={18} /> Workloads
          </button>
          <button className={`flup-nav-item ${activeTab === 'api-keys' ? 'active' : ''}`} onClick={() => setActiveTab('api-keys')}>
            <Key size={18} /> API Keys
          </button>
        </div>

        <div className="flup-nav-group">
          <div className="flup-nav-label">System</div>
          <button className="flup-nav-item">
            <Settings size={18} /> Settings
          </button>
        </div>

        <div style={{ flex: 1 }} />
        
        <div style={{ borderTop: '1px solid var(--flup-border)', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
            {user?.email?.[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--flup-text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.organizationName || 'User'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--flup-text-muted)' }}>Admin</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flup-main">
        {activeTab === 'overview' ? (
          <>
            <header className="flup-header">
              <h1>Dashboard</h1>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="flup-btn-primary" onClick={() => setShowTriggerModal(true)}>
                  <Plus size={18} /> Trigger Workload
                </button>
              </div>
            </header>

            {/* Top Stats Row */}
            <div className="flup-top-stats">
              <div className="flup-card">
                <div className="flup-stat-header">
                  <Activity size={16} color="#059669" /> Active Workers
                </div>
                <div className="flup-stat-value">
                  {activeWorkers}
                  {activeWorkers > 0 ? (
                    <span className="flup-stat-trend positive" style={{ color: '#059669' }}>Online</span>
                  ) : (
                    <span className="flup-stat-trend neutral" style={{ color: '#64748b' }}>Awaiting...</span>
                  )}
                </div>
              </div>
              <div className="flup-card">
                <div className="flup-stat-header">
                  <Package size={16} color="#3b82f6" /> Total Workloads
                </div>
                <div className="flup-stat-value">
                  {stats.total}
                  {stats.total > 0 && <span className="flup-stat-trend positive"><TrendingUp size={14}/> Live data</span>}
                </div>
              </div>
              <div className="flup-card">
                <div className="flup-stat-header">
                  <CheckCircle size={16} color="#8b5cf6" /> Success Rate
                </div>
                <div className="flup-stat-value">
                  {stats.successRate}%
                  <span className="flup-stat-trend positive"><TrendingUp size={14}/> Valid</span>
                </div>
              </div>
              <div className="flup-card">
                <div className="flup-stat-header">
                  <Key size={16} color="#f59e0b" /> API Keys
                </div>
                <div className="flup-stat-value">
                  {apiKeys.length}
                  <span className="flup-stat-trend positive"><TrendingUp size={14}/> Active</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="flup-charts-row">
              <div className="flup-card">
                <div className="flup-card-title">Workloads Over Time</div>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                      <Bar dataKey="failed" name="Failed" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flup-card">
                <div className="flup-card-title">Workloads by Type</div>
                <div style={{ width: '100%', height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>No workloads yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Row */}
            <div className="flup-card">
              <div className="flup-card-title">Recent Workloads</div>
              <table className="flup-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Type / Payload</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No workloads found. Trigger one to see data flow.
                      </td>
                    </tr>
                  )}
                  {jobs.slice(0, 10).map((job) => (
                    <tr key={job.id} onClick={() => handleSelectJob(job)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{job.id.substring(0,8)}...</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--flup-text-main)' }}>{job.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--flup-text-muted)' }}>
                          {JSON.stringify(job.payload)}
                        </div>
                      </td>
                      <td>
                        <div className={`flup-badge ${job.status}`}>
                          {job.status === 'completed' && <CheckCircle size={12} />}
                          {(job.status === 'running' || job.status === 'pending' || job.status === 'queued' || job.status === 'scheduled') && <Activity size={12} />}
                          {job.status === 'failed' && <XCircle size={12} />}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{job.priority}</td>
                      <td style={{ color: '#64748b' }}>{new Date(job.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'jobs' ? (
          <>
            <header className="flup-header">
              <h1>Workloads</h1>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="flup-btn-primary" onClick={() => setShowTriggerModal(true)}>
                  <Plus size={18} /> Trigger Workload
                </button>
              </div>
            </header>

            <div className="flup-card">
              <div className="flup-card-title">All Workloads</div>
              <table className="flup-table">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Type / Payload</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No workloads found. Trigger one to see data flow.
                      </td>
                    </tr>
                  )}
                  {jobs.map((job) => (
                    <tr key={job.id} onClick={() => handleSelectJob(job)} style={{ cursor: 'pointer' }}>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{job.id.substring(0,8)}...</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--flup-text-main)' }}>{job.type}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--flup-text-muted)' }}>
                          {JSON.stringify(job.payload)}
                        </div>
                      </td>
                      <td>
                        <div className={`flup-badge ${job.status}`}>
                          {job.status === 'completed' && <CheckCircle size={12} />}
                          {(job.status === 'running' || job.status === 'pending' || job.status === 'queued' || job.status === 'scheduled') && <Activity size={12} />}
                          {job.status === 'failed' && <XCircle size={12} />}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{job.priority}</td>
                      <td style={{ color: '#64748b' }}>{new Date(job.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : activeTab === 'api-keys' ? (
          <>
            <header className="flup-header">
              <h1>API Keys</h1>
              <button className="flup-btn-primary" onClick={handleGenerateKey}>
                <Plus size={18} /> Generate New Key
              </button>
            </header>
            
            {newKey && (
              <div className="flup-card" style={{ marginBottom: '2rem', border: '1px solid #10b981', backgroundColor: '#ecfdf5' }}>
                <h4 style={{ color: '#059669', marginBottom: '0.5rem', fontWeight: 600 }}>Key Generated Successfully!</h4>
                <p style={{ color: '#047857', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Please copy this key now. You will not be able to see it again.
                </p>
                <code style={{ background: '#ffffff', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '4px', display: 'block', fontSize: '1.1rem', letterSpacing: '1px', color: '#065f46' }}>
                  {newKey}
                </code>
              </div>
            )}

            <div className="flup-card">
              <table className="flup-table">
                <thead>
                  <tr>
                    <th>Key Name</th>
                    <th>Prefix</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        No API keys found.
                      </td>
                    </tr>
                  )}
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td style={{ fontWeight: 600, color: 'var(--flup-text-main)' }}>{key.name}</td>
                      <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{key.prefix}...</td>
                      <td style={{ color: '#64748b' }}>{new Date(key.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
            Settings placeholder
          </div>
        )}
      </main>

      {/* Trigger Modal */}
      {showTriggerModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ background: '#ffffff' }}>
            <div className="modal-header">
              <h3 style={{ color: '#1e293b' }}>Trigger Workload</h3>
              <button className="modal-close" onClick={() => setShowTriggerModal(false)}>
                <X size={20} />
              </button>
            </div>
            {triggerError && <div className="auth-error">{triggerError}</div>}
            <form onSubmit={handleTriggerSubmit} className="auth-form">
              <div>
                <label style={{ color: '#64748b' }}>Workload Type</label>
                <select 
                  className="auth-input" 
                  style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', width: '100%' }}
                  value={workloadId} 
                  onChange={e => setWorkloadId(e.target.value)}
                >
                  <option value="hello-vessel">Hello Vessel (Fast/Safe)</option>
                  <option value="processing-demo">Processing Demo (Simulates Work)</option>
                  <option value="failure-demo">Failure Demo (Simulates Error)</option>
                </select>
              </div>
              <button type="submit" className="flup-btn-primary" disabled={isTriggering} style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
                {isTriggering ? 'Triggering...' : 'Submit Workload'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Slide-over */}
      {selectedJob && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '600px',
          background: 'var(--flup-bg-card)', borderLeft: '1px solid var(--flup-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.05)', zIndex: 1000, display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--flup-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--flup-text-main)' }}>Job Details</h2>
            <button onClick={closeJobDetails} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
          </div>
          
          <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '4px' }}>Job ID</div>
              <div style={{ fontFamily: 'monospace', color: 'var(--flup-text-main)' }}>{selectedJob.id}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '4px' }}>Status</div>
                <div className={`flup-badge ${selectedJob.status}`} style={{ display: 'inline-flex' }}>
                  {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '4px' }}>Priority</div>
                <div style={{ fontWeight: 500, color: 'var(--flup-text-main)' }}>{selectedJob.priority}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '4px' }}>Submitted At</div>
                <div style={{ color: 'var(--flup-text-main)' }}>{new Date(selectedJob.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '4px' }}>Type</div>
                <div style={{ color: 'var(--flup-text-main)' }}>{selectedJob.type}</div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '8px' }}>Execution Payload</div>
              <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', overflowX: 'auto', margin: 0 }}>
                {JSON.stringify(selectedJob.payload, null, 2)}
              </pre>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--flup-text-muted)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Live Container Logs</span>
                {(selectedJob.status === 'running' || selectedJob.status === 'scheduled') && <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }} /> Streaming</span>}
              </div>
              <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '1rem', borderRadius: '8px', minHeight: '300px', maxHeight: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {jobLogs.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic' }}>Waiting for logs...</div>
                ) : (
                  jobLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px', borderBottom: '1px solid #1e293b', paddingBottom: '4px' }}>{log}</div>)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
