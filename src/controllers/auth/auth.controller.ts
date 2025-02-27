import type { NextFunction, Request, Response } from "express";
import { hashPassword } from "../../utils/hashPassword.ts";
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.ts";
import { AppError } from "../../utils/AppError.ts";
import { CreateUserDto } from "./dto/signup.ts";
import { loginDTO } from "./dto/login.ts";
import JWT from "../../services/JWT.service..ts";
import { CookieService } from "../../services/Cookie.service.ts";

class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = CreateUserDto.validate(req.body);

      if (error) {
        return next(AppError.badRequest(error.message));
      }

      if (await prisma.user.findUnique({ where: { email: req.body.email } })) {
        return next(
          AppError.badRequest(
            "A user with this email already exists. Please use a different email address."
          )
        );
      }

      const hashedPassword = await hashPassword(req.body.password);

      const newuser = await prisma.user.create({
        data: { ...req.body, password: hashedPassword },
      });

      const accessToken = JWT.generateAccessToken({ userId: newuser.id });
      const refreshToken = JWT.generateRefreshToken({ userId: newuser.id });

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
      const { error } = loginDTO.validate(req.body);
      if (error) {
        return next(AppError.badRequest(error.message));
      }
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return next(AppError.notFound());
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return next(AppError.badRequest("Invalid credentials"));
      }

      const accessToken = JWT.generateAccessToken({ userId: user.id });
      const refreshToken = JWT.generateRefreshToken({ userId: user.id });

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
      const user = JWT.verifyRefreshToken(refreshToken);
      if (!user) {
        return next(AppError.unauthorized());
      }
      const accessToken = JWT.generateAccessToken({ userId: user.userId });

      CookieService.setCookie(res, "accessToken", accessToken, { maxAge: 60 * 1000 }); // 60 seconds

      res.json({ accessToken });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      next(new AppError(message, 500));
    }
  }
}

export default new AuthController();
