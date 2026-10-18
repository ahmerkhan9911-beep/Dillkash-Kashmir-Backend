import { HotelBookingModel } from "../models/hotel-booking.model.js";
import { HotelModel } from "../models/hotel.model.js";

/** POST /api/hotel-bookings — authenticated users only */
export async function createHotelBooking(req, res) {
  try {
    const {
      hotelId,
      checkInDate,
      checkOutDate,
      guestsCount,
      roomsCount,
      roomType,
      guestName,
      guestPhone,
      guestEmail,
    } = req.body;

    if (!hotelId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "hotelId, checkInDate, checkOutDate are required" });
    }

    // Verify hotel exists
    const hotel = await HotelModel.findByIdOrSlug(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    // Calculate total price: nights * rooms * pricePerNight
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));

    // Use room price if a room type is specified and found
    let pricePerNight = hotel.pricePerNight;
    if (roomType && hotel.rooms) {
      const room = hotel.rooms.find((r) => r.roomType === roomType);
      if (room) pricePerNight = room.pricePerNight;
    }

    const totalPrice = nights * (roomsCount || 1) * pricePerNight;

    const bookingId = await HotelBookingModel.create({
      hotelId,
      userId: req.user?.id || null,
      guestName: guestName || req.user?.full_name || "Guest",
      guestPhone: guestPhone || req.user?.phone || "",
      guestEmail: guestEmail || req.user?.email || "",
      checkInDate,
      checkOutDate,
      guestsCount: guestsCount || 1,
      roomsCount: roomsCount || 1,
      roomType: roomType || "Standard",
      totalPrice,
    });

    const booking = await HotelBookingModel.findById(bookingId);
    res.status(201).json({ message: "Hotel booking submitted successfully", booking });
  } catch (err) {
    console.error("Create hotel booking error:", err);
    res.status(500).json({ error: "Failed to create hotel booking" });
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
