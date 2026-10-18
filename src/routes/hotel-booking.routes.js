import { Router } from "express";
import {
  createHotelBooking,
  getMyHotelBookings,
  getAllHotelBookings,
  updateHotelBookingStatus,
  deleteHotelBooking,
} from "../controllers/hotel-booking.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// User routes (authenticated)
router.post("/", authenticateToken, createHotelBooking);
router.get("/my", authenticateToken, getMyHotelBookings);

// Admin routes
router.get("/", authenticateToken, requireAdmin, getAllHotelBookings);
router.patch("/:id/status", authenticateToken, requireAdmin, updateHotelBookingStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteHotelBooking);

export default router;
