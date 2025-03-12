import { prisma } from "../config/db.ts";
import bcrypt from "bcrypt";
import type { LoginDTO } from "../controllers/auth/dto/login.ts";
import { type SignupDTO } from "../controllers/auth/dto/signup.ts";
import { AppError } from "../utils/AppError.ts";
import { hashPassword } from "../utils/hashPassword.ts";
import { JWT } from "./jwt.service.ts";

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

      const accessToken = JWT.generateAccessToken({ sub: newuser.id });
      const refreshToken = JWT.generateRefreshToken({ sub: newuser.id });

      return { newuser, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }
  async login({ dto }: { dto: LoginDTO }) {
    try {
      const { email, password } = dto;

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw AppError.notFound();
      }
      if (!user.password) {
        throw AppError.badRequest("No password");
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw AppError.badRequest("Invalid credentials");
      }

      const accessToken = JWT.generateAccessToken({ sub: user.id });
      const refreshToken = JWT.generateRefreshToken({ sub: user.id });

      return { user, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }
  async refreshAccessToken({ refreshToken }: { refreshToken: string }) {
    try {
      const user = JWT.verifyRefreshToken(refreshToken);
      if (!user) {
        throw AppError.unauthorized();
      }

      const accessToken = JWT.generateAccessToken({ sub: user.userId });

      return { accessToken };
    } catch (error) {
      throw error;
    }
  }
}
export default new AuthService();
