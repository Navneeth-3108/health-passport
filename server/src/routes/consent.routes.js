import express from "express";
import { body, param } from "express-validator";
import { viewPendingRequests, respondToRequest, revokeConsent, consentHistory } from "../controllers/consent.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.use(isAuthenticated);
router.use(allowRoles("PATIENT"));

router.get("/pending", viewPendingRequests);

router.post("/respond",
  [
    body("consentId").isMongoId().withMessage("Invalid consent ID"),
    body("action").isIn(["GRANTED", "REVOKED"]).withMessage("Action must be GRANTED or REVOKED")
  ],
  validateRequest,
  respondToRequest
);

router.put("/revoke/:id",
  [
    param("id").isMongoId().withMessage("Invalid consent ID")
  ],
  validateRequest,
  revokeConsent
);

router.get("/history", consentHistory);

export default router;