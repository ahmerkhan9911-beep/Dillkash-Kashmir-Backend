import { Router } from "express";
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import { upload } from "../controllers/upload.controller.js";

const router = Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);

// Protected admin routes
router.post("/", authenticateToken, requireAdmin, createBlog);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      upload.array("gallery")(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message || "Upload failed" });
        next();
      });
    } else {
      next();
    }
  },
  updateBlog
);
router.delete("/:id", authenticateToken, requireAdmin, deleteBlog);

export default router;

