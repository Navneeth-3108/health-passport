import Patient from "../models/Patient.js";

export const googleAuthSuccess = async (req, res) => {
  if (!req.user) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=authentication_failed`);
  }

  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/role-selection?auth=success`);
};

export const assignRole = async (req, res) => {
  try {
    const { role, organization } = req.body;

    if (!["PATIENT", "PROVIDER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.user._id,
      {
        role,
        organization: role === "PROVIDER" ? organization : undefined,
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "User not found" });
    }


    req.user.role = patient.role;
    req.user.organization = patient.organization;

    res.status(200).json({
      message: "Role assigned successfully",
      id: patient._id,
      name: patient.name,
      email: patient.email,
      picture: patient.picture,
      role: patient.role,
      organization: patient.organization,
      qr_code_id: patient.qr_code_id,
    });
  } catch (err) {
    console.error("Role assignment error:", err);
    res.status(500).json({ message: "Role assignment failed", error: err.message });
  }
};

export const getProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.status(200).json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    role: req.user.role || null,
    organization: req.user.organization,
    qr_code_id: req.user.qr_code_id,
  });
};

export const logout = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
};