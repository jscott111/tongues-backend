-- Migration: Add character count to sessions
-- Created: 2025-09-08T22:58:03.871Z
-- 
-- Add your SQL statements here
-- Example:
ALTER TABLE sessions ADD COLUMN character_count INTEGER DEFAULT 0;

-- Remember to update the migration arrays in:
-- - config/database.js (for PostgreSQL)
