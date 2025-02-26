import { Router } from "express";
import authController from "../controllers/auth/auth.controller.ts";

const router = Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

export default router;
