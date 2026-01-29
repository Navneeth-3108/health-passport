import mongoose from "mongoose";

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["HOSPITAL", "LAB", "DOCTOR"], required: true },
    verified: { type: Boolean, default: false },
    endpoint: { type: String, required: true },
  },
  { timestamps: true }
);

const Provider = mongoose.model("Provider", providerSchema);

export default Provider;