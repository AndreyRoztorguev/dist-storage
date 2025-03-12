import type { NextFunction, Request, Response } from "express";
import { JWT } from "../services/jwt.service.ts";
import { AppError } from "../utils/AppError.ts";
import { CookieService } from "../services/cookie.service.ts";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = CookieService.getCookie(req, "accessToken");

    if (accessToken && JWT.verifyAccessToken(accessToken)) {
      return next();
    }

    next(AppError.unauthorized());
  } catch (error) {
    next(AppError.internalServerError());
  }
}

export { authMiddleware };
