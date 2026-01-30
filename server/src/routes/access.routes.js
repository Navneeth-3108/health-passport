import express from "express";
import { body } from "express-validator";
import {
  scanQR,
  createAccessRequest
} from "../controllers/access.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { handleEmergency } from "../middlewares/emergency.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/scan",
  handleEmergency,
  [
    body("qr_code_id").notEmpty().withMessage("QR code ID is required"),
    body("requestedBy").isMongoId().withMessage("Valid requester ID is required"),
    body("emergency").optional().isBoolean().withMessage("Emergency must be a boolean")
  ],
  validateRequest,
  scanQR
);

router.post("/request",
  [
    body("patientId").notEmpty().withMessage("Patient ID (email, QR code, or MongoDB ID) is required"),
    body("providerId").isMongoId().withMessage("Valid provider ID is required"),
    body("dataScope").optional().isArray().withMessage("Data scope must be an array")
  ],
  validateRequest,
  createAccessRequest
);

router.post("/emergency",
  handleEmergency,
  [
    body("qr_code_id").notEmpty().withMessage("QR code ID is required"),
    body("requestedBy").isMongoId().withMessage("Valid requester ID is required")
  ],
  validateRequest
);

export default router;