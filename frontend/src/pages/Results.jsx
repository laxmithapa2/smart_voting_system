import { useState, useEffect } from 'react';
import { Database, Link2, Clock, CheckCircle } from 'lucide-react';

export default function Results() {
  const [results, setResults] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [chain, setChain] = useState([]);

  useEffect(() => {
    // Fetch candidates
    fetch('http://localhost:8000/candidates')
      .then(res => res.json())
      .then(data => setCandidates(data.candidates || []))
      .catch(err => console.error(err));
      
    // Fetch results
    const fetchStats = () => {
      fetch('http://localhost:8000/results')
        .then(res => res.json())
        .then(data => setResults(data.results || {}))
        .catch(err => console.error(err));
        
      fetch('http://localhost:8000/chain')
        .then(res => res.json())
        .then(data => setChain(data.chain || []))
        .catch(err => console.error(err));
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '1rem 0' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Live Election Results</h2>
        <p style={{ color: 'var(--text-muted)' }}>Real-time cryptography-secured vote tallies</p>
      </div>
      
      <div className="glass-panel" style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle className="text-gradient" /> Current Standings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {candidates.map(c => {
            const votes = results[c.id] || 0;
            const percentage = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
            return (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{c.name}</strong>
                  <span>{votes} votes ({percentage}%)</span>
                </div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${percentage}%`, 
                    background: 'linear-gradient(90deg, var(--primary), #c084fc)',
                    transition: 'width 1s ease-in-out'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="glass-panel">
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database className="text-gradient" /> Blockchain Explorer
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Transparent view of the decentralized ledger. Each block contains securely hashed vote transactions.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chain.slice().reverse().map(block => (
            <div key={block.index} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <span className="text-gradient" style={{ fontWeight: 600 }}>Block #{block.index}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={14} /> {new Date(block.timestamp * 1000).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', overflowWrap: 'break-word', wordWrap: 'break-word' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><Link2 size={14} /> <strong>Block Hash:</strong> {block.hash}</div>
                <div><strong>Previous Hash:</strong> {block.previous_hash}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Transactions:</strong> {block.transactions.length} vote(s)
                </div>
              </div>
            </div>
          ))}
          {chain.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading blockchain data...</p>}
        </div>
      </div>
    </div>
  );
}
