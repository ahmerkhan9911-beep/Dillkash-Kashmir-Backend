import { validationResult } from "express-validator";
import { HotelModel } from "../models/hotel.model.js";

/** GET /api/hotels — public (active only) or admin (?all=true) */
export async function getAllHotels(req, res) {
  try {
    const activeOnly = req.query.all !== "true";
    const hotels = await HotelModel.findAll({ activeOnly });
    res.json({ hotels });
  } catch (err) {
    console.error("Get hotels error:", err);
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
}

/** GET /api/hotels/:idOrSlug */
export async function getHotel(req, res) {
  try {
    const hotel = await HotelModel.findByIdOrSlug(req.params.idOrSlug);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json({ hotel });
  } catch (err) {
    console.error("Get hotel error:", err);
    res.status(500).json({ error: "Failed to fetch hotel" });
  }
}

/** POST /api/hotels — admin only */
export async function createHotel(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hotelId = await HotelModel.create(req.body);
    const hotel = await HotelModel.findByIdOrSlug(hotelId);

    res.status(201).json({ message: "Hotel created successfully", hotel });
  } catch (err) {
    console.error("Create hotel error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "A hotel with this slug already exists" });
    }
    res.status(500).json({ error: "Failed to create hotel" });
  }
}

/** PUT /api/hotels/:id — admin only */
export async function updateHotel(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid hotel ID" });
    }

    const existing = await HotelModel.findByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    await HotelModel.update(id, req.body);
    const updated = await HotelModel.findByIdOrSlug(id);

    res.json({ message: "Hotel updated successfully", hotel: updated });
  } catch (err) {
    console.error("Update hotel error:", err);
    res.status(500).json({ error: "Failed to update hotel" });
  }
}

/** DELETE /api/hotels/:id — admin only */
export async function deleteHotel(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid hotel ID" });
    }

    const existing = await HotelModel.findByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: "Hotel not found" });
    }

    await HotelModel.delete(id);
    res.json({ message: "Hotel deleted successfully" });
  } catch (err) {
    console.error("Delete hotel error:", err);
    res.status(500).json({ error: "Failed to delete hotel" });
  }
}

/** PATCH /api/hotels/:id/status — admin only */
export async function toggleHotelStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid hotel ID" });
    }

    await HotelModel.toggleStatus(id);
    const updated = await HotelModel.findByIdOrSlug(id);

    res.json({ message: "Status updated", hotel: updated });
  } catch (err) {
    console.error("Toggle hotel status error:", err);
    res.status(500).json({ error: "Failed to toggle status" });
  }
}
