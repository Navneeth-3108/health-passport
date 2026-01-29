import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './ProfilePage.css';

function ProfilePage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;

    setLoading(true);
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to logout');
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="profile-avatar-img" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <p className="profile-role">
              <span className={`role-badge role-${user.role}`}>{user.role}</span>
              {user.organization && <span className="org-badge">{user.organization}</span>}
            </p>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="profile-content">
          <div className="card">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{user.name}</p>
              </div>
              <div className="info-item">
                <label>Email Address</label>
                <p>{user.email}</p>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <p className="monospace">{user._id || user.id}</p>
              </div>
              <div className="info-item">
                <label>Account Type</label>
                <p>{user.role === 'PATIENT' ? 'Patient' : 'Healthcare Provider'}</p>
              </div>
              {user.organization && (
                <div className="info-item">
                  <label>Organization</label>
                  <p>{user.organization}</p>
                </div>
              )}
              <div className="info-item">
                <label>Member Since</label>
                <p>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Just now'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Account Settings</h2>
            <div className="settings-group">
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Privacy</h3>
                  <p>Manage your privacy preferences and data sharing settings</p>
                </div>
                <a href={user.role === 'PATIENT' ? '/patient/profile' : '#'} className="button button-secondary">
                  Manage
                </a>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add extra security to your account</p>
                </div>
                <button className="button button-secondary" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          <div className="card danger-zone">
            <h2>Danger Zone</h2>
            <p>Be careful with these actions as they cannot be undone.</p>
            <button
              className="button button-danger"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'Logging Out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;