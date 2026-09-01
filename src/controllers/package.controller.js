import { validationResult } from "express-validator";
import { PackageModel } from "../models/package.model.js";
import { UserModel } from "../models/user.model.js";

/** GET /api/packages — public */
export async function getAllPackages(req, res) {
  try {
    const activeOnly = req.query.all !== "true"; // admin can pass ?all=true
    const packages = await PackageModel.findAll({ activeOnly });
    res.json({ packages });
  } catch (err) {
    console.error("Get packages error:", err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
}

/** GET /api/packages/:idOrSlug — public */
export async function getPackage(req, res) {
  try {
    const pkg = await PackageModel.findByIdOrSlug(req.params.idOrSlug);
    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json({ package: pkg });
  } catch (err) {
    console.error("Get package error:", err);
    res.status(500).json({ error: "Failed to fetch package" });
  }
}

/** POST /api/packages — admin only */
export async function createPackage(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const packageId = await PackageModel.create(req.body);
    const pkg = await PackageModel.findByIdOrSlug(packageId);

    res.status(201).json({ message: "Package created successfully", package: pkg });
  } catch (err) {
    console.error("Create package error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "A package with this slug already exists" });
    }
    res.status(500).json({ error: "Failed to create package" });
  }
}

/** PUT /api/packages/:id — admin only */
export async function updatePackage(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid package ID" });
    }

    // Check exists
    const existing = await PackageModel.findByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: "Package not found" });
    }

    await PackageModel.update(id, req.body);
    const updated = await PackageModel.findByIdOrSlug(id);

    res.json({ message: "Package updated successfully", package: updated });
  } catch (err) {
    console.error("Update package error:", err);
    res.status(500).json({ error: "Failed to update package" });
  }
}

/** DELETE /api/packages/:id — admin only */
export async function deletePackage(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid package ID" });
    }

    const existing = await PackageModel.findByIdOrSlug(id);
    if (!existing) {
      return res.status(404).json({ error: "Package not found" });
    }

    await PackageModel.delete(id);
    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    console.error("Delete package error:", err);
    res.status(500).json({ error: "Failed to delete package" });
  }
}

/** PATCH /api/packages/:id/status — admin only */
export async function togglePackageStatus(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid package ID" });
    }

    await PackageModel.toggleStatus(id);
    const updated = await PackageModel.findByIdOrSlug(id);

    res.json({ message: "Status updated", package: updated });
  } catch (err) {
    console.error("Toggle status error:", err);
    res.status(500).json({ error: "Failed to toggle status" });
  }
}

/** GET /api/packages/admin/stats — admin only */
export async function getStats(req, res) {
  try {
    const [totalPackages, activePackages, featuredPackages, totalUsers] =
      await Promise.all([
        PackageModel.countAll(),
        PackageModel.countActive(),
        PackageModel.countFeatured(),
        UserModel.countAll(),
      ]);
    res.json({ totalPackages, activePackages, featuredPackages, totalUsers });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}
