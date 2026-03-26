import { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, AlertCircle } from 'lucide-react';
import { patientService } from '../services/api';
import { useToast } from '../context/useToast';

const PatientHome = () => {
  const [qrCodeId, setQrCodeId] = useState('');
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();
  const qrRef = useRef();

  const loadQR = useCallback(async () => {
    try {
      const data = await patientService.generateQR();
      setQrCodeId(data.qr_code_id);
    } catch {
      showError('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadQR();
  }, [loadQR]);

  const handleExport = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Add padding and white background
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `HealthPassport-${qrCodeId.substring(0, 8)}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      showSuccess('QR code exported successfully');
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading) return <div className="flex-center" style={{ height: '300px' }}><div className="loader"></div></div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Your Health Passport</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Present this QR code to authorized healthcare providers.</p>
      
      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '32px', padding: '32px', alignItems: 'center' }}>
        
        {/* QR Core Container */}
        <div className="flex-center" style={{ flexDirection: 'column', padding: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div ref={qrRef} style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <QRCodeSVG value={qrCodeId} size={220} level={"H"} />
          </div>
          <div style={{ marginTop: '16px', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            ID: {qrCodeId}
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ marginBottom: '8px' }}>Quick Actions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>Save your QR to your device or print it for offline emergencies.</p>
            <button className="btn btn-primary" onClick={handleExport} style={{ width: '100%' }}>
              <Download size={18} /> Export as PNG
            </button>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--info)', marginBottom: '8px', fontWeight: '600' }}>
              <AlertCircle size={18} /> How it works
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Scanning this code gives providers temporary access to your health records based on your consent preferences.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientHome;
