import "dotenv/config";
import pool from "../config/db.js";

async function migrate() {
  const conn = await pool.getConnection();
  try {
    // Check if bookings.user_id already exists
    const [bookingCols] = await conn.query(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'user_id'`
    );
    if (bookingCols[0].cnt === 0) {
      console.log("Adding user_id and email to bookings...");
      await conn.query(`ALTER TABLE bookings ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER id`);
      await conn.query(`ALTER TABLE bookings ADD COLUMN email VARCHAR(255) DEFAULT '' AFTER phone_number`);
      await conn.query(`ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`);
      console.log("✅ bookings table updated.");
    } else {
      console.log("⏭️  bookings.user_id already exists, skipping.");
    }

    // Check if custom_tour_requests.user_id already exists
    const [ctCols] = await conn.query(
      `SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_tour_requests' AND COLUMN_NAME = 'user_id'`
    );
    if (ctCols[0].cnt === 0) {
      console.log("Adding user_id and email to custom_tour_requests...");
      await conn.query(`ALTER TABLE custom_tour_requests ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER id`);
      await conn.query(`ALTER TABLE custom_tour_requests ADD COLUMN email VARCHAR(255) DEFAULT '' AFTER phone_number`);
      await conn.query(`ALTER TABLE custom_tour_requests ADD CONSTRAINT fk_custom_tours_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL`);
      console.log("✅ custom_tour_requests table updated.");
    } else {
      console.log("⏭️  custom_tour_requests.user_id already exists, skipping.");
    }

    console.log("\n✅ Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();
