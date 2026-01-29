import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import { initPassport } from "./config/passport.js";
import patientRoutes from "./routes/patient.routes.js";
import consentRoutes from "./routes/consent.routes.js";
import accessRoutes from "./routes/access.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

initPassport();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send({ message: "HealthPassport API running" });
});

app.use("/patient", patientRoutes);
app.use("/consent", consentRoutes);
app.use("/access", accessRoutes);
app.use("/audit", auditRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);

  const message = process.env.NODE_ENV === "production"
    ? "An error occurred"
    : err.message;

  res.status(err.status || 500).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  });
});

export default app;