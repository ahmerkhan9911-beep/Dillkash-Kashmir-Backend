import { Router } from "express";
import { upload, uploadImage } from "../controllers/upload.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/upload
 * Accepts a single image file in the `image` field of a multipart/form-data request.
 * Returns { url: "/uploads/<filename>" }
 */
router.post(
  "/upload",
  authenticateToken,
  requireAdmin,
  (req, res, next) => {
    // Wrap multer so we can return a clean JSON error instead of an HTML crash
    upload.single("image")(req, res, (err) => {
      if (err) {
        const isFileTooLarge =
          err.code === "LIMIT_FILE_SIZE" || err.message?.includes("File too large");
        if (isFileTooLarge) {
          return res.status(400).json({ error: "File must be smaller than 5 MB" });
        }
        return res.status(400).json({ error: err.message || "Upload failed" });
      }
      next();
    });
  },
  uploadImage
);

export default router;
