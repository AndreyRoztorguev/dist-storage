import { prisma } from "../config/db.ts";
import bcrypt from "bcrypt";
import type { LoginDTO } from "../controllers/auth/dto/login.ts";
import { type SignupDTO } from "../controllers/auth/dto/signup.ts";
import { AppError } from "../utils/AppError.ts";
import { hashPassword } from "../utils/hashPassword.ts";
import { JWT } from "./JWT.service..ts";

class AuthService {
  async signup({ dto }: { dto: SignupDTO }) {
    try {
      if (await prisma.user.findUnique({ where: { email: dto.email } })) {
        throw AppError.badRequest(
          "A user with this email already exists. Please use a different email address."
        );
      }

      const hashedPassword = await hashPassword(dto.password);

      const newuser = await prisma.user.create({
        data: { ...dto, password: hashedPassword },
      });

      const accessToken = JWT.generateAccessToken({ userId: newuser.id });
      const refreshToken = JWT.generateRefreshToken({ userId: newuser.id });

      return { newuser, accessToken, refreshToken };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new AppError(message, 500);
    }
  }
  async login({ dto }: { dto: LoginDTO }) {
    try {
      const { email, password } = dto;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw AppError.notFound();
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw AppError.badRequest("Invalid credentials");
      }

      const accessToken = JWT.generateAccessToken({ userId: user.id });
      const refreshToken = JWT.generateRefreshToken({ userId: user.id });

      return { user, accessToken, refreshToken };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new AppError(message, 500);
    }
  }
  async refreshAccessToken({ refreshToken }: { refreshToken: string }) {
    try {
      const user = JWT.verifyRefreshToken(refreshToken);
      if (!user) {
        throw AppError.unauthorized();
      }

      const accessToken = JWT.generateAccessToken({ userId: user.userId });

      return { accessToken };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new AppError(message, 500);
    }
  }
}
export default new AuthService();
