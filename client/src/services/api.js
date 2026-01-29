import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
});


api.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.method, response.config.url, response.status);
    return response;
  },
  error => {
    console.error('API Error:', error.config?.method, error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);


export const authService = {
  getProfile: () => api.get('/auth/profile'),
  assignRole: (role, organization) => {
    const payload = { role };
    if (organization) {
      payload.organization = organization;
    }
    return api.post('/auth/assign-role', payload);
  },
  logout: () => api.get('/auth/logout'),
};


export const patientService = {
  generateQR: () => api.get('/patient/qr'),
  updateEmergency: (emergencyData) =>
    api.put('/patient/emergency-summary', emergencyData),
  updateConsent: (consentData) =>
    api.put('/patient/preferences', consentData),
};


export const consentService = {
  getPendingRequests: () => api.get('/consent/pending'),
  respondToRequest: (consentId, action) =>
    api.post('/consent/respond', { consentId, action }),
  revokeConsent: (consentId) => api.put(`/consent/revoke/${consentId}`),
  getConsentHistory: () => api.get('/consent/history'),
};


export const accessService = {
  scanQR: (qrCodeId, requestedBy, emergency = false) =>
    api.post('/access/scan', { qr_code_id: qrCodeId, requestedBy, emergency }),
  createAccessRequest: (patientId, providerId, dataScope) =>
    api.post('/access/request', { patientId, providerId, dataScope }),
  emergencyAccess: (qrCodeId, accessedBy, reason) =>
    api.post('/access/emergency', { qr_code_id: qrCodeId, accessedBy, reason }),
};


export const auditService = {
  getPatientAccessLogs: () => api.get('/audit/me'),
  getEmergencyLogs: () => api.get('/audit/emergency'),
  getConsentedPatients: () => api.get('/audit/consented-patients'),
  getProviderAccessLogs: () => api.get('/audit/provider-logs'),
};

export default api;