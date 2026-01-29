import mongoose from "mongoose";

const accessLogSchema = new mongoose.Schema(
  {
    accessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dataAccessed: { type: [String], required: true },
    timestamp: { type: Date, default: Date.now },
    emergency: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const AccessLog = mongoose.model("AccessLog", accessLogSchema);

export default AccessLog;