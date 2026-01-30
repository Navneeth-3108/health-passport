import User from "../models/User.js";
import AccessLog from "../models/AccessLog.js";
import Consent from "../models/Consent.js";
import { validateQRToken } from "../services/qr.service.js";

export const scanQR = async (req, res) => {
  try {
    const { qr_code_id, requestedBy, emergency } = req.body;

    console.log('Scan request:', { qr_code_id, requestedBy, emergency });

    if (!qr_code_id) {
      return res.status(400).json({ message: "QR code ID is required" });
    }

    if (!requestedBy) {
      return res.status(400).json({ message: "Requester information is required" });
    }

    const patient = await User.findOne({ qr_code_id });
    if (!patient) {
      console.log('Patient not found for QR:', qr_code_id);
      return res.status(404).json({ message: "Patient not found with this QR code" });
    }

    console.log('Patient found:', patient.name, patient._id);

    const isValid = validateQRToken(qr_code_id, patient);
    if (!isValid) {
      console.log('Invalid QR token');
      return res.status(400).json({ message: "Invalid QR code" });
    }

    let consentRecord = null;

    const data = {
      name: patient.name,
      email: patient.email,
    };


    if (emergency) {
      data.medical_history = patient.medical_history || 'Request Emergency Access';
      data.prescriptions = patient.prescriptions || [];
      data.allergies = patient.emergency?.allergies || [];
      data.blood_group = patient.emergency?.blood_group || 'Not specified';
      data.current_medications = patient.emergency?.current_medications || [];
    } else {
      const dataScope = consentRecord ? consentRecord.dataScope : [];
      
      if (dataScope.includes('medical_history') || patient.consent.medical_history) {
        data.medical_history = patient.medical_history || 'Request Emergency Access';
      }
      if (dataScope.includes('prescriptions') || patient.consent.prescriptions) {
        data.prescriptions = patient.prescriptions || [];
      }
      if (dataScope.includes('allergies') || patient.consent.allergies) {
        data.allergies = patient.emergency?.allergies || [];
      }
      data.blood_group = patient.emergency?.blood_group || 'Not specified';
      if (dataScope.includes('current_medications') || patient.consent.current_medications) {
        data.current_medications = patient.emergency?.current_medications || [];
      }
    }

    await AccessLog.create({
      accessedBy: requestedBy,
      patientId: patient._id,
      dataAccessed: Object.keys(data),
      emergency: emergency || false,
    });

    console.log('Access granted, data:', data);

    res.status(200).json({
      patientId: patient._id,
      patientName: patient.name,
      data,
      emergency: emergency || false,
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ message: "Failed to scan QR code", error: err.message });
  }
};

export const createAccessRequest = async (req, res) => {
  try {
    const { patientId, providerId, dataScope } = req.body;

    console.log('Create access request:', { patientId, providerId, dataScope });

    if (!patientId || !providerId) {
      return res.status(400).json({ message: "Patient ID (email/QR code/ID) and Provider ID are required" });
    }


    let patient;
    try {
      patient = await User.findById(patientId);
    } catch (e) {
      console.log('Invalid MongoDB ID format, trying email/QR:', patientId);
    }

    if (!patient) {
      patient = await User.findOne({ email: patientId });
      console.log('Searched by email:', patientId, patient ? 'found' : 'not found');
    }

    if (!patient) {
      patient = await User.findOne({ qr_code_id: patientId });
      console.log('Searched by QR code:', patientId, patient ? 'found' : 'not found');
    }

    if (!patient) {
      console.log('Patient not found:', patientId);
      return res.status(404).json({ message: "Patient not found. Use patient ID, email, or QR code ID" });
    }

    console.log('Patient found:', patient._id, patient.name);


    let provider;
    try {
      provider = await User.findById(providerId);
    } catch (e) {
      console.log('Invalid provider ID:', providerId, e.message);
      return res.status(400).json({ message: "Invalid provider ID format" });
    }

    if (!provider) {
      console.log('Provider not found:', providerId);
      return res.status(400).json({ message: "Provider not found" });
    }

    if (provider.role !== 'PROVIDER') {
      console.log('User is not a provider:', providerId, provider.role);
      return res.status(400).json({ message: "Requester must be a provider" });
    }

    console.log('Provider valid:', provider._id, provider.name);


    try {
      const existingConsent = await Consent.findOne({
        patientId: patient._id,
        providerId: provider._id,
        status: "PENDING"
      });

      if (existingConsent) {
        console.log('Pending consent already exists');
        return res.status(400).json({ message: "Pending consent request already exists for this patient" });
      }
    } catch (e) {
      console.log('Error checking existing consent:', e.message);
    }


    const consent = await Consent.create({
      patientId: patient._id,
      providerId: provider._id,
      dataScope: dataScope && dataScope.length > 0 ? dataScope : ["medical_history", "prescriptions", "allergies", "current_medications"],
      status: "PENDING",
    });

    console.log('Consent created:', consent._id);

    const responseData = {
      message: "Access request sent to patient successfully",
      success: true,
      consent: {
        id: consent._id,
        status: consent.status
      },
      patientName: patient.name,
      patientEmail: patient.email
    };

    console.log('Sending response:', responseData);
    res.status(200).json(responseData);
  } catch (err) {
    console.error('Create access request error:', err);
    res.status(500).json({
      message: "Failed to create access request",
      error: err.message,
      details: err.stack
    });
  }
};