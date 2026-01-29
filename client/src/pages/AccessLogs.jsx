import { useState, useEffect } from 'react';
import { auditService } from '../services/api';
import './AccessLogs.css';

function AccessLogs() {
  const [accessLogs, setAccessLogs] = useState([]);
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('access');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching access logs...');
      const [accessRes, emergencyRes] = await Promise.all([
        auditService.getPatientAccessLogs(),
        auditService.getEmergencyLogs()
      ]);
      console.log('Access logs response:', accessRes.data);
      console.log('Emergency logs response:', emergencyRes.data);
      setAccessLogs(accessRes.data.accessLogs || []);
      setEmergencyLogs(emergencyRes.data.emergencyLogs || []);
    } catch (err) {
      console.error('Fetch access logs error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to fetch access logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading access logs...</div>;
  }

  return (
    <div className="access-logs">
      <h1>Access Logs</h1>
      <p className="subtitle">View all instances where your medical data has been accessed</p>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'access' ? 'active' : ''}`}
          onClick={() => setActiveTab('access')}
        >
          All Access ({accessLogs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          Emergency Access ({emergencyLogs.length})
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeTab === 'access' && (
        <div className="tab-content">
          {accessLogs.length === 0 ? (
            <div className="card empty-state">
              <p>No access logs</p>
            </div>
          ) : (
            <div className="logs-container">
              {accessLogs.map((log) => (
                <div key={log._id} className="card log-card">
                  <div className="log-header">
                    <div className="log-provider">
                      <h3>{typeof log.accessedBy === 'object' ? log.accessedBy?.name : 'Unknown Provider'}</h3>
                      <p>{typeof log.accessedBy === 'object' ? log.accessedBy?.organization : 'N/A'}</p>
                    </div>
                    <span className="badge badge-primary">Regular Access</span>
                  </div>

                  <div className="log-details">
                    <div className="detail-item">
                      <span className="detail-label">Accessed On:</span>
                      <span className="detail-value">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Data Accessed:</span>
                      <div className="data-tags">
                        {log.dataAccessed && log.dataAccessed.map((data) => (
                          <span key={data} className="data-tag">{data}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="tab-content">
          {emergencyLogs.length === 0 ? (
            <div className="card empty-state">
              <p>No emergency access logs</p>
            </div>
          ) : (
            <div className="logs-container">
              {emergencyLogs.map((log) => (
                <div key={log._id} className="card log-card emergency">
                  <div className="log-header">
                    <div className="log-provider">
                      <h3>{typeof log.accessedBy === 'object' ? log.accessedBy?.name : 'Unknown Provider'}</h3>
                      <p>{typeof log.accessedBy === 'object' ? log.accessedBy?.organization : 'N/A'}</p>
                    </div>
                    <span className="badge badge-danger">Emergency Access</span>
                  </div>

                  <div className="log-details">
                    <div className="detail-item">
                      <span className="detail-label">Accessed On:</span>
                      <span className="detail-value">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Data Accessed:</span>
                      <div className="data-tags">
                        {log.dataAccessed && log.dataAccessed.map((data) => (
                          <span key={data} className="data-tag">{data}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="emergency-notice">
                    <strong>⚠️ Emergency Access</strong> - This data was accessed during an emergency situation.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccessLogs;