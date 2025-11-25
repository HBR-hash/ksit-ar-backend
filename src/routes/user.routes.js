import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteAccount
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getProfile);
router.put("/update", authenticate, updateProfile);
router.delete("/delete", authenticate, deleteAccount);

export default router;



