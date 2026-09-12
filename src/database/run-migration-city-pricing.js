/**
 * Run city-pricing migration.
 * Usage: cd server && node src/database/run-migration-city-pricing.js
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import defaultPool from "../config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const raw = readFileSync(join(__dirname, "migration_city_pricing.sql"), "utf-8");
  // Strip full-line comments, then split on semicolons
  const sql = raw.replace(/^--.*$/gm, "");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} migration statements…\n`);

  for (const stmt of statements) {
    const preview = stmt.replace(/\s+/g, " ").slice(0, 80);
    try {
      await defaultPool.execute(stmt);
      console.log(`  ✓ ${preview}…`);
    } catch (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log(`  ⏭ Skipped (column already exists): ${preview}…`);
      } else if (err.code === "ER_BAD_FIELD_ERROR" && stmt.includes("CHANGE COLUMN price ")) {
        console.log(`  ⏭ Skipped (price column already renamed): ${preview}…`);
      } else {
        console.error(`  ✗ FAILED: ${preview}…`);
        console.error(`    Error: ${err.message}`);
        process.exit(1);
      }
    }
  }

  console.log("\n✅ City-pricing migration complete!");
  process.exit(0);
}

run();
