import type { CookieOptions, Request, Response } from "express";

class CookieService {
  static setCookie(res: Response, name: string, value: string, options: CookieOptions = {}) {
    const defaultOptions: CookieOptions = {
      httpOnly: true, //  Prevents JavaScript access (security)
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS and localhost
      sameSite: "strict", // // CSRF protection
      ...options,
    };
    res.cookie(name, value, defaultOptions);
  }

  static getCookie(req: Request, name: string) {
    return req.cookies?.[name];
  }

  static clearCookie(res: Response, name: string, options: CookieOptions) {
    res.clearCookie(name, options);
  }
}

export { CookieService };
