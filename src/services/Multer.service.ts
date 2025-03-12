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

  static uploadGoogleDrive(fieldName: string) {
    return multer({ storage: multer.memoryStorage() }).single(fieldName);
  }
}

export { MulterService };
