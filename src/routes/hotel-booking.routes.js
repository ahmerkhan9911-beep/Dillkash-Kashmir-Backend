import { Router } from "express";
import {
  createHotelBooking,
  getMyHotelBookings,
  getAllHotelBookings,
  updateHotelBookingStatus,
  deleteHotelBooking,
} from "../controllers/hotel-booking.controller.js";
import { authenticateToken, optionalAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public / User route: Anyone can submit a room availability inquiry
router.post("/", optionalAuth, createHotelBooking);

// User route (authenticated): view own inquiries
router.get("/my", authenticateToken, getMyHotelBookings);

// Admin routes
router.get("/", authenticateToken, requireAdmin, getAllHotelBookings);
router.patch("/:id/status", authenticateToken, requireAdmin, updateHotelBookingStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteHotelBooking);

export default router;
