-- Migration: Add 'duration' column to custom_tour_requests
-- Run once against the existing database

ALTER TABLE custom_tour_requests
  ADD COLUMN duration VARCHAR(50) NOT NULL DEFAULT '' AFTER persons;
