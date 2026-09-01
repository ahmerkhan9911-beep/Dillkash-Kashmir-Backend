import pool from "../config/db.js";

export const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, full_name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  async create({ full_name, email, phone, password_hash, role = "user" }) {
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, phone, password_hash, role]
    );
    return result.insertId;
  },

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) as total FROM users");
    return rows[0].total;
  },
};
