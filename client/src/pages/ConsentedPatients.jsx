import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/api';
import { useToast } from '../context/useToast';
import { Users, User as UserIcon, Calendar, CheckSquare } from 'lucide-react';

const ConsentedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const { showError } = useToast();

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString();
  };

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await auditService.getConsentedPatients();
      setPatients(data.consentedPatients || data || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load consented patients');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  if (loading) return <div className="flex-center" style={{ height: '300px' }}><div className="loader"></div></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>My Patients</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Patients who have granted you ongoing access to their records.</p>
      
      {patients.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <h3>No Consented Patients</h3>
          <p style={{ marginTop: '8px' }}>You currently have no active patient consents. Use the "Request Access" page to request access.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {patients.map((patient, index) => {
            const patientData = patient.data || {};
            const patientName = patientData.name || patient.patientName || patient.name || 'Patient';
            const cardId = patient.consentId || patient.patientId || patient._id || `${patientName}-${index}`;
            const dataScope = patient.consentScope || patient.dataScope || [];
            const grantedAt = patient.grantedAt || patient.createdAt || patient.updatedAt;
            const isExpanded = expandedId === cardId;
            const visibleDetails = Object.entries(patientData).filter(([key]) => !['name', 'email', 'picture'].includes(key));
            
            return (
              <div key={cardId} className="glass-panel" style={{ overflow: 'hidden', borderLeft: '4px solid var(--success)' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                  onClick={() => setExpandedId(isExpanded ? null : cardId)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="flex-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)' }}>
                      <UserIcon size={24} color="var(--success)" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{patientName}</h3>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         ID: {patient.patientId || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="badge badge-success">ACTIVE</div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                    <div className="responsive-two-col" style={{ paddingTop: '20px', gap: '24px' }}>
                      
                      <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.95rem' }}>
                          <CheckSquare size={16} /> Authorized Data Scope
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {dataScope.length ? dataScope.map(scope => (
                            <span key={scope} className="badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                              {scope.replace('_', ' ')}
                            </span>
                          )) : <span style={{ color: 'var(--text-muted)' }}>No scopes specified</span>}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '12px', fontSize: '0.95rem' }}>
                          <Calendar size={16} /> Consent Details
                        </h4>
                        <div style={{ fontSize: '0.95rem' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Granted on:</span> {formatDate(grantedAt)}
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Consent Status:</span> <span style={{ color: 'var(--success)', fontWeight: '500' }}>Granted</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '0.95rem' }}>Patient Details</h4>
                      {visibleDetails.length ? (
                        <div className="responsive-two-col-tight">
                          {visibleDetails.map(([key, value]) => {
                            const isArray = Array.isArray(value);
                            const displayValue = isArray ? (value.length ? value.join(', ') : 'None') : (value || 'Not provided');
                            return (
                              <div key={key} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px' }}>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'capitalize' }}>
                                  {key.replace(/_/g, ' ')}
                                </div>
                                <div style={{ fontSize: '0.92rem' }}>{String(displayValue)}</div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          No patient details are available for the selected consent scope yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConsentedPatients;
