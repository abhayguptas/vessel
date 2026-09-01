import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { VesselLogo } from '../Logo';
import { useAuth } from '../AuthContext';
import { USER_SERVICE_URL } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${USER_SERVICE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, organizationName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      login(data.tokens.accessToken, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-layout">
      <Link to="/" className="auth-header">
        <VesselLogo size={32} />
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'Instrument Sans' }}>Vessel</span>
      </Link>
      <div className="auth-card">
        <h2>Create an Account</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label>Organization Name</label>
            <input 
              type="text" 
              className="auth-input"
              value={organizationName}
              onChange={e => setOrganizationName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input 
              type="email" 
              className="auth-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password</label>
            <input 
              type="password" 
              className="auth-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', animation: 'none' }}>
            Get Started
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
