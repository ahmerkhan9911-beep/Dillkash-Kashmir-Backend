/**
 * Standalone admin account creator/resetter.
 * Usage: cd server && npm run db:seed-admin
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import defaultPool from "../config/db.js";

export async function seedAdmin(pool = defaultPool) {
  const email = process.env.ADMIN_EMAIL || "admin@dillkash.pk";
  const password = process.env.ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.ADMIN_NAME || "Admin";
  const phone = process.env.ADMIN_PHONE || "03001234567";

  const hash = await bcrypt.hash(password, 12);

  // Upsert: update if exists, insert if not
  const [existing] = await pool.execute("SELECT id, role FROM users WHERE email = ?", [email]);

  if (existing.length > 0) {
    await pool.execute(
      "UPDATE users SET full_name = ?, phone = ?, password_hash = ?, role = 'admin' WHERE email = ?",
      [name, phone, hash, email]
    );
    console.log(`✅ Admin account updated: ${email}`);
  } else {
    await pool.execute(
      "INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
      [name, email, phone, hash]
    );
    console.log(`✅ Admin account created: ${email}`);
  }

  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     admin`);

  return { email, password, name, phone };
}

// Run directly if this script is executed
const isDirectRun = process.argv[1] && (
  process.argv[1].endsWith("seed-admin.js") || process.argv[1].endsWith("seed-admin")
);

if (isDirectRun) {
  seedAdmin(defaultPool)
    .then(async () => {
      await defaultPool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Admin seeding failed:", err.message);
      process.exit(1);
    });
}
