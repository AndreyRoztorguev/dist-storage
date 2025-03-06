import { prisma } from "../config/db.ts";
import { AppError } from "../utils/AppError.ts";

class GoogleAuthService {
  async login(dto: { email: string; name: string; google_id: string }) {
    try {
      const { email, google_id } = dto;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        const newuser = await prisma.user.create({ data: dto });
        return { user: newuser };
      }

      const updateduser = await prisma.user.update({ where: { email }, data: { google_id } });

      return { user: updateduser };
    } catch (error) {
      throw new AppError("Failed to login with Google", 500);
    }
  }
}

export default new GoogleAuthService();
