import { ScanLine, FileText, Users, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProviderHome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Provider Portal</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Secure access to patient medical records and emergency information.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        
        {/* Scan Action */}
        <div className="glass-card" onClick={() => navigate('/provider/scan')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(124, 58, 237, 0.1)', marginBottom: '24px' }}>
            <ScanLine size={32} color="var(--primary-accent)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Scan Patient QR</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Scan a patient's Health Passport QR code to instantly access their authorized records or for emergency access.</p>
        </div>

        {/* Request Action */}
        <div className="glass-card" onClick={() => navigate('/provider/requests')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '24px' }}>
            <FileText size={32} color="var(--secondary-accent)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Request Access</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Request access to specific medical data categories (e.g. Prescriptions, History) from a patient.</p>
        </div>

        {/* Patients Action */}
        <div className="glass-card" onClick={() => navigate('/provider/patients')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '24px' }}>
            <Users size={32} color="var(--success)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>My Patients</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>View the list of patients who have granted your organization ongoing access to their records.</p>
        </div>

      </div>

      <div className="glass-panel" style={{ marginTop: '40px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <ShieldAlert size={28} color="var(--error)" style={{ flexShrink: 0 }} />
        <div>
          <h3 style={{ color: 'var(--error)', marginBottom: '8px', fontSize: '1.1rem' }}>Emergency Data Access</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            In a medical emergency, you can use the QR Scanner in "Emergency Mode" to bypass standard consent workflows and access the patient's critical life-saving information immediately. All emergency access is strictly audited and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderHome;
