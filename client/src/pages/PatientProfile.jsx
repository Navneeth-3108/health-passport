import { useState } from 'react';
import { patientService } from '../services/api';
import './PatientProfile.css';

function PatientProfile() {
  const [emergency, setEmergency] = useState({
    blood_group: '',
    allergies: [],
    current_medications: []
  });
  const [preferences, setPreferences] = useState({
    medical_history: false,
    prescriptions: false,
    allergies: false,
    current_medications: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('emergency');

  const handleEmergencyChange = (field, value) => {
    setEmergency(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (field) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddItem = (field) => {
    const value = document.getElementById(`${field}-input`).value.trim();
    if (value) {
      setEmergency(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      document.getElementById(`${field}-input`).value = '';
    }
  };

  const handleRemoveItem = (field, index) => {
    setEmergency(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSaveEmergency = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patientService.updateEmergency(emergency);
      setSuccess('Emergency information saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save emergency information');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await patientService.updateConsent(preferences);
      setSuccess('Data sharing preferences saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-profile">
      <h1>My Medical Information</h1>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          Emergency Summary
        </button>
        <button
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Data Sharing Preferences
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {activeTab === 'emergency' && (
        <div className="tab-content">
          <div className="card">
            <h2>Emergency Health Summary</h2>
            <p className="help-text">
              This information will be visible to healthcare providers during emergency situations.
            </p>

            <div className="form-group">
              <label htmlFor="blood-group">Blood Group</label>
              <select
                id="blood-group"
                value={emergency.blood_group}
                onChange={(e) => handleEmergencyChange('blood_group', e.target.value)}
                className="form-input"
              >
                <option value="">Select Blood Group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label>Allergies</label>
              <div className="list-input">
                <input
                  id="allergies-input"
                  type="text"
                  placeholder="Enter allergy and press Add"
                  className="form-input"
                />
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handleAddItem('allergies')}
                >
                  Add
                </button>
              </div>
              <div className="items-list">
                {emergency.allergies.map((item, index) => (
                  <span key={index} className="item-tag">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('allergies', index)}
                      className="remove-item"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Current Medications</label>
              <div className="list-input">
                <input
                  id="current_medications-input"
                  type="text"
                  placeholder="Enter medication and press Add"
                  className="form-input"
                />
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handleAddItem('current_medications')}
                >
                  Add
                </button>
              </div>
              <div className="items-list">
                {emergency.current_medications.map((item, index) => (
                  <span key={index} className="item-tag">
                    {item}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem('current_medications', index)}
                      className="remove-item"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              className="button button-primary"
              onClick={handleSaveEmergency}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Emergency Information'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="tab-content">
          <div className="card">
            <h2>Data Sharing Preferences</h2>
            <p className="help-text">
              Choose which types of medical data you're willing to share with healthcare providers by default.
            </p>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Medical History</h3>
                <p>Allow access to your past medical conditions, treatments, and hospitalizations</p>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={preferences.medical_history}
                  onChange={() => handlePreferencesChange('medical_history')}
                />
                <span className="checkmark"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Prescriptions</h3>
                <p>Allow access to your current and past prescriptions</p>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={preferences.prescriptions}
                  onChange={() => handlePreferencesChange('prescriptions')}
                />
                <span className="checkmark"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Allergies</h3>
                <p>Allow access to your allergy information</p>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={preferences.allergies}
                  onChange={() => handlePreferencesChange('allergies')}
                />
                <span className="checkmark"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Current Medications</h3>
                <p>Allow access to your current medications and their details</p>
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={preferences.current_medications}
                  onChange={() => handlePreferencesChange('current_medications')}
                />
                <span className="checkmark"></span>
              </label>
            </div>

            <button
              className="button button-primary"
              onClick={handleSavePreferences}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientProfile;