import type { NextFunction, Request, Response } from "express";
import AuthService from "../../services/Auth.service.ts";
import { CookieService } from "../../services/Cookie.service.ts";
import { AppError } from "../../utils/AppError.ts";
import { loginDTOShema } from "./dto/login.ts";
import { SignupDTOShema } from "./dto/signup.ts";

class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value: userdata } = SignupDTOShema.validate(req.body);

      if (error) {
        return next(AppError.badRequest(error.message));
      }

      const { newuser, accessToken, refreshToken } = await AuthService.signup({ dto: userdata });

      CookieService.setCookie(res, "accessToken", accessToken, { maxAge: 60 * 1000 }); // 60 seconds
      CookieService.setCookie(res, "refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json(newuser);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      next(new AppError(message, 500));
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = loginDTOShema.validate(req.body);
      if (error) {
        return next(AppError.badRequest(error.message));
      }

      const { user, accessToken, refreshToken } = await AuthService.login({ dto: value });

      CookieService.setCookie(res, "accessToken", accessToken, { maxAge: 60 * 1000 }); // 60 seconds
      CookieService.setCookie(res, "refreshToken", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ user, accessToken });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      next(new AppError(message, 500));
    }
  }
  async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = CookieService.getCookie(req, "refreshToken");
      const { accessToken } = await AuthService.refreshAccessToken({ refreshToken });
      CookieService.setCookie(res, "accessToken", accessToken, { maxAge: 60 * 1000 }); // 60 seconds
      res.json({ accessToken });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      next(new AppError(message, 500));
    }
  }
}

export default new AuthController();
