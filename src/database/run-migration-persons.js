import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "dillkash_kashmir",
  });

  try {
    console.log("Starting migration: merge adults and kids into persons...");

    // 1. Update bookings
    console.log("Updating bookings table...");
    try {
      await connection.query("ALTER TABLE bookings ADD COLUMN persons TINYINT UNSIGNED NOT NULL DEFAULT 1");
      await connection.query("UPDATE bookings SET persons = adults + kids");
      await connection.query("ALTER TABLE bookings DROP COLUMN adults, DROP COLUMN kids");
      console.log("bookings table updated successfully.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("persons column already exists in bookings, skipping...");
      } else {
        throw e;
      }
    }

    // 2. Update custom_tour_requests
    console.log("Updating custom_tour_requests table...");
    try {
      await connection.query("ALTER TABLE custom_tour_requests ADD COLUMN persons TINYINT UNSIGNED NOT NULL DEFAULT 1");
      await connection.query("UPDATE custom_tour_requests SET persons = adults + kids");
      await connection.query("ALTER TABLE custom_tour_requests DROP COLUMN adults, DROP COLUMN kids");
      console.log("custom_tour_requests table updated successfully.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("persons column already exists in custom_tour_requests, skipping...");
      } else {
        throw e;
      }
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await connection.end();
  }
}

runMigration();
