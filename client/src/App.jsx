import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import LoginPage from './pages/LoginPage';
import RoleSelection from './pages/RoleSelection';
import PatientDashboard from './pages/PatientDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (location.search.includes('auth=success')) {
      setAuthChecked(false);
      setTimeout(() => checkAuth(), 500);
    }
  }, [location.search]);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        withCredentials: true,
      });
      setUser(response.data);
      setAuthChecked(true);
    } catch (error) {
      setUser(null);
      setAuthChecked(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  if (loading || !authChecked) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      {user && <Navigation user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/role-selection"
          element={user ? (user.role ? <Navigate to={user.role === 'PATIENT' ? '/patient' : '/provider'} /> : <RoleSelection user={user} updateUser={updateUser} />) : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/patient/*"
          element={user ? <PatientDashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/provider/*"
          element={user ? <ProviderDashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to={user ? (user.role ? (user.role === 'PATIENT' ? '/patient' : '/provider') : '/role-selection') : '/login'} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;