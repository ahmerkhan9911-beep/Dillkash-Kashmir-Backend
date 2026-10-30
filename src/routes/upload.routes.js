import { Router } from "express";
import { upload, uploadMedia } from "../controllers/upload.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/upload
 *
 * Accepts a single file in the `file` field of a multipart/form-data request.
 * Supported types: JPG, PNG, WebP, HEIC/HEIF (images) · MP4, MOV, WebM (short video clips)
 * Returns: { url: "https://res.cloudinary.com/…", resourceType: "image"|"video" }
 */
router.post(
  "/upload",
  authenticateToken,
  requireAdmin,
  (req, res, next) => {
    // Wrap multer so we can return a clean JSON error instead of an HTML crash
    upload.single("file")(req, res, (err) => {
      if (err) {
        const isFileTooLarge =
          err.code === "LIMIT_FILE_SIZE" || err.message?.includes("File too large");
        if (isFileTooLarge) {
          return res.status(400).json({
            error: "File too large. Images must be under 15 MB; video clips under 20 MB.",
          });
        }
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  },
  uploadMedia
);

export default router;
