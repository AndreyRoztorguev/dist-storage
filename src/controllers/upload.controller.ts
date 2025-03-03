import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.ts";
import multer from "multer";

class UploadController {
  async uploadSingleImage(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ image: req.file, body: req.body });
    } catch (error) {}
  }

  async uploadArrayImages(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({ image: req.files, body: req.body });
    } catch (err) {
      // if (err) {
      //   if (err instanceof multer.MulterError) {
      //     next(new AppError(err.message, 400));
      //   } else {
      //     next(AppError.internalServerError());
      //   }
      // }
    }
  }
}

export default new UploadController();
