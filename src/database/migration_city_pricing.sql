-- Migration: City-based pricing & departure system
-- Adds 'city' to users, replaces 'price' with 'price_lahore' + 'price_islamabad' in packages.

-- 1. Add 'city' column to users
ALTER TABLE users
  ADD COLUMN city VARCHAR(50) NOT NULL DEFAULT 'Lahore'
  AFTER phone;

-- 2. Rename 'price' → 'price_lahore' in packages
ALTER TABLE packages
  CHANGE COLUMN price price_lahore DECIMAL(10,2) NOT NULL DEFAULT 0;

-- 3. Add 'price_islamabad' right after 'price_lahore'
ALTER TABLE packages
  ADD COLUMN price_islamabad DECIMAL(10,2) NOT NULL DEFAULT 0
  AFTER price_lahore;

-- 4. Seed price_islamabad with price_lahore values as a starting point
--    (Admin can adjust Islamabad prices later)
UPDATE packages SET price_islamabad = price_lahore;
