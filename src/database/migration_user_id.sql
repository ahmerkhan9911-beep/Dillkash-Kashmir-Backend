-- Migration: Add user_id and email columns to bookings and custom_tour_requests
-- Safe to run multiple times (uses IF NOT EXISTS / checks for column existence)

-- Add user_id to bookings
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE bookings ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER id, ADD COLUMN email VARCHAR(255) DEFAULT \'\' AFTER phone_number, ADD CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add user_id to custom_tour_requests
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'custom_tour_requests' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE custom_tour_requests ADD COLUMN user_id INT UNSIGNED DEFAULT NULL AFTER id, ADD COLUMN email VARCHAR(255) DEFAULT \'\' AFTER phone_number, ADD CONSTRAINT fk_custom_tours_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
