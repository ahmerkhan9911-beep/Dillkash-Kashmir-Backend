import express from "express";
import {
  createCustomTour,
  getAllCustomTours,
  getCustomTour,
  getMyCustomTours,
  updateCustomTourStatus,
  deleteCustomTour,
} from "../controllers/custom-tour.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { body } from "express-validator";

const router = express.Router();

const customTourValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("phoneNumber").trim().notEmpty().withMessage("Phone number is required"),
];

// Authenticated — logged-in users can submit a custom tour request
router.post("/", authenticateToken, customTourValidation, createCustomTour);

// Authenticated — get own custom tour requests (must be before /:id)
router.get("/my", authenticateToken, getMyCustomTours);

// Admin-only routes
router.get("/", authenticateToken, requireAdmin, getAllCustomTours);
router.get("/:id", authenticateToken, requireAdmin, getCustomTour);
router.patch("/:id/status", authenticateToken, requireAdmin, updateCustomTourStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteCustomTour);

export default router;
