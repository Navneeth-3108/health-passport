import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
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
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.create({
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
            if (profile.photos?.[0]?.value && user.picture !== profile.photos[0].value) {
              user.picture = profile.photos[0].value;
              await user.save();
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user || false);
    } catch (err) {
      done(err, null);
    }
  });
};