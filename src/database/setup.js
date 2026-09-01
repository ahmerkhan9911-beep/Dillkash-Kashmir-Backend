/**
 * DillKash Kashmir — Complete Database Setup Script
 * 
 * Performs:
 * 1. Creates database IF NOT EXISTS (default: dillkash_kashmir)
 * 2. Runs schema.sql to create all required tables
 * 3. Seeds default tour packages (idempotent — skips existing)
 * 4. Seeds/resets default admin user (idempotent)
 * 
 * Usage: cd server && npm run db:setup
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import { seedPackages } from "./seed.js";
import { seedAdmin } from "./seed-admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSetup() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "dillkash_kashmir";

  console.log("==================================================");
  console.log("🚀 Starting DillKash Kashmir MySQL Database Setup");
  console.log("==================================================");
  console.log(`📡 Host:     ${host}:${port}`);
  console.log(`👤 User:     ${user}`);
  console.log(`🗄️  Database: ${dbName}`);
  console.log("--------------------------------------------------\n");

  let serverConn;
  try {
    // Step 1: Connect to MySQL server without database
    serverConn = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });
  } catch (err) {
    console.error("❌ Failed to connect to MySQL server.");
    console.error(`   Error: ${err.message}`);
    console.error("\n💡 Please ensure:");
    console.error("   1. MySQL service is running.");
    console.error("   2. DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD in server/.env are correct.\n");
    process.exit(1);
  }

  // Step 2: Create database if not exists
  try {
    console.log(`🔨 [1/4] Ensuring database "${dbName}" exists...`);
    await serverConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`✅ Database "${dbName}" is ready.\n`);
  } catch (err) {
    console.error(`❌ Error creating database "${dbName}":`, err.message);
    await serverConn.end();
    process.exit(1);
  } finally {
    await serverConn.end();
  }

  // Step 3: Connect to the specific database & run schema.sql
  const dbPool = mysql.createPool({
    host,
    port,
    user,
    password,
    database: dbName,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    console.log(`📋 [2/4] Executing schema.sql...`);
    let schemaSQL = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    
    // Ensure the schema uses the configured dbName
    schemaSQL = schemaSQL
      .replace(/CREATE DATABASE IF NOT EXISTS `[^`]+`/g, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
      .replace(/USE `[^`]+`;/g, `USE \`${dbName}\`;`);

    await dbPool.query(schemaSQL);

    const [tables] = await dbPool.query("SHOW TABLES");
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log(`✅ Schema applied successfully. Found ${tableNames.length} tables:`);
    tableNames.forEach((t) => console.log(`   - ${t}`));
    console.log();

    // Step 4: Seed Tour Packages
    console.log(`📦 [3/4] Checking and seeding tour packages...`);
    const packageStats = await seedPackages(dbPool);
    console.log(`✅ Packages: ${packageStats.seededCount} new seeded, ${packageStats.skippedCount} already existed (Total: ${packageStats.total}).\n`);

    // Step 5: Seed Admin Account
    console.log(`👑 [4/4] Ensuring default admin account...`);
    const adminInfo = await seedAdmin(dbPool);
    console.log(`\n==================================================`);
    console.log("🎉 Database setup completed successfully!");
    console.log("==================================================");
    console.log(`Database Name: ${dbName}`);
    console.log(`Tables (${tableNames.length}): ${tableNames.join(", ")}`);
    console.log(`Admin Login:   ${adminInfo.email} / ${adminInfo.password}`);
    console.log("==================================================\n");

  } catch (err) {
    console.error("❌ Database setup failed during execution:", err);
    process.exit(1);
  } finally {
    await dbPool.end();
  }

  process.exit(0);
}

runSetup();
