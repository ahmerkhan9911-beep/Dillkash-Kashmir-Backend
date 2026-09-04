import { Router } from "express";
import {
  getAllGuides,
  getGuide,
  createGuide,
  updateGuide,
  deleteGuide,
  toggleGuideStatus,
} from "../controllers/guide.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { guideValidation } from "../utils/validators.js";

const router = Router();

// Public routes
router.get("/", getAllGuides);
router.get("/:id", getGuide);

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, guideValidation, createGuide);
router.put("/:id", authenticateToken, requireAdmin, guideValidation, updateGuide);
router.delete("/:id", authenticateToken, requireAdmin, deleteGuide);
router.patch("/:id/status", authenticateToken, requireAdmin, toggleGuideStatus);

export default router;
