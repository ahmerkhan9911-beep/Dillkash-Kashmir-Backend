import pool from "../config/db.js";

export const PackageModel = {
  /**
   * Get all active packages with their destinations (for public listing).
   */
  async findAll({ activeOnly = true } = {}) {
    let sql = `
      SELECT p.*,
        GROUP_CONCAT(DISTINCT pd.destination_name ORDER BY pd.sort_order SEPARATOR '||') as destinations_csv
      FROM packages p
      LEFT JOIN package_destinations pd ON pd.package_id = p.id
    `;
    if (activeOnly) sql += " WHERE p.is_active = 1";
    sql += " GROUP BY p.id ORDER BY p.featured DESC, p.created_at DESC";

    const [rows] = await pool.execute(sql);
    
    if (rows.length === 0) return [];

    const packageIds = rows.map(r => r.id);
    const placeholders = packageIds.map(() => '?').join(',');
    
    const [galleryRows] = await pool.execute(
      `SELECT package_id, image_url FROM package_gallery WHERE package_id IN (${placeholders}) ORDER BY package_id, sort_order`,
      packageIds
    );

    const galleryMap = {};
    for (const g of galleryRows) {
      if (!galleryMap[g.package_id]) galleryMap[g.package_id] = [];
      galleryMap[g.package_id].push(g.image_url);
    }

    return rows.map((r) => ({
      ...r,
      destinations: r.destinations_csv ? r.destinations_csv.split("||") : [],
      gallery: galleryMap[r.id] || [],
    }));
  },

  /**
   * Get a single package by ID or slug, with ALL related data.
   */
  async findByIdOrSlug(idOrSlug) {
    const isNumeric = /^\d+$/.test(String(idOrSlug));
    const [rows] = await pool.execute(
      `SELECT * FROM packages WHERE ${isNumeric ? "id" : "slug"} = ?`,
      [idOrSlug]
    );
    const pkg = rows[0];
    if (!pkg) return null;

    // Fetch related data in parallel
    const [destinations, itineraries, inclusions, exclusions, gallery] =
      await Promise.all([
        pool.execute(
          "SELECT * FROM package_destinations WHERE package_id = ? ORDER BY sort_order",
          [pkg.id]
        ),
        pool.execute(
          `SELECT pi.*, 
            GROUP_CONCAT(pid.detail_text ORDER BY pid.sort_order SEPARATOR '||') as details_csv
           FROM package_itineraries pi
           LEFT JOIN package_itinerary_details pid ON pid.itinerary_id = pi.id
           WHERE pi.package_id = ?
           GROUP BY pi.id
           ORDER BY pi.day_number`,
          [pkg.id]
        ),
        pool.execute(
          "SELECT * FROM package_inclusions WHERE package_id = ? ORDER BY sort_order",
          [pkg.id]
        ),
        pool.execute(
          "SELECT * FROM package_exclusions WHERE package_id = ? ORDER BY sort_order",
          [pkg.id]
        ),
        pool.execute(
          "SELECT * FROM package_gallery WHERE package_id = ? ORDER BY sort_order",
          [pkg.id]
        ),
      ]);

    return {
      ...pkg,
      destinations: destinations[0].map((d) => d.destination_name),
      itinerary: itineraries[0].map((it) => ({
        day: it.day_number,
        title: it.title,
        details: it.details_csv ? it.details_csv.split("||") : [],
      })),
      included: inclusions[0].map((i) => i.item_text),
      notIncluded: exclusions[0].map((e) => e.item_text),
      gallery: gallery[0].map((g) => g.image_url),
    };
  },

  /**
   * Create a package with all related data. Uses a transaction.
   */
  async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const [pkgResult] = await conn.execute(
        `INSERT INTO packages 
          (slug, title, short_description, full_description, duration_days, package_type, 
           price, rating, reviews_count, image_url, departure_city, departure_day,
           transport, accommodation, meals, featured, is_active, next_departure)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug,
          data.title,
          data.short_description || "",
          data.full_description || "",
          data.duration_days,
          data.package_type || "",
          data.price,
          data.rating || 0,
          data.reviews_count || 0,
          data.image_url || "",
          data.departure_city || "Lahore",
          data.departure_day || "",
          data.transport || "",
          data.accommodation || "",
          data.meals || "",
          data.featured ? 1 : 0,
          data.is_active !== false ? 1 : 0,
          data.next_departure || "",
        ]
      );

      const packageId = pkgResult.insertId;

      // Destinations
      if (data.destinations?.length) {
        for (let i = 0; i < data.destinations.length; i++) {
          await conn.execute(
            "INSERT INTO package_destinations (package_id, destination_name, sort_order) VALUES (?, ?, ?)",
            [packageId, data.destinations[i], i]
          );
        }
      }

      // Itinerary
      if (data.itinerary?.length) {
        for (const day of data.itinerary) {
          const [itResult] = await conn.execute(
            "INSERT INTO package_itineraries (package_id, day_number, title, sort_order) VALUES (?, ?, ?, ?)",
            [packageId, day.day, day.title, day.day]
          );
          if (day.details?.length) {
            for (let d = 0; d < day.details.length; d++) {
              await conn.execute(
                "INSERT INTO package_itinerary_details (itinerary_id, detail_text, sort_order) VALUES (?, ?, ?)",
                [itResult.insertId, day.details[d], d]
              );
            }
          }
        }
      }

      // Inclusions
      if (data.included?.length) {
        for (let i = 0; i < data.included.length; i++) {
          await conn.execute(
            "INSERT INTO package_inclusions (package_id, item_text, sort_order) VALUES (?, ?, ?)",
            [packageId, data.included[i], i]
          );
        }
      }

      // Exclusions
      if (data.notIncluded?.length) {
        for (let i = 0; i < data.notIncluded.length; i++) {
          await conn.execute(
            "INSERT INTO package_exclusions (package_id, item_text, sort_order) VALUES (?, ?, ?)",
            [packageId, data.notIncluded[i], i]
          );
        }
      }

      // Gallery
      if (data.gallery?.length) {
        for (let i = 0; i < data.gallery.length; i++) {
          await conn.execute(
            "INSERT INTO package_gallery (package_id, image_url, sort_order) VALUES (?, ?, ?)",
            [packageId, data.gallery[i], i]
          );
        }
      }

      await conn.commit();
      return packageId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Update a package and all related data. Uses a transaction.
   */
  async update(id, data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const slug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      await conn.execute(
        `UPDATE packages SET
          slug = ?, title = ?, short_description = ?, full_description = ?,
          duration_days = ?, package_type = ?, price = ?, rating = ?,
          reviews_count = ?, image_url = ?, departure_city = ?, departure_day = ?,
          transport = ?, accommodation = ?, meals = ?, featured = ?,
          is_active = ?, next_departure = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          slug, data.title, data.short_description || "", data.full_description || "",
          data.duration_days, data.package_type || "", data.price, data.rating || 0,
          data.reviews_count || 0, data.image_url || "", data.departure_city || "Lahore",
          data.departure_day || "", data.transport || "", data.accommodation || "",
          data.meals || "", data.featured ? 1 : 0, data.is_active !== false ? 1 : 0,
          data.next_departure || "", id,
        ]
      );

      // Delete and re-insert related data
      // First get itinerary IDs to delete their details
      const [itineraryRows] = await conn.execute(
        "SELECT id FROM package_itineraries WHERE package_id = ?", [id]
      );
      for (const row of itineraryRows) {
        await conn.execute("DELETE FROM package_itinerary_details WHERE itinerary_id = ?", [row.id]);
      }
      
      await conn.execute("DELETE FROM package_destinations WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_itineraries WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_inclusions WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_exclusions WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_gallery WHERE package_id = ?", [id]);

      // Re-insert
      if (data.destinations?.length) {
        for (let i = 0; i < data.destinations.length; i++) {
          await conn.execute(
            "INSERT INTO package_destinations (package_id, destination_name, sort_order) VALUES (?, ?, ?)",
            [id, data.destinations[i], i]
          );
        }
      }

      if (data.itinerary?.length) {
        for (const day of data.itinerary) {
          const [itResult] = await conn.execute(
            "INSERT INTO package_itineraries (package_id, day_number, title, sort_order) VALUES (?, ?, ?, ?)",
            [id, day.day, day.title, day.day]
          );
          if (day.details?.length) {
            for (let d = 0; d < day.details.length; d++) {
              await conn.execute(
                "INSERT INTO package_itinerary_details (itinerary_id, detail_text, sort_order) VALUES (?, ?, ?)",
                [itResult.insertId, day.details[d], d]
              );
            }
          }
        }
      }

      if (data.included?.length) {
        for (let i = 0; i < data.included.length; i++) {
          await conn.execute(
            "INSERT INTO package_inclusions (package_id, item_text, sort_order) VALUES (?, ?, ?)",
            [id, data.included[i], i]
          );
        }
      }

      if (data.notIncluded?.length) {
        for (let i = 0; i < data.notIncluded.length; i++) {
          await conn.execute(
            "INSERT INTO package_exclusions (package_id, item_text, sort_order) VALUES (?, ?, ?)",
            [id, data.notIncluded[i], i]
          );
        }
      }

      if (data.gallery?.length) {
        for (let i = 0; i < data.gallery.length; i++) {
          await conn.execute(
            "INSERT INTO package_gallery (package_id, image_url, sort_order) VALUES (?, ?, ?)",
            [id, data.gallery[i], i]
          );
        }
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Delete a package and all related data.
   */
  async delete(id) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Delete itinerary details first
      const [itineraryRows] = await conn.execute(
        "SELECT id FROM package_itineraries WHERE package_id = ?", [id]
      );
      for (const row of itineraryRows) {
        await conn.execute("DELETE FROM package_itinerary_details WHERE itinerary_id = ?", [row.id]);
      }

      await conn.execute("DELETE FROM package_destinations WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_itineraries WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_inclusions WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_exclusions WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM package_gallery WHERE package_id = ?", [id]);
      await conn.execute("DELETE FROM packages WHERE id = ?", [id]);

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Toggle active status.
   */
  async toggleStatus(id) {
    await pool.execute(
      "UPDATE packages SET is_active = NOT is_active, updated_at = NOW() WHERE id = ?",
      [id]
    );
  },

  async countAll() {
    const [rows] = await pool.execute("SELECT COUNT(*) as total FROM packages");
    return rows[0].total;
  },

  async countActive() {
    const [rows] = await pool.execute("SELECT COUNT(*) as total FROM packages WHERE is_active = 1");
    return rows[0].total;
  },

  async countFeatured() {
    const [rows] = await pool.execute("SELECT COUNT(*) as total FROM packages WHERE featured = 1");
    return rows[0].total;
  },
};
