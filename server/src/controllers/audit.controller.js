import AccessLog from "../models/AccessLog.js";
import Provider from "../models/Provider.js";
import Consent from "../models/Consent.js";
import Patient from "../models/Patient.js";

export const getPatientAccessLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({ patientId: req.user._id, emergency: false })
      .populate('accessedBy', 'name email organization picture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      accessLogs: logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch access logs" });
  }
};

export const getEmergencyLogs = async (req, res) => {
  try {
    const logs = await AccessLog.find({ patientId: req.user._id, emergency: true })
      .populate('accessedBy', 'name email organization picture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      emergencyLogs: logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch emergency logs" });
  }
};


export const getConsentedPatients = async (req, res) => {
  try {

    const consents = await Consent.find({
      providerId: req.user._id,
      status: "GRANTED",
      $or: [
        { expiry: null },
        { expiry: { $gt: new Date() } }
      ]
    }).populate('patientId', 'name email picture medical_history prescriptions emergency');


    const patientsWithData = await Promise.all(
      consents.map(async (consent) => {
        const patient = consent.patientId;
        const data = {
          name: patient.name,
          email: patient.email,
          picture: patient.picture,
        };


        if (consent.dataScope.includes('medical_history')) {
          data.medical_history = patient.medical_history || 'No medical history recorded';
        }
        if (consent.dataScope.includes('prescriptions')) {
          data.prescriptions = patient.prescriptions && patient.prescriptions.length > 0 ? patient.prescriptions : null;
        }
        if (consent.dataScope.includes('allergies')) {
          data.allergies = patient.emergency?.allergies || [];
        }
        if (consent.dataScope.includes('blood_group')) {
          data.blood_group = patient.emergency?.blood_group || 'Not specified';
        }
        if (consent.dataScope.includes('current_medications')) {
          data.current_medications = patient.emergency?.current_medications || [];
        }

        return {
          patientId: patient._id.toString(),
          consentId: consent._id.toString(),
          consentScope: consent.dataScope,
          grantedAt: consent.createdAt,
          data,
        };
      })
    );

    res.status(200).json({
      consentedPatients: patientsWithData,
    });
  } catch (err) {
    console.error('Failed to fetch consented patients:', err);
    res.status(500).json({ message: "Failed to fetch consented patients" });
  }
};

export const getProviderAccessLogs = async (req, res) => {
  try {

    const logs = await AccessLog.find({ accessedBy: req.user._id })
      .populate('patientId', 'name email picture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      providerAccessLogs: logs,
    });
  } catch (err) {
    console.error('Failed to fetch provider access logs:', err);
    res.status(500).json({ message: "Failed to fetch provider access logs" });
  }
};