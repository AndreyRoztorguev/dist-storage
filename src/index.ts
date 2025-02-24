import express from "express";
import AuthRouter from "./routes/auth.router.ts";

const PORT = process.env.PORT || 8080;

const app = express();

app.use("/api/auth", AuthRouter);
app.get("*", (req, res) => {
  res.send(new Date().toLocaleTimeString());
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
