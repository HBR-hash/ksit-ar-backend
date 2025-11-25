import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { router } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { seedAdmin } from "./seed/admin.js";

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.env !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.use(errorHandler);

const start = async () => {
  await connectDatabase();
  await seedAdmin();

  app.listen(config.port, "0.0.0.0", () => {
    console.log(`[server] Listening on port ${config.port}`);
  });
};

start().catch((error) => {
  console.error("[server] Failed to start", error);
  process.exit(1);
});



