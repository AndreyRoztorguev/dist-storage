import { Router } from "express";
import authController from "../controllers/auth.controller.ts";

const router = Router();

router.get("/signup", authController.signup);
router.get("/login", authController.login);

export default router;
