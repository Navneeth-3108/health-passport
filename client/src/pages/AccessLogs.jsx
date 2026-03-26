import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/api';
import { useToast } from '../context/useToast';
import { AlertTriangle, Shield, Clock } from 'lucide-react';

const AccessLogs = () => {
  const [standardLogs, setStandardLogs] = useState([]);
  const [emergencyLogs, setEmergencyLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const getActorDisplay = (actor) => {
    if (!actor) return 'Authorized Provider';
    if (typeof actor === 'string') return actor;
    if (typeof actor === 'object') return actor.name || actor.email || 'Authorized Provider';
    return 'Authorized Provider';
  };

  const formatDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Unknown time';
    return date.toLocaleString();
  };

  const formatDataKey = (key) => key.replace(/_/g, ' ');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [stdData, emergData] = await Promise.all([
        auditService.getPatientAccessLogs(),
        auditService.getEmergencyLogs()
      ]);
      setStandardLogs(stdData.accessLogs || []);
      setEmergencyLogs(emergData.emergencyLogs || []);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to load access logs');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <div className="flex-center" style={{ height: '300px' }}><div className="loader"></div></div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Audit & Access Logs</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Track who accessed your records and when.</p>

      {/* Emergency Logs - Highlighted */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle className="text-error" size={24} color="var(--error)" />
        Emergency Access Events
      </h2>
      
      {emergencyLogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '40px' }}>
          No emergency access records found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          {emergencyLogs.map(log => (
            <div key={log._id} className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--error)', overflowWrap: 'anywhere' }}>{getActorDisplay(log.accessedBy)}</h3>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600' }}>Reason:</span> {log.reason || 'Medical Emergency'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> {formatDate(log.createdAt)}
                  </div>
                </div>
                <div className="badge badge-error">EMERGENCY</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standard Logs */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shield className="text-primary-accent" size={24} color="var(--primary-accent)" />
        Standard Access History
      </h2>
      
      {standardLogs.length === 0 ? (
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No standard access records found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {standardLogs.map(log => (
            <div key={log._id} className="glass-panel" style={{ padding: '16px 20px', borderLeft: '4px solid var(--info)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', overflowWrap: 'anywhere' }}>{getActorDisplay(log.accessedBy)}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> {formatDate(log.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 0, flex: '1 1 260px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Data Accessed</div>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {log.dataAccessed?.length ? log.dataAccessed.map(d => (
                      <span key={d} className="badge badge-info" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{formatDataKey(d)}</span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No fields logged</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AccessLogs;
