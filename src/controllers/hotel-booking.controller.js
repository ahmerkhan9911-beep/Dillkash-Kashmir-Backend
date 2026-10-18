import { HotelBookingModel } from "../models/hotel-booking.model.js";
import { HotelModel } from "../models/hotel.model.js";

/** POST /api/hotel-bookings — lead generation inquiry */
export async function createHotelBooking(req, res) {
  try {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      guestsCount,
      roomsCount,
      guestName,
      guestPhone,
      guestEmail,
    } = req.body;

    if (!hotelId) {
      return res.status(400).json({ error: "hotelId is required" });
    }

    if (!guestName || !guestName.trim()) {
      return res.status(400).json({ error: "Your name is required" });
    }

    if (!guestPhone || !guestPhone.trim()) {
      return res.status(400).json({ error: "Phone / WhatsApp number is required" });
    }

    // Verify hotel exists
    const hotel = await HotelModel.findByIdOrSlug(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    const bookingId = await HotelBookingModel.create({
      hotelId,
      userId: req.user?.id || null,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail ? guestEmail.trim() : (req.user?.email || ""),
      checkInDate: checkInDate || new Date().toISOString().split("T")[0],
      checkOutDate: checkOutDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      guestsCount: Math.max(1, parseInt(guestsCount, 10) || 1),
      roomsCount: Math.max(1, parseInt(roomsCount, 10) || 1),
      roomType: "Standard",
      totalPrice: Number(hotel.pricePerNight) || 0,
    });

    const booking = await HotelBookingModel.findById(bookingId);
    res.status(201).json({
      message: "Your request has been sent! Our team will confirm room availability with the hotel and contact you shortly.",
      booking,
    });
  } catch (err) {
    console.error("Create hotel booking error:", err);
    res.status(500).json({ error: "Failed to submit room availability request" });
  }
}

/** GET /api/hotel-bookings/my — user's own hotel bookings */
export async function getMyHotelBookings(req, res) {
  try {
    const bookings = await HotelBookingModel.findByUserId(req.user.id);
    res.json({ bookings });
  } catch (err) {
    console.error("Get my hotel bookings error:", err);
    res.status(500).json({ error: "Failed to fetch hotel bookings" });
  }
}

/** GET /api/hotel-bookings — admin only */
export async function getAllHotelBookings(req, res) {
  try {
    const { status } = req.query;
    const bookings = await HotelBookingModel.findAll({ status: status || undefined });
    res.json({ bookings });
  } catch (err) {
    console.error("Get all hotel bookings error:", err);
    res.status(500).json({ error: "Failed to fetch hotel bookings" });
  }
}

/** PATCH /api/hotel-bookings/:id/status — admin only */
export async function updateHotelBookingStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid booking ID" });

    const { status } = req.body;
    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await HotelBookingModel.updateStatus(id, status);
    const booking = await HotelBookingModel.findById(id);
    res.json({ message: "Status updated", booking });
  } catch (err) {
    console.error("Update hotel booking status error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
}

/** DELETE /api/hotel-bookings/:id — admin only */
export async function deleteHotelBooking(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid booking ID" });

    await HotelBookingModel.delete(id);
    res.json({ message: "Hotel booking deleted" });
  } catch (err) {
    console.error("Delete hotel booking error:", err);
    res.status(500).json({ error: "Failed to delete hotel booking" });
  }
}
