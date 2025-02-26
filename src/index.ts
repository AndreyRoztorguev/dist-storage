import express from "express";

import authRouter from "./routes/auth.router.ts";
import userRouter from "./routes/user.router.ts";
import { errorMiddleware } from "./middlewares/errorMiddleware.ts";
import setup from "./config/setup.ts";

setup();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(process.env.DATABASE_URL);
  console.log(`listening on port ${process.env.PORT}`);
});
