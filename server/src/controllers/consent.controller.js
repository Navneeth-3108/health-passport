import Consent from "../models/Consent.js";
import Patient from "../models/Patient.js";
import Provider from "../models/Provider.js";

export const viewPendingRequests = async (req, res) => {
  try {
    const pending = await Consent.find({
      patientId: req.user._id,
      status: "PENDING",
    }).populate("providerId", "name organization picture");

    console.log('Pending requests for patient:', req.user._id, pending.length);

    res.status(200).json({
      pendingRequests: pending,
    });
  } catch (err) {
    console.error('Fetch pending requests error:', err);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
};

export const respondToRequest = async (req, res) => {
  try {
    const { consentId, action } = req.body;

    if (!["GRANTED", "REVOKED"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const consent = await Consent.findOne({ _id: consentId, patientId: req.user._id });
    if (!consent) return res.status(404).json({ message: "Consent request not found" });

    consent.status = action;
    await consent.save();

    console.log('Consent request responded:', consentId, action);

    res.status(200).json({
      message: `Consent ${action.toLowerCase()} successfully`,
      consent
    });
  } catch (err) {
    console.error('Respond to request error:', err);
    res.status(500).json({ message: "Failed to respond to request" });
  }
};

export const revokeConsent = async (req, res) => {
  try {
    const { id } = req.params;

    const consent = await Consent.findOne({ _id: id, patientId: req.user._id });
    if (!consent) return res.status(404).json({ message: "Consent not found" });

    consent.status = "REVOKED";
    await consent.save();

    res.status(200).json({ message: "Consent revoked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to revoke consent" });
  }
};

export const consentHistory = async (req, res) => {
  try {
    const history = await Consent.find({ patientId: req.user._id })
      .populate("providerId", "name organization picture")
      .sort({ createdAt: -1 });

    console.log('Consent history for patient:', req.user._id, history.length);

    res.status(200).json({
      consentHistory: history,
    });
  } catch (err) {
    console.error('Fetch consent history error:', err);
    res.status(500).json({ message: "Failed to fetch consent history" });
  }
};