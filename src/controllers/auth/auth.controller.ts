import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../config/db.ts";
import { AppError } from "../../utils/AppError.ts";
import { Prisma } from "@prisma/client";
import { CreateUserDto } from "./dto/signup.ts";

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
      const { email, password } = req.body;
      if (!email || !password) {
        return next(AppError.badRequest("Email and password are required"));
      }
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return next(AppError.notFound());
      }

      if (!bcrypt.compareSync(password, user.password)) {
        return next(AppError.badRequest("Invalid credentials"));
      }

      res.json({ user });
    } catch (error) {
      res
        .status(500)
        .json({ error: "login failed", message: error instanceof Error ? error.message : error });
    }
  }
}

export default new AuthController();
