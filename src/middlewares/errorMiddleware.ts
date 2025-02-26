import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = "Something went wrong";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({ error: message });
}

export { errorMiddleware };
