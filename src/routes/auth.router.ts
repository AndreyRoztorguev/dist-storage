import { Router, type Request, type Response } from "express";
import passport from "passport";
import { Strategy as GoogleOauth20Strategy } from "passport-google-oauth20";
import authController from "../controllers/auth/auth.controller.ts";
import GoogleAuthService from "../services/GoogleAuth.service.ts";
import { authMiddleware } from "../middlewares/authMiddleware.ts";

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
        const { emails: [email] = [], name = { givenName: "" }, id } = profile;

        const { user } = await GoogleAuthService.login({
          email: email.value,
          name: name.givenName,
          google_id: id,
        });
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);
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

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/refresh", authController.refreshAccessToken);
router.get("/login/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/check-session", authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({ message: "Authenticated" });
});
router.get(
  "/callback/google",
  passport.authenticate("google", {
    successReturnToOrRedirect: process.env.CLIENT_URI + "/profile",
    failureRedirect: process.env.CLIENT_URI + "/login",
  })
);
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
