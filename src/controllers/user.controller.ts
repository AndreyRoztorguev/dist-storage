import type { Request, Response } from "express";
import { prisma } from "../config/db.ts";

class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany();
      res.json({ users });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }
  async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const user = await prisma.user.findUnique({ where: { email } });

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    }
  }
}

export default new UserController();
