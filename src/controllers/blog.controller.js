import db from "../config/db.js";

// Helper to generate a basic slug if one isn't provided
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getAllBlogs(req, res, next) {
  try {
    const [rows] = await db.query(
      "SELECT id, title, slug, cover_image, author, created_at, updated_at FROM blogs ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
}

export async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [rows] = await db.query("SELECT * FROM blogs WHERE slug = ?", [slug]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function createBlog(req, res, next) {
  try {
    const { title, slug, content, cover_image, author } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const finalSlug = slug ? generateSlug(slug) : generateSlug(title);
    const finalAuthor = author || "Admin";

    // Check for existing slug
    const [existing] = await db.query("SELECT id FROM blogs WHERE slug = ?", [finalSlug]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "A blog with this slug already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO blogs (title, slug, content, cover_image, author) VALUES (?, ?, ?, ?, ?)",
      [title, finalSlug, content, cover_image || null, finalAuthor]
    );

    res.status(201).json({ id: result.insertId, title, slug: finalSlug });
  } catch (error) {
    next(error);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, content, cover_image, author } = req.body;

    // Build dynamic update query to only update provided fields
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (slug !== undefined) { updates.push("slug = ?"); values.push(generateSlug(slug)); }
    if (content !== undefined) { updates.push("content = ?"); values.push(content); }
    if (cover_image !== undefined) { updates.push("cover_image = ?"); values.push(cover_image); }
    if (author !== undefined) { updates.push("author = ?"); values.push(author); }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE blogs SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function deleteBlog(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM blogs WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    next(error);
  }
}
