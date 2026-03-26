import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { authService } from './services/api';
import { useToast } from './context/useToast';
import Navigation from './components/Navigation';

// Page imports (We'll stub them or implement them shortly)
import LoginPage from './pages/LoginPage';
import RoleSelection from './pages/RoleSelection';
import ProfilePage from './pages/ProfilePage';

// Patient Pages
import PatientDashboard from './pages/PatientDashboard';
import PatientHome from './pages/PatientHome';
import PatientProfile from './pages/PatientProfile';
import ConsentManagement from './pages/ConsentManagement';
import AccessLogs from './pages/AccessLogs';

// Provider Pages
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderHome from './pages/ProviderHome';
import QRScanner from './pages/QRScanner';
import AccessRequests from './pages/AccessRequests';
import ConsentedPatients from './pages/ConsentedPatients';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const authSuccessHandledRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const checkAuth = useCallback(async (isSuccessCallback = false) => {
    setLoading(true);

    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const data = await authService.getProfile();
          setUser(data?.user ?? data ?? null);

          if (isSuccessCallback) {
            showSuccess('Successfully authenticated');
          }

          setAuthChecked(true);
          return true;
        } catch {
          if (!(isSuccessCallback && attempt === 0)) {
            break;
          }

          // In cross-domain OAuth redirects, session cookie propagation can lag briefly.
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      setUser(null);
      setAuthChecked(true);
      return false;
    } finally {
      setLoading(false);
    }
  }, [showSuccess]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get('auth');
    
    if (authStatus === 'success' && !authSuccessHandledRef.current) {
      authSuccessHandledRef.current = true;
      checkAuth(true).finally(() => {
        navigate(location.pathname, { replace: true });
      });
    } else if (!authChecked) {
      checkAuth();
    }
  }, [location, authChecked, navigate, checkAuth]);

  if (loading) {
    return (
      <div className="page-wrapper flex-center">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation user={user} setUser={setUser} />
      
      <main className={`page-wrapper animate-fade-in ${!user ? 'page-wrapper-public' : ''}`}>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Role Selection Route */}
          <Route path="/role-selection" element={
            user ? (
              <RoleSelection user={user} setUser={setUser} />
            ) : <Navigate to="/login" replace />
          } />

          {/* Protected Routes Wrapper */}
          {user ? (
            <>
              {/* Profile Route */}
              <Route path="/profile" element={<ProfilePage user={user} setUser={setUser} />} />

              {/* Patient Routes */}
              <Route path="/patient" element={
                user.role === 'PATIENT' ? <PatientDashboard /> : <Navigate to="/" replace />
              }>
                <Route index element={<PatientHome />} />
                <Route path="profile" element={<PatientProfile />} />
                <Route path="consent" element={<ConsentManagement />} />
                <Route path="logs" element={<AccessLogs />} />
              </Route>

              {/* Provider Routes */}
              <Route path="/provider" element={
                user.role === 'PROVIDER' ? <ProviderDashboard /> : <Navigate to="/" replace />
              }>
                <Route index element={<ProviderHome />} />
                <Route path="scan" element={<QRScanner />} />
                <Route path="requests" element={<AccessRequests />} />
                <Route path="patients" element={<ConsentedPatients />} />
              </Route>

              {/* Root Redirect Logic */}
              <Route path="/" element={
                !user.role ? <Navigate to="/role-selection" replace /> :
                user.role === 'PATIENT' ? <Navigate to="/patient" replace /> :
                user.role === 'PROVIDER' ? <Navigate to="/provider" replace /> :
                <Navigate to="/login" replace />
              } />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
