import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../context/ToastContext';
import './RoleSelection.css';

function RoleSelection({ user, updateUser }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) {
      showError('Please select a role');
      return;
    }

    if (selectedRole === 'PROVIDER' && !organization.trim()) {
      showError('Organization is required for providers');
      return;
    }

    setLoading(true);
    try {
      const payload = { role: selectedRole };
      if (selectedRole === 'PROVIDER' && organization) {
        payload.organization = organization;
      }
      const response = await authService.assignRole(payload.role, payload.organization);
      console.log('Role assigned:', response.data);

      updateUser(response.data);
      navigate(selectedRole === 'PATIENT' ? '/patient' : '/provider');
    } catch (err) {
      console.error('Role assignment error:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.map(e => e.msg).join(', ')
        : err.response?.data?.message || 'Failed to assign role';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-container">
      <div className="role-box">
        <h1>Select Your Role</h1>
        <p className="role-subtitle">Choose how you'll use Health Passport</p>

        <div className="role-cards">
          <div
            className={`role-card ${selectedRole === 'PATIENT' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('PATIENT')}
          >
            <div className="role-icon">👤</div>
            <h3>Patient</h3>
            <p>Manage your medical records and control data sharing</p>
            <ul className="role-features">
              <li>Store medical history</li>
              <li>Create emergency summary</li>
              <li>Grant access to providers</li>
              <li>Track data access</li>
            </ul>
          </div>

          <div
            className={`role-card ${selectedRole === 'PROVIDER' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('PROVIDER')}
          >
            <div className="role-icon">🏥</div>
            <h3>Healthcare Provider</h3>
            <p>Request and access patient medical records</p>
            <ul className="role-features">
              <li>Request patient data</li>
              <li>Scan patient QR codes</li>
              <li>Emergency access</li>
              <li>View access history</li>
            </ul>
          </div>
        </div>

        {selectedRole === 'PROVIDER' && (
          <div className="form-group">
            <label htmlFor="organization">Organization / Hospital Name</label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Enter your organization name"
              className="form-input"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedRole || loading}
          className="role-submit-btn"
        >
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  );
}

export default RoleSelection;