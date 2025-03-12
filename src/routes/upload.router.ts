import { Router } from "express";
import { MulterService } from "../services/multer.service.ts";
import uploadController from "../controllers/upload.controller.ts";

const router = Router();

router.post(
  "/image",
  MulterService.upload("static/image", "image"),
  uploadController.uploadSingleImage
);

router.post(
  "/images",
  MulterService.uploadArray("static/images", "images", { limits: { files: 4 } }),
  uploadController.uploadArrayImages
);

export default router;
