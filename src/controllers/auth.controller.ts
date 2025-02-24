import type { Request, Response } from "express";

class AuthController {
  signup(req: Request, res: Response) {
    console.log("Signing up...");
    res.send("Signup successful!");
  }
  login() {
    console.log("login up...");
  }
}

export default new AuthController();
