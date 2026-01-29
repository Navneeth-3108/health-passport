import { useState } from 'react';
import { accessService } from '../services/api';
import './AccessRequests.css';

function AccessRequests({ user }) {
  const [patientId, setPatientId] = useState('');
  const [dataScope, setDataScope] = useState(['medical_history', 'prescriptions', 'allergies', 'current_medications', 'blood_group']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDataScopeChange = (item) => {
    if (dataScope.includes(item)) {
      setDataScope(dataScope.filter(d => d !== item));
    } else {
      setDataScope([...dataScope, item]);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (!patientId.trim()) {
      setError('Please enter a valid patient ID');
      return;
    }

    if (dataScope.length === 0) {
      setError('Please select at least one data type');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      console.log('Sending access request:', { patientId, providerId: user.id, dataScope });
      const response = await accessService.createAccessRequest(patientId, user.id, dataScope);
      console.log('Access request response:', response.data);
      setSuccess('Access request sent to patient successfully!');
      setPatientId('');
      setDataScope(['medical_history', 'prescriptions', 'allergies', 'current_medications', 'blood_group']);


      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Access request error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to send access request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="access-requests">
      <h1>Create Access Request</h1>
      <p className="subtitle">Request access to specific patient medical data</p>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="request-form-container">
        <div className="card">
          <h2>Patient Information</h2>
          <form onSubmit={handleSubmitRequest}>
          <div className="form-group">
              <label htmlFor="patient-id">Patient Information</label>
              <input
                id="patient-id"
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter patient's email, QR code ID, or MongoDB ID"
                className="form-input"
              />
              <small>You can use: Patient Email • Patient QR Code ID • Patient MongoDB ID</small>
            </div>

            <div className="form-group">
              <label>Data Scope</label>
              <p className="help-text">Select which types of data you need access to</p>

              <div className="data-scope-options">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={dataScope.includes('medical_history')}
                    onChange={() => handleDataScopeChange('medical_history')}
                  />
                  <span className="checkbox-label">Medical History</span>
                  <span className="checkbox-desc">Past medical conditions and treatments</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={dataScope.includes('prescriptions')}
                    onChange={() => handleDataScopeChange('prescriptions')}
                  />
                  <span className="checkbox-label">Prescriptions</span>
                  <span className="checkbox-desc">Current and past medications</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={dataScope.includes('allergies')}
                    onChange={() => handleDataScopeChange('allergies')}
                  />
                  <span className="checkbox-label">Allergies</span>
                  <span className="checkbox-desc">Known allergies and sensitivities</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={dataScope.includes('current_medications')}
                    onChange={() => handleDataScopeChange('current_medications')}
                  />
                  <span className="checkbox-label">Current Medications</span>
                  <span className="checkbox-desc">Medications currently being taken</span>
                </label>

                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={dataScope.includes('blood_group')}
                    onChange={() => handleDataScopeChange('blood_group')}
                  />
                  <span className="checkbox-label">Blood Group</span>
                  <span className="checkbox-desc">Patient's blood type for emergencies</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={submitting}
            >
              {submitting ? 'Sending Request...' : 'Send Access Request'}
            </button>
          </form>
        </div>

        <div className="card info-card">
          <h3>How It Works</h3>
          <ol className="process-steps">
            <li>You request specific medical data from a patient</li>
            <li>The patient receives a notification of your request</li>
            <li>The patient reviews and approves or denies your request</li>
            <li>Upon approval, you can access the requested data</li>
            <li>All access is logged and can be audited</li>
          </ol>

          <h3>Privacy & Compliance</h3>
          <p>
            Patients have complete control over their data. You can only access data they explicitly approve.
            Any violation of privacy or unauthorized access may result in legal consequences and loss of privileges.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccessRequests;