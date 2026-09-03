import { validationResult } from "express-validator";
import { DestinationModel } from "../models/destination.model.js";

/** GET /api/destinations — public */
export async function getAllDestinations(req, res) {
  try {
    const activeOnly = req.query.all !== "true"; // admin can pass ?all=true
    const destinations = await DestinationModel.findAll({ activeOnly });
    res.json({ destinations });
  } catch (err) {
    console.error("Get destinations error:", err);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
}

/** GET /api/destinations/:idOrSlug — public */
export async function getDestination(req, res) {
  try {
    const destination = await DestinationModel.findByIdOrSlug(req.params.idOrSlug);
    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }
    res.json({ destination });
  } catch (err) {
    console.error("Get destination error:", err);
    res.status(500).json({ error: "Failed to fetch destination" });
  }
}

/** POST /api/destinations — admin only */
export async function createDestination(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const destinationId = await DestinationModel.create(req.body);
    const dest = await DestinationModel.findByIdOrSlug(destinationId);

    res.status(201).json({ message: "Destination created successfully", destination: dest });
  } catch (err) {
    console.error("Create destination error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "A destination with this slug already exists" });
    }
    res.status(500).json({ error: "Failed to create destination" });
  }
}

/** PUT /api/destinations/:id — admin only */
export async function updateDestination(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    const existing = await DestinationModel.findByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: "Destination not found" });
    }

    await DestinationModel.update(id, req.body);
    const updated = await DestinationModel.findByIdOrSlug(id);

    res.json({ message: "Destination updated successfully", destination: updated });
  } catch (err) {
    console.error("Update destination error:", err);
    res.status(500).json({ error: "Failed to update destination" });
  }
}

/** DELETE /api/destinations/:id — admin only */
export async function deleteDestination(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    const existing = await DestinationModel.findByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: "Destination not found" });
    }

    await DestinationModel.delete(id);
    res.json({ message: "Destination deleted successfully" });
  } catch (err) {
    console.error("Delete destination error:", err);
    res.status(500).json({ error: "Failed to delete destination" });
  }
}

/** PATCH /api/destinations/:id/status — admin only */
export async function toggleDestinationStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid destination ID" });
    }

    await DestinationModel.toggleStatus(id);
    const updated = await DestinationModel.findByIdOrSlug(id);

    res.json({ message: "Status updated", destination: updated });
  } catch (err) {
    console.error("Toggle destination status error:", err);
    res.status(500).json({ error: "Failed to toggle status" });
  }
}
