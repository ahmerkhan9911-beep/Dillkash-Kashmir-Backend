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
   * Get a single hotel by numeric ID or string slug.
   */
  async findByIdOrSlug(idOrSlug) {
    const isNumeric = /^\d+$/.test(String(idOrSlug));
    const [rows] = await pool.execute(
      `SELECT * FROM hotels WHERE ${isNumeric ? "id" : "slug"} = ?`,
      [idOrSlug]
    );
    const hotel = rows[0];
    return hotel ? normalizeHotel(hotel) : null;
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
        description, images, amenities, featured, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      ]
    );
    return result.insertId;
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
        is_active = ?
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
        id,
      ]
    );
  },

  /**
   * Delete a hotel.
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
 * mysql2 auto-parses JSON columns, but we ensure arrays are always present.
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
  };
}
