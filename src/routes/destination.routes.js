import { Router } from "express";
import {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  toggleDestinationStatus,
} from "../controllers/destination.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { destinationValidation } from "../utils/validators.js";

const router = Router();

// Public routes
router.get("/", getAllDestinations);
router.get("/:idOrSlug", getDestination);

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, destinationValidation, createDestination);
router.put("/:id", authenticateToken, requireAdmin, destinationValidation, updateDestination);
router.delete("/:id", authenticateToken, requireAdmin, deleteDestination);
router.patch("/:id/status", authenticateToken, requireAdmin, toggleDestinationStatus);

export default router;
