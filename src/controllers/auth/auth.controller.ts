import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/db.ts";
import { AppError } from "../../utils/AppError.ts";
import { CreateUserDto } from "./dto/signup.ts";
import { loginDTO } from "./dto/login.ts";

class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { error } = CreateUserDto.validate(req.body);

      if (error) {
        return next(AppError.badRequest(error.message));
      }

      const hashedPassword = await bcrypt.hash(req.body.password, +process.env.BCRYPT_SOLT!);

      if (await prisma.user.findUnique({ where: { email: req.body.email } })) {
        return next(
          AppError.badRequest(
            "A user with this email already exists. Please use a different email address."
          )
        );
      }

      const newuser = await prisma.user.create({
        data: { ...req.body, password: hashedPassword },
      });

      res.json(newuser);
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

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1m" });

      res.cookie("accessToken", token, {
        httpOnly: true, // Prevents JavaScript access (security)
        secure: true, // Only send over HTTPS
        sameSite: "strict",
        maxAge: 60 * 1000, // 60sec // 60 * 60 * 1000, // 1 hour
      });

      res.json({ user, token });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      next(new AppError(message, 500));
    }
  }
}

export default new AuthController();
