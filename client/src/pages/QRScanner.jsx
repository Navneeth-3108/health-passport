import { useState, useRef } from 'react';
import jsQR from 'jsqr';
import { accessService } from '../services/api';
import { useToast } from '../context/ToastContext';
import './QRScanner.css';

function QRScanner({ user }) {
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const emergencyStateAtScanRef = useRef(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

        setLoading(false);
        if (qrCode) {
          await handleScan(qrCode.data);
        } else {
          showError('No QR code detected in the image. Please try another image or enter the code manually.');
        }
      };
      img.onerror = () => {
        setLoading(false);
        showError('Failed to load the image. Please try another file.');
      };
      img.src = URL.createObjectURL(file);
    } catch (err) {
      setLoading(false);
      showError('Error processing the image. Please try again.');
      console.error('Image processing error:', err);
    }
  };

  const handleScan = async (qrCodeId) => {
    if (!qrCodeId || !qrCodeId.trim()) {
      showError('Please provide a valid QR code ID');
      return;
    }

    setLoading(true);

    emergencyStateAtScanRef.current = isEmergency;

    try {
      console.log('Scanning QR:', qrCodeId, 'Requested by:', user.id);
      const response = await accessService.scanQR(qrCodeId.trim(), user.id, isEmergency);
      console.log('Scan response:', response.data);
      setScannedData(response.data);
      showSuccess(
        isEmergency
          ? 'Emergency access granted to patient data'
          : 'Patient QR code scanned successfully'
      );
    } catch (err) {
      console.error('Scan error:', err);
      showError(err.response?.data?.message || 'Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = () => {
    const qrCode = prompt('Enter the patient QR code ID (12 characters):');
    if (qrCode && qrCode.trim()) {
      handleScan(qrCode.trim());
    }
  };

  return (
    <div className="qr-scanner">
      <h1>Scan Patient QR Code</h1>

      <div className="scanner-container">
        <div className="card">
          <h2>Emergency Access</h2>
          <p>Enable emergency access to view patient's emergency health information immediately</p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
            />
            <span className="checkbox-label">
              {isEmergency ? '🚨 Emergency Access Enabled' : 'Enable Emergency Access'}
            </span>
          </label>
          {isEmergency && (
            <p className="emergency-warning">
              ⚠️ You are accessing patient data in emergency mode. This access will be logged and audited.
            </p>
          )}
        </div>

        <div className="card">
          <h2>Upload QR Code Image</h2>
          <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
            <div className="upload-icon">📸</div>
            <p>Click to upload or drag and drop</p>
            <small>PNG, JPG up to 10MB</small>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>

        <div className="card">
          <h2>Or Enter Manually</h2>
          <p>If you have the QR code ID, you can enter it manually:</p>
          <button className="button button-secondary" onClick={handleManualEntry}>
            Enter QR Code ID Manually
          </button>
        </div>
      </div>

      {scannedData && (
        <div className="card scanned-result">
          <h2>Scan Result</h2>
          <div className="result-data">
            <p><strong>Patient Name:</strong> {scannedData.patientName}</p>
            <p><strong>Patient ID:</strong> {scannedData.patientId}</p>
            {scannedData.data.medical_history && (
              <div className="result-section">
                <strong>Medical History:</strong>
                <p>{scannedData.data.medical_history}</p>
              </div>
            )}
            {scannedData.data.prescriptions && scannedData.data.prescriptions.length > 0 ? (
              <div className="result-section">
                <strong>Prescriptions:</strong>
                <ul>
                  {scannedData.data.prescriptions.map((rx, idx) => (
                    <li key={idx}>{rx}</li>
                  ))}
                </ul>
              </div>
            ) : scannedData.data.prescriptions !== undefined ? (
              <div className="result-section">
                <strong>Prescriptions:</strong>
                <p className="no-data">No prescriptions recorded</p>
              </div>
            ) : null}
            {scannedData.data.blood_group && (
              <div className="result-section">
                <strong>Blood Group:</strong>
                <p>{scannedData.data.blood_group === 'Not specified' ? 'Not specified' : scannedData.data.blood_group}</p>
              </div>
            )}
            {scannedData.data.allergies && scannedData.data.allergies.length > 0 ? (
              <div className="result-section">
                <strong>Allergies:</strong>
                <ul>
                  {scannedData.data.allergies.map((allergy, idx) => (
                    <li key={idx}>{allergy}</li>
                  ))}
                </ul>
              </div>
            ) : scannedData.data.allergies !== undefined ? (
              <div className="result-section">
                <strong>Allergies:</strong>
                <p className="no-data">No allergies recorded</p>
              </div>
            ) : null}
            {scannedData.data.current_medications && scannedData.data.current_medications.length > 0 ? (
              <div className="result-section">
                <strong>Current Medications:</strong>
                <ul>
                  {scannedData.data.current_medications.map((med, idx) => (
                    <li key={idx}>{med}</li>
                  ))}
                </ul>
              </div>
            ) : scannedData.data.current_medications !== undefined ? (
              <div className="result-section">
                <strong>Current Medications:</strong>
                <p className="no-data">No current medications recorded</p>
              </div>
            ) : null}
            {scannedData.emergency && (
              <p className="emergency-badge">🚨 Emergency Access Used</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default QRScanner;
