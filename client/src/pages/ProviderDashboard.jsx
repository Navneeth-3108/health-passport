import { Routes, Route, Link } from 'react-router-dom';
import ProviderHome from './ProviderHome';
import QRScanner from './QRScanner';
import AccessRequests from './AccessRequests';
import ConsentedPatients from './ConsentedPatients';
import './ProviderDashboard.css';

function ProviderDashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<ProviderHome user={user} />} />
          <Route path="/scan" element={<QRScanner user={user} />} />
          <Route path="/requests" element={<AccessRequests user={user} />} />
          <Route path="/patients" element={<ConsentedPatients />} />
        </Routes>
      </div>
    </div>
  );
}

export default ProviderDashboard;