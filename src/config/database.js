import mongoose from "mongoose";
import { config } from "./env.js";

export const connectDatabase = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log("[database] MongoDB connected");
  } catch (error) {
    console.error("[database] Connection error", error);
    process.exit(1);
  }
};
