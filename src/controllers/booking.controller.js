import { validationResult } from "express-validator";
import { BookingModel } from "../models/booking.model.js";
import { PackageModel } from "../models/package.model.js";
import { UserModel } from "../models/user.model.js";
import { PromoCodeModel, calculateDiscount, normalizePromoCode } from "../models/promo-code.model.js";
import { INVALID_PROMO_MESSAGE } from "./promo-code.controller.js";

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

    const { fullName, phoneNumber, selectedTour, travelDate, persons, room, promoCode } = req.body;
    const personCount = Number(persons) || 1;

    // ── Server-side pricing (never trust prices sent by the client) ──
    // Price comes from the DB package + the user's city stored in the DB.
    let originalPrice = null;
    const pkg = await PackageModel.findPricingByTitle(selectedTour);
    if (pkg) {
      const dbUser = await UserModel.findById(req.user.id);
      const unitPrice = dbUser?.city === "Islamabad" ? Number(pkg.price_islamabad) : Number(pkg.price_lahore);
      originalPrice = Math.round(unitPrice * personCount);
    }

    // ── Promo code verification ──
    let appliedPromo = null;
    let discountAmount = null;
    let totalPrice = originalPrice;

    const normalizedPromo = normalizePromoCode(promoCode);
    if (normalizedPromo) {
      const promo = await PromoCodeModel.findActiveByCode(normalizedPromo);
      if (!promo) {
        return res.status(400).json({ error: INVALID_PROMO_MESSAGE });
      }
      if (originalPrice === null) {
        return res.status(400).json({
          error: "We couldn't verify the price for this tour, so the promo code can't be applied. Please choose a listed package or remove the code.",
        });
      }
      const result = calculateDiscount(originalPrice, Number(promo.discount_percent));
      appliedPromo = promo.code;
      discountAmount = result.discountAmount;
      totalPrice = result.finalPrice;
    }

    const id = await BookingModel.create({
      userId: req.user.id,
      fullName,
      phoneNumber,
      email: req.user.email || "",
      selectedTour: selectedTour || "",
      travelDate: travelDate || null,
      persons: personCount,
      roomType: room || "Standard Double",
      totalPrice,
      appliedPromo,
      discountAmount,
    });

    const booking = await BookingModel.findById(id);

    res.status(201).json({
      message: "Booking submitted successfully",
      booking,
      pricing: {
        originalPrice,
        discountAmount: discountAmount ?? 0,
        totalPrice,
        appliedPromo,
      },
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
