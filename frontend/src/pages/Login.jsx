import { useState } from 'react';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setStatus('Success! Initializing Dashboard...');
      sessionStorage.setItem('admin_session', 'true');
      setTimeout(() => {
        navigate('/home');
      }, 800);
    } else {
      setStatus('Authentication Failed: Invalid credentials');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
        <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          System Login
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Enter administrator credentials to access the secure voting dashboard.
        </p>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="e.g. admin"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', padding: '1rem', width: '100%' }}>
            <LogIn size={20} /> Access Dashboard
          </button>
          
          {status && (
            <div style={{ marginTop: '0.5rem', padding: '1rem', background: status.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,0,0,0.1)', border: status.includes('Success') ? '1px solid var(--secondary)' : '1px solid var(--accent)', color: status.includes('Success') ? 'var(--secondary)' : 'white', borderRadius: '12px', textAlign: 'center' }}>
              {status}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
