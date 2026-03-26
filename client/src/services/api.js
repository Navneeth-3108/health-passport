import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  withCredentials: true
});

// Response interceptor for basic logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API SUCCESS] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const authService = {
  getProfile: () => api.get('/auth/profile').then(res => res.data),
  assignRole: (role, organization) => api.post('/auth/assign-role', { role, organization }).then(res => res.data),
  logout: () => api.get('/auth/logout').then(res => res.data)
};

export const patientService = {
  generateQR: () => api.get('/patient/qr').then(res => res.data),
  updateEmergency: (emergencyData) => api.put('/patient/emergency-summary', emergencyData).then(res => res.data),
  updateConsent: (consentData) => api.put('/patient/preferences', consentData).then(res => res.data)
};

export const consentService = {
  getPendingRequests: () => api.get('/consent/pending').then(res => res.data),
  respondToRequest: (consentId, action) => api.post('/consent/respond', { consentId, action }).then(res => res.data),
  revokeConsent: (consentId) => api.put(`/consent/revoke/${consentId}`).then(res => res.data),
  getConsentHistory: () => api.get('/consent/history').then(res => res.data)
};

export const accessService = {
  scanQR: (qrCodeId, requestedBy, emergency = false) => api.post('/access/scan', { qr_code_id: qrCodeId, requestedBy, emergency }).then(res => res.data),
  createAccessRequest: (patientId, dataScope) => api.post('/access/request', { patientId, dataScope }).then(res => res.data),
  emergencyAccess: (qrCodeId, accessedBy, reason) => api.post('/access/emergency', { qr_code_id: qrCodeId, requestedBy: accessedBy, emergency: true, reason }).then(res => res.data)
};

export const auditService = {
  getPatientAccessLogs: () => api.get('/audit/me').then(res => res.data),
  getEmergencyLogs: () => api.get('/audit/emergency').then(res => res.data),
  getConsentedPatients: () => api.get('/audit/consented-patients').then(res => res.data),
  getProviderAccessLogs: () => api.get('/audit/provider-logs').then(res => res.data)
};

export default api;
