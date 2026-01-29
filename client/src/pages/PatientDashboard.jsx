import { Routes, Route, Link } from 'react-router-dom';
import PatientHome from './PatientHome';
import PatientProfile from './PatientProfile';
import ConsentManagement from './ConsentManagement';
import AccessLogs from './AccessLogs';
import './PatientDashboard.css';

function PatientDashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<PatientHome user={user} />} />
          <Route path="/profile" element={<PatientProfile user={user} />} />
          <Route path="/consent" element={<ConsentManagement user={user} />} />
          <Route path="/logs" element={<AccessLogs user={user} />} />
        </Routes>
      </div>
    </div>
  );
}

export default PatientDashboard;