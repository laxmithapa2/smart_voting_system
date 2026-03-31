import { useState, useEffect } from 'react';
import WebcamCapture from '../components/WebcamCapture';
import { ShieldCheck, Vote, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function VotingBooth() {
  const [voterId, setVoterId] = useState('');
  const [aadharId, setAadharId] = useState('');
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const [authStatus, setAuthStatus] = useState('');
  const [sessionData, setSessionData] = useState(null); // Holds voter data after auth
  
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [voteStatus, setVoteStatus] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data.candidates || []))
      .catch(err => console.error("Error fetching candidates:", err));
  }, []);

  const authenticateUser = async (currentImage) => {
    if (!voterId || !aadharId || !currentImage) {
      alert("Please provide Voter ID, Aadhar Number, and Face Scan");
      return;
    }
    setAuthStatus("Authenticating ID and Face Data...");
    try {
      const res = await fetch('http://localhost:8000/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: voterId, aadhar_id: aadharId, image: currentImage })
      });
      const data = await res.json();
      
      if (res.ok && data.authenticated) {
        if (data.has_voted) {
          setAuthStatus("Error: You have already cast your vote!");
        } else {
          setSessionData({
            voterId,
            voterName: data.voter_name,
            hasVoted: data.has_voted,
            faceImage: currentImage
          });
          setAuthStatus("");
        }
      } else {
        setAuthStatus(`Authentication Failed: ${data.detail || "Credentials did not match"}`);
      }
    } catch (err) {
      setAuthStatus("Error connecting to auth server. Is the backend running?");
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    authenticateUser(image);
  };

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !sessionData) return;
    
    setVoteStatus("Casting encrypted vote to blockchain...");
    try {
      const res = await fetch('http://localhost:8000/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voter_id: sessionData.voterId, candidate_id: selectedCandidate })
      });
      const data = await res.json();
      if (res.ok) {
        setVoteStatus("Vote Successfully Cast & Recorded on Blockchain! Verifying...");
        const updatedSession = { ...sessionData, hasVoted: true };
        setSessionData(updatedSession);
        
        setTimeout(() => {
           setVoteStatus('');
           setSessionData(null);
           setVoterId('');
           setAadharId('');
           setImage(null);
           setSelectedCandidate('');
           navigate('/results');
        }, 3000);
      } else {
        setVoteStatus(`Failed to cast vote: ${data.detail}`);
      }
    } catch (err) {
      setVoteStatus("Error connecting to server. Is the backend running?");
    }
  };

  const handleLogoutVoter = () => {
    setSessionData(null);
    setVoterId(''); setAadharId(''); setImage(null);
  };

  const handleCapture = (imgBase64) => {
    setImage(imgBase64);
    setShowCamera(false);
    if (voterId && aadharId) {
      authenticateUser(imgBase64);
    }
  };

  if (sessionData) {
    return (
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Welcome, {sessionData.voterName}
          </h2>
          <button className="btn-secondary" onClick={handleLogoutVoter} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Exit Booth
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Voter Profile</h3>
            {sessionData.faceImage ? (
              <img src={sessionData.faceImage} alt="Voter face" style={{ width: '100%', maxWidth: '200px', borderRadius: '12px', border: '2px solid var(--secondary)', marginBottom: '1rem' }} />
            ) : (
              <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1rem' }}></div>
            )}
            <div style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
              <strong>ID:</strong> {sessionData.voterId}
              <br />
              <strong>Status:</strong> {sessionData.hasVoted ? (
                <span style={{ color: 'var(--accent)' }}>Voted ✓</span>
              ) : (
                <span style={{ color: 'var(--secondary)' }}>Eligible</span>
              )}
            </div>
          </div>

          <div>
            {sessionData.hasVoted ? (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--secondary)', borderRadius: '16px' }}>
                <ShieldCheck size={48} color="var(--secondary)" style={{ margin: '0 auto 1rem auto' }} />
                <h3>You have already cast your vote!</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Your vote is securely recorded on the blockchain.</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                  <ShieldCheck size={20} /> Authentication active. You may now cast your secure vote.
                </p>
                <form onSubmit={handleVoteSubmit}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    {candidates.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', cursor: 'pointer', border: selectedCandidate === c.id ? '2px solid var(--primary)' : '2px solid transparent', transition: 'all 0.2s' }}>
                        <input 
                          type="radio" 
                          name="candidate" 
                          value={c.id} 
                          onChange={(e) => setSelectedCandidate(e.target.value)}
                          style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{c.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.party}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={!selectedCandidate}>
                    Submit Secure Vote <Vote size={20} />
                  </button>
                  {voteStatus && (
                    <div style={{ marginTop: '1rem', padding: '1.5rem', background: voteStatus.includes('Successfully') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,0,0,0.1)', border: voteStatus.includes('Successfully') ? '1px solid var(--secondary)' : '1px solid var(--accent)', color: voteStatus.includes('Successfully') ? 'var(--secondary)' : 'white', borderRadius: '12px', textAlign: 'center' }}>
                      {voteStatus}
                    </div>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <ShieldCheck className="text-gradient" size={28} /> Secure Voting Booth
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center' }}>
        Please explicitly verify your Voter ID, Aadhar, and provide a Live Face Scan to access your ballot.
      </p>
      
      <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Voter ID Number</label>
            <input 
              type="text" 
              value={voterId} 
              onChange={(e) => setVoterId(e.target.value)} 
              placeholder="Your Voter ID"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Aadhar Number</label>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Live Face Authentication</label>
          <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
            {image ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <img src={image} alt="Auth face" style={{ width: '100%', maxWidth: '200px', borderRadius: '12px', border: '3px solid var(--secondary)', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)' }} />
                <button type="button" onClick={() => setShowCamera(true)} className="btn-secondary">
                  <Camera size={18} /> Retake Scan
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
        
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', width: '100%' }} disabled={!voterId || !aadharId || !image}>
          Authenticate Identity
        </button>
        
        {authStatus && (
          <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,0,0,0.1)', border: '1px solid var(--accent)', color: 'white', borderRadius: '12px', textAlign: 'center' }}>
            {authStatus}
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
