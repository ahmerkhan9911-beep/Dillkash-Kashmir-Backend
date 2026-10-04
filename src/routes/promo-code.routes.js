import { Router } from "express";
import {
  listPromoCodes,
  createPromoCode,
  togglePromoCode,
  validatePromoCode,
} from "../controllers/promo-code.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { promoCodeValidation } from "../utils/validators.js";

/* Admin: mounted at /api/admin/promo-codes */
export const adminPromoRouter = Router();
adminPromoRouter.use(authenticateToken, requireAdmin);
adminPromoRouter.get("/", listPromoCodes);
adminPromoRouter.post("/", promoCodeValidation, createPromoCode);
adminPromoRouter.patch("/:id", togglePromoCode);

/* User: mounted at /api/promo */
export const promoRouter = Router();
promoRouter.post("/validate", authenticateToken, validatePromoCode);
