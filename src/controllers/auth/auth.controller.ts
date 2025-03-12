import type { NextFunction, Request, Response } from "express";
import { CookieService } from "../../services/cookie.service.ts";
import { AppError } from "../../utils/AppError.ts";
import { loginDTOShema } from "./dto/login.ts";
import { SignupDTOShema } from "./dto/signup.ts";
import authService from "../../services/auth.service.ts";

class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value: userdata } = SignupDTOShema.validate(req.body);

      if (error) {
        return next(AppError.badRequest(error.message));
      }

      const { newuser, accessToken, refreshToken } = await authService.signup({ dto: userdata });

      CookieService.setAccessToken(res, accessToken);
      CookieService.setRefreshToken(res, refreshToken);

      res.status(201).json(newuser);
    } catch (error) {
      next(error);
    }
  }
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = loginDTOShema.validate(req.body);
      if (error) {
        return next(AppError.badRequest(error.message));
      }

      const { user, accessToken, refreshToken } = await authService.login({ dto: value });

      CookieService.setAccessToken(res, accessToken);
      CookieService.setRefreshToken(res, refreshToken);

      res.json({ user, accessToken });
    } catch (error) {
      next(error);
    }
  }
  async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = CookieService.getCookie(req, "refreshToken");
      const { accessToken } = await authService.refreshAccessToken({ refreshToken });
      CookieService.setCookie(res, "accessToken", accessToken, { maxAge: 60 * 1000 }); // 60 seconds
      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      req.logout(function (err) {
        if (err) return next(err);
        res.redirect("/");
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
