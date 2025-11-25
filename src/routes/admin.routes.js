import { Router } from "express";
import {
  adminLogin,
  listUsers,
  deleteUser,
  getAnalytics
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/users", authenticateAdmin, listUsers);
router.delete("/user/:id", authenticateAdmin, deleteUser);
router.get("/analytics", authenticateAdmin, getAnalytics);

export default router;



