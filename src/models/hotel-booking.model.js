import pool from "../config/db.js";

export const HotelBookingModel = {
  /**
   * Create a new hotel booking.
   */
  async create({
    hotelId,
    userId,
    guestName,
    guestPhone,
    guestEmail = "",
    checkInDate,
    checkOutDate,
    guestsCount = 1,
    roomsCount = 1,
    roomType = "Standard",
    totalPrice,
  }) {
    const [result] = await pool.execute(
      `INSERT INTO hotel_bookings
        (hotel_id, user_id, guest_name, guest_phone, guest_email,
         check_in_date, check_out_date, guests_count, rooms_count, room_type, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        hotelId,
        userId || null,
        guestName,
        guestPhone,
        guestEmail,
        checkInDate,
        checkOutDate,
        guestsCount,
        roomsCount,
        roomType,
        totalPrice,
      ]
    );
    return result.insertId;
  },

  /** Find a booking by id. */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT hb.*, h.name AS hotel_name, h.location AS hotel_location
       FROM hotel_bookings hb
       JOIN hotels h ON h.id = hb.hotel_id
       WHERE hb.id = ?`,
      [id]
    );
    return rows[0] ?? null;
  },

  /** Get all hotel bookings (admin), optionally filtered by status. */
  async findAll({ status } = {}) {
    let sql = `
      SELECT hb.*, h.name AS hotel_name, h.location AS hotel_location,
             u.full_name AS user_full_name, u.email AS user_email
      FROM hotel_bookings hb
      LEFT JOIN hotels h ON h.id = hb.hotel_id
      LEFT JOIN users u ON u.id = hb.user_id
    `;
    const params = [];
    if (status) {
      sql += " WHERE hb.status = ?";
      params.push(status);
    }
    sql += " ORDER BY hb.created_at DESC";
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  /** Get all bookings for a specific user. */
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT hb.*, h.name AS hotel_name, h.location AS hotel_location, h.images AS hotel_images
       FROM hotel_bookings hb
       LEFT JOIN hotels h ON h.id = hb.hotel_id
       WHERE hb.user_id = ?
       ORDER BY hb.created_at DESC`,
      [userId]
    );
    return rows.map((row) => ({
      ...row,
      hotel_images: Array.isArray(row.hotel_images) ? row.hotel_images : [],
    }));
  },

  /** Update booking status. */
  async updateStatus(id, status) {
    await pool.execute(
      "UPDATE hotel_bookings SET status = ? WHERE id = ?",
      [status, id]
    );
  },

  /** Delete a booking. */
  async delete(id) {
    await pool.execute("DELETE FROM hotel_bookings WHERE id = ?", [id]);
  },

  /** Count all hotel bookings. */
  async countAll() {
    const [[row]] = await pool.execute("SELECT COUNT(*) AS cnt FROM hotel_bookings");
    return row.cnt;
  },

  /** Count pending hotel bookings. */
  async countPending() {
    const [[row]] = await pool.execute(
      "SELECT COUNT(*) AS cnt FROM hotel_bookings WHERE status = 'Pending'"
    );
    return row.cnt;
  },
};
