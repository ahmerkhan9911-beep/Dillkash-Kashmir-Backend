-- Promo Codes migration
-- 1. Creates the promo_codes table.
-- 2. Adds promo/discount tracking columns to bookings.
-- Usage: cd server && npm run db:migrate-promo

CREATE TABLE IF NOT EXISTS promo_codes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  discount_percent TINYINT UNSIGNED NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_promo_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Final (post-discount) amount, computed server-side at booking time
ALTER TABLE bookings ADD COLUMN total_price INT UNSIGNED DEFAULT NULL;

-- Promo code string used for this booking (e.g. HBA10)
ALTER TABLE bookings ADD COLUMN applied_promo VARCHAR(50) DEFAULT NULL;

-- Discount amount in PKR that was deducted from the original price
ALTER TABLE bookings ADD COLUMN discount_amount INT UNSIGNED DEFAULT NULL;
