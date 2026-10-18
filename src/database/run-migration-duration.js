/**
 * Migration: add `duration` column to custom_tour_requests.
 * Run with: node src/database/run-migration-duration.js
 */

import "dotenv/config";
import { createConnection } from "mysql2/promise";

const conn = await createConnection({
  host:     process.env.DB_HOST     || "localhost",
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "dillkash_kashmir",
});

try {
  console.log("Running migration: add duration to custom_tour_requests…");

  // Check if column already exists to make the script idempotent
  const [cols] = await conn.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_tour_requests' AND COLUMN_NAME = 'duration'`
  );

  if (cols.length > 0) {
    console.log("✓ Column 'duration' already exists — skipping.");
  } else {
    await conn.execute(
      `ALTER TABLE custom_tour_requests
       ADD COLUMN duration VARCHAR(50) NOT NULL DEFAULT '' AFTER persons`
    );
    console.log("✓ Column 'duration' added successfully.");
  }
} finally {
  await conn.end();
}
