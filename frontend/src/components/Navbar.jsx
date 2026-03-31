import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Fingerprint, Vote, BarChart3, Home, LogOut } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/home', name: 'Home', icon: <Home size={20} /> },
    { path: '/register', name: 'Enroll', icon: <Fingerprint size={20} /> },
    { path: '/vote', name: 'Vote', icon: <Vote size={20} /> },
    { path: '/results', name: 'Live Results', icon: <BarChart3 size={20} /> },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_session');
    // Also clear any voter session for safety
    sessionStorage.removeItem('voter_session');
    navigate('/login');
    // Force a full reload to reset state if needed
    window.location.reload();
  };

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <div className="logo-icon"><Vote size={28} color="white" /></div>
        <span className="text-gradient">SecureCast System</span>
      </div>
      <div className="nav-links">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
        {/* System Logout Button */}
        <button 
          onClick={handleLogout} 
          className="nav-link" 
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}
        >
          <LogOut size={20} />
          <span>System Logout</span>
        </button>
      </div>
    </nav>
  );
}
