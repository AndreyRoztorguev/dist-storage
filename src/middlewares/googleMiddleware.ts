import type { NextFunction, Request, Response } from "express";
import { JWT } from "../services/jwt.service.ts";
import { AppError } from "../utils/AppError.ts";
import { CookieService } from "../services/cookie.service.ts";
import GoogleDriveService from "../services/google-drive.service.ts";
import { prisma } from "../config/db.ts";

async function googleMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const jwtAccessToken = CookieService.getCookie(req, "accessToken");
    const { sub = "", googleId = "" } = JWT.verifyAccessToken(jwtAccessToken);

    const userGoogleAccount = await prisma.userOAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: googleId } },
    });

    if (userGoogleAccount?.accessToken) {
      GoogleDriveService.setCredentials({ access_token: userGoogleAccount.accessToken });
      return next(null);
    }

    next(AppError.unauthorized());
  } catch (error) {
    next(AppError.internalServerError());
  }
}

export { googleMiddleware };
