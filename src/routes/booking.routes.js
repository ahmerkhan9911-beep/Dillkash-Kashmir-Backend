import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/booking.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { bookingValidation } from "../utils/validators.js";

const router = Router();

// Public — anyone can submit a booking
router.post("/", bookingValidation, createBooking);

// Admin-only routes
router.get("/", authenticateToken, requireAdmin, getAllBookings);
router.get("/:id", authenticateToken, requireAdmin, getBooking);
router.patch("/:id/status", authenticateToken, requireAdmin, updateBookingStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteBooking);

export default router;
