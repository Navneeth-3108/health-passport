import { useState, useEffect } from 'react';
import { accessService, authService } from '../services/api';
import { useToast } from '../context/useToast';
import { FileText, Send } from 'lucide-react';

const AccessRequests = () => {
  const [patientId, setPatientId] = useState('');
  const [dataScope, setDataScope] = useState([]);
  const [loading, setLoading] = useState(false);
  const [providerId, setProviderId] = useState(null);
  const { showSuccess, showError } = useToast();

  const scopes = [
    { id: 'medical_history', label: 'Full Medical History' },
    { id: 'prescriptions', label: 'Past Prescriptions' },
    { id: 'allergies', label: 'Allergies' },
    { id: 'current_medications', label: 'Current Medications' }
  ];

  useEffect(() => {
    authService.getProfile()
      .then((res) => setProviderId(res?.id || res?._id || res?.user?.id || res?.user?._id || null))
      .catch(console.error);
  }, []);

  const toggleScope = (id) => {
    setDataScope(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) {
      showError('Patient identifying information is required');
      return;
    }
    if (dataScope.length === 0) {
      showError('Please select at least one data scope');
      return;
    }

    try {
      setLoading(true);
      await accessService.createAccessRequest(patientId, providerId, dataScope);
      showSuccess('Access request sent successfully');
      setPatientId('');
      setDataScope([]);
    } catch (err) {
      showError(err.response?.data?.message || err.response?.data?.error || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Request Access</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Send a consent request to a patient for ongoing access to their medical records.</p>
      
      <form className="glass-panel" onSubmit={handleSubmit} style={{ padding: '32px' }}>
        <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '24px' }}>
          <FileText size={32} color="var(--secondary-accent)" />
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">Patient Identifier</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Email, QR Code ID, or Mongo ID..." 
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
            required
          />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Enter any known identifier to route this request to the patient's dashboard.
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '32px' }}>
          <label className="form-label" style={{ marginBottom: '16px' }}>Requested Data Scope</label>
          <div className="responsive-two-col-tight">
            {scopes.map(scope => (
              <label 
                key={scope.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px', 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '12px', 
                  border: dataScope.includes(scope.id) ? '1px solid var(--primary-accent)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={dataScope.includes(scope.id)} 
                  onChange={() => toggleScope(scope.id)} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-accent)', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500' }}>{scope.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
          {loading ? <span className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span> : <><Send size={18} /> Send Request</>}
        </button>
      </form>

    </div>
  );
};

export default AccessRequests;
