import pool from "../config/db.js";

/** Normalize user-entered promo codes: trimmed + uppercase. */
export function normalizePromoCode(code) {
  return String(code ?? "").trim().toUpperCase();
}

/**
 * Compute a discount in whole PKR. Shared by the validate endpoint and booking
 * creation so the frontend and backend always agree on rounding.
 * @param {number} originalPrice
 * @param {number} discountPercent
 */
export function calculateDiscount(originalPrice, discountPercent) {
  const discountAmount = Math.round((originalPrice * discountPercent) / 100);
  return {
    discountAmount,
    finalPrice: Math.max(0, originalPrice - discountAmount),
  };
}

export const PromoCodeModel = {
  /**
   * List all promo codes, newest first.
   * @returns {Promise<object[]>}
   */
  async findAll() {
    const [rows] = await pool.execute(
      "SELECT id, code, discount_percent, is_active, created_at FROM promo_codes ORDER BY created_at DESC, id DESC"
    );
    return rows;
  },

  /**
   * @param {number} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, code, discount_percent, is_active, created_at FROM promo_codes WHERE id = ?",
      [id]
    );
    return rows[0] ?? null;
  },

  /**
   * Find an ACTIVE promo code by its (normalized) code string.
   * @param {string} code
   * @returns {Promise<object|null>}
   */
  async findActiveByCode(code) {
    const normalized = normalizePromoCode(code);
    if (!normalized) return null;
    const [rows] = await pool.execute(
      "SELECT id, code, discount_percent, is_active, created_at FROM promo_codes WHERE code = ? AND is_active = 1",
      [normalized]
    );
    return rows[0] ?? null;
  },

  /**
   * @param {{ code: string, discountPercent: number }} data
   * @returns {Promise<number>} inserted id
   */
  async create({ code, discountPercent }) {
    const [result] = await pool.execute(
      "INSERT INTO promo_codes (code, discount_percent) VALUES (?, ?)",
      [normalizePromoCode(code), discountPercent]
    );
    return result.insertId;
  },

  /**
   * Set (or toggle when isActive is undefined) a promo code's active flag.
   * @param {number} id
   * @param {boolean} [isActive]
   */
  async setActive(id, isActive) {
    if (typeof isActive === "boolean") {
      await pool.execute("UPDATE promo_codes SET is_active = ? WHERE id = ?", [isActive ? 1 : 0, id]);
    } else {
      await pool.execute("UPDATE promo_codes SET is_active = NOT is_active WHERE id = ?", [id]);
    }
  },
};
