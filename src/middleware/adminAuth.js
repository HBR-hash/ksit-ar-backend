import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const authenticateAdmin = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: "Admin auth required." });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden." });
    }

    req.admin = { id: decoded.adminId };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid admin token." });
  }
};



