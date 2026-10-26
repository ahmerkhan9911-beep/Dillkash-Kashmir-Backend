import pool from "../config/db.js";

export const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows[0] && rows[0].city === undefined) {
      rows[0].city = "Lahore";
    }
    return rows[0] || null;
  },

  async findById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, full_name, email, phone, city, role, created_at, updated_at FROM users WHERE id = ?",
        [id]
      );
      return rows[0] || null;
    } catch (err) {
      if (err.code === "ER_BAD_FIELD_ERROR" && err.message?.includes("city")) {
        const [rows] = await pool.execute(
          "SELECT id, full_name, email, phone, role, created_at, updated_at FROM users WHERE id = ?",
          [id]
        );
        if (rows[0]) {
          rows[0].city = "Lahore";
        }
        return rows[0] || null;
      }
      throw err;
    }
  },

  async create({ full_name, email, phone, city = "Lahore", password_hash, role = "user" }) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO users (full_name, email, phone, city, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [full_name, email, phone, city, password_hash, role]
      );
      return result.insertId;
    } catch (err) {
      if (err.code === "ER_BAD_FIELD_ERROR" && err.message?.includes("city")) {
        console.warn("[UserModel] 'city' column not found in users table. Inserting without city column...");
        const [result] = await pool.execute(
          `INSERT INTO users (full_name, email, phone, password_hash, role)
           VALUES (?, ?, ?, ?, ?)`,
          [full_name, email, phone, password_hash, role]
        );
        return result.insertId;
      }
      throw err;
    }
  },

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) as total FROM users");
    return rows[0].total;
  },
};

