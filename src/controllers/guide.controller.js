import { validationResult } from "express-validator";
import { GuideModel } from "../models/guide.model.js";

/** GET /api/guides — public (active only) or admin (?all=true) */
export async function getAllGuides(req, res) {
  try {
    const activeOnly = req.query.all !== "true";
    const guides = await GuideModel.findAll({ activeOnly });
    res.json({ guides });
  } catch (err) {
    console.error("Get guides error:", err);
    res.status(500).json({ error: "Failed to fetch guides" });
  }
}

/** GET /api/guides/:id */
export async function getGuide(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid guide ID" });
    }

    const guide = await GuideModel.findById(id);
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }
    res.json({ guide });
  } catch (err) {
    console.error("Get guide error:", err);
    res.status(500).json({ error: "Failed to fetch guide" });
  }
}

/** POST /api/guides — admin only */
export async function createGuide(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const guideId = await GuideModel.create(req.body);
    const guide = await GuideModel.findById(guideId);

    res.status(201).json({ message: "Guide created successfully", guide });
  } catch (err) {
    console.error("Create guide error:", err);
    res.status(500).json({ error: "Failed to create guide" });
  }
}

/** PUT /api/guides/:id — admin only */
export async function updateGuide(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid guide ID" });
    }

    const existing = await GuideModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Guide not found" });
    }

    await GuideModel.update(id, req.body);
    const updated = await GuideModel.findById(id);

    res.json({ message: "Guide updated successfully", guide: updated });
  } catch (err) {
    console.error("Update guide error:", err);
    res.status(500).json({ error: "Failed to update guide" });
  }
}

/** DELETE /api/guides/:id — admin only */
export async function deleteGuide(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid guide ID" });
    }

    const existing = await GuideModel.findById(id);
    if (!existing) {
      return res.status(404).json({ error: "Guide not found" });
    }

    await GuideModel.delete(id);
    res.json({ message: "Guide deleted successfully" });
  } catch (err) {
    console.error("Delete guide error:", err);
    res.status(500).json({ error: "Failed to delete guide" });
  }
}

/** PATCH /api/guides/:id/status — admin only */
export async function toggleGuideStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid guide ID" });
    }

    await GuideModel.toggleStatus(id);
    const updated = await GuideModel.findById(id);

    res.json({ message: "Status updated", guide: updated });
  } catch (err) {
    console.error("Toggle guide status error:", err);
    res.status(500).json({ error: "Failed to toggle status" });
  }
}
