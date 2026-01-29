import express from "express";
import passport from "passport";
import { body } from "express-validator";
import { googleAuthSuccess, assignRole, getProfile, logout } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";

const router = express.Router();

router.get("/login", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/" }), googleAuthSuccess );

router.get("/profile", isAuthenticated, getProfile);

router.post("/assign-role",
  isAuthenticated,
  [
    body("role").isIn(["PATIENT", "PROVIDER"]).withMessage("Role must be PATIENT or PROVIDER"),
    body("organization").optional().isString().withMessage("Organization must be a string")
  ],
  validateRequest,
  assignRole
);

router.get("/logout", isAuthenticated, logout);

export default router;