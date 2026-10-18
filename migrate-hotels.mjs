import pool from "./src/config/db.js";

async function migrate() {
  try {
    // Add new columns to hotels table
    const alterQueries = [
      "ALTER TABLE hotels ADD COLUMN check_in_time VARCHAR(20) DEFAULT '2:00 PM'",
      "ALTER TABLE hotels ADD COLUMN check_out_time VARCHAR(20) DEFAULT '12:00 PM'",
      "ALTER TABLE hotels ADD COLUMN cancellation_policy TEXT NULL",
      "ALTER TABLE hotels ADD COLUMN house_rules TEXT NULL",
    ];

    for (const q of alterQueries) {
      try {
        await pool.execute(q);
        console.log("OK:", q.substring(0, 70));
      } catch (e) {
        if (e.code === "ER_DUP_FIELDNAME") {
          console.log("SKIP (already exists):", q.substring(0, 70));
        } else {
          throw e;
        }
      }
    }

    // Create hotel_rooms table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hotel_rooms (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT UNSIGNED NOT NULL,
        room_type VARCHAR(50) NOT NULL DEFAULT 'Standard',
        price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
        max_guests INT NOT NULL DEFAULT 2,
        available_rooms INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
      )
    `);
    console.log("hotel_rooms table OK");

    // Create hotel_bookings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hotel_bookings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NULL,
        guest_name VARCHAR(150) NOT NULL,
        guest_phone VARCHAR(30) NOT NULL DEFAULT '',
        guest_email VARCHAR(200) NOT NULL DEFAULT '',
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guests_count INT NOT NULL DEFAULT 1,
        rooms_count INT NOT NULL DEFAULT 1,
        room_type VARCHAR(50) NOT NULL DEFAULT 'Standard',
        total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
        status ENUM('Pending','Confirmed','Cancelled') NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);    console.log("hotel_bookings table OK");

    console.log("✅ Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
