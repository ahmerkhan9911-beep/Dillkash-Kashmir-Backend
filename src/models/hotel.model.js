import pool from "../config/db.js";

export const HotelModel = {
  /**
   * Get all hotels, optionally filtered to active-only.
   * JSON columns (images, amenities) are parsed automatically by mysql2.
   */
  async findAll({ activeOnly = true } = {}) {
    let sql = "SELECT * FROM hotels";
    if (activeOnly) sql += " WHERE is_active = 1";
    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(sql);
    return rows.map(normalizeHotel);
  },

  /**
   * Get a single hotel by numeric ID or string slug — with rooms.
   */
  async findByIdOrSlug(idOrSlug) {
    const isNumeric = /^\d+$/.test(String(idOrSlug));
    const [hotelRows] = await pool.execute(
      `SELECT * FROM hotels WHERE ${isNumeric ? "id" : "slug"} = ?`,
      [idOrSlug]
    );
    const hotel = hotelRows[0];
    if (!hotel) return null;

    // Fetch rooms for this hotel
    const [roomRows] = await pool.execute(
      "SELECT * FROM hotel_rooms WHERE hotel_id = ? ORDER BY price_per_night ASC",
      [hotel.id]
    );

    return { ...normalizeHotel(hotel), rooms: roomRows.map(normalizeRoom) };
  },

  /**
   * Create a new hotel.
   */
  async create(data) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const [result] = await pool.execute(
      `INSERT INTO hotels (
        slug, name, location, star_rating, price_per_night,
        description, images, amenities, featured, is_active,
        check_in_time, check_out_time, cancellation_policy, house_rules
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        data.name,
        data.location || "",
        data.star_rating || data.starRating || 3,
        data.price_per_night || data.pricePerNight || 0,
        data.description || "",
        JSON.stringify(data.images || []),
        JSON.stringify(data.amenities || []),
        data.featured ? 1 : 0,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
        data.check_in_time || data.checkInTime || "2:00 PM",
        data.check_out_time || data.checkOutTime || "12:00 PM",
        data.cancellation_policy || data.cancellationPolicy || "",
        data.house_rules || data.houseRules || "",
      ]
    );

    const hotelId = result.insertId;

    // Insert rooms if provided
    if (Array.isArray(data.rooms) && data.rooms.length > 0) {
      for (const room of data.rooms) {
        await pool.execute(
          `INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, max_guests, available_rooms)
           VALUES (?, ?, ?, ?, ?)`,
          [
            hotelId,
            room.roomType || room.room_type || "Standard",
            room.pricePerNight || room.price_per_night || 0,
            room.maxGuests || room.max_guests || 2,
            room.availableRooms || room.available_rooms || 1,
          ]
        );
      }
    }

    return hotelId;
  },

  /**
   * Update an existing hotel.
   */
  async update(id, data) {
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    await pool.execute(
      `UPDATE hotels SET
        slug = ?,
        name = ?,
        location = ?,
        star_rating = ?,
        price_per_night = ?,
        description = ?,
        images = ?,
        amenities = ?,
        featured = ?,
        is_active = ?,
        check_in_time = ?,
        check_out_time = ?,
        cancellation_policy = ?,
        house_rules = ?
      WHERE id = ?`,
      [
        slug,
        data.name,
        data.location || "",
        data.star_rating || data.starRating || 3,
        data.price_per_night || data.pricePerNight || 0,
        data.description || "",
        JSON.stringify(data.images || []),
        JSON.stringify(data.amenities || []),
        data.featured ? 1 : 0,
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
        data.check_in_time || data.checkInTime || "2:00 PM",
        data.check_out_time || data.checkOutTime || "12:00 PM",
        data.cancellation_policy || data.cancellationPolicy || "",
        data.house_rules || data.houseRules || "",
        id,
      ]
    );

    // Update rooms — delete existing and re-insert
    if (Array.isArray(data.rooms)) {
      await pool.execute("DELETE FROM hotel_rooms WHERE hotel_id = ?", [id]);
      for (const room of data.rooms) {
        await pool.execute(
          `INSERT INTO hotel_rooms (hotel_id, room_type, price_per_night, max_guests, available_rooms)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            room.roomType || room.room_type || "Standard",
            room.pricePerNight || room.price_per_night || 0,
            room.maxGuests || room.max_guests || 2,
            room.availableRooms || room.available_rooms || 1,
          ]
        );
      }
    }
  },

  /**
   * Delete a hotel (also cascades rooms via FK).
   */
  async delete(id) {
    await pool.execute("DELETE FROM hotels WHERE id = ?", [id]);
  },

  /**
   * Toggle is_active flag.
   */
  async toggleStatus(id) {
    await pool.execute(
      "UPDATE hotels SET is_active = NOT is_active WHERE id = ?",
      [id]
    );
  },

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM hotels");
    return rows[0].count;
  },

  async countActive() {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM hotels WHERE is_active = 1"
    );
    return rows[0].count;
  },
};

/**
 * Normalize a raw DB row into a consistent shape.
 */
function normalizeHotel(row) {
  return {
    ...row,
    images: Array.isArray(row.images) ? row.images : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    // Map snake_case DB columns to camelCase for frontend compatibility
    starRating: row.star_rating,
    pricePerNight: Number(row.price_per_night),
    featured: !!row.featured,
    is_active: !!row.is_active,
    checkInTime: row.check_in_time || "2:00 PM",
    checkOutTime: row.check_out_time || "12:00 PM",
    cancellationPolicy: row.cancellation_policy || "",
    houseRules: row.house_rules || "",
  };
}

function normalizeRoom(row) {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    roomType: row.room_type,
    pricePerNight: Number(row.price_per_night),
    maxGuests: row.max_guests,
    availableRooms: row.available_rooms,
  };
}
