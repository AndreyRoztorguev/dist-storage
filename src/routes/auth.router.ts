import { Router } from "express";
import passport from "passport";
import authController from "../controllers/auth/auth.controller.ts";
import { Strategy as GoogleOauth20Strategy } from "passport-google-oauth20";
import { prisma } from "../config/db.ts";
import { AppError } from "../utils/AppError.ts";

const router = Router();

passport.use(
  new GoogleOauth20Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
      scope: ["profile"],
    },
    async function verify(accessToken, refreshToken, profile, done) {
      try {
        const { emails: [email] = [] } = profile;
        const user = await prisma.user.findUnique({ where: { email: email.value } });
        if (!user) return done(AppError.unauthorized());
        return done(null, profile);
      } catch (error) {
        done(error);
      }
    }
  )
);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/refresh", authController.refreshAccessToken);
router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/callback/google",
  passport.authenticate("google", {
    successReturnToOrRedirect: process.env.CLIENT_URI + "/profile",
    failureRedirect: process.env.CLIENT_URI + "/login",
  })
);
router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  try {
    done(null, user!);
  } catch (error) {
    done(error, null);
  }
});

export default router;
