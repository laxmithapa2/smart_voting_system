import { useState } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { Fingerprint, CheckCircle, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [voterId, setVoterId] = useState('');
  const [aadharId, setAadharId] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [status, setStatus] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  const navigate = useNavigate();

  const registerUser = async (currentImage) => {
    if (!voterId || !aadharId || !name || !currentImage) {
      alert('Please fill all fields and capture a face photo.');
      return;
    }
    
    setStatus('Registering... Please wait.');
    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voter_id: voterId, 
          aadhar_id: aadharId,
          name: name, 
          image: currentImage 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Success! Voter Registered.`);
        setIsRegistered(true);
      } else {
        setStatus(`Error: ${data.detail}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to connect to backend server. Please make sure the backend is running.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser(image);
  };

  const handleCapture = (imgBase64) => {
    setImage(imgBase64);
    setShowCamera(false);
    if (voterId && aadharId && name) {
      registerUser(imgBase64);
    }
  };

  if (isRegistered) {
    return (
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <CheckCircle size={48} color="var(--secondary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Registration Complete</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your biometric data has been securely saved.</p>
        
        {/* Voter ID Card Display */}
        <div style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%)', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', gap: '2rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div>
            <img src={image} alt="Voter" style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--secondary)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Elector's Photo Identity Card</h3>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}><strong>Voter ID:</strong> {voterId}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}><strong>Aadhar:</strong> **** **** {aadharId.slice(-4)}</p>
          </div>
        </div>

        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '1rem 2rem' }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Fingerprint className="text-gradient" size={28} /> Voter Registration
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
        Enroll your demographic and biometric data to participate in secure elections.
      </p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Voter ID Number</label>
            <input 
              type="text" 
              value={voterId} 
              onChange={(e) => setVoterId(e.target.value)} 
              placeholder="e.g. ABC1234567"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Aadhar Card Number</label>
            <input 
              type="text" 
              value={aadharId} 
              onChange={(e) => setAadharId(e.target.value)} 
              placeholder="12-digit Aadhar"
              required
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="As per legal documents"
            required
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Face Scan</label>
          <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
            {image ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <img src={image} alt="Captured face" style={{ width: '100%', maxWidth: '200px', borderRadius: '12px', border: '3px solid var(--secondary)', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }} />
                <button type="button" onClick={() => setShowCamera(true)} className="btn-secondary">
                  <Camera size={18} /> Retake Photo
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={() => setShowCamera(true)} 
                className="btn-secondary" 
                style={{ width: '100%', padding: '2rem', borderStyle: 'dashed', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                <Camera size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                Click to Open Face Authenticate Popup
              </button>
            )}
          </div>
        </div>
        
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', width: '100%' }} disabled={!voterId || !aadharId || !name || !image}>
          Complete Registration
        </button>
        
        {status && (
          <div style={{ marginTop: '1rem', padding: '1.5rem', background: status.includes('Success') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,0,0,0.1)', border: status.includes('Success') ? '1px solid var(--secondary)' : '1px solid var(--accent)', color: status.includes('Success') ? 'var(--secondary)' : 'white', borderRadius: '12px', textAlign: 'center', lineHeight: '1.5' }}>
            {status}
          </div>
        )}
      </form>

      {/* Fullscreen Camera Modal */}
      {showCamera && (
        <WebcamCapture 
          onCapture={handleCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
}
