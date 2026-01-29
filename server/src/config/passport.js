import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import Patient from "../models/Patient.js";
import { nanoid } from "nanoid";

const generateQRId = () => {
  return nanoid(12);
};

export const initPassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALL_BACKURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let patient = await Patient.findOne({ googleId: profile.id });

          if (!patient) {
            patient = await Patient.create({
              name: profile.displayName,
              googleId: profile.id,
              email: profile.emails?.[0]?.value,
              picture: profile.photos?.[0]?.value || null,
              role: null,
              consent: {
                medical_history: false,
                prescriptions: false,
                allergies: false,
              },
              emergency: {
                blood_group: null,
                allergies: [],
                current_medications: [],
              },
              qr_code_id: generateQRId(),
            });
          } else {
            if (profile.photos?.[0]?.value && patient.picture !== profile.photos[0].value) {
              patient.picture = profile.photos[0].value;
              await patient.save();
            }
          }

          return done(null, patient);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((patient, done) => {
    done(null, patient.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const patient = await Patient.findById(id);
      done(null, patient || false);
    } catch (err) {
      done(err, null);
    }
  });
};