import mongoose from "mongoose";

const consentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dataScope: {
      type: [String],
      default: ["medical_history", "prescriptions", "allergies", "current_medications", "blood_group"],
    },
    status: { type: String, enum: ["PENDING", "GRANTED", "REVOKED"], default: "PENDING" },
    expiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const Consent = mongoose.model("Consent", consentSchema);

export default Consent;