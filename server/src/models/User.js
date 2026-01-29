import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    googleId: { type: String, required: true, unique: true },
    picture: { type: String, default: null },

    role: { type: String, enum: ["PATIENT", "PROVIDER"], default: null },
    organization: { type: String, default: null },

    emergency: {
      blood_group: { type: String, default: null },
      allergies: [{ type: String }],
      current_medications: [{ type: String }],
    },

    consent: {
      medical_history: { type: Boolean, default: false },
      prescriptions: { type: Boolean, default: false },
      allergies: { type: Boolean, default: false },
      current_medications: { type: Boolean, default: false },
    },

    medical_history: { type: String, default: "" },
    prescriptions: [{ type: String }],

    qr_code_id: { type: String, unique: true, index: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
