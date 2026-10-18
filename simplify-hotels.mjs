import pool from "./src/config/db.js";

async function simplifyHotels() {
  try {
    console.log("Removing hotel_rooms table...");
    await pool.execute("DROP TABLE IF EXISTS hotel_rooms");
    console.log("✅ hotel_rooms table removed.");
    console.log("✅ Hotels module simplified for lead generation!");
    process.exit(0);
  } catch (err) {
    console.error("Simplification error:", err);
    process.exit(1);
  }
}

simplifyHotels();
