import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { accessService } from '../services/api';
import { useToast } from '../context/useToast';
import { Upload, ScanLine, AlertTriangle, User as UserIcon } from 'lucide-react';

const QRScanner = () => {
  const [qrId, setQrId] = useState('');
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          showSuccess('QR code decoded successfully');
          setQrId(code.data);
        } else {
          showError('Could not find a valid QR code in the image');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async (e) => {
    e?.preventDefault();
    if (!qrId.trim()) {
      showError('Please provide a QR Code ID');
      return;
    }

    try {
      setLoading(true);
      const data = emergencyMode
        ? await accessService.emergencyAccess(qrId, undefined, 'Emergency medical access')
        : await accessService.scanQR(qrId, undefined, false);
      setScannedData(data);
      showSuccess(`Successfully accessed records for ${data.patientName || 'patient'}`);
    } catch (err) {
      showError(err.response?.data?.message || err.response?.data?.error || 'Failed to access patient records');
    } finally {
      setLoading(false);
    }
  };

  const renderScannedData = () => {
    if (!scannedData) return null;
    const { patientName, patientId, emergency, data } = scannedData;
    const displayData = emergency
      ? {
          blood_group: data?.blood_group ?? 'Not specified',
          allergies: Array.isArray(data?.allergies) ? data.allergies : [],
          current_medications: Array.isArray(data?.current_medications) ? data.current_medications : [],
          medical_history: data?.medical_history || 'Not provided',
          prescriptions: Array.isArray(data?.prescriptions) ? data.prescriptions : []
        }
      : (data || {});
    const entries = Object.entries(displayData);

    return (
      <div className="glass-panel animate-fade-in" style={{ padding: '32px', marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.2)' }}>
              <UserIcon size={24} color="var(--primary-accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{patientName}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'monospace' }}>ID: {patientId}</div>
            </div>
          </div>
          {emergency && (
            <div className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> EMERGENCY ACCESS
            </div>
          )}
        </div>

        <div className="responsive-two-col-tight" style={{ gap: '24px' }}>
          {entries.map(([key, value]) => {
            // Render primitive or array naturally
            const isArray = Array.isArray(value);
            return (
              <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', textTransform: 'capitalize' }}>
                  {key.replace('_', ' ')}
                </h3>
                {isArray ? (
                  value.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {value.map((v, i) => (
                        <span key={i} className={`badge ${key.includes('allerg') ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'none' }}>{v}</span>
                      ))}
                    </div>
                  ) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>None listed</span>
                ) : (
                  <div style={{ fontSize: '1rem' }}>{value ? String(value) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}</div>
                )}
              </div>
            );
          })}
          {entries.length === 0 && (
            <div style={{ color: 'var(--text-muted)' }}>
              No details available for this scan.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>QR Scanner & Access</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Upload a patient QR code or manually enter the Passport ID to retrieve records.</p>
      
      {!scannedData ? (
        <div className="responsive-two-col">
          
          {/* Upload Method */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '24px' }}>
              <Upload size={32} color="var(--secondary-accent)" />
            </div>
            <h3 style={{ marginBottom: '12px' }}>Upload QR Image</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Select an image file containing the Health Passport QR Code to decode it locally.</p>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileUpload} 
            />
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ width: '100%' }}>
              Select Image File
            </button>
          </div>

          {/* Manual Entry Method */}
          <form className="glass-panel" onSubmit={handleScan} style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', marginBottom: '24px', margin: '0 auto 24px auto' }}>
              <ScanLine size={32} color="var(--primary-accent)" />
            </div>
            <h3 style={{ marginBottom: '12px', textAlign: 'center' }}>Scan Options</h3>
            
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Passport ID</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter decoded ID..." 
                value={qrId}
                onChange={e => setQrId(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '24px' }}>
              <span style={{ color: 'var(--error)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} /> Emergency Mode
              </span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={emergencyMode} 
                  onChange={() => setEmergencyMode(!emergencyMode)} 
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }} disabled={loading}>
              {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : <><ScanLine size={18} /> Access Records</>}
            </button>
          </form>

        </div>
      ) : (
        <>
          <button className="btn btn-secondary" onClick={() => { setScannedData(null); setQrId(''); setEmergencyMode(false); }} style={{ marginBottom: '16px' }}>
            &larr; Scan Another
          </button>
          {renderScannedData()}
        </>
      )}
    </div>
  );
};

export default QRScanner;
