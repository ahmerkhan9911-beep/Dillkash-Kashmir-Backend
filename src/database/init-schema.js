/**
 * Schema Initializer — creates database and tables without inserting seed data.
 * Usage: cd server && npm run db:schema
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initSchema() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "dillkash_kashmir";

  console.log(`📡 Connecting to MySQL server at ${host}:${port}...`);
  const serverConn = await mysql.createConnection({ host, port, user, password });

  console.log(`🔨 Ensuring database "${dbName}" exists...`);
  await serverConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await serverConn.end();

  const dbPool = mysql.createPool({
    host,
    port,
    user,
    password,
    database: dbName,
    multipleStatements: true,
  });

  let schemaSQL = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  schemaSQL = schemaSQL
    .replace(/CREATE DATABASE IF NOT EXISTS `[^`]+`/g, `CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    .replace(/USE `[^`]+`;/g, `USE \`${dbName}\`;`);

  console.log(`📋 Applying schema.sql to "${dbName}"...`);
  await dbPool.query(schemaSQL);

  const [tables] = await dbPool.query("SHOW TABLES");
  const tableNames = tables.map((t) => Object.values(t)[0]);
  console.log(`✅ Schema applied successfully. Tables (${tableNames.length}):`);
  tableNames.forEach((t) => console.log(`   - ${t}`));

  await dbPool.end();
  process.exit(0);
}

initSchema().catch((err) => {
  console.error("❌ Schema initialization failed:", err.message);
  process.exit(1);
});
