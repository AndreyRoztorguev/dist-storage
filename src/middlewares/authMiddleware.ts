import type { NextFunction, Request, Response } from "express";
import JWT from "../services/JWT.service..ts";
import { AppError } from "../utils/AppError.ts";
import { CookieService } from "../services/Cookie.service.ts";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const accessToken = CookieService.getCookie(req, "accessToken");
    if (!accessToken || !JWT.verifyAccessToken(accessToken)) {
      return next(AppError.unauthorized());
    }
    next();
  } catch (error) {
    AppError.internalServerError();
  }
}

export { authMiddleware };
