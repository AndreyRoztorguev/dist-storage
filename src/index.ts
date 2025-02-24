import express from "express";
import AuthRouter from "./routes/auth.router.ts";
import client from "./config/db.ts";

const PORT = process.env.PORT || 8080;

const app = express();
try {
  client
    .connect()
    .then(() => {
      console.log("Connected to PostgreSQL database");
    })
    .catch((err) => {
      console.error("Error connecting to PostgreSQL database", err);
    });
  app.get("/users", async (req, res) => {
    try {
      const result = await client.query("SELECT NOW()");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.use("/api/auth", AuthRouter);
  app.get("*", (req, res) => {
    res.send(new Date().toLocaleTimeString());
  });

  app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  });
} catch (error) {
  console.log(error);
}
