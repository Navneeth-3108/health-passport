import { Shield, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const handleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${apiUrl}/auth/login`;
  };

  return (
    <div className="login-page flex-center">
      <div className="glass-panel animate-fade-in login-card">
        <div className="flex-center login-logo-wrap">
          <div className="glow-effect flex-center login-logo-tile">
            <Shield size={40} className="text-primary-accent" color="var(--primary-accent)" />
          </div>
        </div>
        
        <h1 className="gradient-text login-title">Health Passport</h1>
        <p className="login-subtitle">
          Secure, portable medical identity and seamless provider access.
        </p>

        <button 
          onClick={handleLogin}
          className="btn btn-primary login-button"
        >
          <Sparkles size={20} />
          Continue with Google
        </button>
        
        <div className="login-legal">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
