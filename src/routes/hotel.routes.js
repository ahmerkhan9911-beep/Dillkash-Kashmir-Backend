import { Router } from "express";
import {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  toggleHotelStatus,
} from "../controllers/hotel.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { hotelValidation } from "../utils/validators.js";

const router = Router();

// Public routes
router.get("/", getAllHotels);
router.get("/:idOrSlug", getHotel);

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, hotelValidation, createHotel);
router.put("/:id", authenticateToken, requireAdmin, hotelValidation, updateHotel);
router.delete("/:id", authenticateToken, requireAdmin, deleteHotel);
router.patch("/:id/status", authenticateToken, requireAdmin, toggleHotelStatus);

export default router;
