import express from "express";
import { body } from "express-validator";
import { generateQR, updateEmergency, updateConsent } from "../controllers/patient.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(allowRoles("PATIENT"));

router.get("/qr", generateQR);

router.put("/emergency-summary",
  [
    body("blood_group").optional().isString().withMessage("Blood group must be a string"),
    body("allergies").optional().isArray().withMessage("Allergies must be an array"),
    body("current_medications").optional().isArray().withMessage("Current medications must be an array")
  ],
  validateRequest,
  updateEmergency
);

router.put("/preferences",
  [
    body("medical_history").optional().isBoolean().withMessage("medical_history must be a boolean"),
    body("prescriptions").optional().isBoolean().withMessage("prescriptions must be a boolean"),
    body("allergies").optional().isBoolean().withMessage("allergies must be a boolean")
  ],
  validateRequest,
  updateConsent
);

export default router;