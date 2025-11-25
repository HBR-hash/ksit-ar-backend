import { asyncHandler } from "../utils/asyncHandler.js";
import { adminLoginSchema } from "../utils/validators.js";
import { Admin } from "../models/Admin.js";
import { comparePassword } from "../utils/password.js";
import { createToken } from "../utils/token.js";
import { User } from "../models/User.js";
import { fetchAnalytics } from "../services/analytics.service.js";

export const adminLogin = asyncHandler(async (req, res) => {
  const { value, error } = adminLoginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const admin = await Admin.findOne({ email: value.email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const match = await comparePassword(value.password, admin.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = createToken({ adminId: admin.id, role: "admin" }, { expiresIn: "1d" });
  res.json({ token });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find()
    .select("name email phone createdAt lastLoginAt")
    .lean();
  res.json(users);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted." });
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await fetchAnalytics();
  res.json(analytics);
});



