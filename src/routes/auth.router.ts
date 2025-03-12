import { Router } from "express";
import passport from "passport";
import { Strategy as GoogleOauth20Strategy } from "passport-google-oauth20";
import { prisma } from "../config/db.ts";
import authController from "../controllers/auth/auth.controller.ts";
import { CookieService } from "../services/cookie.service.ts";
import { JWT } from "../services/jwt.service.ts";

const router = Router();

passport.use(
  new GoogleOauth20Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_AUTHORIZED_REDIRECT_URI,
      scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
    },
    async function verify(accessToken, refreshToken, profile, done) {
      try {
        let user = await prisma.userOAuthAccount.findUnique({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: profile.id,
            },
          },
          include: {
            user: true,
          },
        });
        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value || "",
              name: profile.name?.givenName || "",
              oauthAccounts: {
                create: {
                  provider: profile.provider,
                  providerAccountId: profile.id,
                  refreshToken: refreshToken,
                  accessToken: accessToken,
                },
              },
            },
            include: { oauthAccounts: true },
          });

          user = { ...newUser.oauthAccounts[0], user: newUser };
        } else {
          if (refreshToken) {
            await prisma.userOAuthAccount.update({
              where: { id: user.id },
              data: { refreshToken },
            });
          }
        }
        const jwtAccessToken = JWT.generateAccessToken({
          sub: user.user.id,
          provider: "google",
          googleId: user.providerAccountId,
        });
        const jwtRefreshToken = JWT.generateRefreshToken({ sub: user.user.id, provider: "google" });

        done(null, { user: user.user, jwtAccessToken, jwtRefreshToken });
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

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
  })
);
router.get("/callback/google", passport.authenticate("google", { session: false }), (req, res) => {
  const { jwtAccessToken, jwtRefreshToken } = req.user as {
    jwtAccessToken: string;
    jwtRefreshToken: string;
  };

  CookieService.setAccessToken(res, jwtAccessToken);
  CookieService.setRefreshToken(res, jwtRefreshToken);

  res.redirect(process.env.CLIENT_URI + "/profile");
});
router.get("/logout", authController.logout);

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/refresh", authController.refreshAccessToken);

export default router;
