class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message?: string) {
    return new AppError(message ?? "Bad Request", 400);
  }
  static unauthorized() {
    return new AppError("Unauthorized", 401);
  }
  static forbidden() {
    return new AppError("Forbidden", 403);
  }
  static notFound() {
    return new AppError("Not Found", 404);
  }
  static internalServerError() {
    return new AppError("Internal Server Error", 500);
  }
  static conflict(message: string) {
    return new AppError(message, 409);
  }
}

export { AppError };
