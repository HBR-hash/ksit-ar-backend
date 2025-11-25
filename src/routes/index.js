import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";

export const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);

router.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
console.log("Server started: KSIT AR Campus Explorer");
console.log("Routes loaded:", __filename);
console.log("Auth Routes:", authRoutes);