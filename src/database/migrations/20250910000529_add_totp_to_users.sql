-- Migration: add-totp-to-users
-- Created: 2025-09-10T00:05:29.449Z
-- 
-- Add TOTP (Time-based One-Time Password) fields to users table

ALTER TABLE users 
ADD COLUMN totp_secret VARCHAR(255) NULL,
ADD COLUMN totp_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN totp_backup_codes TEXT[] NULL;
