import { validationResult } from "express-validator";
import { BookingModel } from "../models/booking.model.js";

/** POST /api/bookings — authenticated users */
export async function createBooking(req, res) {
  try {
    if (req.user?.role === "admin") {
      return res.status(403).json({ error: "Admins are not allowed to make bookings" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, phoneNumber, selectedTour, travelDate, adults, kids, room } = req.body;

    const id = await BookingModel.create({
      userId: req.user.id,
      fullName,
      phoneNumber,
      email: req.user.email || "",
      selectedTour: selectedTour || "",
      travelDate: travelDate || null,
      adults: Number(adults) || 1,
      kids: Number(kids) || 0,
      roomType: room || "Standard Double",
    });

    const booking = await BookingModel.findById(id);

    res.status(201).json({
      message: "Booking submitted successfully",
      booking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to submit booking" });
  }
}

/** GET /api/bookings — admin only */
export async function getAllBookings(req, res) {
  try {
    const { status } = req.query;
    const bookings = await BookingModel.findAll(status ? { status } : {});
    res.json({ bookings });
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch bookings" });
  }
}

/** GET /api/bookings/my — authenticated user's own bookings */
export async function getMyBookings(req, res) {
  try {
    const bookings = await BookingModel.findByUserId(req.user.id);
    res.json({ bookings });
  } catch (err) {
    console.error("Get my bookings error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch your bookings" });
  }
}

/** GET /api/bookings/:id — admin only */
export async function getBooking(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }
    const booking = await BookingModel.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json({ booking });
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch booking" });
  }
}

/** PATCH /api/bookings/:id/status — admin only */
export async function updateBookingStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const existing = await BookingModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await BookingModel.updateStatus(id, status);
    const updated = await BookingModel.findById(id);
    res.json({ message: "Booking status updated", booking: updated });
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to update booking status" });
  }
}

/** DELETE /api/bookings/:id — admin only */
export async function deleteBooking(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const existing = await BookingModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await BookingModel.delete(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to delete booking" });
  }
}
