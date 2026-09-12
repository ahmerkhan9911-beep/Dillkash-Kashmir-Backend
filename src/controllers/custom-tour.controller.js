import { validationResult } from "express-validator";
import { CustomTourModel } from "../models/custom-tour.model.js";

/** POST /api/custom-tours — authenticated users */
export async function createCustomTour(req, res) {
  try {
    if (req.user?.role === "admin") {
      return res.status(403).json({ error: "Admins are not allowed to make custom tour requests" });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      phoneNumber,
      preferredDate,
      adults,
      kids,
      hotelPreference,
      transportPreference,
      preferredDestinations,
      message,
    } = req.body;

    const id = await CustomTourModel.create({
      userId: req.user.id,
      name,
      phoneNumber,
      email: req.user.email || "",
      preferredDate: preferredDate || null,
      adults: Number(adults) || 1,
      kids: Number(kids) || 0,
      hotelPreference,
      transportPreference,
      preferredDestinations,
      message,
    });

    const request = await CustomTourModel.findById(id);

    res.status(201).json({
      message: "Custom tour request submitted successfully",
      request,
    });
  } catch (err) {
    console.error("Create custom tour error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to submit request" });
  }
}

/** GET /api/custom-tours — admin only */
export async function getAllCustomTours(req, res) {
  try {
    const { status } = req.query;
    const requests = await CustomTourModel.findAll(status ? { status } : {});
    res.json({ requests });
  } catch (err) {
    console.error("Get custom tours error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch requests" });
  }
}

/** GET /api/custom-tours/my — authenticated user's own requests */
export async function getMyCustomTours(req, res) {
  try {
    const requests = await CustomTourModel.findByUserId(req.user.id);
    res.json({ requests });
  } catch (err) {
    console.error("Get my custom tours error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch your requests" });
  }
}

/** GET /api/custom-tours/:id — admin only */
export async function getCustomTour(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }
    const request = await CustomTourModel.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ request });
  } catch (err) {
    console.error("Get custom tour error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to fetch request" });
  }
}

/** PATCH /api/custom-tours/:id/status — admin only */
export async function updateCustomTourStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const { status } = req.body;
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const existing = await CustomTourModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    await CustomTourModel.updateStatus(id, status);
    const updated = await CustomTourModel.findById(id);
    res.json({ message: "Status updated successfully", request: updated });
  } catch (err) {
    console.error("Update custom tour status error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to update status" });
  }
}

/** DELETE /api/custom-tours/:id — admin only */
export async function deleteCustomTour(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid request ID" });
    }

    const existing = await CustomTourModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    await CustomTourModel.delete(id);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("Delete custom tour error:", err);
    res.status(500).json({ error: "Database Error", details: err.message || "Failed to delete request" });
  }
}
