import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Navigation.css';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      showSuccess('Logout successful!');
      onLogout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      showError('Logout failed. Please try again.');
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          🏥 Health Passport
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-left">
            {user.role === 'PATIENT' && (
              <>
                <Link to="/patient" className="nav-link">Dashboard</Link>
                <Link to="/patient/profile" className="nav-link">Medical Info</Link>
                <Link to="/patient/consent" className="nav-link">Consent</Link>
                <Link to="/patient/logs" className="nav-link">Access Logs</Link>
              </>
            )}

            {user.role === 'PROVIDER' && (
              <>
                <Link to="/provider" className="nav-link">Dashboard</Link>
                <Link to="/provider/scan" className="nav-link">Scan QR</Link>
                <Link to="/provider/requests" className="nav-link">Requests</Link>
                <Link to="/provider/patients" className="nav-link">Access Details</Link>
              </>
            )}
          </div>

          <div className="nav-right">
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="user-avatar-img" />
                ) : (
                  <span className="user-avatar">{user.name.charAt(0)}</span>
                )}
                <span className="user-name">{user.name}</span>
                <span className="dropdown-icon">▼</span>
              </button>

              {showDropdown && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <hr className="dropdown-divider" />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;