import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.ts";
import userRouter from "./routes/user.router.ts";
import { errorMiddleware } from "./middlewares/errorMiddleware.ts";
import setup from "./config/setup.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";
import { CookieService } from "./services/Cookie.service.ts";

setup();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(
//   session({
//     secret: "your-secret-key", // Change this to a secure secret
//     resave: false, // Avoid resaving unchanged sessions
//     saveUninitialized: false, // Avoid saving empty sessions
//     cookie: { secure: false, maxAge: 1000 * 60 * 60 }, // Set cookie options
//   })
// );

app.get("/api/v1/", authMiddleware, (req, res) => {
  const accessToken = CookieService.getCookie(req, "accessToken");
  const refreshToken = CookieService.getCookie(req, "refreshToken");

  res.json({ accessToken, refreshToken });
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(process.env.DATABASE_URL);
  console.log(`listening on port ${process.env.PORT}`);
});
