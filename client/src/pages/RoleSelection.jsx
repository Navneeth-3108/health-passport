import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../context/useToast';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

const RoleSelection = ({ setUser }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    if (selectedRole === 'PROVIDER' && !organization.trim()) {
      showError('Organization name is required for providers');
      return;
    }

    try {
      setLoading(true);
      const data = await authService.assignRole(selectedRole, selectedRole === 'PROVIDER' ? organization.trim() : undefined);
      setUser(data?.user ?? data ?? null);
      showSuccess(`Welcome! Role set to ${selectedRole}`);
      navigate('/');
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const validationMessage = err.response?.data?.errors?.[0]?.msg;
      showError(validationMessage || backendMessage || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <div className="animate-fade-in" style={{ maxWidth: '800px', width: '100%', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Choose Your Path</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select how you will be using Health Passport</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Patient Card */}
          <div 
            className={`glass-card ${selectedRole === 'PATIENT' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('PATIENT')}
            style={{ 
              cursor: 'pointer', 
              borderColor: selectedRole === 'PATIENT' ? 'var(--primary-accent)' : '',
              boxShadow: selectedRole === 'PATIENT' ? '0 0 20px rgba(124, 58, 237, 0.2)' : ''
            }}
          >
            <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '24px' }}>
              <User size={32} color="var(--secondary-accent)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Patient</h3>
            <p style={{ color: 'var(--text-muted)' }}>Generate your QR code, manage medical data, and control provider access.</p>
          </div>

          {/* Provider Card */}
          <div 
            className={`glass-card ${selectedRole === 'PROVIDER' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('PROVIDER')}
            style={{ 
              cursor: 'pointer', 
              borderColor: selectedRole === 'PROVIDER' ? 'var(--primary-accent)' : '',
              boxShadow: selectedRole === 'PROVIDER' ? '0 0 20px rgba(124, 58, 237, 0.2)' : ''
            }}
          >
            <div className="flex-center" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', marginBottom: '24px' }}>
              <Stethoscope size={32} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Provider</h3>
            <p style={{ color: 'var(--text-muted)' }}>Scan patient QR codes and request access to medical records.</p>
            
            {/* Organization Input - Show only if Provider selected */}
            <div style={{ 
              marginTop: '24px', 
              maxHeight: selectedRole === 'PROVIDER' ? '100px' : '0', 
              opacity: selectedRole === 'PROVIDER' ? '1' : '0', 
              overflow: 'hidden', 
              transition: 'all 0.3s ease' 
            }}>
              <label className="form-label" onClick={(e) => e.stopPropagation()}>Organization Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Metro General Hospital"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>

        <div className="flex-center">
          <button 
            className="btn btn-primary" 
            onClick={handleRoleSelect} 
            disabled={!selectedRole || loading}
            style={{ padding: '16px 48px', fontSize: '1.1rem', opacity: (!selectedRole || loading) ? 0.5 : 1 }}
          >
            {loading ? <span className="loader" style={{ width: '24px', height: '24px', borderWidth: '2px' }}></span> : 'Continue'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
