import { Router } from "express";
import {
  getAllBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/:slug", getBlogBySlug);

// Protected admin routes
router.post("/", authenticateToken, requireAdmin, createBlog);
router.put("/:id", authenticateToken, requireAdmin, updateBlog);
router.delete("/:id", authenticateToken, requireAdmin, deleteBlog);

export default router;
