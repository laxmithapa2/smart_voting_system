import { Link } from 'react-router-dom';
import { ShieldCheck, Fingerprint, Lock } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container animate-fade-in">
      <div className="hero-section">
        <h1 className="hero-title">
          The Future of <span className="text-gradient">Secure Voting</span>
        </h1>
        <p className="hero-subtitle">
          Experience tamper-proof elections powered by Blockchain technology and biometric Face Authentication.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn-primary">
            <Fingerprint size={20} /> Enroll Now
          </Link>
          <Link to="/results" className="btn-secondary">
            View Live Results
          </Link>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card glass-panel">
          <div className="feature-icon"><ShieldCheck size={32} color="var(--primary)" /></div>
          <h3>Immutable Ledger</h3>
          <p>Every vote is securely hashed and stored on a decentralized blockchain network.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Fingerprint size={32} color="#c084fc" /></div>
          <h3>Biometric Security</h3>
          <p>Facial recognition ensures one person, one vote. Zero identity fraud.</p>
        </div>
        <div className="feature-card glass-panel">
          <div className="feature-icon"><Lock size={32} color="var(--secondary)" /></div>
          <h3>Cryptographic Proof</h3>
          <p>End-to-end verification and complete transparency of the election process.</p>
        </div>
      </div>
    </div>
  );
}
