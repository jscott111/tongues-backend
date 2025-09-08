-- Migration: remove_expires_at_column
-- Created: 2025-01-09T00:00:00.000Z
-- Description: Remove expires_at column from sessions table since sessions are now persistent

-- Remove the expires_at column from sessions table
ALTER TABLE sessions DROP COLUMN IF EXISTS expires_at;

-- Remove the index on expires_at since the column no longer exists
DROP INDEX IF EXISTS idx_sessions_expires_at;
