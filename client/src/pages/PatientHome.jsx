import { useState, useEffect } from 'react';
import { patientService } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '../context/ToastContext';
import './PatientHome.css';

function PatientHome({ user }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchQRCode();
  }, []);

  const fetchQRCode = async () => {
    try {
      const response = await patientService.generateQR();
      setQrCode(response.data);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const qrElement = document.querySelector('#qr-code svg');
    if (!qrElement) return;

    const svgData = new XMLSerializer().serializeToString(qrElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-passport-${user.id}.png`;
      link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="patient-home">
      <div className="welcome-card">
        <h1>Welcome, {user.name}!</h1>
        <p>Your Health Passport is your personal health data management system.</p>
      </div>

      <div className="home-grid">
        <div className="card">
          <h2>Your QR Code</h2>
          <p>Share this QR code with healthcare providers to allow them to request access to your medical records.</p>

          {loading ? (
            <div className="loading-spinner">Generating QR Code...</div>
          ) : qrCode ? (
            <div className="qr-section">
              <div id="qr-code" className="qr-container">
                <QRCodeSVG
                  value={qrCode.qr_code_id || user.id}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="qr-id">ID: {qrCode.qr_code_id}</p>
              <button className="button button-primary" onClick={downloadQR}>
                Download QR Code
              </button>
            </div>
          ) : null}
        </div>

        <div className="card">
          <h2>What You Can Do</h2>
          <ul className="feature-list">
            <li>📋 Store and manage your medical history</li>
            <li>🏥 Grant secure access to healthcare providers</li>
            <li>🆘 Create emergency health summary</li>
            <li>📊 Track all access to your records</li>
            <li>🚫 Revoke access anytime</li>
            <li>🔐 Maintain complete privacy control</li>
          </ul>
        </div>
      </div>

      <div className="card info-card">
        <h3>Privacy & Security</h3>
        <p>
          Your health data is encrypted and stored securely. You maintain complete control over who can access your medical information.
          All access is logged and you can revoke permissions at any time.
        </p>
      </div>
    </div>
  );
}

export default PatientHome;