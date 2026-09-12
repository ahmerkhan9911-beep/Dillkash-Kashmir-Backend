import pool from "../config/db.js";

export const CustomTourModel = {
  async create({
    userId = null,
    name,
    phoneNumber,
    email = "",
    preferredDate,
    adults,
    kids,
    hotelPreference,
    transportPreference,
    preferredDestinations,
    message,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO custom_tour_requests (
        user_id, name, phone_number, email, preferred_date, adults, kids, 
        hotel_preference, transport_preference, preferred_destinations, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        phoneNumber,
        email,
        preferredDate || null,
        adults || 1,
        kids || 0,
        hotelPreference || "",
        transportPreference || "",
        JSON.stringify(preferredDestinations || []),
        message || "",
      ]
    );
    return result.insertId;
  },

  async findAll(filters = {}) {
    let sql = "SELECT * FROM custom_tour_requests";
    const params = [];

    if (filters.status) {
      sql += " WHERE status = ?";
      params.push(filters.status);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM custom_tour_requests WHERE id = ?", [id]);
    return rows[0] || null;
  },

  /**
   * Get all custom tour requests for a specific user, newest first.
   * @param {number} userId
   * @returns {Promise<object[]>}
   */
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM custom_tour_requests WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  },

  async updateStatus(id, status) {
    await pool.execute("UPDATE custom_tour_requests SET status = ? WHERE id = ?", [status, id]);
  },

  async delete(id) {
    await pool.execute("DELETE FROM custom_tour_requests WHERE id = ?", [id]);
  },

  async countPending() {
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM custom_tour_requests WHERE status = 'Pending'");
    return rows[0].count;
  },
};
