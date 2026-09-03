import pool from "../config/db.js";

export const DestinationModel = {
  /**
   * Get all destinations with their gallery images.
   */
  async findAll({ activeOnly = true } = {}) {
    let sql = "SELECT * FROM destinations";
    if (activeOnly) sql += " WHERE is_active = 1";
    sql += " ORDER BY sort_order ASC, created_at DESC";

    const [rows] = await pool.execute(sql);
    if (rows.length === 0) return [];

    const destIds = rows.map((r) => r.id);
    const placeholders = destIds.map(() => "?").join(",");

    const [galleryRows] = await pool.execute(
      `SELECT destination_id, image_url FROM destination_gallery WHERE destination_id IN (${placeholders}) ORDER BY destination_id, sort_order ASC`,
      destIds
    );

    const galleryMap = {};
    for (const g of galleryRows) {
      if (!galleryMap[g.destination_id]) galleryMap[g.destination_id] = [];
      galleryMap[g.destination_id].push(g.image_url);
    }

    return rows.map((r) => ({
      ...r,
      gallery: galleryMap[r.id] && galleryMap[r.id].length > 0
        ? galleryMap[r.id]
        : (r.cover_image ? [r.cover_image] : []),
    }));
  },

  /**
   * Get a single destination by ID or slug with all gallery images.
   */
  async findByIdOrSlug(idOrSlug) {
    const isNumeric = /^\d+$/.test(String(idOrSlug));
    const [rows] = await pool.execute(
      `SELECT * FROM destinations WHERE ${isNumeric ? "id" : "slug"} = ?`,
      [idOrSlug]
    );

    const dest = rows[0];
    if (!dest) return null;

    const [galleryRows] = await pool.execute(
      "SELECT image_url FROM destination_gallery WHERE destination_id = ? ORDER BY sort_order ASC",
      [dest.id]
    );

    const gallery = galleryRows.map((g) => g.image_url);

    return {
      ...dest,
      gallery: gallery.length > 0 ? gallery : (dest.cover_image ? [dest.cover_image] : []),
    };
  },

  /**
   * Create a new destination.
   */
  async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      const [result] = await conn.execute(
        `INSERT INTO destinations (
          name, slug, description, cover_image, is_active, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          slug,
          data.description || "",
          data.cover_image || "",
          data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
          data.sort_order !== undefined ? Number(data.sort_order) : 0,
        ]
      );

      const destId = result.insertId;

      if (Array.isArray(data.gallery)) {
        for (let i = 0; i < data.gallery.length; i++) {
          const img = data.gallery[i];
          if (img && typeof img === "string" && img.trim()) {
            await conn.execute(
              "INSERT INTO destination_gallery (destination_id, image_url, sort_order) VALUES (?, ?, ?)",
              [destId, img.trim(), i]
            );
          }
        }
      }

      await conn.commit();
      return destId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Update an existing destination.
   */
  async update(id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug =
        data.slug ||
        data.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

      await conn.execute(
        `UPDATE destinations SET
          name = ?,
          slug = ?,
          description = ?,
          cover_image = ?,
          is_active = ?,
          sort_order = ?
        WHERE id = ?`,
        [
          data.name,
          slug,
          data.description || "",
          data.cover_image || "",
          data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1,
          data.sort_order !== undefined ? Number(data.sort_order) : 0,
          id,
        ]
      );

      if (Array.isArray(data.gallery)) {
        await conn.execute("DELETE FROM destination_gallery WHERE destination_id = ?", [id]);

        for (let i = 0; i < data.gallery.length; i++) {
          const img = data.gallery[i];
          if (img && typeof img === "string" && img.trim()) {
            await conn.execute(
              "INSERT INTO destination_gallery (destination_id, image_url, sort_order) VALUES (?, ?, ?)",
              [id, img.trim(), i]
            );
          }
        }
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Delete a destination (foreign keys cascade to gallery).
   */
  async delete(id) {
    await pool.execute("DELETE FROM destinations WHERE id = ?", [id]);
  },

  /**
   * Toggle is_active flag.
   */
  async toggleStatus(id) {
    await pool.execute(
      "UPDATE destinations SET is_active = NOT is_active WHERE id = ?",
      [id]
    );
  },

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) as count FROM destinations");
    return rows[0].count;
  },

  async countActive() {
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM destinations WHERE is_active = 1"
    );
    return rows[0].count;
  },
};
