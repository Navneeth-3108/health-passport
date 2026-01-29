import express from "express";
import { getPatientAccessLogs, getEmergencyLogs, getConsentedPatients, getProviderAccessLogs } from "../controllers/audit.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(isAuthenticated);


router.get("/me", allowRoles("PATIENT"), getPatientAccessLogs);

router.get("/emergency", allowRoles("PATIENT"), getEmergencyLogs);


router.get("/consented-patients", allowRoles("PROVIDER"), getConsentedPatients);

router.get("/provider-logs", allowRoles("PROVIDER"), getProviderAccessLogs);

export default router;