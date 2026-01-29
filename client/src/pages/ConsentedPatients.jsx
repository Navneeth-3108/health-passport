import { useState, useEffect } from 'react';
import { auditService } from '../services/api';
import './ConsentedPatients.css';

function ConsentedPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedPatient, setExpandedPatient] = useState(null);

  useEffect(() => {
    fetchConsentedPatients();
  }, []);

  const fetchConsentedPatients = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching consented patients...');
      const response = await auditService.getConsentedPatients();
      console.log('Consented patients response:', response.data);
      setPatients(response.data.consentedPatients || []);
    } catch (err) {
      console.error('Fetch consented patients error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to fetch consented patients');
    } finally {
      setLoading(false);
    }
  };

  const togglePatientExpand = (patientId) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  const renderDataPreview = (data) => {
    const items = [];

    if (data.medical_history) {
      items.push(
        <div key="medical_history" className="data-item">
          <strong>Medical History:</strong>
          <p>{data.medical_history}</p>
        </div>
      );
    }

    if (data.prescriptions !== undefined) {
      items.push(
        <div key="prescriptions" className="data-item">
          <strong>Prescriptions:</strong>
          {data.prescriptions && data.prescriptions.length > 0 ? (
            <ul>
              {data.prescriptions.map((rx, idx) => (
                <li key={idx}>{rx}</li>
              ))}
            </ul>
          ) : (
            <p>No prescriptions recorded</p>
          )}
        </div>
      );
    }

    if (data.blood_group) {
      items.push(
        <div key="blood_group" className="data-item">
          <strong>Blood Group:</strong>
          <p>{data.blood_group}</p>
        </div>
      );
    }

    if (data.allergies !== undefined) {
      items.push(
        <div key="allergies" className="data-item">
          <strong>Allergies:</strong>
          {data.allergies && data.allergies.length > 0 ? (
            <ul>
              {data.allergies.map((allergy, idx) => (
                <li key={idx}>{allergy}</li>
              ))}
            </ul>
          ) : (
            <p>None recorded</p>
          )}
        </div>
      );
    }

    if (data.current_medications !== undefined) {
      items.push(
        <div key="current_medications" className="data-item">
          <strong>Current Medications:</strong>
          {data.current_medications && data.current_medications.length > 0 ? (
            <ul>
              {data.current_medications.map((med, idx) => (
                <li key={idx}>{med}</li>
              ))}
            </ul>
          ) : (
            <p>No current medications recorded</p>
          )}
        </div>
      );
    }

    return items.length > 0 ? items : <p className="no-data">No additional data in scope</p>;
  };

  if (loading) {
    return <div className="loading">Loading consented patients...</div>;
  }

  return (
    <div className="consented-patients">
      <h1>My Consented Patients</h1>
      <p className="subtitle">View patient data you have been granted access to</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {patients.length === 0 ? (
        <div className="card empty-state">
          <p>No patients have consented to share data with you yet</p>
        </div>
      ) : (
        <div className="patients-container">
          {patients.map((patient) => (
            <div key={patient.patientId} className="card patient-card">
              <div className="patient-header">
                <div className="patient-info">
                  {patient.data.picture && (
                    <img src={patient.data.picture} alt={patient.data.name} className="patient-avatar" />
                  )}
                  <div>
                    <h3>{patient.data.name}</h3>
                    <p className="patient-email">{patient.data.email}</p>
                  </div>
                </div>
                <div className="patient-meta">
                  <span className="badge badge-success">Consented</span>
                  <button
                    className="expand-btn"
                    onClick={() => togglePatientExpand(patient.patientId)}
                  >
                    {expandedPatient === patient.patientId ? '▼' : '▶'}
                  </button>
                </div>
              </div>

              {expandedPatient === patient.patientId && (
                <div className="patient-details">
                  <div className="consent-scope">
                    <h4>Consent Scope:</h4>
                    <div className="scope-badges">
                      {patient.consentScope.map((scope) => (
                        <span key={scope} className="badge badge-info">{scope}</span>
                      ))}
                    </div>
                  </div>

                  <div className="patient-data">
                    <h4>Authorized Data:</h4>
                    {renderDataPreview(patient.data)}
                  </div>

                  <div className="consent-date">
                    <small>Consented on: {new Date(patient.grantedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</small>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConsentedPatients;