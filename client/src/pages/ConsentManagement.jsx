import { useState, useEffect, useCallback } from 'react';
import { consentService } from '../services/api';
import { useToast } from '../context/useToast';
import { Check, X, ShieldAlert, FileText } from 'lucide-react';

const ConsentManagement = () => {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const getProviderName = (provider) => {
    if (!provider) return 'Unknown Provider';
    if (typeof provider === 'string') return provider;
    return provider.name || provider.email || 'Unknown Provider';
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString();
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingData, historyData] = await Promise.all([
        consentService.getPendingRequests(),
        consentService.getConsentHistory()
      ]);
      setPending(pendingData.pendingRequests || []);
      setHistory(historyData.consentHistory || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load consent data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRespond = async (consentId, action) => {
    try {
      await consentService.respondToRequest(consentId, action);
      const verb = action === 'GRANTED' ? 'granted' : 'denied';
      showSuccess(`Request ${verb} successfully`);
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to respond to request');
    }
  };

  const handleRevoke = async (consentId) => {
    try {
      await consentService.revokeConsent(consentId);
      showSuccess('Consent revoked successfully');
      loadData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to revoke consent');
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '300px' }}><div className="loader"></div></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Consent Management</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Review provider requests and manage active data sharing.</p>

      {/* Pending Requests */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldAlert className="text-warning" size={24} color="var(--warning)" />
        Pending Requests
        {pending.length > 0 && <span className="badge badge-warning" style={{ marginLeft: '8px' }}>{pending.length}</span>}
      </h2>
      
      {pending.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
          No pending requests at this time.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          {pending.map(req => (
            <div key={req._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{getProviderName(req.providerId)}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>Requested scopes:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {req.dataScope?.map(scope => (
                    <span key={scope} className="badge badge-info">{scope.replace('_', ' ')}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={() => handleRespond(req._id, 'REVOKED')} style={{ color: 'var(--error)' }}>
                  <X size={18} /> Deny
                </button>
                <button className="btn btn-primary" onClick={() => handleRespond(req._id, 'GRANTED')}>
                  <Check size={18} /> Grant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active & Historical Consents */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText className="text-primary-accent" size={24} color="var(--primary-accent)" />
        Consent History & Active Grants
      </h2>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No consent history found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map(item => (
            <div key={item._id} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${item.status === 'GRANTED' ? 'var(--success)' : item.status === 'REVOKED' ? 'var(--warning)' : 'var(--error)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{getProviderName(item.providerId)}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Updated on: {formatDate(item.updatedAt || item.createdAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {item.dataScope?.map(scope => (
                      <span key={scope} className="badge" style={{ background: 'rgba(255,255,255,0.05)' }}>{scope.replace('_', ' ')}</span>
                    ))}
                  </div>
                </div>
                <div>
                  {item.status === 'GRANTED' ? (
                    <button className="btn btn-danger" onClick={() => handleRevoke(item._id)} style={{ padding: '6px 16px', fontSize: '0.9rem' }}>
                      Revoke Access
                    </button>
                  ) : (
                    <span className={`badge ${item.status === 'REVOKED' ? 'badge-warning' : 'badge-error'}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ConsentManagement;
