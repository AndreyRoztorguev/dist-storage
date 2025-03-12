import express, { type Request, type Response } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.ts";
import userRouter from "./routes/user.router.ts";
import googleRouter from "./routes/google.router.ts";
import uploadRouter from "./routes/upload.router.ts";
import { errorMiddleware } from "./middlewares/errorMiddleware.ts";
import setup from "./config/setup.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";
import { CookieService } from "./services/cookie.service.ts";

setup();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false },
//     // cookie: {
//     //   secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
//     //   httpOnly: true,
//     //   maxAge: 1000 * 60 * 60 * 24, // 1 day
//     // },
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());
app.use("/static", express.static("static"));

app.get("/", (req: Request, res: Response) => {
  res.send(
    `<h1>Welcome to the Server!</h1>
    <p>Current Local Server Time ${new Date().toLocaleTimeString()}</p>
    `
  );
});
app.get("/api/v1", (req, res) => {
  const accessToken = CookieService.getCookie(req, "accessToken");
  const refreshToken = CookieService.getCookie(req, "refreshToken");
  res.json({ accessToken, refreshToken });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/google", authMiddleware, googleRouter);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(process.env.DATABASE_URL);
  console.log(`listening on port ${process.env.PORT}`);
});
