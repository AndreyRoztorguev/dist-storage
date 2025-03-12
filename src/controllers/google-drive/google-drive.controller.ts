import type { NextFunction, Request, Response } from "express";
import googleDriveService from "../../services/google-drive.service.ts";
import { AppError } from "../../utils/AppError.ts";

class GoogleDriveController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw AppError.badRequest();

      const data = await googleDriveService.uploadFile({ file: req.file });
      res.json({ data });
    } catch (error) {
      next(error);
    }
  }
  async listFolders(req: Request, res: Response, next: NextFunction) {
    // try {
    //   await GoogleDriveService.listFolders(req, res);
    // } catch (error) {
    //   console.error("Error listing folders:", error);
    // }
  }
}

export default new GoogleDriveController();
