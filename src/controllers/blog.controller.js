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

/** Parse the gallery column: MySQL may return it as a string or already as an array. */
function parseGallery(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getAllBlogs(req, res, next) {
  try {
    const [rows] = await db.query(
      "SELECT id, title, slug, cover_image, gallery, author, created_at, updated_at FROM blogs ORDER BY created_at DESC"
    );
    const blogs = rows.map((b) => ({ ...b, gallery: parseGallery(b.gallery) }));
    res.json(blogs);
  } catch (error) {
    next(error);
  }
}

export async function getBlogBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [rows] = await db.query("SELECT * FROM blogs WHERE slug = ? OR id = ?", [slug, slug]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const blog = rows[0];
    blog.gallery = parseGallery(blog.gallery);
    res.json(blog);
  } catch (error) {
    next(error);
  }
}

export async function createBlog(req, res, next) {
  try {
    const { title, slug, content, cover_image, author, gallery } = req.body;

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

    // Normalise gallery to a JSON string
    const galleryArr = parseGallery(gallery);
    const galleryJson = galleryArr.length > 0 ? JSON.stringify(galleryArr) : null;

    const [result] = await db.query(
      "INSERT INTO blogs (title, slug, content, cover_image, author, gallery) VALUES (?, ?, ?, ?, ?, ?)",
      [title, finalSlug, content, cover_image || null, finalAuthor, galleryJson]
    );

    res.status(201).json({ id: result.insertId, title, slug: finalSlug });
  } catch (error) {
    next(error);
  }
}

export async function updateBlog(req, res, next) {
  try {
    const { id } = req.params;
    const { title, slug, content, cover_image, author, gallery, existing_gallery } = req.body || {};

    // Build dynamic update query to only update provided fields
    const updates = [];
    const values = [];

    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (slug !== undefined) { updates.push("slug = ?"); values.push(generateSlug(slug)); }
    if (content !== undefined) { updates.push("content = ?"); values.push(content); }
    if (cover_image !== undefined) { updates.push("cover_image = ?"); values.push(cover_image); }
    if (author !== undefined) { updates.push("author = ?"); values.push(author); }

    // Handle gallery (supports JSON, FormData with stringified existing array, and new files)
    const hasGalleryField = gallery !== undefined || existing_gallery !== undefined || (req.files && req.files.length > 0);
    if (hasGalleryField) {
      const rawExisting = existing_gallery !== undefined ? existing_gallery : gallery;
      const existingArr = parseGallery(rawExisting);
      const newUrls = (req.files || []).map((file) => `/uploads/${file.filename}`);
      const finalGallery = [...existingArr, ...newUrls];

      updates.push("gallery = ?");
      values.push(finalGallery.length > 0 ? JSON.stringify(finalGallery) : null);
    }

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
