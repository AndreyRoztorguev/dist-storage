import { Router } from "express";
import userController from "../controllers/user.controller.ts";

const router = Router();

router.get("/", userController.getAll);
router.get("/:email", userController.getByEmail);

export default router;
