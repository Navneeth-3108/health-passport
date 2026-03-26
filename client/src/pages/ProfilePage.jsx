import { useMemo, useState } from 'react';
import { Shield, Mail, Building, User as UserIcon } from 'lucide-react';

const ProfilePage = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  const profileImage = useMemo(() => {
    if (!user?.picture) return null;
    const normalized = user.picture.replace('http://', 'https://');
    return normalized.includes('googleusercontent.com') && !normalized.includes('sz=')
      ? `${normalized}${normalized.includes('?') ? '&' : '?'}sz=256`
      : normalized;
  }, [user]);

  if (!user) return null;

  return (
    <div className="container">
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '32px' }}>Your Profile</h1>
        
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {profileImage && !imageError ? (
              <img
                src={profileImage}
                alt={user.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid var(--primary-accent)', objectFit: 'cover' }}
              />
            ) : (
              <div className="flex-center" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(124, 58, 237, 0.2)' }}>
                <UserIcon size={40} color="var(--primary-accent)" />
              </div>
            )}
            
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user.name}</h2>
              <div className="badge badge-success" style={{ display: 'inline-block' }}>{user.role}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                <Mail size={20} color="var(--text-muted)" />
              </div>
              <div>
                <div className="form-label">Email Address</div>
                <div style={{ fontSize: '1.1rem' }}>{user.email}</div>
              </div>
            </div>

            {user.role === 'PROVIDER' && user.organization && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                  <Building size={20} color="var(--text-muted)" />
                </div>
                <div>
                  <div className="form-label">Organization</div>
                  <div style={{ fontSize: '1.1rem' }}>{user.organization}</div>
                </div>
              </div>
            )}

            {user.role === 'PATIENT' && user.qr_code_id && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
                  <Shield size={20} color="var(--text-muted)" />
                </div>
                <div>
                  <div className="form-label">Passport ID</div>
                  <div style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{user.qr_code_id}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
