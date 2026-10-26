/**
 * DillKash Kashmir — Automated Database Migration & Schema Synchronizer
 * 
 * Runs automatically on server startup to ensure:
 * 1. All necessary tables exist (users, packages, bookings, destinations, hotels, blogs, etc.)
 * 2. All required columns exist (e.g. city in users, price_lahore/price_islamabad in packages,
 *    user_id/email/duration in custom_tour_requests, promo columns in bookings).
 * 
 * Safe and idempotent — can be run repeatedly without altering existing data.
 */

import pool from "../config/db.js";

async function columnExists(db, table, column) {
  const [rows] = await db.execute(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function tableExists(db, table) {
  const [rows] = await db.execute(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return rows.length > 0;
}

async function addColumnIfNotExists(db, table, column, columnDef, after = "") {
  const exists = await columnExists(db, table, column);
  if (!exists) {
    const afterClause = after ? ` AFTER ${after}` : "";
    console.log(`[AutoMigrate] Adding missing column '${column}' to table '${table}'...`);
    await db.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${columnDef}${afterClause}`);
    console.log(`[AutoMigrate] ✓ Added column '${column}' to '${table}'.`);
  }
}

export async function autoMigrate(db = pool) {
  try {
    console.log("[AutoMigrate] Checking database schema...");

    // 1. Ensure core tables exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL DEFAULT '',
        city VARCHAR(50) NOT NULL DEFAULT 'Lahore',
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        discount_percent TINYINT UNSIGNED NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_promo_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS destinations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image TEXT NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order TINYINT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_destination_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS destination_gallery (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        destination_id INT UNSIGNED NOT NULL,
        image_url TEXT NOT NULL,
        sort_order TINYINT UNSIGNED DEFAULT 0,
        FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS guides (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        experience TINYINT UNSIGNED NOT NULL DEFAULT 1,
        bio TEXT,
        image_url TEXT,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL,
        name VARCHAR(200) NOT NULL,
        location VARCHAR(100) NOT NULL,
        star_rating TINYINT UNSIGNED NOT NULL DEFAULT 3,
        price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0,
        description TEXT,
        images JSON,
        amenities JSON,
        featured TINYINT(1) NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_hotel_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS hotel_bookings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED DEFAULT NULL,
        guest_name VARCHAR(150) NOT NULL,
        guest_phone VARCHAR(30) NOT NULL,
        guest_email VARCHAR(255) DEFAULT '',
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guests_count TINYINT UNSIGNED NOT NULL DEFAULT 1,
        rooms_count TINYINT UNSIGNED NOT NULL DEFAULT 1,
        room_type VARCHAR(50) NOT NULL DEFAULT 'Standard',
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        cover_image VARCHAR(255),
        gallery JSON,
        author VARCHAR(100) DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_blog_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED DEFAULT NULL,
        full_name VARCHAR(150) NOT NULL,
        phone_number VARCHAR(30) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        selected_tour VARCHAR(255) DEFAULT '',
        travel_date DATE DEFAULT NULL,
        persons TINYINT UNSIGNED NOT NULL DEFAULT 1,
        room_type VARCHAR(100) DEFAULT 'Standard Double',
        status ENUM('Pending', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Pending',
        total_price INT UNSIGNED DEFAULT NULL,
        applied_promo VARCHAR(50) DEFAULT NULL,
        discount_amount INT UNSIGNED DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS custom_tour_requests (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED DEFAULT NULL,
        name VARCHAR(150) NOT NULL,
        phone_number VARCHAR(30) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        preferred_date DATE DEFAULT NULL,
        persons TINYINT UNSIGNED NOT NULL DEFAULT 1,
        duration VARCHAR(50) NOT NULL DEFAULT '',
        hotel_preference VARCHAR(100) DEFAULT '',
        transport_preference VARCHAR(100) DEFAULT '',
        preferred_destinations JSON,
        message TEXT,
        status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Ensure missing columns on existing tables (critical for upgrades on deployed databases)
    if (await tableExists(db, "users")) {
      await addColumnIfNotExists(db, "users", "city", "VARCHAR(50) NOT NULL DEFAULT 'Lahore'", "phone");
    }

    if (await tableExists(db, "packages")) {
      const hasPriceLahore = await columnExists(db, "packages", "price_lahore");
      const hasLegacyPrice = await columnExists(db, "packages", "price");
      if (!hasPriceLahore && hasLegacyPrice) {
        console.log("[AutoMigrate] Renaming 'price' to 'price_lahore' in packages...");
        await db.execute("ALTER TABLE packages CHANGE COLUMN price price_lahore DECIMAL(10,2) NOT NULL DEFAULT 0");
      } else if (!hasPriceLahore) {
        await addColumnIfNotExists(db, "packages", "price_lahore", "DECIMAL(10,2) NOT NULL DEFAULT 0");
      }
      await addColumnIfNotExists(db, "packages", "price_islamabad", "DECIMAL(10,2) NOT NULL DEFAULT 0", "price_lahore");
    }

    if (await tableExists(db, "custom_tour_requests")) {
      await addColumnIfNotExists(db, "custom_tour_requests", "user_id", "INT UNSIGNED DEFAULT NULL", "id");
      await addColumnIfNotExists(db, "custom_tour_requests", "email", "VARCHAR(255) DEFAULT ''", "phone_number");
      await addColumnIfNotExists(db, "custom_tour_requests", "duration", "VARCHAR(50) NOT NULL DEFAULT ''", "persons");
    }

    if (await tableExists(db, "bookings")) {
      await addColumnIfNotExists(db, "bookings", "user_id", "INT UNSIGNED DEFAULT NULL", "id");
      await addColumnIfNotExists(db, "bookings", "email", "VARCHAR(255) DEFAULT ''", "phone_number");
      await addColumnIfNotExists(db, "bookings", "total_price", "INT UNSIGNED DEFAULT NULL");
      await addColumnIfNotExists(db, "bookings", "applied_promo", "VARCHAR(50) DEFAULT NULL");
      await addColumnIfNotExists(db, "bookings", "discount_amount", "INT UNSIGNED DEFAULT NULL");
    }

    console.log("[AutoMigrate] ✓ Database schema is up to date and verified.");
  } catch (err) {
    console.error("[AutoMigrate] Migration warning / check failed:", err.message);
  }
}

// Allow direct execution: node src/database/auto-migrate.js
const isDirectRun = process.argv[1] && process.argv[1].endsWith("auto-migrate.js");
if (isDirectRun) {
  autoMigrate()
    .then(() => {
      console.log("[AutoMigrate] Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[AutoMigrate] Fatal error:", err);
      process.exit(1);
    });
}
