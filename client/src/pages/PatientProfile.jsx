import { useState, useEffect } from 'react';
import { patientService, authService } from '../services/api';
import { useToast } from '../context/useToast';
import { Activity, ShieldCheck, Save, Plus, X } from 'lucide-react';

const PatientProfile = () => {
  const [emergencyData, setEmergencyData] = useState({
    blood_group: '',
    allergies: [],
    current_medications: []
  });
  const [consentData, setConsentData] = useState({
    medical_history: false,
    prescriptions: false,
    allergies: true,
    current_medications: true
  });
  
  const [newAllergy, setNewAllergy] = useState('');
  const [newMed, setNewMed] = useState('');
  const [savingSection, setSavingSection] = useState(null);
  
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    authService
      .getProfile()
      .then((u) => {
        if (u?.emergency) setEmergencyData(u.emergency);
        if (u?.consent) setConsentData(u.consent);
      })
      .catch(() => {
        showError('Failed to load profile data');
      });
  }, [showError]);

  const saveEmergency = async () => {
    setSavingSection('emergency');
    try {
      await patientService.updateEmergency(emergencyData);
      showSuccess('Emergency summary updated');
    } catch {
      showError('Failed to update emergency info');
    } finally {
      setSavingSection(null);
    }
  };

  const saveConsent = async () => {
    setSavingSection('consent');
    try {
      await patientService.updateConsent(consentData);
      showSuccess('Consent preferences updated');
    } catch {
      showError('Failed to update preferences');
    } finally {
      setSavingSection(null);
    }
  };

  const addArrayItem = (field, value, setter) => {
    if (!value.trim()) return;
    setEmergencyData(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setter('');
  };

  const removeArrayItem = (field, index) => {
    setEmergencyData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const toggleConsent = (key) => {
    setConsentData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gap: '32px' }}>
      
      <div style={{ marginBottom: '16px' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>Medical Information</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your emergency snapshot and default privacy preferences.</p>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Activity className="text-primary-accent" size={24} />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Emergency Summary</h2>
        </div>
        
        <div className="form-group">
          <label className="form-label">Blood Group</label>
          <select 
            className="form-input" 
            value={emergencyData.blood_group || ''}
            onChange={(e) => setEmergencyData({...emergencyData, blood_group: e.target.value})}
            style={{ width: '200px' }}
          >
            <option value="">Select Group</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Allergies */}
          <div>
            <label className="form-label">Allergies</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                className="form-input" 
                placeholder="e.g. Penicillin" 
                value={newAllergy}
                onChange={e => setNewAllergy(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addArrayItem('allergies', newAllergy, setNewAllergy)}
              />
              <button className="btn btn-secondary" onClick={() => addArrayItem('allergies', newAllergy, setNewAllergy)} style={{ padding: '0 16px' }}><Plus size={20}/></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {emergencyData.allergies?.map((al, i) => (
                <div key={i} className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'none' }}>
                  {al} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeArrayItem('allergies', i)} />
                </div>
              ))}
            </div>
          </div>

          {/* Medications */}
          <div>
            <label className="form-label">Current Medications</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input 
                className="form-input" 
                placeholder="e.g. Lisinopril 10mg" 
                value={newMed}
                onChange={e => setNewMed(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addArrayItem('current_medications', newMed, setNewMed)}
              />
              <button className="btn btn-secondary" onClick={() => addArrayItem('current_medications', newMed, setNewMed)} style={{ padding: '0 16px' }}><Plus size={20}/></button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {emergencyData.current_medications?.map((med, i) => (
                <div key={i} className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'none' }}>
                  {med} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeArrayItem('current_medications', i)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button className="btn btn-primary" onClick={saveEmergency} disabled={savingSection === 'emergency'}>
            <Save size={18} /> {savingSection === 'emergency' ? 'Saving...' : 'Save Emergency Info'}
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <ShieldCheck className="text-primary-accent" size={24} />
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Default Consent Preferences</h2>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
          These settings control whether emergency scans automatically include these data categories without a formal access request.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'medical_history', label: 'Full Medical History' },
            { key: 'prescriptions', label: 'Past Prescriptions' },
            { key: 'allergies', label: 'Allergies' },
            { key: 'current_medications', label: 'Current Medications' }
          ].map(field => (
            <div key={field.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: '500' }}>{field.label}</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={consentData[field.key] || false} 
                  onChange={() => toggleConsent(field.key)} 
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button className="btn btn-primary" onClick={saveConsent} disabled={savingSection === 'consent'}>
            <Save size={18} /> {savingSection === 'consent' ? 'Saving...' : 'Save Privacy Settings'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default PatientProfile;
