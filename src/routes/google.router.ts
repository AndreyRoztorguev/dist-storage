import { Router, type NextFunction, type Request, type Response } from "express";
import GoogleDriveController from "../controllers/google-drive/google-drive.controller.ts";
import { MulterService } from "../services/multer.service.ts";
import GoogleDriveService from "../services/google-drive.service.ts";
import fs from "node:fs";
import path from "node:path";
import { AppError } from "../utils/AppError.ts";
import { CookieService } from "../services/cookie.service.ts";
import { googleMiddleware } from "../middlewares/googleMiddleware.ts";

const router = Router();

router.post(
  "/drive/upload",
  googleMiddleware,
  MulterService.uploadGoogleDrive("file"),
  GoogleDriveController.upload
);

router.get("/oauth2callback", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const code = req.query.code as string;
    // if (!code) throw AppError.badRequest("no code");
    // await GoogleDriveService.setCredentials(code);
    // next();
  } catch (error) {
    next(error);
  }
});

export default router;
