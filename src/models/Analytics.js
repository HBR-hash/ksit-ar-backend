import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    date: { type: String, unique: true, required: true },
    dailyNewUsers: { type: Number, default: 0 },
    dailyLogins: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalLogins: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);



