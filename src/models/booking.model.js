import pool from "../config/db.js";

export const BookingModel = {
  /**
   * Create a new booking record.
   * @param {object} data
   * @param {number|null} [data.userId]
   * @param {string} data.fullName
   * @param {string} data.phoneNumber
   * @param {string} [data.email]
   * @param {string} [data.selectedTour]
   * @param {string} [data.travelDate]   - ISO date string "YYYY-MM-DD"
   * @param {number} [data.persons]
   * @param {string} [data.roomType]
   * @returns {Promise<number>} The inserted row's id.
   */
  async create({ userId = null, fullName, phoneNumber, email = "", selectedTour = "", travelDate = null, persons = 1, roomType = "Standard Double" }) {
    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, full_name, phone_number, email, selected_tour, travel_date, persons, room_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, phoneNumber, email, selectedTour, travelDate || null, persons, roomType]
    );
    return result.insertId;
  },

  /**
   * Find a booking by id.
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE id = ?",
      [id]
    );
    return rows[0] ?? null;
  },

  /**
   * Get all bookings, newest first.
   * @param {{ status?: string }} [filters]
   * @returns {Promise<object[]>}
   */
  async findAll({ status } = {}) {
    let sql = "SELECT * FROM bookings";
    const params = [];
    if (status) {
      sql += " WHERE status = ?";
      params.push(status);
    }
    sql += " ORDER BY created_at DESC";
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  /**
   * Get all bookings for a specific user, newest first.
   * @param {number} userId
   * @returns {Promise<object[]>}
   */
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  },

  /**
   * Update a booking's status.
   * @param {number} id
   * @param {'Pending'|'Confirmed'|'Cancelled'} status
   * @returns {Promise<void>}
   */
  async updateStatus(id, status) {
    await pool.execute(
      "UPDATE bookings SET status = ? WHERE id = ?",
      [status, id]
    );
  },

  /**
   * Delete a booking by id.
   * @param {number} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    await pool.execute("DELETE FROM bookings WHERE id = ?", [id]);
  },

  /**
   * Count all bookings (for dashboard stats).
   * @returns {Promise<number>}
   */
  async countAll() {
    const [[row]] = await pool.execute("SELECT COUNT(*) AS cnt FROM bookings");
    return row.cnt;
  },

  /**
   * Count bookings with Pending status.
   * @returns {Promise<number>}
   */
  async countPending() {
    const [[row]] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM bookings WHERE status = 'Pending'"
    );
    return row.cnt;
  },
};
