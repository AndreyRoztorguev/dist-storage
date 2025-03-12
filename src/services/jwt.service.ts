import jwt, { type JwtPayload } from "jsonwebtoken";

class JWT {
  static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "1h",
    });
  }

  static verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
  }

  static generateRefreshToken(payload: object) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "7d",
    });
  }

  static verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
  }
}

export { JWT };
