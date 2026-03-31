import { useRef, useCallback, useState, useEffect } from 'react';
import { Camera, Crosshair, X } from 'lucide-react';

export default function WebcamCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [stream, setStream] = useState(null);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setHasStarted(true);
      }
    } catch (err) {
      console.error("Error accessing webcam: ", err);
      alert("Please allow webcam access for face authentication.");
    }
  };

  // Ensure stream starts playing
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.play().catch(e => console.error(e));
    }
  }, [stream]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const captureFrame = useCallback((e) => {
    e.preventDefault(); // Prevent form submission
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0) {
        alert("Camera initializing, please wait a second.");
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(imageBase64);
    }
  }, [onCapture]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
      backgroundColor: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
    }}>
      <div className="glass-panel animate-fade-in" style={{ 
        width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', 
        gap: '1.5rem', alignItems: 'center', position: 'relative' 
      }}>
        
        <button type="button" onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
          border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={24} className="text-gradient" /> Face Authentication
        </h3>

        {!hasStarted ? (
          <button type="button" onClick={startVideo} className="btn-secondary" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', borderColor: 'var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
            <Camera size={56} className="text-gradient" style={{ margin: '0 auto' }} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Start Biometric Scanner</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click to allow camera access</span>
          </button>
        ) : (
          <>
            <div className="scanner-container" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)', border: '2px solid var(--primary)', width: '100%', backgroundColor: '#000' }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ display: 'block', width: '100%', height: 'auto', opacity: 0.9 }} />
              
              <div className="scanner-overlay">
                <div className="scanner-line"></div>
                <div className="target-box">
                  <Crosshair size={180} color="rgba(99, 102, 241, 0.6)" strokeWidth={1} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>
            </div>

            <button type="button" onClick={captureFrame} className="btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              <Camera size={22} /> Capture Photo
            </button>
          </>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
