import User from "../models/User.js";
import { nanoid } from "nanoid";

export const generateQR = (req, res) => {
  if (!req.user.qr_code_id) {
    req.user.qr_code_id = nanoid(12);
    req.user.save();
  }

  res.status(200).json({
    message: "Patient QR generated",
    qr_code_id: req.user.qr_code_id,
  });
};

export const updateEmergency = async (req, res) => {
  try {
    const { blood_group, allergies, current_medications } = req.body;

    req.user.emergency = {
      blood_group: blood_group || req.user.emergency.blood_group,
      allergies: allergies || req.user.emergency.allergies,
      current_medications: current_medications || req.user.emergency.current_medications,
    };

    await req.user.save();

    res.status(200).json({
      message: "Emergency summary updated",
      emergency: req.user.emergency,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update emergency summary" });
  }
};

export const updateConsent = async (req, res) => {
  try {
    const { medical_history, prescriptions, allergies, current_medications } = req.body;

    req.user.consent = {
      medical_history: medical_history ?? req.user.consent.medical_history,
      prescriptions: prescriptions ?? req.user.consent.prescriptions,
      allergies: allergies ?? req.user.consent.allergies,
      current_medications: current_medications ?? req.user.consent.current_medications,
    };

    await req.user.save();

    res.status(200).json({
      message: "Consent preferences updated",
      consent: req.user.consent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update consent preferences" });
  }
};