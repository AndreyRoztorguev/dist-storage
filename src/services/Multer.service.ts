import type { NextFunction } from "express";
import multer from "multer";

class MulterService {
  static upload(destination: string, fieldName: string, options: multer.Options = {}) {
    const storage = multer.diskStorage({
      destination,
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });

    return multer({ storage, ...options }).single(fieldName);
  }

  static uploadArray(destination: string, fieldName: string, options: multer.Options = {}) {
    const storage = multer.diskStorage({
      destination,
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });

    return multer({ storage, ...options }).array(fieldName, options.limits?.files || Infinity);
  }
}

export { MulterService };
