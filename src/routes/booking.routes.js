import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBooking,
  getMyBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/booking.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { bookingValidation } from "../utils/validators.js";

const router = Router();

// Authenticated — logged-in users can submit a booking
router.post("/", authenticateToken, bookingValidation, createBooking);

// Authenticated — get own bookings (must be before /:id to avoid route conflict)
router.get("/my", authenticateToken, getMyBookings);

// Admin-only routes
router.get("/", authenticateToken, requireAdmin, getAllBookings);
router.get("/:id", authenticateToken, requireAdmin, getBooking);
router.patch("/:id/status", authenticateToken, requireAdmin, updateBookingStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteBooking);

export default router;
