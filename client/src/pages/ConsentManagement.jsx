import { useState, useEffect } from 'react';
import { consentService } from '../services/api';
import { useToast } from '../context/ToastContext';
import './ConsentManagement.css';

function ConsentManagement() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [consentHistory, setConsentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching consent data...');
      const [pendingRes, historyRes] = await Promise.all([
        consentService.getPendingRequests(),
        consentService.getConsentHistory()
      ]);
      console.log('Pending requests response:', pendingRes.data);
      console.log('Consent history response:', historyRes.data);
      setPendingRequests(pendingRes.data.pendingRequests || []);
      setConsentHistory(historyRes.data.consentHistory || []);
    } catch (err) {
      console.error('Fetch consent data error:', err);
      console.error('Error response:', err.response?.data);
      showError(err.response?.data?.message || err.message || 'Failed to fetch consent data');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (consentId, action) => {
    try {
      await consentService.respondToRequest(consentId, action);
      showSuccess(`Consent ${action.toLowerCase()}!`);
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to respond to request');
    }
  };

  const handleRevokeConsent = async (consentId) => {
    try {
      await consentService.revokeConsent(consentId);
      showSuccess('Consent revoked successfully!');
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to revoke consent');
    }
  };

  if (loading) {
    return <div className="loading">Loading consent information...</div>;
  }

  return (
    <div className="consent-management">
      <h1>Consent Management</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests ({pendingRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Consent History
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="tab-content">
          {pendingRequests.length === 0 ? (
            <div className="card empty-state">
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="requests-list">
              {pendingRequests.map((request) => (
                <div key={request._id} className="card request-card">
                  <div className="request-header">
                    <h3>{typeof request.providerId === 'object' ? request.providerId?.name : 'Unknown Provider'}</h3>
                    <span className="badge badge-warning">PENDING</span>
                  </div>

                  <div className="request-details">
                    <p><strong>Organization:</strong> {typeof request.providerId === 'object' ? request.providerId?.organization : 'N/A'}</p>
                    <p><strong>Requested Data:</strong></p>
                    <div className="data-scope">
                      {request.dataScope && request.dataScope.map((item) => (
                        <span key={item} className="scope-tag">{item}</span>
                      ))}
                    </div>
                  </div>

                  {request.expiry && (
                    <p className="expiry">Expires: {new Date(request.expiry).toLocaleDateString()}</p>
                  )}

                  <div className="request-actions">
                    <button
                      className="button button-success"
                      onClick={() => handleRespondToRequest(request._id, 'GRANTED')}
                    >
                      Grant Access
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => handleRespondToRequest(request._id, 'REVOKED')}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          {consentHistory.length === 0 ? (
            <div className="card empty-state">
              <p>No consent history</p>
            </div>
          ) : (
            <div className="history-table">
              <table className="table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Data Scope</th>
                    <th>Granted Date</th>
                    <th>Expires</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {consentHistory.map((consent) => (
                    <tr key={consent._id}>
                      <td>
                        <strong>{typeof consent.providerId === 'object' ? consent.providerId?.name : 'Unknown'}</strong>
                        <br />
                        <small>{typeof consent.providerId === 'object' ? consent.providerId?.organization : 'N/A'}</small>
                      </td>
                      <td>
                        <span className={`badge badge-${consent.status === 'GRANTED' ? 'success' : 'danger'}`}>
                          {consent.status}
                        </span>
                      </td>
                      <td>
                        {consent.dataScope && consent.dataScope.join(', ')}
                      </td>
                      <td>{new Date(consent.createdAt).toLocaleDateString()}</td>
                      <td>
                        {consent.expiry ? new Date(consent.expiry).toLocaleDateString() : 'No expiry'}
                      </td>
                      <td>
                        {consent.status === 'GRANTED' && (
                          <button
                            className="button button-danger"
                            style={{ padding: '5px 10px', fontSize: '0.85rem' }}
                            onClick={() => handleRevokeConsent(consent._id)}
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ConsentManagement;