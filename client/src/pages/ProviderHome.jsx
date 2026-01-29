import './ProviderHome.css';

function ProviderHome({ user }) {

  return (
    <div className="provider-home">
      <div className="welcome-card">
        <h1>Welcome, {user.name}!</h1>
        <p>Healthcare Provider Portal for secure patient data access</p>
      </div>

      <div className="home-grid">
        <div className="card">
          <h2>How It Works</h2>
          <ul className="process-list">
            <li><strong>Scan QR:</strong> Patient shares their QR code</li>
            <li><strong>Request:</strong> Request specific medical data</li>
            <li><strong>Approval:</strong> Patient approves your request</li>
            <li><strong>Access:</strong> View authorized patient records</li>
            <li><strong>Track:</strong> All access is logged and audited</li>
          </ul>
        </div>
      </div>

      <div className="card info-card">
        <h3>Compliance & Privacy</h3>
        <p>
          As a healthcare provider, you are bound by HIPAA and other healthcare data protection laws.
          All access to patient data is logged, monitored, and can be audited. Patients can revoke your access at any time.
          Unauthorized access to patient information is strictly prohibited and may result in legal consequences.
        </p>
      </div>
    </div>
  );
}

export default ProviderHome;