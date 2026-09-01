import { Router } from "express";
import {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  getStats,
} from "../controllers/package.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { packageValidation } from "../utils/validators.js";

const router = Router();

// Public routes
router.get("/", getAllPackages);
router.get("/admin/stats", authenticateToken, requireAdmin, getStats);
router.get("/:idOrSlug", getPackage);

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, packageValidation, createPackage);
router.put("/:id", authenticateToken, requireAdmin, packageValidation, updatePackage);
router.delete("/:id", authenticateToken, requireAdmin, deletePackage);
router.patch("/:id/status", authenticateToken, requireAdmin, togglePackageStatus);

export default router;
