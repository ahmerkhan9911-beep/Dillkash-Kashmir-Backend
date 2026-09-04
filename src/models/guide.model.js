import pool from "../config/db.js";

export const GuideModel = {
  /**
   * Get all guides, optionally filtered to active-only.
   */
  async findAll({ activeOnly = true } = {}) {
    let sql = "SELECT * FROM guides";
    if (activeOnly) sql += " WHERE is_active = 1";
    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute(sql);
    return rows;
  },

  /**
   * Get a single guide by ID.
   */
  async findById(id) {
    const [rows] = await pool.execute("SELECT * FROM guides WHERE id = ?", [id]);
    return rows[0] || null;
  },

  /**
   * Create a new guide.
   */
  async create(data) {
    const [result] = await pool.execute(
      `INSERT INTO guides (name, role, experience, bio, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.role,
        data.experience || 1,
        data.bio || "",
        data.image_url || "",
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
      ]
    );
    return result.insertId;
  },

  /**
   * Update an existing guide.
   */
  async update(id, data) {
    await pool.execute(
      `UPDATE guides SET
        name = ?,
        role = ?,
        experience = ?,
        bio = ?,
        image_url = ?,
        is_active = ?
      WHERE id = ?`,
      [
        data.name,
        data.role,
        data.experience || 1,
        data.bio || "",
        data.image_url || "",
        data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
        id,
      ]
    );
  },

  /**
   * Delete a guide.
   */
  async delete(id) {
    await pool.execute("DELETE FROM guides WHERE id = ?", [id]);
  },

  /**
   * Toggle is_active flag.
   */
  async toggleStatus(id) {
    await pool.execute(
      "UPDATE guides SET is_active = NOT is_active WHERE id = ?",
      [id]
    );
  },

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM guides");
    return rows[0].count;
  },

  async countActive() {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM guides WHERE is_active = 1"
    );
    return rows[0].count;
  },
};
