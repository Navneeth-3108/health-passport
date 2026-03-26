import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useToast } from '../context/useToast';
import { Shield, Home, User, FileText, Activity, Scan, Users, LogOut } from 'lucide-react';

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      sessionStorage.removeItem('hp_force_role_selection');
      setUser(null);
      showSuccess('Logged out successfully');
      navigate('/login');
    } catch {
      showError('Failed to logout');
      sessionStorage.removeItem('hp_force_role_selection');
      setUser(null);
      navigate('/login');
    }
  };

  const renderPatientLinks = () => (
    <>
      <NavLink to="/patient" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><Home size={18}/> Dashboard</span>
      </NavLink>
      <NavLink to="/patient/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><Activity size={18}/> Medical Info</span>
      </NavLink>
      <NavLink to="/patient/consent" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><FileText size={18}/> Consent</span>
      </NavLink>
      <NavLink to="/patient/logs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><Shield size={18}/> Access Logs</span>
      </NavLink>
    </>
  );

  const renderProviderLinks = () => (
    <>
      <NavLink to="/provider" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><Home size={18}/> Dashboard</span>
      </NavLink>
      <NavLink to="/provider/scan" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><Scan size={18}/> Scan QR</span>
      </NavLink>
      <NavLink to="/provider/requests" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><FileText size={18}/> Requests</span>
      </NavLink>
      <NavLink to="/provider/patients" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
        <span className="flex-center" style={{gap: '6px'}}><Users size={18}/> Patients</span>
      </NavLink>
    </>
  );

  if (!user) return null;

  return (
    <header className="nav-header">
      <div className="container nav-container">
        <div className="nav-brand gradient-text">
          <Shield className="text-primary-accent" size={28} />
          Health Passport
        </div>

        <nav className="nav-links">
          {user.role === 'PATIENT' && renderPatientLinks()}
          {user.role === 'PROVIDER' && renderProviderLinks()}
          
          <div style={{width: '2px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px'}}></div>
          
          <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
             <span className="flex-center" style={{gap: '6px'}}><User size={18}/> Profile</span>
          </NavLink>
          
          <button onClick={handleLogout} className="btn btn-secondary flex-center" style={{padding: '6px 12px', gap: '6px', fontSize: '0.9rem'}}>
            <LogOut size={16} /> Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
