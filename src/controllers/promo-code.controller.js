import { validationResult } from "express-validator";
import { PromoCodeModel, normalizePromoCode } from "../models/promo-code.model.js";

export const INVALID_PROMO_MESSAGE = "Invalid or expired promo code.";

/** Shape DB rows for the API (camelCase + booleans). */
function serialize(row) {
  return {
    id: row.id,
    code: row.code,
    discountPercent: Number(row.discount_percent),
    isActive: !!row.is_active,
    createdAt: row.created_at,
  };
}

/* ───────────────────────── Admin ───────────────────────── */

/** GET /api/admin/promo-codes */
export async function listPromoCodes(_req, res) {
  try {
    const rows = await PromoCodeModel.findAll();
    res.json({ promoCodes: rows.map(serialize) });
  } catch (err) {
    console.error("List promo codes error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch promo codes" });
  }
}

/** POST /api/admin/promo-codes  { code, discountPercent } */
export async function createPromoCode(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const code = normalizePromoCode(req.body.code);
    const discountPercent = Number(req.body.discountPercent);

    const id = await PromoCodeModel.create({ code, discountPercent });
    const created = await PromoCodeModel.findById(id);
    res.status(201).json({ message: `Promo code ${code} created`, promoCode: serialize(created) });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A promo code with this name already exists" });
    }
    console.error("Create promo code error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to create promo code" });
  }
}

/** PATCH /api/admin/promo-codes/:id  { isActive? } — sets the flag, or toggles it if omitted */
export async function togglePromoCode(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid promo code ID" });
    }

    const existing = await PromoCodeModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Promo code not found" });
    }

    const { isActive } = req.body ?? {};
    if (isActive !== undefined && typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    await PromoCodeModel.setActive(id, isActive);
    const updated = await PromoCodeModel.findById(id);
    res.json({
      message: `Promo code ${updated.code} ${updated.is_active ? "activated" : "deactivated"}`,
      promoCode: serialize(updated),
    });
  } catch (err) {
    console.error("Toggle promo code error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to update promo code" });
  }
}

/* ───────────────────────── User ───────────────────────── */

/** POST /api/promo/validate  { code } */
export async function validatePromoCode(req, res) {
  try {
    const code = normalizePromoCode(req.body?.code);
    if (!code) {
      return res.status(400).json({ error: "Please enter a promo code." });
    }

    const promo = await PromoCodeModel.findActiveByCode(code);
    if (!promo) {
      return res.status(404).json({ error: INVALID_PROMO_MESSAGE });
    }

    res.json({
      valid: true,
      code: promo.code,
      discountPercent: Number(promo.discount_percent),
    });
  } catch (err) {
    console.error("Validate promo code error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to validate promo code" });
  }
}
